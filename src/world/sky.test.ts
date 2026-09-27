import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { tierCount } from '../logic/deviceTier'
import { tuning } from '../tuning'
import { starField, twinkle, writeSkyColors } from './sky'

describe('the window sky (spec §3)', () => {
  it('runs from the horizon color at the bottom to the top color at the top', () => {
    const plane = new THREE.PlaneGeometry(1, 1, 1, 4)
    const positions = plane.attributes.position as THREE.BufferAttribute
    const colors = new THREE.BufferAttribute(new Float32Array(positions.count * 3), 3)
    writeSkyColors(colors, positions, new THREE.Color(1, 0, 0), new THREE.Color(0, 0, 1))
    // PlaneGeometry lists its rows from the top (y 0.5) to the bottom (y -0.5).
    expect([colors.getX(0), colors.getY(0), colors.getZ(0)]).toEqual([1, 0, 0])
    const last = colors.count - 1
    expect([colors.getX(last), colors.getY(last), colors.getZ(last)]).toEqual([0, 0, 1])
    expect(colors.getX(4)).toBeGreaterThan(0)
    expect(colors.getX(4)).toBeLessThan(1)
    plane.dispose()
  })

  it('scatters the stars inside the window, the same way on every load', () => {
    const a = starField(40, 2)
    const b = starField(40, 2)
    expect(a.count).toBe(40)
    expect(Array.from(a.x)).toEqual(Array.from(b.x))
    for (let i = 0; i < a.count; i++) expect(Math.hypot(a.x[i]!, a.y[i]!)).toBeLessThanOrEqual(2)
  })

  it('twinkles each star between its dimmest and its full size', () => {
    const { min } = tuning.world.stars
    const seen = new Set<number>()
    for (let t = 0; t < 6; t += 0.25) {
      const k = twinkle(t, 0.7)
      expect(k).toBeGreaterThanOrEqual(min - 1e-9)
      expect(k).toBeLessThanOrEqual(1 + 1e-9)
      seen.add(Math.round(k * 100))
    }
    expect(seen.size).toBeGreaterThan(3)
  })

  it('draws about half the stars on a low-tier device (spec §8)', () => {
    const { count } = tuning.world.stars
    expect(tierCount(count, 'low')).toBe(Math.round(count / 2))
  })
})
