import { memo, useId, type CSSProperties, type ReactNode } from 'react'
import type { CatId } from '../../content'
import type { Stage } from '../../logic/era'
import { cssColor, feelingColors, tuning } from '../../tuning'
import { catDrawings, type CatDrawing, type CharmKind, type Extra, type EyeSpec, type Xy } from './cats'

export type CatPose = 'playing' | 'noticing' | 'staying'

interface Props {
  id: CatId
  // Design §1: the book starts as a pencil sketch, becomes ink, and ends in light. Boceto draws the
  // cat in pencil on its paper; tinta inks it with the feeling color muted; luz gives full color and a glow.
  stage: Stage
  pose?: CatPose
  size: number
  // Tus gatos shows a cat not yet met as a flat shape.
  silhouette?: boolean
  // Line boil (design §4): the outlines jitter through the shared #ink-boil filter.
  boil?: boolean
}

const origin = ([x, y]: Xy) => `${x}px ${y}px`
// How far above the paw a front leg meets the body, in drawing units.
const shoulder = 22

// A tube: an edge stroke with the fill stroke inside it, so thin legs and tails get outlines.
function Tube({ d, width, edge }: { d: string; width: number; edge: 'line' | 'edge' }) {
  return (
    <>
      <path d={d} className={`cat-tube-${edge}`} strokeWidth={width + tuning.cats.line * 1.6} />
      <path d={d} className="cat-tube-fill" strokeWidth={width} />
    </>
  )
}

// The lighter second pass of the scratchy double outline, offset beside the ink stroke.
function Echo({ d }: { d: string }) {
  const { echo } = tuning.cats
  return (
    <path
      d={d}
      className="cat-echo"
      strokeWidth={echo.width}
      opacity={echo.opacity}
      transform={`translate(${echo.dx} ${echo.dy})`}
    />
  )
}

function Detail({ d }: { d: string }) {
  return <path d={d} className="cat-detail" strokeWidth={tuning.cats.detail} />
}

function Paint({ extra }: { extra: Extra }) {
  return <path d={extra.d} className={`cat-paint cat-paint-${extra.paint}`} strokeWidth={tuning.cats.detail} />
}

function starPoints(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = (Math.PI / points) * i - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
  }).join(' ')
}

