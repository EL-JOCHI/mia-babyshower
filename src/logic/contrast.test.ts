import { describe, expect, it } from 'vitest'
import { themes, type ThemeName } from '../tuning'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrastRatio('#FF2D8A', '#FFF7FB')).toBeCloseTo(3.33, 2)
  })
})

describe('theme contrast (US-2 AC4)', () => {
  const pairsInUse = (name: ThemeName) => {
    const t = themes[name]
    return [
      ['ink on field', t.ink, t.field],
      ['ink on surface', t.ink, t.surface],
      ['pink text on field', t.accentText, t.field],
      ['pink text on surface', t.accentText, t.surface],
      ['button label on button', t.buttonInk, t.buttonBg],
    ] as const
  }

  for (const name of ['dark', 'light'] as const) {
    it(`meets 4.5:1 for every text pair in the ${name} theme`, () => {
      for (const [label, fg, bg] of pairsInUse(name)) {
        expect(contrastRatio(fg, bg), `${name}: ${label}`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})
