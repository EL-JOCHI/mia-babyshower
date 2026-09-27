import { useState, type CSSProperties, type ReactNode } from 'react'
import { tuning } from '../tuning'

interface Props {
  // The page is standing or in view, found, or motion is reduced: the map lies open. Once open, it
  // stays open, so it unrolls once.
  unrolled: boolean
  // The address and Ver en el mapa, written on the map.
  children: ReactNode
}

// Dónde (design §5): a treasure map. As soon as its page stands (or is in view), the parchment
// unrolls from the centre (a clip-path), the two rolled ends slide out to the edges, and a pin drops
// on the spot. A tap or keyboard focus inside also unrolls it.
export function TreasureMap({ unrolled, children }: Props) {
  const [open, setOpen] = useState(unrolled)
  if (unrolled && !open) setOpen(true)
  const { unrollMs, pinDelayMs, pinMs } = tuning.objects.map
  const style = {
    '--unroll-ms': `${unrollMs}ms`,
    '--pin-delay': `${pinDelayMs}ms`,
    '--pin-ms': `${pinMs}ms`,
  } as CSSProperties
  return (
    <div
      className={`treasure-map${open ? ' is-unrolled' : ''}`}
      style={style}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen(true)}
    >
      <div className="map-sheet">
        <svg className="map-art" viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {/* Hills, the dotted trail to the X, and trees above the words; a river and the compass
              below them. */}
          <path className="map-hills" d="M14 50 l12 -14 l12 14 M32 50 l10 -10 l10 10" />
          <path className="map-trail" d="M44 56 C 70 70, 96 30, 124 46 S 138 52, 146 44" />
          <path className="map-x" d="M142 34 l16 16 M158 34 l-16 16" />
          <g className="map-trees">
            <path d="M236 44 l7 -14 l7 14 Z M254 52 l6 -12 l6 12 Z M270 42 l5 -10 l5 10 Z" />
          </g>
          <path className="map-river" d="M-4 212 C 40 196, 70 218, 120 206 S 200 192, 304 210" />
          <g className="map-compass" transform="translate(274 196)">
            <circle r={10} />
            <path d="M0 -14 L2.5 0 L0 14 L-2.5 0 Z" />
          </g>
        </svg>
        <span className="map-pin" aria-hidden="true">
          <svg viewBox="0 0 24 34" focusable="false">
            <path d="M12 33 C 5 22, 1 16, 1 11 a11 11 0 0 1 22 0 C 23 16, 19 22, 12 33 Z" />
            <circle cx={12} cy={11} r={4} />
          </svg>
        </span>
        <div className="map-text">{children}</div>
      </div>
      <span className="map-roll map-roll-left" aria-hidden="true" />
      <span className="map-roll map-roll-right" aria-hidden="true" />
    </div>
  )
}
