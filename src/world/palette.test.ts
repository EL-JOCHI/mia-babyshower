import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { tokens, tuning, type ColorMix, type MoodId, type ThemeName } from '../tuning'
import { colorFrom, paletteFor, palettes } from './palette'

const looks: [MoodId, ThemeName][] = [
  ['saturday', 'dark'],
  ['saturday', 'light'],
  ['sunday', 'dark'],
  ['sunday', 'light'],
]

// The mix as the tuning module means it, written out independently: from one color toward another.
function expected(spec: ColorMix): THREE.Color {
  if (typeof spec === 'string') return new THREE.Color(spec)
  return new THREE.Color(spec[0]).lerp(new THREE.Color(spec[1]), spec[2])
}

describe('the four looks (spec §3)', () => {
  it.each(looks)('builds %s %s from its tuning look', (mood, theme) => {
    const look = tuning.world.looks[mood][theme]
    const palette = paletteFor(mood, theme)
    expect(palette).toBe(palettes[mood][theme])
    for (const key of ['fog', 'wood', 'floor', 'beam', 'skyTop', 'skyBottom', 'orb', 'halo', 'cloth', 'key', 'ambientSky', 'ambientGround', 'shaft', 'sparkle', 'dust'] as const) {
      expect(palette[key].equals(expected(look[key])), key).toBe(true)
    }
    expect(palette.keyIntensity).toBe(look.keyIntensity)
    expect(palette.ambient).toBe(look.ambient)
    expect(palette.orbKind).toBe(look.orbKind)
    expect(palette.orbAt).toEqual(look.orbAt)
    expect(palette.motes).toBe(look.motes)
  })

  it('gives each of the four looks its own sky', () => {
    const skies = new Set(looks.map(([mood, theme]) => paletteFor(mood, theme).skyTop.getHexString()))
    expect(skies.size).toBe(4)
  })

  it('mixes a color from one token toward another', () => {
    expect(colorFrom([tokens.ink, tokens.bone, 0.25]).equals(expected([tokens.ink, tokens.bone, 0.25]))).toBe(true)
    expect(colorFrom(tokens.rose).equals(new THREE.Color(tokens.rose))).toBe(true)
  })
})
