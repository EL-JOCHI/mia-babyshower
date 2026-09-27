import { describe, expect, it } from 'vitest'
import { catIds } from '../content'
import { feelingColors, themes, tokens, type ThemeName } from '../tuning'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrastRatio('#FF2D8A', '#FFF7FB')).toBeCloseTo(3.33, 2)
  })
})

describe('theme contrast (US-2 AC4, design §3 Burton pink noir)', () => {
  it('meets 4.5:1 for every text pair in the dark theme', () => {
    const pairs: Array<readonly [string, string, string]> = [
      ['bone on ink', tokens.bone, tokens.ink],
      ['rose on ink', tokens.rose, tokens.ink],
      ['ink on rose (buttons)', tokens.ink, tokens.rose],
      ...catIds.map((id) => [`${id} feeling color on ink`, feelingColors[id], tokens.ink] as const),
    ]
    for (const [label, fg, bg] of pairs) {
      expect(contrastRatio(fg, bg), label).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('meets 4.5:1 for every text pair in the light theme', () => {
    const pairs = [
      ['ink on bone', tokens.ink, tokens.bone],
      ['deep rose on bone', tokens.deepRose, tokens.bone],
    ] as const
    for (const [label, fg, bg] of pairs) {
      expect(contrastRatio(fg, bg), label).toBeGreaterThanOrEqual(4.5)
    }
  })

  // The token-level pairs above cover the palette in the abstract. These read straight from
  // `themes` so the wiring itself (which token lands on which theme role) stays covered too.
  const wiredPairs = (name: ThemeName) => {
    const t = themes[name]
    return [
      ['ink on field', t.ink, t.field],
      ['ink on surface', t.ink, t.surface],
      ['accentText on field', t.accentText, t.field],
      ['accentText on surface', t.accentText, t.surface],
      ['buttonInk on buttonBg', t.buttonInk, t.buttonBg],
      // The parchment pages and their stamp.
      ['pageInk on page', t.pageInk, t.page],
      ['pageAccentText on page', t.pageAccentText, t.page],
      // The darkest the aged paper gets (the vignette's outer tint), where text may still sit.
      ['pageInk on pageShade', t.pageInk, t.pageShade],
    ] as const
  }

  // The page's accent text keeps a margin over AA on the darkest paper, for the grain on top.
  it('keeps page accent text at 4.6:1 or more on the darkest paper tint, in both themes', () => {
    for (const name of ['dark', 'light'] as const) {
      const t = themes[name]
      expect(contrastRatio(t.pageAccentText, t.pageShade), name).toBeGreaterThanOrEqual(4.6)
    }
  })

  it('never sets rose text on the parchment pages (design §3)', () => {
    for (const name of ['dark', 'light'] as const) expect(themes[name].pageAccentText).not.toBe(tokens.rose)
  })

  for (const name of ['dark', 'light'] as const) {
    it(`meets 4.5:1 for every wired-up text pair in the ${name} theme`, () => {
      for (const [label, fg, bg] of wiredPairs(name)) {
        expect(contrastRatio(fg, bg), `${name}: ${label}`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})
