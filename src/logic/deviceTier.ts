import { tuning, type TierSettings } from '../tuning'

export type DeviceTier = 'low' | 'normal'

// What deviceTier reads: navigator.hardwareConcurrency, and navigator.deviceMemory where the browser
// has it (Chromium only).
export interface TierNavigator {
  hardwareConcurrency?: number
  deviceMemory?: number
}

const known = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

// Spec §8 Device tiers: little memory, or few cores, make a low device. Only Chromium reports
// deviceMemory, and there both numbers are honest. Safari and Firefox report no memory, and Safari's
// core count is not a reliable signal, so without a memory reading the device counts as normal
// (an iPhone must never drop to low on its core count alone).
export function deviceTier(nav: TierNavigator): DeviceTier {
  const { lowCores, lowMemoryGb } = tuning.world.tiers
  const cores = nav.hardwareConcurrency
  const memory = nav.deviceMemory
  if (!known(memory)) return 'normal'
  if (memory <= lowMemoryGb) return 'low'
  if (known(cores) && cores <= lowCores) return 'low'
  return 'normal'
}

export function tierSettings(tier: DeviceTier): TierSettings {
  if (tier === 'low') return tuning.world.tiers.low
  return {
    maxDpr: tuning.world.maxDpr,
    backdropMaxDpr: tuning.world.backdropMaxDpr,
    shadows: true,
    countScale: 1,
    motionScale: 1,
  }
}

// How many stars, fireflies, or dust motes a tier draws: about half on low, and at least one.
export function tierCount(count: number, tier: DeviceTier): number {
  return Math.max(1, Math.round(count * tierSettings(tier).countScale))
}
