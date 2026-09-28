import { describe, expect, it } from 'vitest'
import dioramaSheet from './diorama.css?raw'

// The rules alone: a comment may name what the sheet must not do.
const rules = dioramaSheet.replace(/\/\*[\s\S]*?\*\//g, '')

// Spec §7 Level 3: the paper diorama sits under the flat room's cards for guests who cannot run the
// book, often on the weakest phones. A CSS filter on a sliding layer is redrawn on every frame it
// moves, and an animation that never ends keeps the page compositing even while nothing else moves,
// so the diorama's paper shadows are drawn into its SVG and nothing in it loops.
describe('the paper diorama stays cheap to draw (spec §7 Level 3)', () => {
  // vite.config.ts lets ?raw CSS through in tests, so the guard cannot pass by reading an empty file.
  it('reads the stylesheet', () => {
    expect(rules).toContain('.paper-diorama')
    expect(rules).toContain('.diorama-layer')
  })

  it('declares no CSS filter', () => {
    expect(rules).not.toMatch(/(^|[\s;{])(-webkit-)?(backdrop-)?filter\s*:/)
  })

  it('runs no animation forever', () => {
    expect(rules).not.toMatch(/\binfinite\b/)
  })

  it('hides the diorama once the live attic has faded in over it, and shows it again at once without it', () => {
    const resting = /\.paper-diorama\.is-resting\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(resting).toMatch(/visibility:\s*hidden/)
    expect(resting).toMatch(/transition:\s*visibility 0s linear var\(--backdrop-fade\)/)
    const base = /\.paper-diorama\s*\{([^}]*)\}/.exec(rules)?.[1] ?? ''
    expect(base).not.toMatch(/transition/)
  })
})
