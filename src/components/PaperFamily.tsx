import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { tuning } from '../tuning'
import { familyDoorway, familyDrawing, familyFigures, rimPath, type FamilyFigure, type FamilyLayer } from './art/family'

type Phase = 'waiting' | 'entering' | 'standing'

const share = (value: number) => `${Number((value * 100).toFixed(3))}%`

// One paper layer of a figure: the rim of backlight as a glowing stroke, or the body or hair cut from
// paper like the cats (the shared #paper-cut filter: a rough paper edge and a soft shadow) and drawn
// in their scratchy double ink: the ink stroke, a fill-only copy over it so no inner line shows
// (spec §6: no faces, no inner lines), and the lighter second pass offset along the outline, as on
// the cats. The line boils with the cats' (#ink-boil), and holds still with reduced motion.
function Layer({ figure, layer, still }: { figure: FamilyFigure; layer: FamilyLayer; still: boolean }) {
  const { x, y, width, height } = figure.box
  const { line, echo } = tuning.cats
  return (
    <svg className={`figure-layer figure-${layer}`} viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true" focusable="false">
      {layer === 'rim' ? (
        <path d={rimPath(figure)} className="figure-rim-line" strokeWidth={tuning.family.rimWidth} />
      ) : (
        <g filter="url(#paper-cut)">
          <g filter={still ? undefined : 'url(#ink-boil)'}>
            <path d={figure[layer]} className="figure-ink" strokeWidth={line} />
            <path d={figure[layer]} className="figure-fill" />
            <path
              d={figure[layer]}
              className="figure-echo"
              strokeWidth={echo.width}
              opacity={echo.opacity}
              transform={`translate(${echo.dx} ${echo.dy})`}
            />
          </g>
        </g>
      )}
    </svg>
  )
}

// Spec §6: the family as layered CSS 3D paper standing in the card's doorway. The first time the
// door is in view on a visit, the figures fold up from the page (rotateX from flat to upright) and
// walk in, one after another. With reduced motion they simply stand.
export function PaperFamily({ still }: { still: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [phase, setPhase] = useState<Phase>('waiting')

  useEffect(() => {
    if (still) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(() => setPhase('entering'), 0)
      return () => window.clearTimeout(id)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPhase('entering')
          observer.disconnect()
        }
      },
      { threshold: tuning.family.inViewShare },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [still])

  // Once the last figure has walked in, the family simply stands.
  useEffect(() => {
    if (phase !== 'entering') return
    const { foldMs, walkMs, staggerMs } = tuning.family
    const id = window.setTimeout(() => setPhase('standing'), foldMs + walkMs + staggerMs * (familyFigures.length - 1))
    return () => window.clearTimeout(id)
  }, [phase])

  const state = still || phase === 'standing' ? 'is-standing' : phase === 'entering' ? 'is-entering' : 'is-waiting'
  const { foldMs, walkMs, staggerMs, perspectivePx, walkFromPx, depthPx } = tuning.family
  const style = {
    left: share(familyDoorway.x / familyDrawing.width),
    top: share(familyDoorway.y / familyDrawing.height),
    width: share(familyDoorway.width / familyDrawing.width),
    height: share(familyDoorway.height / familyDrawing.height),
    '--family-perspective': `${perspectivePx}px`,
    '--family-fold': `${foldMs}ms`,
    '--family-walk': `${walkMs}ms`,
    '--family-walk-from': `${walkFromPx}px`,
    '--family-rim-depth': `${depthPx.rim}px`,
    '--family-hair-depth': `${depthPx.hair}px`,
  } as CSSProperties

  return (
    <div ref={ref} className={`paper-family ${state}`} aria-hidden="true" style={style}>
      {familyFigures.map((figure, i) => (
        <div
          key={figure.id}
          className={`paper-figure figure-${figure.id}`}
          style={
            {
              left: share((figure.box.x - familyDoorway.x) / familyDoorway.width),
              top: share((figure.box.y - familyDoorway.y) / familyDoorway.height),
              width: share(figure.box.width / familyDoorway.width),
              height: share(figure.box.height / familyDoorway.height),
              '--figure-delay': `${i * staggerMs}ms`,
            } as CSSProperties
          }
        >
          <Layer figure={figure} layer="rim" still={still} />
          <Layer figure={figure} layer="body" still={still} />
          <Layer figure={figure} layer="hair" still={still} />
        </div>
      ))}
    </div>
  )
}
