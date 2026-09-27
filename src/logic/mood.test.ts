import { describe, expect, it } from 'vitest'
import type { DayId } from '../content'
import { tuning, type MoodId, type ThemeName } from '../tuning'
import { moodFor, moodOfDay } from './mood'

describe('moodFor (spec §3)', () => {
  it.each([
    ['sat', 'dark', 'saturday'],
    ['sat', 'light', 'saturday'],
    ['sun', 'dark', 'sunday'],
    ['sun', 'light', 'sunday'],
  ] as [DayId, ThemeName, MoodId][])('gives %s in %s the %s look', (day, theme, mood) => {
    const result = moodFor(day, theme)
    expect(result.mood).toBe(mood)
    expect(result.theme).toBe(theme)
    expect(result.look).toBe(tuning.world.looks[mood][theme])
  })

  it('takes the mood from the invite link only: Saturday is night, Sunday is dusk', () => {
    expect(moodOfDay).toEqual({ sat: 'saturday', sun: 'sunday' })
  })

  it('puts the moon in both Saturday looks and the sun in both Sunday looks', () => {
    for (const theme of ['dark', 'light'] as const) {
      expect(moodFor('sat', theme).look.orbKind).toBe('moon')
      expect(moodFor('sun', theme).look.orbKind).toBe('sun')
    }
  })

  it('shows the window stars on Saturday only, and fireflies only at Sunday dusk', () => {
    expect(moodFor('sat', 'dark').look.stars).toBeGreaterThan(0)
    expect(moodFor('sat', 'light').look.stars).toBeGreaterThan(0)
    expect(moodFor('sun', 'dark').look.stars).toBe(0)
    expect(moodFor('sun', 'light').look.stars).toBe(0)
    expect(moodFor('sun', 'dark').look.motes).toBe('fireflies')
    for (const [day, theme] of [['sat', 'dark'], ['sat', 'light'], ['sun', 'light']] as [DayId, ThemeName][]) {
      expect(moodFor(day, theme).look.motes).toBe('dust')
    }
  })

  it('lights the crooked lamp in the light looks and leaves it dark in the dark looks (spec §5)', () => {
    expect(moodFor('sat', 'dark').look.lampGlow).toBe(0)
    expect(moodFor('sun', 'dark').look.lampGlow).toBe(0)
    expect(moodFor('sat', 'light').look.lampGlow).toBeGreaterThan(0)
    expect(moodFor('sun', 'light').look.lampGlow).toBeGreaterThan(0)
  })
})
