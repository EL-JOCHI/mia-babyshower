import * as THREE from 'three'
import { tokens, tuning, type ColorMix, type MoodId, type ThemeName, type WorldLook } from '../tuning'

// Spec §3: two moods, one attic. Each mood and theme's look, built once from the palette tokens as
// ready colors, so switching theme only copies colors.
export interface WorldPalette {
  fog: THREE.Color
  wood: THREE.Color
  floor: THREE.Color
  beam: THREE.Color
  skyTop: THREE.Color
  skyBottom: THREE.Color
  orbKind: 'moon' | 'sun'
  orbAt: readonly [number, number]
  orbSize: number
  orb: THREE.Color
  halo: THREE.Color
  cloth: THREE.Color
  key: THREE.Color
  keyIntensity: number
  ambientSky: THREE.Color
  ambientGround: THREE.Color
  ambient: number
  shaft: THREE.Color
  shaftOpacity: number
  sparkle: THREE.Color
  stars: number
  motes: 'dust' | 'fireflies'
  lanternGlow: number
  lampGlow: number
  // The book's paper tint for each stage: gray pencil paper, bone parchment, and bone warmed by candles.
  paper: { sketch: THREE.Color; bone: THREE.Color; warm: THREE.Color }
  dust: THREE.Color
}

export function colorFrom(spec: ColorMix): THREE.Color {
  if (typeof spec === 'string') return new THREE.Color(spec)
  const [from, to, amount] = spec
  return new THREE.Color(from).lerp(new THREE.Color(to), amount)
}

function build(look: WorldLook): WorldPalette {
  const bone = new THREE.Color(tokens.bone)
  const hsl = { h: 0, s: 0, l: 0 }
  bone.getHSL(hsl)
  return {
    fog: colorFrom(look.fog),
    wood: colorFrom(look.wood),
    floor: colorFrom(look.floor),
    beam: colorFrom(look.beam),
    skyTop: colorFrom(look.skyTop),
    skyBottom: colorFrom(look.skyBottom),
    orbKind: look.orbKind,
    orbAt: look.orbAt,
    orbSize: look.orbSize,
    orb: colorFrom(look.orb),
    halo: colorFrom(look.halo),
    cloth: colorFrom(look.cloth),
    key: colorFrom(look.key),
    keyIntensity: look.keyIntensity,
    ambientSky: colorFrom(look.ambientSky),
    ambientGround: colorFrom(look.ambientGround),
    ambient: look.ambient,
    shaft: colorFrom(look.shaft),
    shaftOpacity: look.shaftOpacity,
    sparkle: colorFrom(look.sparkle),
    stars: look.stars,
    motes: look.motes,
    lanternGlow: look.lanternGlow,
    lampGlow: look.lampGlow,
    paper: {
      sketch: new THREE.Color().setHSL(hsl.h, 0, hsl.l * look.sketchLightness),
      bone,
      warm: bone.clone().lerp(new THREE.Color(tokens.candle), look.warmth),
    },
    dust: colorFrom(look.dust),
  }
}

const { looks } = tuning.world

export const palettes: Record<MoodId, Record<ThemeName, WorldPalette>> = {
  saturday: { dark: build(looks.saturday.dark), light: build(looks.saturday.light) },
  sunday: { dark: build(looks.sunday.dark), light: build(looks.sunday.light) },
}

export function paletteFor(mood: MoodId, theme: ThemeName): WorldPalette {
  return palettes[mood][theme]
}

// Sets a material's color from the palette. Kept outside components, so retinting a shared
// material is one plain call.
export function paint(material: { color: THREE.Color }, next: THREE.Color) {
  material.color.copy(next)
}
