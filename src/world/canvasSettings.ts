import { tierSettings, type DeviceTier } from '../logic/deviceTier'

export interface CanvasSettings {
  dpr: [number, number]
  shadows: 'percentage' | false
}

// Spec §8 Device tiers: the book's canvas. A low device gets no real shadow map and a lower pixel ratio.
export function bookCanvas(tier: DeviceTier): CanvasSettings {
  const settings = tierSettings(tier)
  return { dpr: [1, settings.maxDpr], shadows: settings.shadows ? 'percentage' : false }
}

// Level 2's live attic never has a shadow map (it has no candles); its pixel ratio is lower still.
export function backdropCanvas(tier: DeviceTier): CanvasSettings {
  return { dpr: [1, tierSettings(tier).backdropMaxDpr], shadows: false }
}
