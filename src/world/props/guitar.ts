import * as THREE from 'three'
import { tuning } from '../../tuning'
import { parts, type Pieces } from './factories'
import { block, placed, rod, splitGroups, tilt } from './shapes'
import type { PropModel } from './types'

// The Mockingbird's hooked, asymmetric body (spec §6), traced from the host's photo, seen from the
// front with the neck up: from the neck joint on the bass side, round the small bite to the short
// hooked horn's tip, down the straight bass edge to its corner, into the deep bite below it and out
// to the pointed tail (the beak) at the bottom; along the slanted bottom to the lower treble point, up
// the hollow treble waist to the long curved horn's tip, and back down its inside and the treble
// cutaway to the neck. In the guitar's own units, the bottom at y = 0.
export function mockingbirdOutline(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(-0.027, 0.395)
  shape.bezierCurveTo(-0.04, 0.382, -0.066, 0.386, -0.072, 0.405)
  shape.bezierCurveTo(-0.075, 0.415, -0.075, 0.424, -0.081, 0.432)
  shape.bezierCurveTo(-0.108, 0.422, -0.14, 0.39, -0.142, 0.33)
  shape.lineTo(-0.143, 0.298)
  shape.bezierCurveTo(-0.12, 0.29, -0.097, 0.27, -0.096, 0.24)
  shape.bezierCurveTo(-0.095, 0.2, -0.16, 0.12, -0.18, 0.047)
  shape.bezierCurveTo(-0.17, 0.02, -0.13, 0.002, -0.075, 0)
  shape.bezierCurveTo(0, 0, 0.14, 0.06, 0.18, 0.142)
  shape.bezierCurveTo(0.14, 0.19, 0.12, 0.23, 0.122, 0.29)
  shape.bezierCurveTo(0.124, 0.36, 0.15, 0.415, 0.176, 0.46)
  shape.bezierCurveTo(0.14, 0.452, 0.1, 0.42, 0.078, 0.37)
  shape.bezierCurveTo(0.068, 0.345, 0.04, 0.345, 0.028, 0.362)
  shape.closePath()
  return shape
}

// Where a fret's inlay sits on the neck, between the nut and the body (a guitar's frets close up
// toward the body, twelve to an octave).
function fretY(fret: number, nut: number, end: number, lastFret: number): number {
  const along = (1 - 2 ** (-fret / 12)) / (1 - 2 ** (-lastFret / 12))
  return nut - (nut - end) * along
}

// The body: the outline extruded `depth` thick with a `bevel`, its caps then its sides as draw groups.
export function mockingbirdBody(): THREE.ExtrudeGeometry {
  const { depth, bevel, curveSegments } = tuning.world.props.guitar
  return new THREE.ExtrudeGeometry(mockingbirdOutline(), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments,
  })
}

// Spec §6: dad's B.C. Rich Mockingbird Contour in gold top. The body extruded thin, its top gold and
// its sides dark; a rosewood neck and headstock with bone inlays; 3+3 tuner pegs; two black
// humbuckers in gold bezels, a bridge and tailpiece, and knobs. It leans back against the wall by
// `lean` degrees, its bottom on the floor. Pure: the same call draws the same guitar.
export function guitar(): PropModel {
  const g = tuning.world.props.guitar
  const { depth, bevel } = g
  // The front of the body, where the neck and the hardware sit.
  const front = depth + bevel
  const pieces: Required<Pick<Pieces, 'gold' | 'rosewood' | 'pickup' | 'paper'>> = { gold: [], rosewood: [], pickup: [], paper: [] }

  const [caps, sides] = splitGroups(mockingbirdBody())
  pieces.gold.push(placed(caps!))
  pieces.rosewood.push(placed(sides!))

  // The neck from the body to the nut, the fretboard's inlays, and the headstock.
  const { neckFrom, nut, headTop, neckWidth } = g
  pieces.rosewood.push(block(neckWidth, nut - neckFrom, 0.026, { at: [0, neckFrom, front] }))
  pieces.rosewood.push(block(g.headWidth, headTop - nut, 0.018, { at: [0, nut, front - 0.004] }))
  for (const fret of [3, 5, 7, 9, 12, 15, 17]) {
    const y = fretY(fret, nut, neckFrom + 0.04, 20)
    pieces.paper.push(block(fret === 12 ? neckWidth * 0.75 : neckWidth * 0.45, 0.012, 0.004, { at: [0, y, front + 0.013] }))
  }
  pieces.paper.push(block(neckWidth, 0.008, 0.006, { at: [0, nut - 0.008, front + 0.013] }))

  // 3+3 tuner pegs, gold, each a post and a button.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = nut + 0.04 + i * 0.045
      const x = side * (g.headWidth / 2 - 0.004)
      pieces.gold.push(rod(0.005, 0.022, { at: [x, y, front - 0.004], rotate: [0, 0, -side * (Math.PI / 2)] }, 6))
      pieces.gold.push(rod(0.01, 0.008, { at: [x + side * 0.022, y, front - 0.004], rotate: [0, 0, -side * (Math.PI / 2)] }, 8))
    }
  }

  // Two black humbuckers in gold bezels, the bridge, the tailpiece, and the knobs.
  for (const y of g.pickupsAt) {
    pieces.gold.push(block(0.09, 0.046, 0.008, { at: [0, y - 0.023, front - 0.002] }))
    pieces.pickup.push(block(0.076, 0.034, 0.014, { at: [0, y - 0.017, front + 0.001] }))
  }
  pieces.gold.push(block(0.085, 0.012, 0.012, { at: [0, 0.168, front + 0.002] }))
  pieces.gold.push(block(0.09, 0.014, 0.01, { at: [0, 0.128, front + 0.001] }))
  for (const [x, y] of g.knobsAt) pieces.gold.push(rod(0.012, 0.014, { at: [x, y, front - 0.002], rotate: [Math.PI / 2, 0, 0] }, 10))

  // Leaning back against the wall, then set down so its lowest corner touches the floor.
  const all = Object.values(pieces).flat()
  const lean = new THREE.Matrix4().makeRotationX(-tilt(g.lean))
  const box = new THREE.Box3()
  for (const piece of all) {
    piece.applyMatrix4(lean)
    piece.computeBoundingBox()
    box.union(piece.boundingBox!)
  }
  for (const piece of all) piece.translate(0, -box.min.y, 0)
  return { parts: parts(pieces), instances: [], shadow: 0 }
}
