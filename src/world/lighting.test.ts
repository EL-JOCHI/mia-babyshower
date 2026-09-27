import { describe, expect, it } from 'vitest'
import { tuning, type MoodId, type ThemeName } from '../tuning'
import { candleBrightness, candleFlicker, moodLight } from './lighting'
import { paletteFor } from './palette'
import { createStageMix, writeStageMix } from './stageMix'

const at = (progress: number) => writeStageMix(progress, createStageMix())
const looks: [MoodId, ThemeName][] = [
  ['saturday', 'dark'],
  ['saturday', 'light'],
  ['sunday', 'dark'],
  ['sunday', 'light'],
]

describe('lit from the start (spec §4)', () => {
  it.each(looks)('lights the %s %s attic by its mood alone', (mood, theme) => {
    const look = tuning.world.looks[mood][theme]
    expect(moodLight(paletteFor(mood, theme))).toEqual({ keyIntensity: look.keyIntensity, ambientIntensity: look.ambient })
  })

  it('takes nothing from the stage: the palette is its only input', () => {
    expect(moodLight).toHaveLength(1)
  })

  it('keeps the candles dark until luz, and at full brightness at the door', () => {
    expect(candleBrightness(at(0))).toBe(0)
    expect(candleBrightness(at(0.5))).toBe(0)
    expect(candleBrightness(at(0.8))).toBeGreaterThan(0)
    expect(candleBrightness(at(1))).toBeCloseTo(tuning.world.light.candle, 6)
  })

  it('flickers each candle softly around its brightness, out of step with the others', () => {
    const { flicker } = tuning.world.light
    for (let t = 0; t < 5; t += 0.37) {
      const f = candleFlicker(t, 1)
      expect(f).toBeGreaterThanOrEqual(1 - flicker)
      expect(f).toBeLessThanOrEqual(1 + flicker)
    }
    expect(candleFlicker(1, 0)).not.toBe(candleFlicker(1, 1))
  })
})
