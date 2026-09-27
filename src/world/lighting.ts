import { tuning } from '../tuning'
import type { WorldPalette } from './palette'
import type { StageMix } from './stageMix'

// Spec §4 Lit from the start: the attic's key light (through the window) and its ambient light are
// the mood's, on every page. Nothing here reads the stage.
export function moodLight(palette: WorldPalette): { keyIntensity: number; ambientIntensity: number } {
  return { keyIntensity: palette.keyIntensity, ambientIntensity: palette.ambient }
}

// Design §1 Evolution, kept for the book only: the candles are dark until luz, then brighten toward
// the family door.
export function candleBrightness(mix: StageMix): number {
  const { candle, candleBase } = tuning.world.light
  return candle * mix.light * (candleBase + (1 - candleBase) * mix.warm)
}

// A candle's soft, uneven flicker at time t: two waves, each candle a phase apart from the next.
export function candleFlicker(t: number, index: number): number {
  const { flicker, flickerWaves } = tuning.world.light
  const { fast, slow, phase } = flickerWaves
  return 1 + flicker * Math.sin(t * fast + index * phase) * Math.sin(t * slow + index)
}
