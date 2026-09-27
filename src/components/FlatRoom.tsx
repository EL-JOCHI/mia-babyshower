import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type UIEvent } from 'react'
import { copy, type CatId, type DayId } from '../content'
import { useCamera } from '../hooks/useCamera'
import { useKeyboardModality } from '../hooks/useKeyboardModality'
import { useSettledPage } from '../hooks/useSettledPage'
import { useViewport } from '../hooks/useViewport'
import { cameraTargetFor, horizontalPosition } from '../logic/camera'
import type { BattleCat } from '../logic/battle'
import type { CatState } from '../logic/catState'
import { stageAt } from '../logic/era'
import { computeLayout, landmarksFor, type LandmarkId, type Layout, type Point } from '../logic/layout'
import { isPartyOver } from '../logic/party'
import { countablePages, type Progress, type ProgressEvent } from '../logic/progress'
import { tuning } from '../tuning'
import { Landmark } from './Landmark'
import { usePages } from './Pages'
import { Signposts } from './Signposts'
import { HeartToy, PickToy, StarToy, ThunderBolt } from './Toys'

export interface RoomProps {
  day: DayId
  now: number
  reducedMotion: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  // Misha and Kira's ¡A jugar! opens the legendary battle (design §7).
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrUrl: string | undefined
  // The game layer (design §6): pages found and badges so far, and where page events go.
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  // The guest's first drag, wheel, or arrow key. Tab, Escape, and modifier keys do not count.
  onFirstMove?: () => void
}

// Fixed decoration spots, as fractions of the layer. Deterministic, so rendering stays pure.
const farDots = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 37) % 100) / 100,
  y: ((i * 53 + 11) % 100) / 100,
  size: 2 + (i % 3) * 2,
}))
// Near decorations stay in bands above and below the cards, so none comes to rest on the words.
const nearBits = Array.from({ length: 12 }, (_, i) => ({
  x: (i + 0.3) / 12,
  y: i % 2 === 0 ? 0.17 + ((i * 7) % 6) / 100 : 0.77 + ((i * 5) % 6) / 100,
  kind: (['heart', 'star', 'pixel', 'thunder', 'pixel', 'pick'] as const)[i % 6],
}))

// The page the camera is centred on: the nearest one, if the camera is within
// tuning.pages.reachShare of the screen of centring it.
function pageInView(camera: Point, layout: Layout, ids: readonly LandmarkId[], vw: number, vh: number): LandmarkId | undefined {
  let best: { id: LandmarkId; dx: number; dy: number } | undefined
  for (const id of ids) {
    const target = cameraTargetFor(layout.positions[id], layout, vw, vh)
    const dx = Math.abs(target.x - camera.x)
    const dy = Math.abs(target.y - camera.y)
    if (!best || Math.hypot(dx, dy) < Math.hypot(best.dx, best.dy)) best = { id, dx, dy }
  }
  const { reachShare } = tuning.pages
  return best && best.dx <= reachShare * vw && best.dy <= reachShare * vh ? best.id : undefined
}

// The pages in view: a page is in view while its centre is on screen (design §5: its object opens).
function pagesInView(camera: Point, layout: Layout, ids: readonly LandmarkId[], vw: number, vh: number): LandmarkId[] {
  return ids.filter((id) => {
    const { x, y } = layout.positions[id]
    return x >= camera.x && x <= camera.x + vw && y >= camera.y && y <= camera.y + vh
  })
}

// Where the camera settles after a drag or the wheel: the nearest page, if it is within
// tuning.pages.snapShare of the spacing between pages.
function snapTarget(camera: Point, layout: Layout, ids: readonly LandmarkId[], vw: number, vh: number): Point | null {
  let best: { target: Point; distance: number } | null = null
  for (const id of ids) {
    const target = cameraTargetFor(layout.positions[id], layout, vw, vh)
    const distance = Math.hypot(target.x - camera.x, target.y - camera.y)
    if (!best || distance < best.distance) best = { target, distance }
  }
  const spacing = layout.roomWidth / Math.max(1, ids.length)
  return best && best.distance > 0 && best.distance <= tuning.pages.snapShare * spacing ? best.target : null
}

function isOutside(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect()
  // Without a layout (zero box) there is nothing to measure, so bring it into view anyway.
  if (r.width === 0 && r.height === 0) return true
  return r.left < 0 || r.top < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight
}

