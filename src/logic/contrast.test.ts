import { describe, expect, it } from 'vitest'
import { catIds } from '../content'
import { feelingColors, tokens } from '../tuning'
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
})
