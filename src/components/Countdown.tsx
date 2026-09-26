import { copy } from '../content'
import { countdown } from '../logic/countdown'

interface Props {
  target: string
  now: number
  wobbling: boolean
  scratched: boolean
  onTap: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

// US-6. The countdown is not a live region, so screen readers do not read every tick.
export function Countdown({ target, now, wobbling, scratched, onTap }: Props) {
  const parts = countdown(target, now)
  const units = [
    [parts.days, copy.countdownLabels.days],
    [parts.hours, copy.countdownLabels.hours],
    [parts.minutes, copy.countdownLabels.minutes],
    [parts.seconds, copy.countdownLabels.seconds],
  ] as const
  return (
    <div className={`countdown${wobbling ? ' is-wobbling' : ''}`} data-testid="countdown" onClick={onTap}>
      {units.map(([value, label], i) => (
        <div className="countdown-unit" key={label} style={{ animationDelay: `${i * 60}ms` }}>
          <span className="countdown-number">{pad(value)}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
      <svg className={`scratch-marks${scratched ? ' is-visible' : ''}`} viewBox="0 0 40 30" aria-hidden="true">
        <path d="M4 26 L16 4 M12 28 L24 6 M20 28 L32 8" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  )
}
