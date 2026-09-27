import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { tierCount } from '../../logic/deviceTier'
import { tuning, type MoodId, type ThemeName } from '../../tuning'
import { fireflyAt, fireflyField, fireflyGlow } from './fireflies'
import { ambientMotions, buildMoodProps, disposeMoodBuild, lanternSway, moodDrawCalls, sagY, shaftGeometry } from './moodProps'

const looks: [MoodId, ThemeName][] = [
  ['saturday', 'dark'],
  ['saturday', 'light'],
  ['sunday', 'dark'],
  ['sunday', 'light'],
]

describe('the mood props (spec §3)', () => {
  it('hangs the mobile, the star garland, and the moonbeam on Saturday', () => {
    const build = buildMoodProps('saturday')
    if (build.kind !== 'saturday') throw new Error('Saturday builds Saturday props')
    expect(build.garland).toHaveLength(tuning.world.mood.garland.count)
    expect(build.mobileCharms.attributes.position!.count).toBeGreaterThan(0)
    expect(moodDrawCalls(build)).toBe(5)
    disposeMoodBuild(build)
  })

  it('strings the lanterns and the golden beam on Sunday', () => {
    const build = buildMoodProps('sunday')
    if (build.kind !== 'sunday') throw new Error('Sunday builds Sunday props')
    expect(build.lanterns).toHaveLength(tuning.world.mood.lanterns.count)
    expect(moodDrawCalls(build)).toBe(3)
    disposeMoodBuild(build)
  })

  it('builds the same props on every call', () => {
    const a = buildMoodProps('sunday')
    const b = buildMoodProps('sunday')
    if (a.kind !== 'sunday' || b.kind !== 'sunday') throw new Error('Sunday builds Sunday props')
    expect(a.lanterns.map((l) => l.position.toArray())).toEqual(b.lanterns.map((l) => l.position.toArray()))
    disposeMoodBuild(a)
    disposeMoodBuild(b)
  })

  it('lets the beam fall from the window to the floor, wider and fainter at the floor', () => {
    const shaft = shaftGeometry('sunday')
    const p = shaft.attributes.position as THREE.BufferAttribute
    const c = shaft.attributes.color as THREE.BufferAttribute
    expect(p.getY(0)).toBeGreaterThan(tuning.world.attic.windowY)
    expect(p.getY(2)).toBeLessThan(0.1)
    expect(p.getX(3) - p.getX(2)).toBeGreaterThan(p.getX(1) - p.getX(0))
    expect(c.getW(0)).toBe(1)
    expect(c.getW(2)).toBeCloseTo(tuning.world.mood.shaft.bottomAlpha, 6)
    shaft.dispose()
  })

  it('sags a string between its rafters: highest at the ends, lowest in the middle', () => {
    expect(sagY(-10, -10, 10, 7, 1)).toBeCloseTo(7, 6)
    expect(sagY(10, -10, 10, 7, 1)).toBeCloseTo(7, 6)
    expect(sagY(0, -10, 10, 7, 1)).toBeCloseTo(6, 6)
  })
})

describe('the ambient motion (spec §3 Motion rule, §8)', () => {
  it.each(looks)('moves at most two things at once in %s %s: the mobile or the lanterns, plus the dust or the fireflies', (mood, theme) => {
    const motions = ambientMotions(mood, tuning.world.looks[mood][theme].motes)
    expect(motions).toHaveLength(2)
    expect(['mobile', 'lanterns']).toContain(motions[0])
    expect(['dust', 'fireflies']).toContain(motions[1])
  })

  it('sways each lantern gently, within its swing, out of step with its neighbours', () => {
    const { sway } = tuning.world.mood.lanterns
    for (let t = 0; t < 8; t += 0.4) expect(Math.abs(lanternSway(t, 3))).toBeLessThanOrEqual(sway + 1e-9)
    expect(lanternSway(1, 0)).not.toBe(lanternSway(1, 1))
  })

  it('drifts each firefly around its own spot, and blinks it', () => {
    const field = fireflyField(12)
    expect(Array.from(fireflyField(12).base)).toEqual(Array.from(field.base))
    const { drift } = tuning.world.mood.fireflies
    const out = new THREE.Vector3()
    for (const t of [0, 1.3, 7.7]) {
      for (let i = 0; i < field.count; i++) {
        fireflyAt(field, i, t, out)
        expect(Math.abs(out.x - field.base[i * 3]!)).toBeLessThanOrEqual(drift + 1e-6)
        expect(Math.abs(out.z - field.base[i * 3 + 2]!)).toBeLessThanOrEqual(drift + 1e-6)
        const glow = fireflyGlow(t, field.phase[i]!)
        expect(glow).toBeGreaterThanOrEqual(0)
        expect(glow).toBeLessThanOrEqual(1)
      }
    }
  })

  it('sends out about half the fireflies on a low-tier device', () => {
    const { count } = tuning.world.mood.fireflies
    expect(tierCount(count, 'low')).toBe(Math.round(count / 2))
  })
})
