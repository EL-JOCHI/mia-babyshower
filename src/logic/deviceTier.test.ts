import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { deviceTier, tierCount, tierSettings } from './deviceTier'

const { lowCores, lowMemoryGb } = tuning.world.tiers

describe('deviceTier (spec §8)', () => {
  it('is normal with plenty of cores and memory', () => {
    expect(deviceTier({ hardwareConcurrency: 8, deviceMemory: 8 })).toBe('normal')
  })

  it('is low at the core threshold or below, and normal just above it', () => {
    expect(deviceTier({ hardwareConcurrency: lowCores, deviceMemory: 8 })).toBe('low')
    expect(deviceTier({ hardwareConcurrency: lowCores + 1, deviceMemory: 8 })).toBe('normal')
  })

  it('is low at the memory threshold or below, and normal just above it', () => {
    expect(deviceTier({ hardwareConcurrency: 8, deviceMemory: lowMemoryGb })).toBe('low')
    expect(deviceTier({ hardwareConcurrency: 8, deviceMemory: lowMemoryGb * 2 })).toBe('normal')
  })

  it('is normal when the browser reports neither (Safari and Firefox have no deviceMemory)', () => {
    expect(deviceTier({})).toBe('normal')
    expect(deviceTier({ hardwareConcurrency: 8 })).toBe('normal')
  })

  it('never drops to low on the core count alone when memory is unreported (Safari on iPhone)', () => {
    expect(deviceTier({ hardwareConcurrency: lowCores })).toBe('normal')
    expect(deviceTier({ hardwareConcurrency: 1 })).toBe('normal')
  })

  it('ignores zero and junk values', () => {
    expect(deviceTier({ hardwareConcurrency: 0, deviceMemory: Number.NaN })).toBe('normal')
  })
})

describe('tierSettings (spec §8)', () => {
  it('turns the shadow map off, caps the pixel ratio, halves the counts, and slows motion on low', () => {
    expect(tierSettings('low')).toEqual({ maxDpr: 1.25, backdropMaxDpr: 1, shadows: false, countScale: 0.5, motionScale: tuning.world.tiers.low.motionScale })
    expect(tierSettings('low').motionScale).toBeLessThan(1)
  })

  it('keeps the design values on normal', () => {
    expect(tierSettings('normal')).toEqual({
      maxDpr: tuning.world.maxDpr,
      backdropMaxDpr: tuning.world.backdropMaxDpr,
      shadows: true,
      countScale: 1,
      motionScale: 1,
    })
  })

  it('draws about half of a count on low, and never none', () => {
    expect(tierCount(40, 'normal')).toBe(40)
    expect(tierCount(40, 'low')).toBe(20)
    expect(tierCount(1, 'low')).toBe(1)
  })
})
