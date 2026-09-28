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
import { usePageHidden } from '../hooks/usePageHidden'
import { useSettledPage } from '../hooks/useSettledPage'
import { useWorldCamera } from '../hooks/useWorldCamera'
import type { BattleCat } from '../logic/battle'
import { bookQrPx, fitsBook, roomLevel, wantsBackdrop, type RoomEnvironment } from '../logic/book'
import type { CatState } from '../logic/catState'
import { deviceTier, type DeviceTier } from '../logic/deviceTier'
import { stageAt, type Stage } from '../logic/era'
import { landmarksFor, type LandmarkId, type Point } from '../logic/layout'
import { moodOfDay } from '../logic/mood'
import { isPartyOver } from '../logic/party'
import { nearestStation, stationProgress } from '../logic/path'
import { countablePages, type Progress, type ProgressEvent } from '../logic/progress'
import { hasWebGL } from '../logic/webgl'
import { tuning, type ThemeName } from '../tuning'
import { FlatRoom, type BackdropSlot, type RoomProps } from './FlatRoom'
import { loadBackdrop, loadWorld } from './loadWorld'
import { usePages } from './Pages'
import { Signposts } from './Signposts'

const World = lazy(loadWorld)
// Memoized: its props hold still while the flat camera pans (the attic reads the pan itself, each
// frame), so a drag or a glide never re-renders the attic's own React root.
const Backdrop = memo(lazy(loadBackdrop))

interface Props extends RoomProps {
  // Claro or Oscuro: the lighter or darker version of the day's mood (spec §3).
  theme: ThemeName
  // A full-screen dialog (the battle, Tus gatos) covers the room: the 3D stops drawing (spec §8).
  dialogOpen?: boolean
}

// Why the book gave way to the flat room (spec §7): it did not get ready in time or the screen
// turned too short (the live attic may follow), or the 3D failed (the diorama, with no retry).
export type HandoffReason = 'gaveWay' | 'failed'

