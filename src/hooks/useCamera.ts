import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent, type MouseEvent } from 'react'
import { clampCamera } from '../logic/camera'
import type { Point } from '../logic/layout'
import { tuning } from '../tuning'

interface RoomSize {
  roomWidth: number
  roomHeight: number
}

interface Options {
  room: RoomSize
  vw: number
  vh: number
  reducedMotion: boolean
  start: Point
  // Called whenever the guest moves the room: a drag, the wheel, or an arrow key. Glides (a
  // signpost, keyboard focus) are not the guest's own move.
  onMove?: () => void
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  from: Point
  dragging: boolean
}

export interface CameraApi {
  camera: Point
  cameraRef: { readonly current: Point }
  glideTo: (target: Point) => void
  moveBy: (dx: number, dy: number) => void
  surfaceProps: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void
    onPointerMove: (e: PointerEvent<HTMLElement>) => void
    onPointerUp: (e: PointerEvent<HTMLElement>) => void
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void
    onWheel: (e: WheelEvent<HTMLElement>) => void
    onClickCapture: (e: MouseEvent<HTMLElement>) => void
  }
}

const interactive = 'button, a, input, select, textarea, [data-no-drag]'
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

// §4: one camera position, moved by drag, touch, wheel, arrow keys, signposts, and focus.
export function useCamera({ room, vw, vh, reducedMotion, start, onMove }: Options): CameraApi {
  const { edgeMarginPx, glideMs, arrowStepPx, dragThresholdPx } = tuning.camera
  const [raw, setRaw] = useState<Point>(start)
  const camera = clampCamera(raw, room, vw, vh, edgeMarginPx)

  const cameraRef = useRef<Point>(camera)
  const drag = useRef<DragState | null>(null)
  const pointers = useRef(new Set<number>())
  const suppressClick = useRef(false)
  const animation = useRef<number | null>(null)
  const limits = useRef({ room, vw, vh })
  const moved = useRef(onMove)

  useEffect(() => {
    cameraRef.current = camera
    limits.current = { room, vw, vh }
    moved.current = onMove
  })

  const stopGlide = useCallback(() => {
    if (animation.current !== null) cancelAnimationFrame(animation.current)
    animation.current = null
  }, [])

  const setCamera = useCallback(
    (next: Point) => {
      const { room: r, vw: w, vh: h } = limits.current
      const clamped = clampCamera(next, r, w, h, edgeMarginPx)
      cameraRef.current = clamped
      setRaw(clamped)
    },
    [edgeMarginPx],
  )

  const moveBy = useCallback(
    (dx: number, dy: number) => {
      stopGlide()
      setCamera({ x: cameraRef.current.x + dx, y: cameraRef.current.y + dy })
      moved.current?.()
    },
    [setCamera, stopGlide],
  )

  const glideTo = useCallback(
    (target: Point) => {
      stopGlide()
      if (reducedMotion) {
        setCamera(target)
        return
      }
      const from = cameraRef.current
      const startedAt = performance.now()
      const step = (time: number) => {
        const t = Math.min(1, (time - startedAt) / glideMs)
        const k = easeOutCubic(t)
        setCamera({ x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k })
        animation.current = t < 1 ? requestAnimationFrame(step) : null
      }
      animation.current = requestAnimationFrame(step)
    },
    [glideMs, reducedMotion, setCamera, stopGlide],
  )

  useEffect(() => stopGlide, [stopGlide])

  // Arrow keys move the camera, unless a dialog is open or the key belongs to a form field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (document.querySelector('[aria-modal="true"]')) return
      if (e.target instanceof Element && e.target.closest('input, select, textarea')) return
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-arrowStepPx, 0],
        ArrowRight: [arrowStepPx, 0],
        ArrowUp: [0, -arrowStepPx],
        ArrowDown: [0, arrowStepPx],
      }
      const move = moves[e.key]
      if (!move) return
      e.preventDefault()
      moveBy(move[0], move[1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [arrowStepPx, moveBy])

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      suppressClick.current = false
      // A primary press starts a fresh gesture, even if an earlier pointer never reported its end.
      if (e.isPrimary) pointers.current.clear()
      pointers.current.add(e.pointerId)
      // A second finger means pinch zoom. Let the browser have it.
      if (pointers.current.size > 1) {
        drag.current = null
        return
      }
      if (e.button !== 0) return
      if ((e.target as HTMLElement).closest(interactive)) return
      stopGlide()
      drag.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        from: cameraRef.current,
        dragging: false,
      }
    },
    [stopGlide],
  )

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const d = drag.current
      if (!d || d.pointerId !== e.pointerId) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      if (!d.dragging) {
        if (Math.hypot(dx, dy) < dragThresholdPx) return
        d.dragging = true
        // Capture only once it is a drag, so a tap still reaches what was tapped.
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }
      setCamera({ x: d.from.x - dx, y: d.from.y - dy })
      moved.current?.()
    },
    [dragThresholdPx, setCamera],
  )

  const endPointer = useCallback((e: PointerEvent<HTMLElement>) => {
    pointers.current.delete(e.pointerId)
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    if (d.dragging) suppressClick.current = true
    drag.current = null
  }, [])

  const onWheel = useCallback(
    (e: WheelEvent<HTMLElement>) => {
      if (e.ctrlKey) return
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? limits.current.vh : 1
      let dx = e.deltaX * scale
      let dy = e.deltaY * scale
      if (e.shiftKey && dx === 0) {
        dx = dy
        dy = 0
      }
      moveBy(dx, dy)
    },
    [moveBy],
  )

  const onClickCapture = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!suppressClick.current) return
    suppressClick.current = false
    e.stopPropagation()
    e.preventDefault()
  }, [])

  return {
    camera,
    cameraRef,
    glideTo,
    moveBy,
    surfaceProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel,
      onClickCapture,
    },
  }
}