// The collar charm, hung from the collar, in the feeling color.
function Charm({ kind, at: [x, y] }: { kind: CharmKind; at: Xy }) {
  const w = tuning.cats.detail
  const shape: Record<CharmKind, ReactNode> = {
    sun: (
      <>
        <path
          d={`M${x - 5.5} ${y} h11 M${x} ${y - 5.5} v11 M${x - 4} ${y - 4} l8 8 M${x + 4} ${y - 4} l-8 8`}
          className="cat-charm-ray"
          strokeWidth={w}
        />
        <circle cx={x} cy={y} r={3.2} className="cat-charm-shape" strokeWidth={w} />
      </>
    ),
    heart: (
      <path
        d={`M${x} ${y - 1.5} C ${x - 1} ${y - 4.5}, ${x - 5} ${y - 4}, ${x - 5} ${y - 1} C ${x - 5} ${y + 1.5}, ${x - 2} ${y + 3.5}, ${x} ${y + 5} C ${x + 2} ${y + 3.5}, ${x + 5} ${y + 1.5}, ${x + 5} ${y - 1} C ${x + 5} ${y - 4}, ${x + 1} ${y - 4.5}, ${x} ${y - 1.5} Z`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    bell: (
      <path
        d={`M${x - 4} ${y + 3} C ${x - 4} ${y - 1}, ${x - 3} ${y - 4}, ${x} ${y - 4} C ${x + 3} ${y - 4}, ${x + 4} ${y - 1}, ${x + 4} ${y + 3} Z M${x - 1} ${y + 3} a1 1 0 0 0 2 0`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    pick: (
      <path
        d={`M${x - 5} ${y - 3} C ${x - 5} ${y - 5}, ${x + 5} ${y - 5}, ${x + 5} ${y - 3} C ${x + 5} ${y + 1}, ${x + 1} ${y + 6}, ${x} ${y + 6} C ${x - 1} ${y + 6}, ${x - 5} ${y + 1}, ${x - 5} ${y - 3} Z`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    gem: (
      <path
        d={`M${x} ${y - 4.5} L ${x + 4} ${y} L ${x} ${y + 5} L ${x - 4} ${y} Z`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    moon: (
      <path
        d={`M${x + 1} ${y - 5} A 5 5 0 1 0 ${x + 4} ${y + 3} A 4 4 0 1 1 ${x + 1} ${y - 5} Z`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    star: <polygon points={starPoints(x, y, 5.5, 2.4)} className="cat-charm-shape" strokeWidth={w} />,
  }
  return (
    <g className="cat-charm" style={{ transformOrigin: origin([x, y - 5]) }}>
      {shape[kind]}
    </g>
  )
}

// A big eye: the white, the iris in the feeling color, a pupil, and a highlight (a star for Kira).
// The lids are flat shutters clipped to the eye: `cat-droop` rests part-way down (sleepy or cool
// cats) and lifts when the cat notices the guest; `cat-lid` blinks. Both scale with the eye.
interface EyeProps {
  eye: EyeSpec
  pupil: number
  star: boolean
  droop: number
  curve: number
  clipId: string
}

function Eye({ eye, pupil, star, droop, curve, clipId }: EyeProps) {
  const { x, y, r } = eye
  const iris = r * 0.68
  const lid = r + 1
  // The shutter's lower edge bows down by `curve` (0 is a flat, unimpressed lid).
  const edge = y + lid
  const shutter = (className: string, style?: CSSProperties) => (
    <path
      d={`M${x - lid} ${y - lid} H${x + lid} V${edge} Q${x} ${edge + lid * curve * 2} ${x - lid} ${edge} Z`}
      className={className}
      style={{ transformOrigin: origin([x, y - lid]), ...style }}
      vectorEffect="non-scaling-stroke"
    />
  )
  return (
    <g className="cat-eye" style={{ transformOrigin: origin([x, y]) }}>
      <clipPath id={clipId}>
        <circle cx={x} cy={y} r={lid} />
      </clipPath>
      <circle cx={x} cy={y} r={r} className="cat-eye-white" strokeWidth={tuning.cats.detail} />
      <circle cx={x} cy={y + r * 0.08} r={iris} className="cat-iris" strokeWidth={tuning.cats.detail} />
      <ellipse cx={x} cy={y + r * 0.08} rx={iris * pupil} ry={iris * 0.8} className="cat-pupil" />
      {star ? (
        <polygon points={starPoints(x + r * 0.28, y - r * 0.3, r * 0.34, r * 0.13, 4)} className="cat-glint" />
      ) : (
        <circle cx={x + r * 0.3} cy={y - r * 0.32} r={r * 0.2} className="cat-glint" />
      )}
      <g clipPath={`url(#${clipId})`}>
        {droop > 0 && shutter('cat-droop', { ['--droop' as string]: droop })}
        {shutter('cat-lid')}
      </g>
    </g>
  )
}

function Heart({ at: [x, y] }: { at: Xy }) {
  return (
    <path
      className="cat-heart"
      transform={`translate(${x} ${y})`}
      d="M0 3 C -1.5 -1.5, -8 -1.5, -8 3.5 C -8 7.5, -3 10, 0 12.5 C 3 10, 8 7.5, 8 3.5 C 8 -1.5, 1.5 -1.5, 0 3 Z"
      strokeWidth={tuning.cats.detail}
    />
  )
}

function Tail({ tail, edge }: { tail: CatDrawing['tail']; edge: 'line' | 'edge' }) {
  return (
    <g className="cat-tail" style={{ transformOrigin: origin(tail.root) }}>
      <g className="cat-tail-tip" style={{ transformOrigin: origin(tail.joint) }}>
        <Tube d={tail.tip} width={tail.width * 0.85} edge={edge} />
        {tail.tipExtra && <Paint extra={tail.tipExtra} />}
        <Echo d={tail.tip} />
      </g>
      <Tube d={tail.d} width={tail.width} edge={edge} />
      <Echo d={tail.d} />
    </g>
  )
}

function Drawing({ d, pose, uid }: { d: CatDrawing; pose: CatPose; uid: string }) {
  const line = tuning.cats.line
  const tailEdge = d.tail.front ? 'edge' : 'line'
  return (
    <>
      {!d.tail.front && <Tail tail={d.tail} edge={tailEdge} />}
      <g className="cat-body" style={{ transformOrigin: origin(d.body.origin) }}>
        <path d={d.body.d} className="cat-shape" strokeWidth={line} />
        <Echo d={d.body.d} />
        <Detail d={d.body.stitches} />
        {d.legs.map((leg) => {
          const limb = (
            <>
              <Tube d={leg.d} width={leg.width} edge="edge" />
              <ellipse cx={leg.paw[0]} cy={leg.paw[1]} rx={leg.width + 0.8} ry={leg.width * 0.62} className="cat-paw-pad" strokeWidth={tuning.cats.detail} />
            </>
          )
          // The grooming paw swings up from the shoulder, a leg's length above the paw.
          return leg.groom ? (
            <g key={leg.d} className="cat-paw" style={{ transformOrigin: origin([leg.paw[0], leg.paw[1] - shoulder]) }}>
              {limb}
            </g>
          ) : (
            <g key={leg.d}>{limb}</g>
          )
        })}
        <path d={d.collar.d} className="cat-collar" strokeWidth={line} />
        <Charm kind={d.collar.charm} at={d.collar.at} />
      </g>
      {d.tail.front && <Tail tail={d.tail} edge={tailEdge} />}
      <g className="cat-head" style={{ transformOrigin: origin(d.head.origin) }}>
        {(['l', 'r'] as const).map((side) => {
          const ear = d.ears[side]
          return (
            <g key={side} className={`cat-ear-${side}`} style={{ transformOrigin: origin(ear.origin) }}>
              <path d={ear.d} className="cat-shape" strokeWidth={line} strokeLinejoin="round" />
              {ear.inner && <path d={ear.inner} className="cat-ear-inner" />}
              <Echo d={ear.d} />
              {ear.knobs?.map(([x, y]) => (
                <circle key={x} cx={x} cy={y} r={2.3} className="cat-knob" strokeWidth={tuning.cats.detail} />
              ))}
            </g>
          )
        })}
        <path d={d.head.d} className="cat-shape" strokeWidth={line} />
        <Echo d={d.head.d} />
        {d.head.tufts && <Detail d={d.head.tufts} />}
        {d.eyes.map((eye, i) => (
          <Eye
            key={eye.x}
            eye={eye}
            pupil={d.pupil}
            star={Boolean(d.starEyes)}
            droop={d.droop}
            curve={d.lidCurve ?? tuning.cats.lidCurve}
            clipId={`${uid}-eye-${i}`}
          />
        ))}
        <path
          d={`M${d.nose[0] - 2.6} ${d.nose[1] - 1.4} h5.2 l-2.6 3.2 z`}
          className="cat-nose"
          strokeWidth={tuning.cats.detail}
          strokeLinejoin="round"
        />
        <Detail d={d.mouth} />
        <Detail d={d.whiskers} />
        {d.head.extras?.map((extra) => <Paint key={extra.d} extra={extra} />)}
      </g>
      {pose === 'staying' && <Heart at={d.heart} />}
    </>
  )
}

// A cat not yet met: the bare shape, one flat color, no face.
function Silhouette({ d }: { d: CatDrawing }) {
  const tube = (path: string, width: number) => (
    <path d={path} className="cat-silhouette-tube" strokeWidth={width + tuning.cats.line * 1.6} />
  )
  return (
    <>
      {tube(d.tail.d, d.tail.width)}
      {tube(d.tail.tip, d.tail.width * 0.85)}
      {d.tail.tipExtra && <path d={d.tail.tipExtra.d} className="cat-silhouette-shape" />}
      <path d={d.body.d} className="cat-silhouette-shape" />
      {d.legs.map((leg) => (
        <g key={leg.d}>{tube(leg.d, leg.width)}</g>
      ))}
      <path d={d.ears.l.d} className="cat-silhouette-shape" />
      <path d={d.ears.r.d} className="cat-silhouette-shape" />
      <path d={d.head.d} className="cat-silhouette-shape" />
    </>
  )
}

// The seven cats (design §4), one family of paper cut-outs. The rig's parts are named groups
// (.cat-body, .cat-head, .cat-ear-l, .cat-ear-r, .cat-lid, .cat-tail) that CSS moves on springs:
// breathing, blinking, ear twitches, and a tail sway whose tip follows through.
// Memoized: the gate game's catcher and its reactions re-render every animation frame, but a
// cat's own drawing only ever changes with its props.
export const CatSprite = memo(function CatSprite({
  id,
  stage,
  pose = 'playing',
  size,
  silhouette = false,
  boil = false,
}: Props) {
  const d = catDrawings[id]
  const uid = useId()
  const c = tuning.cats
  const feel = feelingColors[id]
  const pencil = cssColor(c.pencil)
  const style = {
    '--feel': feel,
    '--feel-muted': cssColor([feel, pencil, 1 - c.tintaFeel]),
    '--pencil': pencil,
    '--mimo-body': cssColor(c.mimoBody),
    '--glow': `${(c.glowPx * size) / tuning.catSize.room}px`,
    '--turn': `${d.head.turn}deg`,
    '--breath': `${c.breathMs}ms`,
    '--blink': `${c.blinkMs[id]}ms`,
    '--blink-delay': `${c.blinkDelayMs[id]}ms`,
    '--ear': `${c.earMs[id]}ms`,
    '--tail': `${c.tailMs}ms`,
    '--tail-follow': `${c.tailFollowMs}ms`,
  } as CSSProperties
  const classes = ['cat-sprite', `cat-sprite-${id}`, `stage-${stage}`, `pose-${pose}`, silhouette ? 'is-silhouette' : '']
  return (
    <svg
      className={classes.filter(Boolean).join(' ')}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {silhouette ? (
        <Silhouette d={d} />
      ) : (
        <>
          <ellipse cx={d.ground.cx} cy={112} rx={d.ground.rx} ry={3.2} className="cat-ground" />
          <g className="cat-rig" filter="url(#paper-cut)">
            <g filter={boil ? 'url(#ink-boil)' : undefined}>
              <Drawing d={d} pose={pose} uid={uid} />
            </g>
          </g>
        </>
      )}
    </svg>
  )
})
