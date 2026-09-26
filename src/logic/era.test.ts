import { describe, expect, it } from 'vitest'
import { stageAt } from './era'

describe('stageAt (design §1 Evolution, BR-12)', () => {
  it('maps positions to boceto, tinta, and luz with the default thresholds', () => {
    expect([0, 0.32, 0.33, 0.65, 0.66, 1].map((p) => stageAt(p))).toEqual([
      'boceto',
      'boceto',
      'tinta',
      'tinta',
      'luz',
      'luz',
    ])
  })

  it('follows tuned thresholds', () => {
    expect(stageAt(0.5, { color: 0.6, threeD: 0.8 })).toBe('boceto')
  })
})
