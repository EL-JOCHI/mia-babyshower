import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent, type WheelEvent } from 'react'
import type { LandmarkId } from '../logic/layout'
import { progressFromDrag } from '../logic/path'
import { tuning } from '../tuning'

interface Options {
  stations: Record<LandmarkId, number>
  reducedMotion: boolean
  // Called whenever the guest moves the book: a drag, the wheel, or an arrow key.
  onMove?: () => void
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  from: number
  vw: number
  dragging: boolean
}

export interface WorldCameraApi {
  progress: number
  progressRef: { readonly current: number }
  // Where progress is heading: the glide's target while gliding, otherwise where it is.
  aimRef: { readonly current: number }
  glideTo: (id: LandmarkId) => void
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
const forwardKeys: Record<string, 1 | -1> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

// Design §2 Camera path: the same drag, wheel, key, and click rules as useCamera, in one dimension.
// Progress runs from 0 (the cover page) to 1 (the family door).
export function useWorldCamera({ stations, reducedMotion, onMove }: Options): WorldCameraApi {
  const { glideMs, stationEps } = tuning.world
  const { dragThresholdPx } = tuning.camera
  const { snapDelayMs, snapShare } = tuning.pages
  const [progress, setProgressState] = useState(0)
  const progressRef = useRef(0)
  // Where progress is heading: the glide target while gliding, otherwise where it is.
  const aim = useRef(0)
  const drag = useRef<DragState | null>(null)
  const pointers = useRef(new Set<number>())
  const suppressClick = useRef(false)
  const animation = useRef<number | null>(null)
  const snapTimer = useRef<number | null>(null)
  const moved = useRef(onMove)

  useEffect(() => {
    moved.current = onMove
  }, [onMove])

  const order = useMemo(
    () => (Object.entries(stations) as [LandmarkId, number][]).sort((a, b) => a[1] - b[1]),
    [stations],
  )

  const setProgress = useCallback((next: number) => {
    progressRef.current = next
    setProgressState(next)
  }, [])

  // Stops a glide, and a snap waiting for the wheel to go idle.
  const stopGlide = useCallback(() => {
    if (animation.current !== null) cancelAnimationFrame(animation.current)
    animation.current = null
    if (snapTimer.current !== null) window.clearTimeout(snapTimer.current)
    snapTimer.current = null
  }, [])

  const moveTo = useCallback(
    (next: number) => {
      stopGlide()
      aim.current = next
      setProgress(next)
      moved.current?.()
    },
    [setProgress, stopGlide],
  )

  const glideToProgress = useCallback(
    (target: number) => {
      stopGlide()
      aim.current = target
      if (reducedMotion) {
        setProgress(target)
        return
      }
      const from = progressRef.current
      const startedAt = performance.now()
      const step = (time: number) => {
        // A frame's timestamp can come just before the glide started.
        const t = Math.min(1, Math.max(0, (time - startedAt) / glideMs))
        setProgress(from + (target - from) * easeOutCubic(t))
        animation.current = t < 1 ? requestAnimationFrame(step) : null
      }
      animation.current = requestAnimationFrame(step)
    },
    [glideMs, reducedMotion, setProgress, stopGlide],
  )

  const glideTo = useCallback(
    (id: LandmarkId) => {
      const at = stations[id]
      if (at !== undefined) glideToProgress(at)
    },
    [glideToProgress, stations],
  )

  // Design §6: a drag or the wheel can come to rest anywhere, so the camera then glides to the
  // nearest station, if it is within snapShare of the spacing between stations.
  const snap = useCallback(() => {
    if (order.length < 2) return
    const at = progressRef.current
    let nearest = order[0]![1]
    for (const [, station] of order) if (Math.abs(station - at) < Math.abs(nearest - at)) nearest = station
    let spacing = Infinity
    for (let i = 1; i < order.length; i++) spacing = Math.min(spacing, order[i]![1] - order[i - 1]![1])
    const distance = Math.abs(nearest - at)
    if (distance > 0 && distance <= snapShare * spacing) glideToProgress(nearest)
  }, [glideToProgress, order, snapShare])

  useEffect(() => stopGlide, [stopGlide])

  // Arrow keys glide to the next or the previous station, unless a dialog is open or the key
  // belongs to a form field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (document.querySelector('[aria-modal="true"]')) return
      if (e.target instanceof Element && e.target.closest('input, select, textarea')) return
      const direction = forwardKeys[e.key]
      if (!direction) return
      e.preventDefault()
      const from = aim.current
      const next =
        direction > 0
          ? order.find(([, at]) => at > from + stationEps)
          : order.findLast(([, at]) => at < from - stationEps)
      moved.current?.()
      if (next) glideToProgress(next[1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [glideToProgress, order, stationEps])

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
        from: progressRef.current,
        vw: window.innerWidth,
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
      moveTo(progressFromDrag(d.from, dx, dy, d.vw))
    },
    [dragThresholdPx, moveTo],
  )

  const endPointer = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      pointers.current.delete(e.pointerId)
      const d = drag.current
      if (!d || d.pointerId !== e.pointerId) return
      drag.current = null
      if (!d.dragging) return
      suppressClick.current = true
      snap()
    },
    [snap],
  )

  const onWheel = useCallback(
    (e: WheelEvent<HTMLElement>) => {
      if (e.ctrlKey) return
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      // Scrolling down or right reads on, like a finger dragging up or left.
      moveTo(progressFromDrag(progressRef.current, -e.deltaX * scale, -e.deltaY * scale, window.innerWidth))
      snapTimer.current = window.setTimeout(snap, snapDelayMs)
    },
    [moveTo, snap, snapDelayMs],
  )

  const onClickCapture = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!suppressClick.current) return
    suppressClick.current = false
    e.stopPropagation()
    e.preventDefault()
  }, [])

  return {
    progress,
    progressRef,
    aimRef: aim,
    glideTo,
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
