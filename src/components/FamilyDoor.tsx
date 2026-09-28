import { PaperFamily } from './PaperFamily'

// Spec §6 The family door: a lit doorway, the family standing in it as paper pop-ups (PaperFamily),
// and the door frame drawn over them. Tapping the frame starts Misha's scratch. Once every page that
// counts is found, the door glows brighter (.door-stage.is-complete). Drawn in SVG, never from a photo.

interface Props {
  scratching: boolean
  still: boolean
  onFrameTap: () => void
}

const floor = 236
const arch = `M66 ${floor} V104 A94 64 0 0 1 254 104 V${floor}`

export function FamilyDoor({ scratching, still, onFrameTap }: Props) {
  return (
    <div className="family-door">
      <svg className="family-door-light" viewBox="0 0 320 250" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="door-light" cx="50%" cy="60%" r="65%">
            <stop offset="0%" style={{ stopColor: 'var(--bone)' }} />
            <stop offset="45%" style={{ stopColor: 'var(--bone)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--rose)' }} />
          </radialGradient>
          <radialGradient id="door-halo" cx="50%" cy="55%" r="50%">
            <stop offset="0%" style={{ stopColor: 'var(--rose)', stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: 'var(--rose)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <ellipse cx={160} cy={140} rx={160} ry={120} fill="url(#door-halo)" />
        <path d={`${arch} Z`} fill="url(#door-light)" />
        <ellipse cx={160} cy={floor + 4} rx={120} ry={8} fill="var(--rose)" opacity={0.35} />
      </svg>

      <PaperFamily still={still} />

      <svg className="family-door-frame" viewBox="0 0 320 250" aria-hidden="true" focusable="false">
        <path className="door-frame" d={arch} fill="none" stroke="var(--rose)" strokeWidth={6} strokeLinejoin="round" />
        <path className="door-frame-hit" d={arch} fill="none" stroke="transparent" strokeWidth={26} onClick={onFrameTap} />
        <g className={`door-scratch${scratching ? ' is-visible' : ''}`} stroke="var(--bone)" strokeWidth={2} strokeLinecap="round">
          <path d="M58 150 l14 -12" />
          <path d="M58 158 l14 -12" />
          <path d="M58 166 l14 -12" />
        </g>
      </svg>
    </div>
  )
}
