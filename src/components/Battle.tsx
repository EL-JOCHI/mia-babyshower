import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { battleCopy, catById, copy } from '../content'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { chooseMove, startBattle, type BattleCat, type BattleLine, type BattleState, type MoveId } from '../logic/battle'
import { feelingColors, tuning } from '../tuning'
import { CatSprite } from './art/CatSprite'
import { BattleWipe } from './BattleWipe'
import { trapTab } from './focusTrap'

interface Props {
  cat: BattleCat
  onWin: (cat: BattleCat) => void
  onFlee: () => void
  // Skips the wipe and the typewriter: for tests, and with reduced motion.
  instant?: boolean
}

const moves: readonly MoveId[] = ['ovillo', 'mimos', 'ronroneo', 'huir']

// Each battle line in words (design §13 Battle).
function lineText(cat: BattleCat, line: BattleLine): string {
  const name = catById(cat).name
  switch (line.kind) {
    case 'intro':
      return battleCopy.intro(name)
    case 'you':
      return battleCopy.yourMove[line.move](name)
    case 'effective':
      return battleCopy.effective
    case 'cat':
      return battleCopy.catMoves[cat][line.index] ?? ''
    case 'effect':
      return battleCopy.effectOnYou
    case 'safety':
      return battleCopy.safety(name)
    case 'finisher':
      return battleCopy.finisher[cat]
    case 'fled':
      return battleCopy.fled
  }
}

// A bar change that shows once the line at `at` starts: the cat's energy drops with your move, and
// your paciencia dips with the cat's answer (never below the floor) and refills with the head-bump.
interface BarStep {
  at: number
  energy?: number
  patience?: number
}

function barSteps(before: BattleState, after: BattleState): BarStep[] {
  const from = before.log.length
  const lines = after.log.slice(from)
  const at = (kind: BattleLine['kind']) => from + lines.findIndex((line) => line.kind === kind)
  const steps: BarStep[] = [{ at: from, energy: after.energy }]
  const answer = lines.find((line) => line.kind === 'cat')
  if (answer?.kind === 'cat') {
    const { floor, catDamage } = tuning.battle
    steps.push({ at: at('effect'), patience: Math.max(floor, before.patience - (catDamage[answer.index] ?? 0)) })
    if (lines.some((line) => line.kind === 'safety')) steps.push({ at: at('safety'), patience: after.patience })
  }
  return steps
}

interface Typed {
  line: number
  chars: number
  rest: number
}

function typeStep(t: Typed, log: readonly BattleLine[], cat: BattleCat, restTicks: number): Typed {
  const line = log[t.line]
  if (!line) return t
  if (t.chars < lineText(cat, line).length) return { ...t, chars: t.chars + 1 }
  if (t.rest < restTicks) return { ...t, rest: t.rest + 1 }
  return { line: t.line + 1, chars: 0, rest: 0 }
}

function Bar({ label, value, max, kind }: { label: string; value: number; max: number; kind: 'cat' | 'you' }) {
  const labelId = useId()
  return (
    <div className="battle-bar-row">
      <span id={labelId} className="battle-bar-label">
        {label}
      </span>
      <div
        className={`battle-bar battle-bar-${kind}`}
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
      >
        <span className="battle-bar-fill" style={{ '--bar-value': value / max } as CSSProperties} />
      </div>
    </div>
  )
}

