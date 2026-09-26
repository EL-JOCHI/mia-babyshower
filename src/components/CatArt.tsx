import type { ReactNode } from 'react'
import type { CatId } from '../content'
import { catFace } from '../tuning'

export type CatPose = 'playing' | 'noticing' | 'staying'

interface Props {
  id: CatId
  pose?: CatPose
  silhouette?: boolean
  size?: number
  accent: string
  // In the pixel era Mimo's blush body renders as paper white (§4: black, white, and one pink).
  pixel?: boolean
}

// One style for all seven (§5 Shared cat look): near-black body with an accent outline,
// big simple eyes, a small pink nose, pink inner ears. Mimo alone has a blush body and a small bow.

function Tail({ d, width = 7 }: { d: string; width?: number }) {
  return (
    <g className="cat-tail">
      <path d={d} fill="none" stroke="var(--cat-outline)" strokeWidth={width + 4} strokeLinecap="round" />
      <path d={d} fill="none" stroke="var(--cat-fill)" strokeWidth={width} strokeLinecap="round" />
    </g>
  )
}

function Eye({ x, y, r = 6.5, look = 0 }: { x: number; y: number; r?: number; look?: number }) {
  return (
    <g className="cat-detail cat-eye">
      <circle cx={x} cy={y} r={r} fill={catFace.eyeWhite} />
      <circle cx={x + look} cy={y + 0.5} r={r * 0.62} fill={catFace.pupil} />
      <circle cx={x + look + r * 0.25} cy={y - r * 0.3} r={r * 0.22} fill={catFace.eyeWhite} />
    </g>
  )
}

function ClosedEye({ x, y }: { x: number; y: number }) {
  return (
    <path
      className="cat-detail"
      d={`M${x - 4} ${y} q4 3.5 8 0`}
      fill="none"
      stroke={catFace.line}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  )
}

function StarEye({ x, y, r = 5.5 }: { x: number; y: number; r?: number }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.45
    return `${(x + radius * Math.cos(angle)).toFixed(2)},${(y + radius * Math.sin(angle)).toFixed(2)}`
  }).join(' ')
  return (
    <g className="cat-detail">
      <circle cx={x} cy={y} r={r + 1.5} fill={catFace.pupil} />
      <polygon points={points} fill="var(--cat-accent)" />
    </g>
  )
}

function Nose({ x, y }: { x: number; y: number }) {
  return (
    <g className="cat-detail">
      <path d={`M${x - 2.6} ${y - 1.4} h5.2 l-2.6 3 z`} fill="var(--hot-pink)" />
      <path
        d={`M${x - 3.2} ${y + 3.2} q1.6 1.6 3.2 0 q1.6 1.6 3.2 0`}
        fill="none"
        stroke={catFace.line}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
    </g>
  )
}

function Heart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      className="cat-detail cat-heart"
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 3 C -1.5 -1.5, -8 -1.5, -8 3.5 C -8 7.5, -3 10, 0 12.5 C 3 10, 8 7.5, 8 3.5 C 8 -1.5, 1.5 -1.5, 0 3 Z"
      fill="var(--hot-pink)"
      stroke={catFace.line}
      strokeWidth={0.8}
    />
  )
}

function Ears({ left, right, inner }: { left: string; right: string; inner: [string, string] }) {
  return (
    <g className="cat-ears">
      <polygon points={left} className="cat-shape" strokeLinejoin="round" />
      <polygon points={right} className="cat-shape" strokeLinejoin="round" />
      <polygon points={inner[0]} className="cat-detail" fill="var(--hot-pink)" opacity={0.85} />
      <polygon points={inner[1]} className="cat-detail" fill="var(--hot-pink)" opacity={0.85} />
    </g>
  )
}

interface Drawing {
  heartAt: [number, number]
  headOrigin: string
  back: ReactNode
  body: ReactNode
  head: ReactNode
}

