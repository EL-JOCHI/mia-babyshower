import { copy } from '../content'
import { screenCode, type ModuleRect, type ModuleRun, type ScreenCode } from '../logic/qr'
import { tuning } from '../tuning'

// A rounded rectangle as path data.
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  return (
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  )
}

// A finder eye: a rounded 7×7 ring and a rounded 3×3 pupil, ink on bone.
function Eye({ at }: { at: ModuleRect }) {
  const { eyeOuter, eyeInner, eyePupil } = tuning.qr
  const { col: x, row: y } = at
  return (
    <>
      <path className="gift-qr-eye" fillRule="evenodd" d={`${roundedRect(x, y, 7, 7, eyeOuter)}${roundedRect(x + 1, y + 1, 5, 5, eyeInner)}`} />
      <path className="gift-qr-eye" d={roundedRect(x + 2, y + 2, 3, 3, eyePupil)} />
    </>
  )
}

// The cat emblem where the bank's $ was: a small ink cat face in a 24-unit box, fitted to its square.
function Emblem({ at }: { at: ModuleRect }) {
  if (at.size === 0) return null
  return (
    <g className="gift-qr-emblem" transform={`translate(${at.col} ${at.row}) scale(${at.size / 24})`}>
      <path
        className="gift-qr-emblem-head"
        d="M5.4 10 L 5 3.2 L 9.8 6.4 C 11.2 5.9, 12.8 5.9, 14.2 6.4 L 19 3.2 L 18.6 10 C 19.6 11.4, 20 12.6, 20 14 C 20 18.4, 16.4 21, 12 21 C 7.6 21, 4 18.4, 4 14 C 4 12.6, 4.4 11.4, 5.4 10 Z"
      />
      <circle className="gift-qr-emblem-eye" cx={9} cy={13.2} r={1.4} />
      <circle className="gift-qr-emblem-eye" cx={15} cy={13.2} r={1.4} />
      <path className="gift-qr-emblem-nose" d="M11 15.6 h2 l-1 1.2 z" />
      <path className="gift-qr-emblem-line" d="M2.6 15 L 6.6 15.5 M2.6 17.4 L 6.6 17 M21.4 15 L 17.4 15.5 M21.4 17.4 L 17.4 17" />
    </g>
  )
}

// Each run of dark modules as a filled pill `module` tall with rounded ends. Filled, like the eyes,
// so every module keeps exactly its size and edge at any scale the page is drawn.
function runsPath(runs: readonly ModuleRun[]): string {
  const { module } = tuning.qr
  const r = module / 2
  const top = (1 - module) / 2
  return runs
    .map((run) => {
      const long = run.to - run.from - module
      return `M${run.from + r} ${run.row + top}h${long}a${r} ${r} 0 0 1 0 ${module}h${-long}a${r} ${r} 0 0 1 0 ${-module}z`
    })
    .join('')
}

interface Drawing {
  code: ScreenCode
  runs: string
}

// The code and its runs for the page's payload, built once per page load and kept here, outside
// React: encoding takes tens of milliseconds on a phone's main thread, and the QR mounts again on a
// handoff between rooms.
let drawn: { payload: string; drawing: Drawing } | undefined

function drawingFor(payload: string): Drawing {
  if (drawn?.payload !== payload) {
    const code = screenCode(payload)
    drawn = { payload, drawing: { code, runs: runsPath(code.runs) } }
  }
  return drawn.drawing
}

// Spec §2 On screen: the gift QR as SVG, in the palette. Ink modules on bone paper, in rounded runs,
// with rounded finder eyes, a quiet zone of tuning.qr.quiet modules, and a cat emblem in the centre.
// src/logic/qr.test.ts decodes this drawing, rebuilt from the same runs and eyes, at the minimum size.
export function GiftQr({ payload, size }: { payload: string; size: string }) {
  const { code, runs } = drawingFor(payload)
  const { quiet } = tuning.qr
  const box = code.matrix.size + 2 * quiet
  return (
    <svg
      className="gift-qr"
      role="img"
      aria-label={copy.qrAlt}
      viewBox={`${-quiet} ${-quiet} ${box} ${box}`}
      width={tuning.qr.minPx}
      height={tuning.qr.minPx}
      style={{ width: size, height: size }}
      shapeRendering="geometricPrecision"
    >
      <rect className="gift-qr-paper" x={-quiet} y={-quiet} width={box} height={box} />
      <path className="gift-qr-modules" d={runs} />
      {code.eyes.map((eye) => (
        <Eye key={`${eye.row}-${eye.col}`} at={eye} />
      ))}
      <Emblem at={code.emblem} />
    </svg>
  )
}
