import { useId, type CSSProperties, type ReactNode } from 'react'
import type { MoodId } from '../logic/mood'
import { tuning } from '../tuning'

interface Props {
  mood: MoodId
  // The flat room's horizontal position: 0 at its left end, 1 at its right end.
  pan: number
  // Reduced motion: the same room with no depth motion (spec §7).
  still: boolean
  // The live attic (level 2) is over it: it is hidden once the attic has faded in.
  resting: boolean
}

type LayerName = keyof typeof tuning.diorama.rates

// The drawing is 400 × 300 with the floor at the bottom; the round window's centre is here.
const windowX = 200
const windowY = 96

// Saturday's stars in the window, as [x, y, r] from its centre.
const stars = [
  [-22, -18, 1.6],
  [14, -26, 1.2],
  [26, -6, 1.8],
  [-8, -30, 1.1],
  [-30, 4, 1.3],
  [6, -12, 1],
  [20, 14, 1.2],
  [-16, 18, 1.4],
] as const

// The garland's or the lanterns' string, sagging between two rafters, and where things hang on it.
const stringPath = 'M30 58 Q200 118 370 58'
const hangAt = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92]

// A point on the string above, at t from 0 to 1.
function alongString(t: number): [number, number] {
  const x = (1 - t) ** 2 * 30 + 2 * (1 - t) * t * 200 + t ** 2 * 370
  const y = (1 - t) ** 2 * 58 + 2 * (1 - t) * t * 118 + t ** 2 * 58
  return [x, y]
}

function starPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.45
    return `${(cx + radius * Math.cos(a)).toFixed(1)},${(cy + radius * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

interface LayerProps {
  name: LayerName
  pan: number
  still: boolean
  // It casts a paper shadow on the layers behind it.
  cast?: boolean
  children: ReactNode
}

// One paper layer. A layer that casts a shadow draws it as a still copy of its cut-outs, a little
// lower and in the shadow color (src/styles/diorama.css .diorama-cast), so sliding it redraws nothing.
function Layer({ name, pan, still, cast = false, children }: LayerProps) {
  const { travelPx, rates, castOffset } = tuning.diorama
  const style = still ? undefined : { transform: `translate3d(${Number(((0.5 - pan) * travelPx * rates[name]).toFixed(2))}px, 0, 0)` }
  return (
    <div className={`diorama-layer diorama-${name}`} style={style}>
      <svg viewBox="0 0 400 300" focusable="false">
        {cast && (
          <g className="diorama-cast" transform={`translate(0 ${castOffset})`}>
            {children}
          </g>
        )}
        {children}
      </svg>
    </div>
  )
}

// Spec §7 Level 3: the mood's attic as layered paper cut-outs behind the flat room's cards: the back
// wall with the round window and that mood's moon or sun, the rafters, the star garland or the
// lantern string, the shelf, crib, chair, and lamp in silhouette, and the floor. The layers slide at
// different rates with the flat camera's horizontal position. Its colors are the mood and theme's,
// through the head's CSS variables (src/headMeta.ts dioramaCss). Pure DOM and SVG, no canvas.
export function PaperDiorama({ mood, pan, still, resting }: Props) {
  const id = useId()
  const sky = `${id}-sky`
  const clip = `${id}-window`
  const r = tuning.diorama.windowRadius
  const classes = ['paper-diorama', `mood-${mood}`, still ? 'is-still' : '', resting ? 'is-resting' : ''].filter(Boolean).join(' ')
  // Level 2's fade, so the diorama hides just as the live attic has faded in over it.
  const style = { '--backdrop-fade': `${tuning.world.backdropFadeMs}ms` } as CSSProperties
  // The beam falls away from the moon (Saturday, on the right) or the sun (Sunday, on the left).
  const shaft = mood === 'saturday' ? 'M176 112 L224 112 L200 300 L110 300 Z' : 'M176 112 L224 112 L300 300 L210 300 Z'

  return (
    <div className={classes} data-mood={mood} aria-hidden="true" style={style}>
      <Layer name="wall" pan={pan} still={still}>
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="diorama-sky-top" />
            <stop offset="1" className="diorama-sky-bottom" />
          </linearGradient>
          <clipPath id={clip}>
            <circle cx={windowX} cy={windowY} r={r} />
          </clipPath>
        </defs>
        <path className="diorama-wall-fill" d="M-200 300 V150 L200 18 L600 150 V300 Z" />
        <g clipPath={`url(#${clip})`}>
          <rect x={windowX - r} y={windowY - r} width={r * 2} height={r * 2} fill={`url(#${sky})`} />
          {mood === 'saturday' &&
            stars.map(([x, y, size], i) => (
              <circle key={i} className="diorama-star" cx={windowX + x} cy={windowY + y} r={size} />
            ))}
          <g transform={`translate(${windowX} ${windowY})`}>
            <g className="diorama-orb-place">
              <circle className="diorama-halo" r={r * 1.8} />
              <circle className="diorama-orb" r={r} />
            </g>
          </g>
        </g>
        <circle className="diorama-window-frame" cx={windowX} cy={windowY} r={r} />
        <path className="diorama-window-bar" d={`M${windowX - r} ${windowY} H${windowX + r} M${windowX} ${windowY - r} V${windowY + r}`} />
        <path className="diorama-shaft" d={shaft} />
      </Layer>

      <Layer name="rafters" pan={pan} still={still} cast>
        <path className="diorama-rafter" d="M-150 170 L200 22 L550 170" />
        <path className="diorama-rafter" d="M60 112 H340" />
        <path className="diorama-rafter" d="M-40 300 V200 M440 300 V200" />
      </Layer>

      <Layer name="garland" pan={pan} still={still} cast>
        <path className="diorama-string" d={stringPath} />
        {hangAt.map((t, i) => {
          const [x, y] = alongString(t)
          return mood === 'saturday' ? (
            <polygon key={i} className="diorama-garland-star" points={starPoints(x, y + 8, 7)} />
          ) : (
            <g key={i}>
              <path className="diorama-string" d={`M${x} ${y} V${y + 8}`} />
              <ellipse className="diorama-lantern" cx={x} cy={y + 18} rx={8} ry={10} />
              <ellipse className="diorama-lantern-glow" cx={x} cy={y + 18} rx={5} ry={7} />
            </g>
          )
        })}
      </Layer>

      <Layer name="props" pan={pan} still={still} cast>
        <path className="diorama-prop" d="M52 262 V188 H118 V262 Z M58 212 H112 M58 237 H112" />
        <path className="diorama-prop" d="M150 262 V222 H250 V262 M150 232 H250 M162 232 V262 M176 232 V262 M190 232 V262 M204 232 V262 M218 232 V262 M232 232 V262" />
        <path className="diorama-prop" d="M292 262 L300 226 H330 L336 262 M300 226 L294 192 M298 250 Q316 270 344 252" />
        <path className="diorama-prop" d="M266 262 H282 M274 262 L270 182 L286 170 M280 172 L296 176 L290 186 Z" />
      </Layer>

      <Layer name="floor" pan={pan} still={still}>
        <rect className="diorama-floor-fill" x={-200} y={262} width={800} height={40} />
        <path className="diorama-plank" d="M-200 274 H600 M-200 287 H600 M60 262 V274 M190 274 V287 M320 262 V274" />
      </Layer>
    </div>
  )
}
