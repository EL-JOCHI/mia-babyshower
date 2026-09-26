// Toys and small page objects (§5): yarn, box, heart, star, guitar pick, thunder bolt.
// All decorative: hidden from screen readers.

interface ToyProps {
  size?: number
  className?: string
}

export function HeartToy({ size = 28, className = '' }: ToyProps) {
  return (
    <svg className={`toy toy-heart ${className}`} viewBox="-10 -4 20 18" width={size} height={size} aria-hidden="true">
      <path
        d="M0 3 C -1.5 -1.5, -8 -1.5, -8 3.5 C -8 7.5, -3 10, 0 12.5 C 3 10, 8 7.5, 8 3.5 C 8 -1.5, 1.5 -1.5, 0 3 Z"
        fill="var(--hot-pink)"
      />
    </svg>
  )
}

export function StarToy({ size = 26, className = '' }: ToyProps) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const r = i % 2 === 0 ? 10 : 4.4
    return `${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`
  }).join(' ')
  return (
    <svg className={`toy toy-star ${className}`} viewBox="-11 -11 22 22" width={size} height={size} aria-hidden="true">
      <polygon points={points} fill="var(--star-yellow)" stroke="var(--hot-pink)" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  )
}

export function PickToy({ size = 24, className = '' }: ToyProps) {
  return (
    <svg className={`toy toy-pick ${className}`} viewBox="0 0 20 22" width={size} height={size} aria-hidden="true">
      <path d="M10 21 C 4 15, 1 9, 2 5 C 3 1, 17 1, 18 5 C 19 9, 16 15, 10 21 Z" fill="var(--deep-pink)" />
      <path d="M6 6 C 8 5, 12 5, 14 6" stroke="var(--paper)" strokeWidth={1} fill="none" opacity={0.7} />
    </svg>
  )
}

export function YarnToy({ size = 40, className = '' }: ToyProps) {
  return (
    <svg className={`toy toy-yarn ${className}`} viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <circle cx={18} cy={20} r={14} fill="var(--hot-pink)" />
      <path d="M7 14 C 14 18, 24 18, 30 12" stroke="var(--paper)" strokeWidth={1.4} fill="none" opacity={0.7} />
      <path d="M5 22 C 14 26, 24 26, 32 20" stroke="var(--paper)" strokeWidth={1.4} fill="none" opacity={0.7} />
      <path d="M10 31 C 12 20, 22 10, 26 8" stroke="var(--paper)" strokeWidth={1.4} fill="none" opacity={0.7} />
      <path d="M31 27 C 36 30, 38 34, 36 38" stroke="var(--hot-pink)" strokeWidth={1.6} fill="none" />
    </svg>
  )
}

export function BoxToy({ size = 56, className = '' }: ToyProps) {
  return (
    <svg className={`toy toy-box ${className}`} viewBox="0 0 56 44" width={size} height={(size * 44) / 56} aria-hidden="true">
      <path d="M6 16 H50 V42 H6 Z" fill="var(--shadow)" stroke="var(--hot-pink)" strokeWidth={2} strokeLinejoin="round" />
      <path d="M6 16 L0 6 H22 L28 16" fill="var(--shadow)" stroke="var(--hot-pink)" strokeWidth={2} strokeLinejoin="round" />
      <path d="M50 16 L56 6 H34 L28 16" fill="var(--shadow)" stroke="var(--hot-pink)" strokeWidth={2} strokeLinejoin="round" />
      <path d="M22 28 h12" stroke="var(--hot-pink)" strokeWidth={1.5} opacity={0.6} />
    </svg>
  )
}

export function ThunderBolt({ size = 36, className = '' }: ToyProps) {
  return (
    <svg className={`toy toy-thunder ${className}`} viewBox="0 0 24 36" width={size * 0.67} height={size} aria-hidden="true">
      <polygon points="14,0 2,20 11,20 7,36 22,13 13,13" fill="var(--star-yellow)" stroke="var(--hot-pink)" strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  )
}

export function BowToy({ size = 34, className = '' }: ToyProps) {
  return (
    <svg className={`toy toy-bow ${className}`} viewBox="-18 -12 36 24" width={size} height={(size * 24) / 36} aria-hidden="true">
      <path d="M0 0 L-15 -9 C -18 -3, -18 3, -15 9 Z" fill="var(--hot-pink)" />
      <path d="M0 0 L15 -9 C 18 -3, 18 3, 15 9 Z" fill="var(--hot-pink)" />
      <path d="M-2 2 L-7 11 M2 2 L7 11" stroke="var(--hot-pink)" strokeWidth={2.4} strokeLinecap="round" />
      <circle r={3.4} fill="var(--deep-pink)" />
    </svg>
  )
}
