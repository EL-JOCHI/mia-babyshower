import type { CSSProperties } from 'react'
import { copy } from '../content'
import { countdown, type CountdownParts } from '../logic/countdown'
import { tuning } from '../tuning'

interface Props {
  target: string
  now: number
  wobbling: boolean
  scratched: boolean
  onTap: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const units: readonly (keyof CountdownParts)[] = ['days', 'hours', 'minutes', 'seconds']
// The clock ticks once a second, so the digits shown before this tick are a second ago.
const tickMs = 1000

// US-6 and design §5: flip-card digits. When a number changes, the top half of the old number
// falls away over it, like a flip clock. The countdown is not a live region, so screen readers do
// not read every tick; the falling flap is decoration and hidden from them.
export function Countdown({ target, now, wobbling, scratched, onTap }: Props) {
  const parts = countdown(target, now)
  const before = countdown(target, now - tickMs)
  const style = { '--flip-ms': `${tuning.objects.flipMs}ms` } as CSSProperties
  return (
    <div
      className={`countdown${wobbling ? ' is-wobbling' : ''}`}
      data-testid="countdown"
      style={style}
      onClick={onTap}
    >
      {units.map((unit, i) => (
        <div className="countdown-unit" key={unit} style={{ animationDelay: `${i * 60}ms` }}>
          <span className="flip-card">
            <span className="countdown-number">{pad(parts[unit])}</span>
            {before[unit] !== parts[unit] && (
              <span className="flip-flap" key={parts[unit]} aria-hidden="true">
                <span>{pad(before[unit])}</span>
              </span>
            )}
          </span>
          <span className="countdown-label">{copy.countdownLabels[unit]}</span>
        </div>
      ))}
      <svg className={`scratch-marks${scratched ? ' is-visible' : ''}`} viewBox="0 0 40 30" aria-hidden="true">
        <path d="M4 26 L16 4 M12 28 L24 6 M20 28 L32 8" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  )
}
