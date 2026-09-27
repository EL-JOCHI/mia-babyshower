import type { CSSProperties } from 'react'
import { tuning } from '../tuning'
import { Countdown } from './Countdown'

interface CandleProps {
  // How much wax is left, from 0 (burnt down) to 1 (whole).
  wax: number
  className?: string
}

// The candle's wax runs from its foot up to its top when whole (drawing units).
const waxFoot = 88
const waxTall = 58

// A melting candle on a dish, with a flickering flame. Decoration only.
export function Candle({ wax, className = '' }: CandleProps) {
  const top = waxFoot - Math.min(1, Math.max(0, wax)) * waxTall
  const style = { '--flicker-ms': `${tuning.objects.candle.flickerMs}ms` } as CSSProperties
  return (
    <svg className={`candle ${className}`} viewBox="0 0 28 96" style={style} aria-hidden="true" focusable="false">
      <ellipse className="candle-dish" cx={14} cy={90} rx={13} ry={4} />
      <rect className="candle-wax" x={7} y={top} width={14} height={waxFoot - top + 1} rx={2} />
      <g transform={`translate(0 ${top})`}>
        {/* Wax dripping down from the melted top. */}
        <path
          className="candle-drip"
          d="M7 0 H21 V6 a1.5 1.5 0 0 1 -3 0 V3 a1.2 1.2 0 0 0 -2.4 0 V9 a1.5 1.5 0 0 1 -3 0 V2.5 a1.2 1.2 0 0 0 -2.4 0 V5 a1.2 1.2 0 0 1 -2.4 0 Z"
        />
        <line className="candle-wick" x1={14} y1={0} x2={14} y2={-5} />
        <g transform="translate(14 -5)">
          <g className="candle-flame">
            <circle className="candle-glow" cx={0} cy={-6} r={10} />
            <path className="candle-fire" d="M0 -15 C 4 -9, 5.5 -3.5, 0 0 C -5.5 -3.5, -4 -9, 0 -15 Z" />
            <path className="candle-core" d="M0 -7 C 1.8 -4.5, 2.2 -1.8, 0 0 C -2.2 -1.8, -1.8 -4.5, 0 -7 Z" />
          </g>
        </g>
      </g>
    </svg>
  )
}

// An hourglass whose sand keeps pouring. Decoration only.
function Hourglass() {
  return (
    <svg className="hourglass" viewBox="0 0 30 64" aria-hidden="true" focusable="false">
      <path className="hourglass-glass" d="M8 6 C8 20, 13 26, 14 32 C13 38, 8 44, 8 58 H22 C22 44, 17 38, 16 32 C17 26, 22 20, 22 6 Z" />
      <path className="sand-top" d="M9.6 13 H20.4 C20 20, 16.4 26, 15 31 C13.6 26, 10 20, 9.6 13 Z" />
      <line className="sand-stream" x1={15} y1={31} x2={15} y2={56} />
      <path className="sand-bottom" d="M9 57 C10 50, 13 47.5, 15 47 C17 47.5, 20 50, 21 57 Z" />
      <g className="hourglass-frame">
        <rect x={3} y={2} width={24} height={4} rx={1.5} />
        <rect x={3} y={58} width={24} height={4} rx={1.5} />
        <line x1={5} y1={6} x2={5} y2={58} />
        <line x1={25} y1={6} x2={25} y2={58} />
      </g>
    </svg>
  )
}

interface Props {
  target: string
  now: number
  wobbling: boolean
  scratched: boolean
  onTap: () => void
}

const dayMs = 86_400_000

// Cuándo (design §5): a melting candle whose wax tracks the time left, an hourglass, and the
// flip-card countdown. The candle is whole tuning.objects.candle.candleDays before the party
// and burns down to a stub at the start. Only the digits reach screen readers, and not as a
// live region.
export function CandleCountdown({ target, now, wobbling, scratched, onTap }: Props) {
  const { candleDays, candleStub } = tuning.objects.candle
  const left = Math.max(0, Date.parse(target) - now) / (candleDays * dayMs)
  const wax = candleStub + (1 - candleStub) * Math.min(1, left)
  const style = { '--sand-ms': `${tuning.objects.sandMs}ms` } as CSSProperties
  return (
    <div className="candle-countdown" style={style}>
      <Candle wax={wax} className="countdown-candle" />
      <Countdown target={target} now={now} wobbling={wobbling} scratched={scratched} onTap={onTap} />
      <Hourglass />
    </div>
  )
}