// §3 The room, §4 How the room moves. The flat room is the fallback for reduced motion and for
// browsers without WebGL (design §2): everything is reachable, nothing moves on its own, no canvas.
// It opens on the cover page, or on `startAt` when it takes over from the 3D book.
export function FlatRoom({
  day,
  now,
  reducedMotion,
  catState,
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  onFirstMove,
  startAt = 'llegada',
}: RoomProps & { startAt?: LandmarkId }) {
  const { vw, vh } = useViewport()
  const partyOver = isPartyOver(day, now)
  const ids = useMemo(() => landmarksFor(partyOver), [partyOver])
  const pages = useMemo(() => countablePages(ids), [ids])
  const layout = useMemo(() => computeLayout(vw, vh, ids), [vw, vh, ids])
  const [start] = useState(() => cameraTargetFor(layout.positions[startAt] ?? layout.positions.llegada, layout, vw, vh))
  const hasMoved = useRef(false)
  const firstMove = useRef(onFirstMove)
  useEffect(() => {
    firstMove.current = onFirstMove
  }, [onFirstMove])
  const onMove = useCallback(() => {
    if (hasMoved.current) return
    hasMoved.current = true
    firstMove.current?.()
  }, [])
  const snapTo = useCallback((camera: Point) => snapTarget(camera, layout, ids, vw, vh), [layout, ids, vw, vh])
  const cam = useCamera({ room: layout, vw, vh, reducedMotion, start, onMove, snapTo })
  const viewport = useRef<HTMLDivElement | null>(null)
  const keyboard = useKeyboardModality()

  const position = horizontalPosition(cam.camera.x, layout.roomWidth, vw)
  const stage = stageAt(position)
  const depth = reducedMotion ? { far: 1, mid: 1, near: 1 } : tuning.depth
  const standing = pagesInView(cam.camera, layout, ids, vw, vh)
  const content = usePages({
    day,
    now,
    partyOver,
    stage,
    reducedMotion,
    catState,
    onGreet,
    onChallenge,
    musicPlaying,
    qrUrl,
    progress,
    onEvent,
    standing,
    container: viewport,
    cameraRef: cam.cameraRef,
  })

  // Design §6: a page is found once the camera rests on it (the cover never counts).
  const inView = pageInView(cam.camera, layout, ids, vw, vh)
  useSettledPage(inView && pages.includes(inView) ? inView : undefined, (page) => {
    if (!progress.pages.includes(page)) onEvent({ type: 'reachedPage', page, pages })
  })

  const goTo = (id: LandmarkId) => cam.glideTo(cameraTargetFor(layout.positions[id], layout, vw, vh))

  // Keyboard focus inside the room brings the focused control into view (BR-20, FR-11).
  const onFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (!keyboard.current) return
    const target = e.target as HTMLElement
    const id = target.closest<HTMLElement>('[data-landmark-id]')?.dataset.landmarkId as LandmarkId | undefined
    if (id && ids.includes(id) && isOutside(target)) goTo(id)
  }

  // The browser may scroll a clipped box to show focus. The camera owns position, so undo that.
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    e.currentTarget.scrollLeft = 0
    e.currentTarget.scrollTop = 0
  }

  const layer = (factor: number): CSSProperties => ({
    transform: `translate3d(${-cam.camera.x * factor}px, ${-cam.camera.y * factor}px, 0)`,
  })

  return (
    <main className="room" data-era={stage} aria-label={copy.a11y.room}>
      <div
        ref={viewport}
        className="room-viewport"
        {...cam.surfaceProps}
        onScroll={onScroll}
        onFocusCapture={onFocusCapture}
      >
        <div
          className="layer layer-far"
          aria-hidden="true"
          style={{ ...layer(depth.far), width: layout.roomWidth * depth.far + vw, height: layout.roomHeight * depth.far + vh }}
        >
          {farDots.map((dot, i) => (
            <span
              key={i}
              className="far-dot"
              style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%`, width: dot.size, height: dot.size }}
            />
          ))}
        </div>

        <div
          className="layer layer-mid"
          data-testid="room-mid"
          style={{ ...layer(depth.mid), width: layout.roomWidth, height: layout.roomHeight }}
        >
          {ids.map((id) => (
            <Landmark key={id} id={id} at={layout.positions[id]} width={layout.cardWidth} scale={layout.scale}>
              {content[id]}
            </Landmark>
          ))}
        </div>

        <div
          className="layer layer-near"
          aria-hidden="true"
          style={{ ...layer(depth.near), width: layout.roomWidth * depth.near + vw, height: layout.roomHeight }}
        >
          {nearBits.map((bit, i) => (
            <span key={i} className={`near-bit near-${bit.kind}`} style={{ left: `${bit.x * 100}%`, top: `${bit.y * 100}%` }}>
              {bit.kind === 'heart' && <HeartToy size={18} />}
              {bit.kind === 'star' && <StarToy size={16} />}
              {bit.kind === 'thunder' && <ThunderBolt size={22} />}
              {bit.kind === 'pick' && <PickToy size={14} />}
              {bit.kind === 'pixel' && <span className="pixel-square" />}
            </span>
          ))}
        </div>
      </div>

      <Signposts landmarks={ids} onGo={goTo} />
    </main>
  )
}
