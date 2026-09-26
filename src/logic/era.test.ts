import { describe, expect, it } from 'vitest'
import { eraAt } from './era'

describe('eraAt (US-7 AC1, BR-12)', () => {
  it('maps positions to pixel, color, and 3D with the default thresholds', () => {
    expect([0, 0.32, 0.33, 0.65, 0.66, 1].map((p) => eraAt(p))).toEqual([
      'pixel',
      'pixel',
      'color',
      'color',
      '3d',
      '3d',
    ])
  })

  it('follows tuned thresholds', () => {
    expect(eraAt(0.5, { color: 0.6, threeD: 0.8 })).toBe('pixel')
  })
})
