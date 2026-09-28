import { familyCentreX, familyFigures, type FigureId } from '../components/art/family'
import { tuning } from '../tuning'

// Where a figure stands in the 3D doorway (the door piece's own space: x across it, z toward the
// camera), and where its walk begins.
export interface FigureSpot {
  id: FigureId
  // World units per unit of the door drawing.
  scale: number
  width: number
  height: number
  rest: readonly [x: number, z: number]
  start: readonly [x: number, z: number]
  // Seconds after the walk begins before this figure sets off.
  delay: number
}

export interface WalkPose {
  x: number
  z: number
  bob: number
  done: boolean
}

// Spec §6: the figures in the drawing's order across the door, scaled so dad is tuning.world.family.height
// tall. Each waits a step out on the page, then walks in after the one before.
export function familySpots(): FigureSpot[] {
  const { height, restZ, walkFromX, walkFromZ, staggerS } = tuning.world.family
  const tallest = Math.max(...familyFigures.map((figure) => figure.box.height))
  const scale = height / tallest
  return familyFigures.map((figure, i) => {
    const x = (figure.box.x + figure.box.width / 2 - familyCentreX) * scale
    return {
      id: figure.id,
      scale,
      width: figure.box.width * scale,
      height: figure.box.height * scale,
      rest: [x, restZ],
      start: [x + walkFromX, walkFromZ],
      delay: i * staggerS,
    }
  })
}

// Where a figure is `elapsed` seconds after the walk began: waiting at its start, walking in with a
// small bob, then resting in the doorway. Writes into `out`, so the frame loop allocates nothing.
export function walkPose(spot: FigureSpot, elapsed: number, out: WalkPose): WalkPose {
  const { walkS, bob, bobHz } = tuning.world.family
  const k = Math.min(1, Math.max(0, (elapsed - spot.delay) / walkS))
  const eased = k * k * (3 - 2 * k)
  out.x = spot.start[0] + (spot.rest[0] - spot.start[0]) * eased
  out.z = spot.start[1] + (spot.rest[1] - spot.start[1]) * eased
  out.bob = k > 0 && k < 1 ? Math.abs(Math.sin(elapsed * bobHz * Math.PI)) * bob : 0
  out.done = k >= 1
  return out
}

// How far a figure has folded up from the page `elapsed` seconds after the walk began: 0 lying flat,
// 1 standing. Each lies flat until it sets off, then springs up like the book's pop-up pieces
// (tuning.world.popUp's stiffness and damping, as a damped spring from rest), overshooting a little
// while it steps out, and stands exactly upright once its walk is done.
export function foldUp(spot: FigureSpot, elapsed: number): number {
  const { walkS } = tuning.world.family
  const t = elapsed - spot.delay
  if (t <= 0) return 0
  if (t >= walkS) return 1
  const { stiffness, damping } = tuning.world.popUp
  const w = Math.sqrt(stiffness)
  const zeta = damping / (2 * w)
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t)
  const wd = w * Math.sqrt(1 - zeta * zeta)
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t))
}

// Whether the walk sets off: the door stands (its spring past standAt) and the camera is within
// startWithin of the Familia station. The door already stands from the page before, since the pop-up
// range reaches the next station, so the walk waits until the guest is here to see it.
export function walkBegins(doorAngle: number, progress: number, at: number): boolean {
  const { standAt, startWithin } = tuning.world.family
  return doorAngle >= standAt && Math.abs(progress - at) <= startWithin
}

// Two meshes per figure: the paper, and its dark edge behind.
export const familyDrawCalls = familyFigures.length * 2
