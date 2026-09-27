import type * as THREE from 'three'
import { tuning } from '../../tuning'

export interface FireflyField {
  count: number
  // Each firefly's spot, x y z in turn.
  base: Float32Array
  phase: Float32Array
}

// Spec §3: Sunday's fireflies, a fixed scatter in a box of air behind the book, so every load looks
// the same.
export function fireflyField(count: number): FireflyField {
  const { width, bottom, height, back, depth } = tuning.world.mood.fireflies.box
  let seed = 23
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const base = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    base[i * 3] = (next() - 0.5) * width
    base[i * 3 + 1] = bottom + next() * height
    base[i * 3 + 2] = back + next() * depth
    phase[i] = next() * Math.PI * 2
  }
  return { count, base, phase }
}

// Where firefly i is at time t: drifting in a small loop around its spot. Writes into `out`.
export function fireflyAt(field: FireflyField, i: number, t: number, out: THREE.Vector3): THREE.Vector3 {
  const { drift, speed } = tuning.world.mood.fireflies
  const p = field.phase[i]!
  return out.set(
    field.base[i * 3]! + Math.sin(t * speed + p) * drift,
    field.base[i * 3 + 1]! + Math.sin(t * speed * 0.7 + p * 1.3) * drift * 0.6,
    field.base[i * 3 + 2]! + Math.cos(t * speed * 0.9 + p) * drift,
  )
}

// How bright a firefly is at time t, 0 to 1.
export function fireflyGlow(t: number, phase: number): number {
  return 0.5 + 0.5 * Math.sin(t * tuning.world.mood.fireflies.blink + phase * 2)
}
