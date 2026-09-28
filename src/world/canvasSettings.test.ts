import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { backdropCanvas, bookCanvas } from './canvasSettings'

describe('the canvases per device tier (spec §8)', () => {
  it('gives a normal device the shadow map and the design pixel ratios', () => {
    expect(bookCanvas('normal')).toEqual({ dpr: [1, tuning.world.maxDpr], shadows: 'percentage' })
    expect(backdropCanvas('normal')).toEqual({ dpr: [1, tuning.world.backdropMaxDpr], shadows: false })
  })

  it('gives a low device no shadow map, and a pixel ratio of 1.25 in the book and 1 behind the cards', () => {
    expect(bookCanvas('low')).toEqual({ dpr: [1, 1.25], shadows: false })
    expect(backdropCanvas('low')).toEqual({ dpr: [1, 1], shadows: false })
  })

  it('never draws above the 1.75 cap', () => {
    for (const tier of ['low', 'normal'] as const) {
      expect(bookCanvas(tier).dpr[1]).toBeLessThanOrEqual(1.75)
      expect(backdropCanvas(tier).dpr[1]).toBeLessThanOrEqual(1.75)
    }
  })
})
