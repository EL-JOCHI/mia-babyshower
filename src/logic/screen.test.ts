import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { screenScale } from './screen'

const { fromPx, toPx, grow } = tuning.screen
const maxScale = 1 + grow

// Design §9: cards and the HUD grow with the screen from a phone to a 2560 px monitor, then stop.
describe('screenScale (design §9)', () => {
  it('is 1 on a phone, and below it', () => {
    expect(screenScale(fromPx)).toBe(1)
    expect(screenScale(320)).toBe(1)
  })

  it('reaches the cap at the widest screen the design checks, and stays there', () => {
    expect(screenScale(toPx)).toBeCloseTo(maxScale, 10)
    expect(screenScale(toPx * 1.5)).toBeCloseTo(maxScale, 10)
  })

  it('grows in a straight line in between', () => {
    expect(screenScale((fromPx + toPx) / 2)).toBeCloseTo(1 + (maxScale - 1) / 2, 10)
    expect(screenScale(1440)).toBeGreaterThan(screenScale(768))
    expect(screenScale(1920)).toBeGreaterThan(screenScale(1440))
  })
})
