import { useEffect, useRef, useState } from 'react'

// §3 The family door. Four solid shadows with no faces, told apart by height and hair:
// dad (tallest, a full round afro), mom (straight hair), Miguelito (child, curly), Mia (smallest, curly).
// Drawn as SVG paths, never from a photo (§5).

interface Props {
  scratching: boolean
  still: boolean
  onFrameTap: () => void
}

const floor = 236

function curls(cx: number, cy: number, ringR: number, curlR: number, from: number, to: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180
    return <circle key={i} cx={cx + ringR * Math.cos(a)} cy={cy + ringR * Math.sin(a)} r={curlR} />
  })
}

function body(cx: number, neckY: number, shoulderW: number, hipW: number) {
  const s = shoulderW / 2
  const h = hipW / 2
  const waist = neckY + (floor - neckY) * 0.48
  return (
    <path
      d={`M${cx - 4} ${neckY - 4} h8 v6 C ${cx + s} ${neckY + 2}, ${cx + s + 2} ${neckY + 10}, ${cx + s} ${neckY + 24}
          L ${cx + h} ${waist} L ${cx + h - 2} ${floor} L ${cx + 2} ${floor} L ${cx} ${waist + 18}
          L ${cx - 2} ${floor} L ${cx - h + 2} ${floor} L ${cx - h} ${waist}
          L ${cx - s} ${neckY + 24} C ${cx - s - 2} ${neckY + 10}, ${cx - s} ${neckY + 2}, ${cx - 4} ${neckY + 2} Z`}
    />
  )
}

// The four figures. Drawn twice by the door: a stroked underlay, then a fill-only copy on top,
// so only the outer outline shows and no face or interior line appears (§5).
function Figures() {
  return (
    <>
      {/* Mia: the smallest shadow, curly hair. */}
      <g className="family-figure figure-mia" style={{ animationDelay: '600ms' }}>
        {body(88, 204, 17, 15)}
        {curls(88, 195, 7.5, 3.6, 160, 380, 9)}
        <circle cx={88} cy={196} r={7.5} />
      </g>
      {/* Dad: the tallest, a soft round afro, higher and wider than a short cap. */}
      <g className="family-figure figure-dad" style={{ animationDelay: '0ms' }}>
        {body(124, 114, 50, 36)}
        <circle cx={124} cy={86} r={25} />
        {curls(124, 86, 25, 9.5, 150, 390, 14)}
        <circle cx={124} cy={102} r={14} />
      </g>
      {/* Mom: tall, straight hair, no curls. */}
      <g className="family-figure figure-mom" style={{ animationDelay: '200ms' }}>
        {body(176, 122, 40, 44)}
        <path d="M160 150 L158 100 C158 80 194 80 194 100 L192 150 Z" />
        <circle cx={176} cy={102} r={14} />
      </g>
      {/* Miguelito: shorter than the parents, curly hair. */}
      <g className="family-figure figure-miguelito" style={{ animationDelay: '400ms' }}>
        {body(222, 170, 28, 24)}
        {curls(222, 156, 11, 5, 155, 385, 10)}
        <circle cx={222} cy={158} r={11} />
      </g>
    </>
  )
}

export function FamilyDoor({ scratching, still, onFrameTap }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [entered, setEntered] = useState(false)

  // The family moves once, into the lit doorway, the first time the door is in view on a visit.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(() => setEntered(true), 0)
      return () => window.clearTimeout(id)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const state = still || entered ? 'is-entered' : 'is-waiting'

  return (
    <svg ref={ref} className={`family-door ${state}`} viewBox="0 0 320 250" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="door-light" cx="50%" cy="60%" r="65%">
          <stop offset="0%" style={{ stopColor: 'var(--paper)' }} />
          <stop offset="45%" style={{ stopColor: 'var(--blush)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--hot-pink)' }} />
        </radialGradient>
        <radialGradient id="door-halo" cx="50%" cy="55%" r="50%">
          <stop offset="0%" style={{ stopColor: 'var(--hot-pink)', stopOpacity: 0.55 }} />
          <stop offset="100%" style={{ stopColor: 'var(--hot-pink)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <ellipse cx={160} cy={140} rx={160} ry={120} fill="url(#door-halo)" />
      <path d={`M66 ${floor} V104 A94 64 0 0 1 254 104 V${floor} Z`} fill="url(#door-light)" />
      <ellipse cx={160} cy={floor + 4} rx={120} ry={8} fill="var(--hot-pink)" opacity={0.35} />

      <g className="family-shadows family-rim" fill="var(--shadow)" stroke="var(--hot-pink)" strokeOpacity={0.6} strokeWidth={2.4}>
        <Figures />
      </g>
      <g className="family-shadows" fill="var(--shadow)">
        <Figures />
      </g>

      <path
        className="door-frame"
        d={`M66 ${floor} V104 A94 64 0 0 1 254 104 V${floor}`}
        fill="none"
        stroke="var(--hot-pink)"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        className="door-frame-hit"
        d={`M66 ${floor} V104 A94 64 0 0 1 254 104 V${floor}`}
        fill="none"
        stroke="transparent"
        strokeWidth={26}
        onClick={onFrameTap}
      />
      <g className={`door-scratch${scratching ? ' is-visible' : ''}`} stroke="var(--paper)" strokeWidth={2} strokeLinecap="round">
        <path d="M58 150 l14 -12" />
        <path d="M58 158 l14 -12" />
        <path d="M58 166 l14 -12" />
      </g>
    </svg>
  )
}
