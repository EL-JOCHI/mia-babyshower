import * as THREE from 'three'
import { tuning } from '../tuning'

const scratch = new THREE.Color()

// Spec §3: the sky behind the round window, a gradient from its top down to the horizon. Writes one
// color per vertex of a plane whose y runs from -0.5 (the horizon) to 0.5 (the top).
export function writeSkyColors(
  colors: THREE.BufferAttribute,
  positions: THREE.BufferAttribute,
  top: THREE.Color,
  bottom: THREE.Color,
): void {
  for (let i = 0; i < positions.count; i++) {
    const share = THREE.MathUtils.clamp(positions.getY(i) + 0.5, 0, 1)
    scratch.copy(bottom).lerp(top, share)
    colors.setXYZ(i, scratch.r, scratch.g, scratch.b)
  }
  colors.needsUpdate = true
}

export interface StarField {
  count: number
  x: Float32Array
  y: Float32Array
  size: Float32Array
  phase: Float32Array
}

// Saturday's stars (spec §3): a fixed scatter inside a disc of `radius` (the window), so every load
// looks the same.
export function starField(count: number, radius: number): StarField {
  const { size, sizeRange } = tuning.world.stars
  let seed = 5
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const field: StarField = {
    count,
    x: new Float32Array(count),
    y: new Float32Array(count),
    size: new Float32Array(count),
    phase: new Float32Array(count),
  }
  for (let i = 0; i < count; i++) {
    const r = radius * Math.sqrt(next())
    const a = next() * Math.PI * 2
    field.x[i] = r * Math.cos(a)
    field.y[i] = r * Math.sin(a)
    field.size[i] = size + next() * sizeRange
    field.phase[i] = next() * Math.PI * 2
  }
  return field
}

// A star's twinkle at time t: its size swings between `min` and all of itself.
export function twinkle(t: number, phase: number): number {
  const { min, speed } = tuning.world.stars
  return min + (1 - min) * (0.5 + 0.5 * Math.sin(t * speed + phase))
}
