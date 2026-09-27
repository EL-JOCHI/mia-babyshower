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
  // The gate's roaming, greetable Luz steps aside while she's the catcher (called on every phase
  // change; not called at all with reduced motion, since the game never mounts).
  onPlayingChange?: (playing: boolean) => void
}

type PlayProps = Pick<Props, 'onPlayingChange'>

// The gate arcade game (design §8): 30 seconds, Luz moving to catch yarn and hearts. Mimo cheers on
// a big combo; Susto startles on a miss. The score/time show but only the game-over result is
// announced, once, to a screen reader.
function GateGamePlay({ onPlayingChange }: PlayProps) {
  const { best, saveBest } = useGateBest()
  const [game, setGame] = useState<GameState>(() => newGame(best))
  const gameRef = useRef(game)
  const [cheering, setCheering] = useState(false)
  const [startled, setStartled] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const cheerTimer = useRef<number | undefined>(undefined)
  const startleTimer = useRef<number | undefined>(undefined)
  const pulseTimer = useRef<number | undefined>(undefined)

  const updateGame = useCallback((next: GameState) => {
    gameRef.current = next
    setGame(next)
  }, [])

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
    onPlayingChange?.(game.phase === 'playing')
  }, [game.phase, onPlayingChange])

  // The game loop: a requestAnimationFrame tick over the pure logic in gateGame.ts. It pauses while
  // the tab is hidden, and stops scheduling once the round is over.
  useEffect(() => {
    if (game.phase !== 'playing') return
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      if (document.hidden) {
        last = now
        raf = requestAnimationFrame(step)
        return
      }
      const prev = gameRef.current
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
      }
      setGame(next)
      if (next.phase === 'over') {
        saveBest(next.score)
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [game.phase, saveBest, triggerCheer, triggerPulse, triggerStartle])

  const start = () => updateGame(startGame(gameRef.current))
  const restart = () => updateGame(startGame(newGame(best)))

  const moveTo = (x: number) => {
    if (gameRef.current.phase !== 'playing') return
    updateGame(moveCatcher(gameRef.current, x))
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    moveTo((e.clientX - rect.left) / rect.width)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { catcherStep } = tuning.gateScreen
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveTo(gameRef.current.catcherX - catcherStep)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveTo(gameRef.current.catcherX + catcherStep)
    }
  }

  const style = {
    '--pulse-ms': `${tuning.gateScreen.pulseMs}ms`,
    '--cheer-ms': `${tuning.gateScreen.cheerMs}ms`,
    '--startle-ms': `${tuning.gateScreen.startleMs}ms`,
    '--catcher-ms': `${tuning.gateScreen.catcherTransitionMs}ms`,
    '--panel-z': tuning.gateScreen.panelZIndex,
  } as CSSProperties

  const overText =
    game.phase === 'over'
      ? `${gateGameCopy.over} ${gateGameCopy.score(game.score)}. ${game.newRecord ? gateGameCopy.record : gateGameCopy.best(game.best)}`
      : ''

  return (
    <div className={`gate-game phase-${game.phase}`} style={style}>
      {game.phase === 'ready' && (
        <button type="button" className="button gate-game-start" onClick={start}>
          {gateGameCopy.start}
        </button>
      )}

      {game.phase === 'playing' && (
        <>
          <div className="gate-game-hud">
            <p className="gate-game-score">{gateGameCopy.score(game.score)}</p>
            <p className={`gate-game-combo${pulsing ? ' is-pulsing' : ''}`}>{gateGameCopy.combo(game.combo)}</p>
            <p className="gate-game-time">{gateGameCopy.seconds(Math.ceil(game.timeLeftMs / 1000))}</p>
          </div>

          <div className="gate-game-field" tabIndex={0} onPointerMove={onPointerMove} onKeyDown={onKeyDown}>
            {game.drops.map((drop) => (
              <span
                key={drop.id}
                className={`gate-game-drop gate-game-drop-${drop.kind}`}
                style={{ left: `${drop.x * 100}%`, top: `${drop.y * 100}%` }}
                aria-hidden="true"
              >
                {drop.kind === 'yarn' ? (
                  <YarnToy size={tuning.gateScreen.dropSize} />
                ) : (
                  <HeartToy size={tuning.gateScreen.dropSize} />
                )}
              </span>
            ))}
            <div
              className="gate-game-catcher"
              style={{ left: `${game.catcherX * 100}%`, top: `${tuning.gateGame.catchY * 100}%` }}
            >
              <CatSprite id="luz" stage="luz" size={tuning.gateScreen.catcherSize} boil />
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

      {game.phase === 'over' && (
        <div className="gate-game-over">
          <p className="gate-game-over-title">{gateGameCopy.over}</p>
          <p className="gate-game-over-score">{gateGameCopy.score(game.score)}</p>
          <p className="gate-game-over-best">{game.newRecord ? gateGameCopy.record : gateGameCopy.best(game.best)}</p>
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
