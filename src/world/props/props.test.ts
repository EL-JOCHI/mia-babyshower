import * as THREE from 'three'
import { afterAll, describe, expect, it } from 'vitest'
import { tierCount } from '../../logic/deviceTier'
import { tuning, type PropName } from '../../tuning'
import { buildProps, disposeBuiltProps, propDrawCalls, propFactories, totalCalls } from './build'
import { buildMoodProps, disposeMoodBuild, moodDrawCalls, moodMaterials, skyAndMotesCalls } from './moodProps'

describe('the lived-in attic (spec §5)', () => {
  it('builds every prop from a pure factory: the same shapes on every call', () => {
    for (const make of Object.values(propFactories)) {
      const a = make()
      const b = make()
      expect(a.parts.length).toBeGreaterThan(0)
      expect(a.parts.map((p) => [p.material, p.geometry.attributes.position!.count])).toEqual(
        b.parts.map((p) => [p.material, p.geometry.attributes.position!.count]),
      )
      for (const part of [...a.parts, ...b.parts]) part.geometry.dispose()
    }
  })

  it('draws the shelf books and the yarn balls as instanced sets, each item a palette color', () => {
    const shelf = propFactories.bookshelf()
    const books = shelf.instances.find((set) => set.name === 'books')!
    expect(books.matrices).toHaveLength(tuning.world.props.books)
    const bookHexes = tuning.world.props.bookColors.map((c) => new THREE.Color(c).getHex())
    for (const color of books.colors) expect(bookHexes).toContain(color.getHex())
    const basket = propFactories.yarnBasket()
    const yarn = basket.instances.find((set) => set.name === 'yarn')!
    expect(yarn.matrices).toHaveLength(tuning.world.props.yarnBalls)
    const yarnHexes = tuning.world.props.yarnColors.map((c) => new THREE.Color(c).getHex())
    for (const color of yarn.colors) expect(yarnHexes).toContain(color.getHex())
  })

  it('lays soft contact shadows under the crib, the chair, and the trunks only (spec §8)', () => {
    const shaded = (Object.keys(propFactories) as PropName[]).filter((name) => propFactories[name]().shadow > 0)
    expect(shaded.sort()).toEqual(['crib', 'rockingChair', 'trunks'])
  })

  it('merges the static pieces of every prop into one geometry per material', () => {
    const built = buildProps()
    const keys = built.merged.map((m) => m.material)
    expect(new Set(keys).size).toBe(keys.length)
    expect(built.shadows).toHaveLength(3)
    expect(built.boxes.map((b) => b.name).sort()).toEqual((Object.keys(propFactories) as PropName[]).sort())
    disposeBuiltProps(built)
  })
})

describe('the draw-call budget (spec §8)', () => {
  const built = buildProps()
  afterAll(() => disposeBuiltProps(built))
  const cases = (['saturday', 'sunday'] as const).flatMap((mood) =>
    (['dark', 'light'] as const).flatMap((theme) => (['normal', 'low'] as const).map((tier) => [mood, theme, tier] as const)),
  )

  it.each(cases)('keeps %s %s on a %s device within 100 calls in the book and 60 behind the cards', (mood, theme, tier) => {
    const look = tuning.world.looks[mood][theme]
    const build = buildMoodProps(mood)
    const calls = totalCalls(propDrawCalls(built)) + moodDrawCalls(build) + skyAndMotesCalls(look)
    const { book, backdrop, bookAtRest, attic, materials } = tuning.world.budget
    expect(bookAtRest + calls).toBeLessThanOrEqual(book)
    expect(attic + calls).toBeLessThanOrEqual(backdrop)
    expect(propDrawCalls(built).materials + moodMaterials[mood].length).toBeLessThanOrEqual(materials)
    // A low device draws fewer stars and fireflies, never more (the calls stay the same: one each).
    expect(tierCount(tuning.world.stars.count, tier)).toBeLessThanOrEqual(tuning.world.stars.count)
    expect(tierCount(tuning.world.mood.fireflies.count, tier)).toBeLessThanOrEqual(tuning.world.mood.fireflies.count)
    disposeMoodBuild(build)
  })
})
