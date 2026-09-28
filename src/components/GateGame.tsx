import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { copy, gateGameCopy } from '../content'
import { useGateBest } from '../hooks/useGateBest'
import { moveCatcher, newGame, startGame, tick, type GateGame as GameState } from '../logic/gateGame'
import { tuning } from '../tuning'
import { CatSprite } from './art/CatSprite'
import { HeartToy, YarnToy } from './Toys'

interface Props {
  reducedMotion: boolean
  // The gate's roaming, greetable Mishona steps aside while she's the catcher (called on every phase
  // change; not called at all with reduced motion, since the game never mounts).
  onPlayingChange?: (playing: boolean) => void
}

type PlayProps = Pick<Props, 'onPlayingChange'>

// What React draws (spec §5): it changes only on a score, a combo, a phase, or a best event. The
// clock, the drops, and the catcher are written by the frame loop itself.
interface Shown {
  phase: GameState['phase']
  score: number
  combo: number
  best: number
  newRecord: boolean
}

const shownOf = (g: GameState): Shown => ({ phase: g.phase, score: g.score, combo: g.combo, best: g.best, newRecord: g.newRecord })
const sameShown = (a: Shown, b: Shown) =>
  a.phase === b.phase && a.score === b.score && a.combo === b.combo && a.best === b.best && a.newRecord === b.newRecord

