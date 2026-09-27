import {
  Component,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { copy, type CatId, type DayId } from '../content'
import { useKeyboardModality } from '../hooks/useKeyboardModality'
import { useSettledPage } from '../hooks/useSettledPage'
import { useWorldCamera } from '../hooks/useWorldCamera'
import type { BattleCat } from '../logic/battle'
import type { CatState } from '../logic/catState'
import { stageAt, type Stage } from '../logic/era'
import { landmarksFor, type LandmarkId, type Point } from '../logic/layout'
import { isPartyOver } from '../logic/party'
import { stationProgress } from '../logic/path'
import { countablePages, type Progress, type ProgressEvent } from '../logic/progress'
import { hasWebGL } from '../logic/webgl'
import { tuning, type ThemeName } from '../tuning'
import { FlatRoom, type RoomProps } from './FlatRoom'
import { usePages } from './Pages'
import { Signposts } from './Signposts'

const World = lazy(() => import('../world/World'))

interface Props extends RoomProps {
  // The world is the same book by night (Oscuro) and by day (Claro), design §3.
  theme: ThemeName
}

// If the world fails anyway, the guest gets the flat room instead.
class WorldBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

interface PagesProps {
  ids: readonly LandmarkId[]
  stations: Record<LandmarkId, number>
  stage: Stage
  day: DayId
  now: number
  partyOver: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrUrl: string | undefined
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
  container: RefObject<HTMLElement | null>
  noticeCamera: { readonly current: Point }
  progressRef: { readonly current: number }
  theme: ThemeName
  awake: boolean
  onReady: () => void
  onFail: () => void
}

// The world and its pages. Memoized, so moving the camera does not re-render the pages: the
// camera reads progress each frame instead.
const BookPages = memo(function BookPages({
  ids,
  stations,
  stage,
  day,
  now,
  partyOver,
  catState,
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  standing,
  container,
  noticeCamera,
  progressRef,
  theme,
  awake,
  onReady,
  onFail,
}: PagesProps) {
  const content = usePages({
    day,
    now,
    partyOver,
    stage,
    reducedMotion: false,
    catState,
    onGreet,
    onChallenge,
    musicPlaying,
    qrUrl,
    progress,
    onEvent,
    standing,
    container,
    cameraRef: noticeCamera,
  })
  return (
    <WorldBoundary onError={onFail}>
      <Suspense fallback={null}>
        <World
          ids={ids}
          stations={stations}
          progressRef={progressRef}
          content={content}
          theme={theme}
          awake={awake}
          onReady={onReady}
          onFail={onFail}
        />
      </Suspense>
    </WorldBoundary>
  )
})

// Design §2 Loading: the first paint is the book cover in HTML, readable at once.
function Cover({ partyOver, opening, behind }: { partyOver: boolean; opening: boolean; behind: boolean }) {
  return (
    <div
      className={`book-cover${opening ? ' is-opening' : ''}`}
      // Once the book is ready, its first page carries the same words for screen readers.
      aria-hidden={behind || undefined}
      style={{ '--cover-flip': `${tuning.world.coverFlipMs}ms` } as CSSProperties}
    >
      <div className="book-cover-inner">
        <p className="cover-title">{copy.title}</p>
        {partyOver ? (
          <>
            <p className="cover-hero">{copy.postPartyHero}</p>
            <p className="cover-hero relive">{copy.relive}</p>
          </>
        ) : (
          <p className="cover-hero">{copy.hero}</p>
        )}
        <p className="move-hint">{copy.moveHint}</p>
      </div>
    </div>
  )
}

function BookRoom({
  day,
  now,
  catState,
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  theme,
  onFirstMove,
  onFail,
}: Props & { onFail: () => void }) {
  const partyOver = isPartyOver(day, now)
  const ids = useMemo(() => landmarksFor(partyOver), [partyOver])
  const pages = useMemo(() => countablePages(ids), [ids])
  const stations = useMemo(() => stationProgress(ids), [ids])
  const surface = useRef<HTMLDivElement | null>(null)
  const keyboard = useKeyboardModality()
  const [ready, setReady] = useState(false)
  const [moved, setMoved] = useState(false)
  const [coverGone, setCoverGone] = useState(false)
  const hasMoved = useRef(false)
  const firstMove = useRef(onFirstMove)

  useEffect(() => {
    firstMove.current = onFirstMove
  }, [onFirstMove])

  const openCover = useCallback(() => setMoved(true), [])
  // A drag, the wheel, or an arrow key: the guest's own move. It opens the cover and, the first
  // time, counts as the first move (design §6). Other keys and signposts only open the cover.
  const onMove = useCallback(() => {
    openCover()
    if (hasMoved.current) return
    hasMoved.current = true
    firstMove.current?.()
  }, [openCover])
  const onReady = useCallback(() => setReady(true), [])

  const cam = useWorldCamera({ stations, reducedMotion: false, onMove })
  const { glideTo, progressRef } = cam
  const stage = stageAt(cam.progress)
  // The cover opens once the world is ready and the guest has moved, in either order.
  const opening = ready && moved

  // Design §6: a page is found once the camera rests within tuning.world.stationEps of its
  // station (the cover never counts).
  const atStation = pages.find((id) => Math.abs(cam.progress - stations[id]) <= tuning.world.stationEps)
  useSettledPage(atStation, (page) => {
    if (!progress.pages.includes(page)) onEvent({ type: 'reachedPage', page, pages })
  })

  // The pages standing now: within the pop-up range of the camera, the same range that stands a
  // page up. Their objects open at once, found or not (the facts are never gated). Keyed by the ids,
  // so the memoized pages re-render only when the set changes.
  const standingKey = ids.filter((id) => Math.abs(cam.progress - stations[id]) <= tuning.world.popUp.range).join(',')
  const standing = useMemo(() => (standingKey ? (standingKey.split(',') as LandmarkId[]) : []), [standingKey])

  // Any key opens the cover, so a keyboard never tabs into a closed book.
  useEffect(() => {
    if (moved) return
    window.addEventListener('keydown', openCover)
    return () => window.removeEventListener('keydown', openCover)
  }, [moved, openCover])

  useEffect(() => {
    if (!opening) return
    const timer = window.setTimeout(() => setCoverGone(true), tuning.world.coverFlipMs)
    return () => window.clearTimeout(timer)
  }, [opening])

  // Facts are never gated: a world that stalls before its first frame hands over to the flat room.
  useEffect(() => {
    if (ready) return
    const timer = window.setTimeout(onFail, tuning.world.loadTimeoutMs)
    return () => window.clearTimeout(timer)
  }, [ready, onFail])

  // Keyboard focus inside a page glides the camera to that page (BR-20, FR-11). The pages live in
  // their own DOM roots inside the surface, so this listens on the DOM directly.
  useEffect(() => {
    const el = surface.current
    if (!el) return
    const onFocusIn = (e: FocusEvent) => {
      if (!keyboard.current || !(e.target instanceof Element)) return
      const id = e.target.closest<HTMLElement>('[data-landmark-id]')?.dataset.landmarkId as LandmarkId | undefined
      const at = id === undefined ? undefined : stations[id]
      if (id && at !== undefined && Math.abs(progressRef.current - at) > tuning.world.stationEps) glideTo(id)
    }
    // The browser may scroll a clipped box to show focus. The camera owns position, so undo that.
    const onScroll = (e: Event) => {
      if (!(e.target instanceof HTMLElement)) return
      e.target.scrollLeft = 0
      e.target.scrollTop = 0
    }
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('scroll', onScroll, true)
    return () => {
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('scroll', onScroll, true)
    }
  }, [glideTo, keyboard, progressRef, stations])

  // Noticing measures the cats' real positions on screen. For rushing, the camera moves one
  // pixel per pixel of finger drag, as in the flat room.
  const noticeCamera = useMemo(
    () => ({
      get current(): Point {
        return { x: (progressRef.current * window.innerWidth) / tuning.world.dragProgressPerViewport, y: 0 }
      },
    }),
    [progressRef],
  )

  const goTo = (id: LandmarkId) => {
    openCover()
    glideTo(id)
  }

  return (
    <main className="world-room" data-era={stage} aria-label={copy.a11y.room}>
      <div ref={surface} className="world-surface" {...cam.surfaceProps}>
        <BookPages
          ids={ids}
          stations={stations}
          stage={stage}
          day={day}
          now={now}
          partyOver={partyOver}
          catState={catState}
          onGreet={onGreet}
          onChallenge={onChallenge}
          musicPlaying={musicPlaying}
          qrUrl={qrUrl}
          progress={progress}
          onEvent={onEvent}
          standing={standing}
          container={surface}
          noticeCamera={noticeCamera}
          progressRef={progressRef}
          theme={theme}
          awake={coverGone}
          onReady={onReady}
          onFail={onFail}
        />
        {!coverGone && <Cover partyOver={partyOver} opening={opening} behind={ready} />}
      </div>
      <Signposts landmarks={ids} onGo={goTo} />
    </main>
  )
}

// Design §2: the 3D pop-up book, or the flat room with reduced motion, without WebGL, or when
// the world fails.
export function WorldRoom(props: Props) {
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])
  if (props.reducedMotion || failed || !hasWebGL()) {
    return (
      <FlatRoom
        day={props.day}
        now={props.now}
        reducedMotion={props.reducedMotion}
        catState={props.catState}
        onGreet={props.onGreet}
        onChallenge={props.onChallenge}
        musicPlaying={props.musicPlaying}
        qrUrl={props.qrUrl}
        progress={props.progress}
        onEvent={props.onEvent}
        onFirstMove={props.onFirstMove}
      />
    )
  }
  return <BookRoom {...props} onFail={onFail} />
}
