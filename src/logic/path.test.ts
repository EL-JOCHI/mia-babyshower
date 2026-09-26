import { describe, expect, it } from 'vitest'
import { landmarksFor } from './layout'
import { nearestStation, progressFromDrag, stationProgress } from './path'

describe('camera path', () => {
  it('spaces stations evenly from 0 to 1', () => {
    const m = stationProgress(landmarksFor(false))
    expect(m.llegada).toBe(0)
    expect(m.familia).toBe(1)
    expect(m.cuando).toBeCloseTo(2 / 6, 5)
  })
  it('moves forward with a left or up drag, and stays within 0 to 1', () => {
    expect(progressFromDrag(0.5, -100, 0, 1000)).toBeGreaterThan(0.5)
    expect(progressFromDrag(0.5, 0, -100, 1000)).toBeGreaterThan(0.5)
    expect(progressFromDrag(0, 500, 0, 1000)).toBe(0)
    expect(progressFromDrag(1, -5000, 0, 1000)).toBe(1)
  })
  it('finds the nearest station', () => {
    const m = stationProgress(landmarksFor(true))
    expect(nearestStation(0.4, m)).toBe('palabra')
    expect(nearestStation(0.95, m)).toBe('familia')
  })
})