// The gate arcade game (design §8): 30 seconds, Mishona moving to catch yarn and hearts. Choni
// cheers on a big combo; Chavela startles on a miss. The score/time show but only the game-over
// result is announced, once, to a screen reader.
function GateGamePlay({ onPlayingChange }: PlayProps) {
  const { best, saveBest } = useGateBest()
  const [shown, setShown] = useState<Shown>(() => shownOf(newGame(best)))
  const gameRef = useRef<GameState | null>(null)
  // What React last drew, so the loop only asks for a render when it changes.
  const shownRef = useRef<Shown | null>(null)
  const [cheering, setCheering] = useState(false)
  const [startled, setStartled] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const cheerTimer = useRef<number | undefined>(undefined)
  const startleTimer = useRef<number | undefined>(undefined)
  const pulseTimer = useRef<number | undefined>(undefined)
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const catcherRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef<HTMLParagraphElement | null>(null)
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([])

  const triggerCheer = useCallback(() => {
    setCheering(true)
    window.clearTimeout(cheerTimer.current)
    cheerTimer.current = window.setTimeout(() => setCheering(false), tuning.gateScreen.cheerMs)
  }, [])

  const triggerStartle = useCallback(() => {
    setStartled(true)
    window.clearTimeout(startleTimer.current)
    startleTimer.current = window.setTimeout(() => setStartled(false), tuning.gateScreen.startleMs)
  }, [])

  const triggerPulse = useCallback(() => {
    setPulsing(true)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setPulsing(false), tuning.gateScreen.pulseMs)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(cheerTimer.current)
      window.clearTimeout(startleTimer.current)
      window.clearTimeout(pulseTimer.current)
    },
    [],
  )

  useEffect(() => {
    onPlayingChange?.(shown.phase === 'playing')
  }, [shown.phase, onPlayingChange])

  // The game loop: a requestAnimationFrame tick over the pure logic in gateGame.ts. Each frame it
  // writes the clock's text, the drops' and the catcher's transforms straight to the page, and asks
  // React to render only when the score, the combo, or the phase changes. It pauses while the tab is
  // hidden, and stops scheduling once the round is over.
  useEffect(() => {
    if (shown.phase !== 'playing') return
    let raf = 0
    let last = performance.now()
    let drawnX = gameRef.current?.catcherX ?? 0.5
    let second = -1
    const { catchY } = tuning.gateGame
    const { catcherTransitionMs } = tuning.gateScreen
    const draw = (g: GameState, dt: number) => {
      const field = fieldRef.current
      if (!field) return
      const width = field.clientWidth
      const height = field.clientHeight
      // The catcher eases toward where the guest points, over about catcherTransitionMs.
      drawnX += (g.catcherX - drawnX) * (1 - Math.exp(-dt / catcherTransitionMs))
      if (catcherRef.current) {
        catcherRef.current.style.transform = `translate3d(${drawnX * width}px, ${catchY * height}px, 0) translate(-50%, -50%)`
      }
      slotRefs.current.forEach((slot, i) => {
        if (!slot) return
        const drop = g.drops[i]
        const kind = drop?.kind ?? ''
        if (slot.dataset.kind !== kind) slot.dataset.kind = kind
        if (drop) slot.style.transform = `translate3d(${drop.x * width}px, ${drop.y * height}px, 0) translate(-50%, -50%)`
      })
      const s = Math.ceil(g.timeLeftMs / 1000)
      if (s !== second && timeRef.current) {
        second = s
        timeRef.current.textContent = gateGameCopy.seconds(s)
      }
    }
    const step = (now: number) => {
      if (document.hidden) {
        last = now
        raf = requestAnimationFrame(step)
        return
      }
      const prev = gameRef.current
      if (!prev) return
      const dt = now - last
      last = now
      const next = tick(prev, dt)
      gameRef.current = next
      if (next.phase === 'playing') {
        const spawned = next.nextId - prev.nextId
        const removed = prev.drops.length + spawned - next.drops.length
        const scoreGain = next.score - prev.score
        if (removed > 0 && scoreGain === 0) triggerStartle()
        if (scoreGain > 0 && next.combo >= tuning.gateScreen.cheerCombo) triggerCheer()
        if (next.combo > prev.combo) triggerPulse()
        draw(next, dt)
      }
      const nextShown = shownOf(next)
      if (!shownRef.current || !sameShown(shownRef.current, nextShown)) {
        shownRef.current = nextShown
        setShown(nextShown)
      }
      if (next.phase === 'over') {
        saveBest(next.score)
        return
      }
      raf = requestAnimationFrame(step)
    }
    if (gameRef.current) draw(gameRef.current, catcherTransitionMs * 10)
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [shown.phase, saveBest, triggerCheer, triggerPulse, triggerStartle])

  const begin = (game: GameState) => {
    gameRef.current = game
    shownRef.current = shownOf(game)
    setShown(shownRef.current)
  }
  const start = () => begin(startGame(gameRef.current ?? newGame(best)))
  const restart = () => begin(startGame(newGame(best)))

  const moveTo = (x: number) => {
    const game = gameRef.current
    if (!game || game.phase !== 'playing') return
    gameRef.current = moveCatcher(game, x)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    moveTo((e.clientX - rect.left) / rect.width)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { catcherStep } = tuning.gateScreen
    const x = gameRef.current?.catcherX ?? 0.5
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveTo(x - catcherStep)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveTo(x + catcherStep)
    }
  }

  const style = {
    '--pulse-ms': `${tuning.gateScreen.pulseMs}ms`,
    '--cheer-ms': `${tuning.gateScreen.cheerMs}ms`,
    '--startle-ms': `${tuning.gateScreen.startleMs}ms`,
    '--panel-z': tuning.gateScreen.panelZIndex,
  } as CSSProperties

  const overText =
    shown.phase === 'over'
      ? `${gateGameCopy.over} ${gateGameCopy.score(shown.score)}. ${shown.newRecord ? gateGameCopy.record : gateGameCopy.best(shown.best)}`
      : ''

  return (
    <div className={`gate-game phase-${shown.phase}`} style={style}>
      {shown.phase === 'ready' && (
        <button type="button" className="button gate-game-start" onClick={start}>
          {gateGameCopy.start}
        </button>
      )}

      {shown.phase === 'playing' && (
        <>
          <div className="gate-game-hud">
            <p className="gate-game-score">{gateGameCopy.score(shown.score)}</p>
            <p className={`gate-game-combo${pulsing ? ' is-pulsing' : ''}`}>{gateGameCopy.combo(shown.combo)}</p>
            {/* The frame loop rewrites this as the seconds go by. */}
            <p ref={timeRef} className="gate-game-time">
              {gateGameCopy.seconds(tuning.gateGame.durationMs / 1000)}
            </p>
          </div>

          <div ref={fieldRef} className="gate-game-field" tabIndex={0} onPointerMove={onPointerMove} onKeyDown={onKeyDown}>
            {/* A fixed set of drop slots: the loop fills, moves, and empties them (data-kind). */}
            {Array.from({ length: tuning.gateScreen.dropSlots }, (_, i) => (
              <span
                key={i}
                ref={(el) => {
                  slotRefs.current[i] = el
                }}
                className="gate-game-drop"
                data-kind=""
                aria-hidden="true"
              >
                <YarnToy size={tuning.gateScreen.dropSize} className="gate-game-drop-yarn" />
                <HeartToy size={tuning.gateScreen.dropSize} className="gate-game-drop-heart" />
              </span>
            ))}
            <div ref={catcherRef} className="gate-game-catcher">
              <CatSprite id="luz" stage="luz" size={tuning.gateScreen.catcherSize} />
            </div>
            <div className={`gate-game-side gate-game-mimo${cheering ? ' is-cheering' : ''}`}>
              <CatSprite id="mimo" stage="luz" size={tuning.gateScreen.sideCatSize} />
            </div>
            <div className={`gate-game-side gate-game-susto${startled ? ' is-startled' : ''}`}>
              <CatSprite id="susto" stage="luz" size={tuning.gateScreen.sideCatSize} />
            </div>
          </div>
        </>
      )}

      {shown.phase === 'over' && (
        <div className="gate-game-over">
          <p className="gate-game-over-title">{gateGameCopy.over}</p>
          <p className="gate-game-over-score">{gateGameCopy.score(shown.score)}</p>
          <p className="gate-game-over-best">{shown.newRecord ? gateGameCopy.record : gateGameCopy.best(shown.best)}</p>
          <button type="button" className="button gate-game-again" onClick={restart}>
            {copy.playAgain}
          </button>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {overText}
      </p>
    </div>
  )
}

// §3/§8 Reduced motion: no falling objects at all, and no way to start the game.
export function GateGame({ reducedMotion, onPlayingChange }: Props) {
  return reducedMotion ? null : <GateGamePlay onPlayingChange={onPlayingChange} />
}
