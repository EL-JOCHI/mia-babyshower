import { describe, expect, it } from 'vitest'
import { days } from '../content'
import { countdown } from './countdown'

const at = (iso: string) => Date.parse(iso)

describe('countdown (US-6, BR-8)', () => {
  it('targets each day start instant', () => {
    expect(days.sat.start).toBe('2026-10-17T16:30:00-04:00')
    expect(days.sun.start).toBe('2026-10-18T16:30:00-04:00')
  })

  it('splits the remaining time into days, hours, minutes, and seconds', () => {
    expect(countdown(days.sat.start, at('2026-10-16T15:28:30-04:00'))).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 30,
    })
  })

  it('reads zero at and after the start', () => {
    const zero = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    expect(countdown(days.sun.start, at('2026-10-18T16:30:00-04:00'))).toEqual(zero)
    expect(countdown(days.sun.start, at('2026-10-18T20:00:00-04:00'))).toEqual(zero)
  })

  it('never shows negative units', () => {
    const result = countdown(days.sat.start, at('2026-09-27T20:15:01-04:00'))
    for (const value of Object.values(result)) expect(value).toBeGreaterThanOrEqual(0)
    expect(result.days).toBe(19)
  })
})