// The legendary battle (design §7): a full-screen dialog. The guest picks moves, the cat answers,
// and every line types out in the box and reaches a live region. Nobody loses: it ends with the
// cat joining (the win button) or with Huir. Escape is Huir.
export function Battle({ cat, onWin, onFlee, instant = false }: Props) {
  const reducedMotion = useReducedMotion()
  const fast = instant || reducedMotion
  const { typeMs, linePauseMs, barMs, burstMs } = tuning.battleScreen
  const name = catById(cat).name
  const titleId = useId()
  const layer = useRef<HTMLDivElement | null>(null)
  const firstMove = useRef<HTMLButtonElement | null>(null)
  const winButton = useRef<HTMLButtonElement | null>(null)
  const [battle, setBattle] = useState(() => startBattle(cat))
  const [steps, setSteps] = useState<BarStep[]>([])
  // The typewriter's place: the line being typed, how many of its characters show, and how many
  // ticks it has rested since the line finished.
  const [typed, setTyped] = useState<Typed>({ line: 0, chars: 0, rest: 0 })
  const [wiping, setWiping] = useState(!fast)
  const endWipe = useCallback(() => setWiping(false), [])

  const { log, phase } = battle
  const done = fast ? log.length : typed.line
  const busy = done < log.length
  const typing = busy ? lineText(cat, log[done]!) : ''

  // One character per tick, a rest after each line, then the next line.
  useEffect(() => {
    if (fast || wiping || !busy) return
    const restTicks = Math.ceil(linePauseMs / typeMs)
    const id = window.setInterval(() => setTyped((t) => typeStep(t, log, cat, restTicks)), typeMs)
    return () => window.clearInterval(id)
  }, [busy, cat, fast, linePauseMs, log, typeMs, wiping])

  // Huir returns to the room after its line.
  useEffect(() => {
    if (phase === 'fled' && !busy) onFlee()
  }, [busy, onFlee, phase])

  const won = phase === 'won' && !busy

  // Escape is the same as Huir, wherever focus is. Once the cat has joined, it keeps the cat.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (won) onWin(cat)
      else onFlee()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cat, onFlee, onWin, won])

  useEffect(() => {
    firstMove.current?.focus()
  }, [])

  useEffect(() => {
    if (won) winButton.current?.focus()
  }, [won])

  const choose = (move: MoveId) => {
    if (busy || phase !== 'choose') return
    const next = chooseMove(battle, move)
    if (move !== 'huir') setSteps((s) => [...s, ...barSteps(battle, next)])
    setBattle(next)
  }

  // A tap on the box finishes the line that is typing.
  const skipLine = () => {
    if (!busy || fast) return
    setTyped((t) => (t.chars < typing.length ? { ...t, chars: typing.length } : { line: t.line + 1, chars: 0, rest: 0 }))
  }

  // Lines that have started reach the live region whole, so a screen reader hears each one once.
  const started = fast ? log.length : Math.min(log.length, typed.line + 1)
  const shown = steps.reduce<{ energy: number; patience: number }>(
    (bars, step) =>
      step.at < started
        ? { energy: step.energy ?? bars.energy, patience: step.patience ?? bars.patience }
        : bars,
    { energy: tuning.battle.energy, patience: tuning.battle.patience },
  )
  const boxText = busy ? typing.slice(0, typed.chars) : phase === 'choose' ? battleCopy.prompt : lineText(cat, log[log.length - 1]!)

  const style = {
    '--feel': feelingColors[cat],
    '--bar-ms': `${barMs}ms`,
    '--burst-ms': `${burstMs}ms`,
    '--wipe-ms': `${tuning.battleScreen.wipeMs}ms`,
  } as CSSProperties

  return (
    <div
      ref={layer}
      className="battle-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={style}
      onKeyDown={(e) => trapTab(e, layer.current)}
    >
      <div className={`battle phase-${phase}${wiping ? ' is-wiping' : ''}`}>
        <h2 id={titleId} className="sr-only">
          {battleCopy.intro(name)}
        </h2>
        <div className="battle-stage">
          <section className="battle-status battle-status-cat">
            <div className="battle-status-head">
              <p className="battle-name">{name}</p>
              <p className="battle-plate">
                <span aria-hidden="true">★★★ </span>
                {copy.rarity.legendario}
              </p>
            </div>
            <Bar label={battleCopy.catBar} value={shown.energy} max={tuning.battle.energy} kind="cat" />
          </section>
          <div className="battle-spot">
            {won && <div className="battle-burst" aria-hidden="true" />}
            <CatSprite id={cat} stage="luz" pose={won ? 'staying' : 'noticing'} size={tuning.catSize.battle} boil={!fast} />
          </div>
          <section className="battle-status battle-status-you">
            <p className="battle-name">{battleCopy.you}</p>
            <Bar label={battleCopy.youBar} value={shown.patience} max={tuning.battle.patience} kind="you" />
          </section>
        </div>
        <div className="battle-box" onClick={skipLine}>
          <p className="battle-text" aria-hidden="true">
            {boxText}
          </p>
          <div className="sr-only" role="log" aria-live="polite">
            {log.slice(0, started).map((line, i) => (
              <p key={i}>{lineText(cat, line)}</p>
            ))}
          </div>
        </div>
        {won ? (
          <div className="battle-actions">
            <button ref={winButton} type="button" className="battle-win" onClick={() => onWin(cat)}>
              {copy.caught(name)}
            </button>
          </div>
        ) : (
          <div className="battle-actions battle-moves" role="group" aria-label={battleCopy.prompt}>
            {moves.map((move, i) => (
              <button
                key={move}
                ref={i === 0 ? firstMove : undefined}
                type="button"
                className={`battle-move battle-move-${move}`}
                aria-disabled={busy || phase !== 'choose' || undefined}
                onClick={() => choose(move)}
              >
                {battleCopy.moves[move]}
              </button>
            ))}
          </div>
        )}
      </div>
      {wiping && <BattleWipe onDone={endWipe} />}
    </div>
  )
}
