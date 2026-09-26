import * as THREE from 'three'
import { tokens, tuning, type ColorMix, type ThemeName, type WorldLook } from '../tuning'

// Design §3: Oscuro is the moonlit attic, Claro the same book by day. Each theme's look, built once
// from the palette tokens as ready colors, so switching theme only copies colors.
export interface WorldPalette {
  fog: THREE.Color
  wood: THREE.Color
  floor: THREE.Color
  beam: THREE.Color
  sky: THREE.Color
  orb: THREE.Color
  halo: THREE.Color
  cloth: THREE.Color
  key: THREE.Color
  keyIntensity: { boceto: number; luz: number }
  ambientSky: THREE.Color
  ambientGround: THREE.Color
  ambient: { boceto: number; tinta: number }
  // The paper's tint for each stage: gray pencil paper, bone parchment, and bone warmed by candles.
  paper: { sketch: THREE.Color; bone: THREE.Color; warm: THREE.Color }
  dust: THREE.Color
}

function color(spec: ColorMix): THREE.Color {
  if (typeof spec === 'string') return new THREE.Color(spec)
  const [from, to, amount] = spec
  return new THREE.Color(from).lerp(new THREE.Color(to), amount)
}

function build(look: WorldLook): WorldPalette {
  const bone = new THREE.Color(tokens.bone)
  const hsl = { h: 0, s: 0, l: 0 }
  bone.getHSL(hsl)
  return {
    fog: color(look.fog),
    wood: color(look.wood),
    floor: color(look.floor),
    beam: color(look.beam),
    sky: color(look.sky),
    orb: color(look.orb),
    halo: color(look.halo),
    cloth: color(look.cloth),
    key: color(look.key),
    keyIntensity: look.keyIntensity,
    ambientSky: color(look.ambientSky),
    ambientGround: color(look.ambientGround),
    ambient: look.ambient,
    paper: {
      sketch: new THREE.Color().setHSL(hsl.h, 0, hsl.l * look.sketchLightness),
      bone,
      warm: bone.clone().lerp(new THREE.Color(tokens.candle), look.warmth),
    },
    dust: color(look.dust),
  }
}

export const palettes: Record<ThemeName, WorldPalette> = {
  dark: build(tuning.world.night),
  light: build(tuning.world.day),
}

// Sets a material's color from the palette. Kept outside components, so retinting a shared
// material is one plain call.
export function paint(material: { color: THREE.Color }, next: THREE.Color) {
  material.color.copy(next)
}
