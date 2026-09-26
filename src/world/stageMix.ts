import * as THREE from 'three'
import { tokens, tuning } from '../tuning'

// Design §1 Evolution as continuous amounts, so the book blends from one stage to the next:
// ink comes in around the tinta threshold, light around the luz threshold, and warmth keeps
// growing toward the door.
export interface StageMix {
  ink: number
  light: number
  warm: number
}

export function createStageMix(): StageMix {
  return { ink: 0, light: 0, warm: 0 }
}

const smooth = THREE.MathUtils.smoothstep

// Writes into `out`, so the frame loop allocates nothing.
export function writeStageMix(progress: number, out: StageMix): StageMix {
  const { color, threeD } = tuning.eras
  const blend = tuning.world.stageBlend
  out.ink = smooth(progress, color - blend, color + blend)
  out.light = smooth(progress, threeD - blend, threeD + blend)
  out.warm = out.light * smooth(progress, threeD - blend, 1)
  return out
}

// The paper's tint for each stage: gray pencil paper, bone parchment, and bone warmed by candles.
export function paperTints() {
  const bone = new THREE.Color(tokens.bone)
  const hsl = { h: 0, s: 0, l: 0 }
  bone.getHSL(hsl)
  const sketch = new THREE.Color().setHSL(hsl.h, 0, hsl.l * tuning.world.paper.sketchLightness)
  const warm = bone.clone().lerp(new THREE.Color(tokens.candle), tuning.world.paper.warmth)
  return { sketch, bone, warm }
}
