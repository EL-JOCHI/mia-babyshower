import { tuning } from '../tuning'

export interface BackdropView {
  fov: number
  position: [number, number, number]
  look: [number, number, number]
}

// Spec §7 Level 2: where the live attic's camera sits for a screen of this shape (width over
// height), with the flat room panned to `pan` (0 at its left end, 1 at its right end). It slides
// sideways with the pan and turns a little the same way. Writes into `out` when given, so the frame
// loop allocates nothing.
export function backdropView(aspect: number, pan: number, out?: BackdropView): BackdropView {
  const { position, look, fovPortrait, fovLandscape, drift, yaw } = tuning.world.backdrop
  const view = out ?? { fov: 0, position: [0, 0, 0], look: [0, 0, 0] }
  const side = (Math.min(1, Math.max(0, pan)) - 0.5) * 2
  const distance = position[2] - look[2]
  view.fov = aspect < 1 ? fovPortrait : fovLandscape
  view.position[0] = position[0] + side * drift
  view.position[1] = position[1]
  view.position[2] = position[2]
  view.look[0] = look[0] + side * (drift + Math.tan(yaw) * distance)
  view.look[1] = look[1]
  view.look[2] = look[2]
  return view
}