// Each cat's drawing, built only when that cat is drawn.
const drawings: Record<CatId, (noticing: boolean) => Drawing> = {
  // Luz: round head, high tail, hot-pink chest. Almost never still.
  luz: (noticing) => ({
    heartAt: [60, 6],
    headOrigin: '60px 60px',
    back: <Tail d="M78 98 C 104 94, 110 62, 98 42 C 95 36, 89 38, 92 45" />,
    body: (
      <>
        <ellipse cx={60} cy={90} rx={24} ry={22} className="cat-shape" />
        <ellipse cx={60} cy={92} rx={11} ry={13} className="cat-detail" fill="var(--cat-accent)" />
        <ellipse cx={51} cy={110} rx={6.5} ry={4} className="cat-shape" />
        <ellipse cx={69} cy={110} rx={6.5} ry={4} className="cat-shape" />
      </>
    ),
    head: (
      <>
        <Ears
          left="39,42 43,15 58,31"
          right="81,42 77,15 62,31"
          inner={['44,34 45,22 53,31', '76,34 75,22 67,31']}
        />
        <circle cx={60} cy={52} r={23} className="cat-shape" />
        <Eye x={51} y={51} r={noticing ? 7.4 : 6.5} />
        <Eye x={69} y={51} r={noticing ? 7.4 : 6.5} />
        <Nose x={60} y={61} />
      </>
    ),
  }),
  // Mimo: low and round, blush body, half-closed eyes, a small bow.
  mimo: (noticing) => ({
    heartAt: [44, 44],
    headOrigin: '44px 82px',
    back: <Tail d="M96 100 C 108 110, 76 116, 56 111" width={6} />,
    body: <ellipse cx={62} cy={95} rx={38} ry={17} className="cat-shape" />,
    head: (
      <>
        <Ears
          left="28,76 29,58 42,66"
          right="58,72 57,56 46,65"
          inner={['31,71 32,63 38,67', '54,69 53,62 49,66']}
        />
        <circle cx={44} cy={80} r={18} className="cat-shape" />
        {noticing ? (
          <>
            <Eye x={37} y={79} r={4.6} />
            <Eye x={51} y={79} r={4.6} />
          </>
        ) : (
          <>
            <ClosedEye x={37} y={79} />
            <ClosedEye x={51} y={79} />
          </>
        )}
        <Nose x={44} y={87} />
        <g className="cat-detail cat-bow" transform="translate(56 62)">
          <path d="M0 0 L-8 -5 L-8 5 Z" fill="var(--hot-pink)" />
          <path d="M0 0 L8 -5 L8 5 Z" fill="var(--hot-pink)" />
          <circle cx={0} cy={0} r={2.4} fill="var(--deep-pink)" />
        </g>
      </>
    ),
  }),
  // Susto: small, ears back, half-hidden, wide pale eyes.
  susto: (noticing) => ({
    heartAt: [60, 38],
    headOrigin: '60px 76px',
    back: <Tail d="M74 106 C 88 110, 90 96, 81 92" width={5} />,
    body: <ellipse cx={60} cy={98} rx={18} ry={14} className="cat-shape" />,
    head: (
      <>
        <Ears
          left="45,68 28,60 47,57"
          right="75,68 92,60 73,57"
          inner={['43,64 34,60 45,59', '77,64 86,60 75,59']}
        />
        <circle cx={60} cy={74} r={18} className="cat-shape" />
        <Eye x={53} y={73} r={noticing ? 7 : 6.5} look={noticing ? 0 : -2} />
        <Eye x={67} y={73} r={noticing ? 7 : 6.5} look={noticing ? 0 : -2} />
        <Nose x={60} y={82} />
      </>
    ),
  }),
  // Bram: stocky, lightning-shaped tail tip, the one with the pick.
  bram: (noticing) => ({
    heartAt: [60, 12],
    headOrigin: '60px 60px',
    back: (
      <>
        <Tail d="M86 100 C 104 96, 106 80, 100 68" />
        <polygon
          className="cat-detail"
          points="99,70 110,54 103,55 108,42 94,60 101,59"
          fill="var(--cat-accent)"
          stroke="var(--cat-accent)"
          strokeLinejoin="round"
        />
      </>
    ),
    body: (
      <>
        <ellipse cx={60} cy={90} rx={30} ry={23} className="cat-shape" />
        <ellipse cx={46} cy={111} rx={8} ry={4.5} className="cat-shape" />
        <ellipse cx={74} cy={111} rx={8} ry={4.5} className="cat-shape" />
        <path
          className="cat-detail"
          d="M20 100 q6 -10 12 0 q-6 8 -12 0 z"
          fill="var(--cat-accent)"
          stroke={catFace.line}
          strokeWidth={0.8}
        />
      </>
    ),
    head: (
      <>
        <Ears
          left="38,44 41,26 54,36"
          right="82,44 79,26 66,36"
          inner={['42,38 43,30 50,36', '78,38 77,30 70,36']}
        />
        <ellipse cx={60} cy={54} rx={25} ry={21} className="cat-shape" />
        <Eye x={51} y={54} r={5.8} />
        <Eye x={69} y={54} r={5.8} />
        {!noticing && (
          <>
            <rect x={44} y={46} width={14} height={5} className="cat-detail" fill="var(--cat-fill)" />
            <rect x={62} y={46} width={14} height={5} className="cat-detail" fill="var(--cat-fill)" />
          </>
        )}
        <Nose x={60} y={63} />
      </>
    ),
  }),
  // Nana: upright, crown-shaped ears. She chooses a throne.
  nana: (noticing) => ({
    heartAt: [60, 2],
    headOrigin: '60px 50px',
    back: <Tail d="M74 110 C 92 112, 94 96, 83 94" width={6} />,
    body: (
      <>
        <ellipse cx={60} cy={86} rx={20} ry={27} className="cat-shape" />
        <ellipse cx={53} cy={112} rx={6} ry={3.5} className="cat-shape" />
        <ellipse cx={67} cy={112} rx={6} ry={3.5} className="cat-shape" />
      </>
    ),
    head: (
      <>
        <g className="cat-ears">
          <polygon points="41,38 41,16 46,24 50,13 54,24 58,29" className="cat-shape" strokeLinejoin="round" />
          <polygon points="79,38 79,16 74,24 70,13 66,24 62,29" className="cat-shape" strokeLinejoin="round" />
        </g>
        <circle cx={60} cy={45} r={19} className="cat-shape" />
        {noticing ? (
          <>
            <Eye x={52} y={45} r={5.6} />
            <Eye x={68} y={45} r={5.6} />
          </>
        ) : (
          <>
            <ClosedEye x={52} y={45} />
            <ClosedEye x={68} y={45} />
          </>
        )}
        <Nose x={60} y={53} />
      </>
    ),
  }),
  // Misha: long body, calm eyes, tail up, a soft glow.
  misha: (noticing) => ({
    heartAt: [94, 40],
    headOrigin: '94px 76px',
    back: <Tail d="M22 90 C 8 72, 14 46, 27 36" />,
    body: (
      <>
        <ellipse cx={56} cy={90} rx={38} ry={15} className="cat-shape" />
        <ellipse cx={32} cy={106} rx={6} ry={4} className="cat-shape" />
        <ellipse cx={80} cy={106} rx={6} ry={4} className="cat-shape" />
      </>
    ),
    head: (
      <>
        <Ears
          left="84,64 86,46 97,57"
          right="100,58 106,44 110,64"
          inner={['87,60 88,51 94,57', '102,58 105,50 107,61']}
        />
        <circle cx={96} cy={73} r={16} className="cat-shape" />
        {noticing ? (
          <>
            <Eye x={90} y={72} r={4.4} />
            <Eye x={102} y={72} r={4.4} />
          </>
        ) : (
          <>
            <ClosedEye x={90} y={72} />
            <ClosedEye x={102} y={72} />
          </>
        )}
        <Nose x={96} y={80} />
      </>
    ),
  }),
  // Kira: slim, star-bright eyes, sits taller than Misha.
  kira: (noticing) => ({
    heartAt: [60, -2],
    headOrigin: '60px 46px',
    back: <Tail d="M72 108 C 94 106, 98 84, 89 72" width={6} />,
    body: (
      <>
        <ellipse cx={60} cy={86} rx={16} ry={28} className="cat-shape" />
        <ellipse cx={54} cy={112} rx={5.5} ry={3.5} className="cat-shape" />
        <ellipse cx={66} cy={112} rx={5.5} ry={3.5} className="cat-shape" />
      </>
    ),
    head: (
      <>
        <Ears
          left="43,34 45,6 57,23"
          right="77,34 75,6 63,23"
          inner={['47,27 48,15 54,23', '73,27 72,15 66,23']}
        />
        <circle cx={60} cy={40} r={18} className="cat-shape" />
        <StarEye x={52} y={40} r={noticing ? 6.2 : 5.5} />
        <StarEye x={68} y={40} r={noticing ? 6.2 : 5.5} />
        <Nose x={60} y={49} />
      </>
    ),
  }),
  }

export function CatArt({ id, pose = 'playing', silhouette = false, size = 64, accent, pixel = false }: Props) {
  const drawing = drawings[id](pose === 'noticing')
  const mimoBody = pixel ? 'var(--paper)' : 'var(--blush)'
  const fill = silhouette ? 'currentColor' : id === 'mimo' ? mimoBody : 'var(--cat-body)'
  const outline = silhouette ? 'transparent' : id === 'mimo' ? catFace.mimoOutline : accent
  return (
    <svg
      className={`cat-art cat-art-${id} pose-${pose}${silhouette ? ' is-silhouette' : ''}`}
      viewBox="-6 -10 132 132"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ ['--cat-accent' as string]: accent, ['--cat-fill' as string]: fill, ['--cat-outline' as string]: outline }}
    >
      {drawing.back}
      <g className="cat-body-group">{drawing.body}</g>
      <g className="cat-head-group" style={{ transformOrigin: drawing.headOrigin }}>
        {drawing.head}
      </g>
      {pose === 'staying' && <Heart x={drawing.heartAt[0]} y={drawing.heartAt[1]} />}
    </svg>
  )
}