// If the 3D fails anyway (the book or the live attic), the guest keeps the flat room.
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
  qrPayload: string
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
  container: RefObject<HTMLElement | null>
  noticeCamera: { readonly current: Point }
  progressRef: { readonly current: number }
  theme: ThemeName
  tier: DeviceTier
  running: boolean
  paused: boolean
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
  qrPayload,
  progress,
  onEvent,
  standing,
  container,
  noticeCamera,
  progressRef,
  theme,
  tier,
  running,
  paused,
  awake,
  onReady,
  onFail,
}: PagesProps) {
  const { content, playAct } = usePages({
    day,
    now,
    partyOver,
    stage,
    reducedMotion: false,
    catState,
    onGreet,
    onChallenge,
    musicPlaying,
    qrPayload,
    progress,
    onEvent,
    standing,
    container,
    cameraRef: noticeCamera,
    familyInWorld: true,
  })
  // Spec §6: in the book the 3D doorway takes the frame tap, and starts Misha's scratch.
  const onDoorTap = useCallback(() => playAct('mishaScratch'), [playAct])
  return (
    <WorldBoundary onError={onFail}>
      <Suspense fallback={null}>
        <World
          ids={ids}
          stations={stations}
          progressRef={progressRef}
          content={content}
          mood={moodOfDay[day]}
          theme={theme}
          tier={tier}
          running={running}
          paused={paused}
          awake={awake}
          onDoorTap={onDoorTap}
          doorComplete={progress.badges.includes('cuentoCompleto')}
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
  qrPayload,
  progress,
  onEvent,
  theme,
  tier,
  paused,
  onFirstMove,
  onFail,
}: Props & { tier: DeviceTier; paused: boolean; onFail: (page: LandmarkId, reason: HandoffReason) => void }) {
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
  // While the book is still loading behind its cover, a move counts for nothing.
  const onMove = useCallback(() => {
    openCover()
    if (hasMoved.current || !ready) return
    hasMoved.current = true
    firstMove.current?.()
  }, [openCover, ready])
  const onReady = useCallback(() => setReady(true), [])

  const cam = useWorldCamera({ stations, reducedMotion: false, onMove })
  const { glideTo, progressRef, aimRef } = cam
  const stage = stageAt(cam.progress)
  // The cover opens once the world is ready and the guest has moved, in either order.
  const opening = ready && moved

  // The book gives way to the flat room on the page the guest was on, or was heading to (spec §7):
  // it stalled or the screen turned too short (the live attic may follow), or the 3D failed.
  const handOff = useCallback(
    (reason: HandoffReason) => onFail(nearestStation(aimRef.current, stations), reason),
    [aimRef, onFail, stations],
  )
  const giveWay = useCallback(() => handOff('gaveWay'), [handOff])
  const failHard = useCallback(() => handOff('failed'), [handOff])

  // Design §6: a page is found once the camera rests within tuning.world.stationEps of its
  // station (the cover never counts). Nothing is found, or stands, until the cover opens: before
  // that the guest sees only the cover.
  const atStation = opening
    ? pages.find((id) => Math.abs(cam.progress - stations[id]) <= tuning.world.stationEps)
    : undefined
  useSettledPage(atStation, (page) => {
    if (!progress.pages.includes(page)) onEvent({ type: 'reachedPage', page, pages })
  })

  // The pages standing now: within the pop-up range of the camera, the same range that stands a
  // page up. Their objects open at once, found or not (the facts are never gated). Keyed by the ids,
  // so the memoized pages re-render only when the set changes.
  const standingKey = opening
    ? ids.filter((id) => Math.abs(cam.progress - stations[id]) <= tuning.world.popUp.range).join(',')
    : ''
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

  // Facts are never gated: a world that stalls before its first frame gives way to the flat room.
  // A paused world draws no frame, so it cannot get ready: the wait holds while a full-screen dialog
  // is open or the tab is hidden, and starts over, whole, once the world runs again.
  useEffect(() => {
    if (ready || paused) return
    const timer = window.setTimeout(giveWay, tuning.world.loadTimeoutMs)
    return () => window.clearTimeout(timer)
  }, [ready, paused, giveWay])

  // Mobile browsers drop WebGL contexts, most often while the guest is away in WhatsApp after
  // Confirmar. The event does not bubble, so the surface catches it on its way down to the canvas.
  useEffect(() => {
    const el = surface.current
    if (!el) return
    const onLost = () => failHard()
    el.addEventListener('webglcontextlost', onLost, true)
    return () => el.removeEventListener('webglcontextlost', onLost, true)
  }, [failHard])

  // Design §9: a screen that turns too short for a readable page (a phone turned sideways) gives
  // way to the flat room for the rest of the visit.
  useEffect(() => {
    const onResize = () => {
      if (!fitsBook(window.innerHeight)) giveWay()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [giveWay])

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
      <div
        ref={surface}
        className="world-surface"
        // The QR is drawn larger in the book, so it stays at its minimum size on a page at its smallest.
        style={{ '--qr-px': `${bookQrPx}px` } as CSSProperties}
        {...cam.surfaceProps}
      >
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
          qrPayload={qrPayload}
          progress={progress}
          onEvent={onEvent}
          standing={standing}
          container={surface}
          noticeCamera={noticeCamera}
          progressRef={progressRef}
          theme={theme}
          tier={tier}
          running={opening}
          paused={paused}
          awake={coverGone}
          onReady={onReady}
          onFail={failHard}
        />
        {!coverGone && <Cover partyOver={partyOver} opening={opening} behind={ready} />}
      </div>
      <Signposts landmarks={ids} onGo={goTo} />
    </main>
  )
}

// Levels 2 and 3 (spec §7): the flat room's cards over the paper diorama, with the live attic fading
// in behind them where it can run. The flat room stays mounted through every change here, so its
// camera, focus, and cards never move: a lost context or an error only takes the attic away, for the
// rest of the visit.
function FlatLevels({
  room,
  startAt,
  env,
  tier,
  paused,
}: {
  room: Props
  startAt: LandmarkId | undefined
  env: Omit<RoomEnvironment, 'backdropReady'>
  tier: DeviceTier
  paused: boolean
}) {
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const box = useRef<HTMLDivElement | null>(null)
  const current = { ...env, failed: env.failed || failed }
  const wants = wantsBackdrop(current)
  const shown = roomLevel({ ...current, backdropReady: ready }) === 'backdrop'
  const fail = useCallback(() => setFailed(true), [])
  const onReady = useCallback(() => setReady(true), [])

  // A lost WebGL context behind the cards leaves the diorama. The event does not bubble, so the box
  // catches it on its way down to the canvas.
  useEffect(() => {
    const el = box.current
    if (!wants || !el) return
    el.addEventListener('webglcontextlost', fail, true)
    return () => el.removeEventListener('webglcontextlost', fail, true)
  }, [wants, fail])

  const mood = moodOfDay[room.day]
  const backdrop: BackdropSlot | undefined = wants
    ? (pan) => (
        <div
          ref={box}
          className={`room-backdrop${shown ? ' is-ready' : ''}`}
          aria-hidden="true"
          style={{ '--backdrop-fade': `${tuning.world.backdropFadeMs}ms` } as CSSProperties}
        >
          <WorldBoundary onError={fail}>
            <Suspense fallback={null}>
              <Backdrop mood={mood} theme={room.theme} tier={tier} panRef={pan} paused={paused} onReady={onReady} onFail={fail} />
            </Suspense>
          </WorldBoundary>
        </div>
      )
    : undefined

  return (
    <FlatRoom
      startAt={startAt}
      day={room.day}
      now={room.now}
      reducedMotion={room.reducedMotion}
      catState={room.catState}
      onGreet={room.onGreet}
      onChallenge={room.onChallenge}
      musicPlaying={room.musicPlaying}
      qrPayload={room.qrPayload}
      progress={room.progress}
      onEvent={room.onEvent}
      onFirstMove={room.onFirstMove}
      backdrop={backdrop}
      backdropShown={shown}
    />
  )
}

// Spec §7: three levels. The full 3D book (a day link, motion allowed, WebGL, a screen tall enough,
// and ready in time); else the flat room's cards over the live attic where WebGL can run; else over
// the paper diorama. Once the book gives way, the flat room stays for the rest of the visit, opening
// on the page the guest was on.
export function WorldRoom(props: Props) {
  const [handoff, setHandoff] = useState<{ page: LandmarkId; reason: HandoffReason } | null>(null)
  // The screen's height at start. From then on the book itself watches it.
  const [height] = useState(() => window.innerHeight)
  // Spec §8 Device tiers: read once per visit.
  const [tier] = useState(() => deviceTier(navigator))
  const hidden = usePageHidden()
  // Spec §8 Pausing: nothing 3D draws while the tab is hidden or a full-screen dialog covers the room.
  const paused = hidden || Boolean(props.dialogOpen)
  const onFail = useCallback((page: LandmarkId, reason: HandoffReason) => setHandoff({ page, reason }), [])
  const env = {
    reducedMotion: props.reducedMotion,
    height,
    webgl: hasWebGL,
    bookGaveWay: handoff !== null,
    failed: handoff?.reason === 'failed',
  }
  if (roomLevel({ ...env, backdropReady: false }) === 'book') {
    return <BookRoom {...props} tier={tier} paused={paused} onFail={onFail} />
  }
  return <FlatLevels room={props} startAt={handoff?.page} env={env} tier={tier} paused={paused} />
}
