import * as THREE from 'three'
import { afterAll, describe, expect, it } from 'vitest'
import { tierCount } from '../../logic/deviceTier'
import { tuning, type PropName } from '../../tuning'
import { buildProps, disposeBuiltProps, propDrawCalls, propFactories, totalCalls } from './build'
import { buildMoodProps, disposeMoodBuild, moodDrawCalls, moodMaterials, skyAndMotesCalls } from './moodProps'
import { familyDrawCalls } from '../familyWalk'
import { mockingbirdBody, mockingbirdOutline } from './guitar'

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

// This work's spec §6: dad's B.C. Rich Mockingbird Contour in gold top.
describe("dad's guitar (spec §6)", () => {
  const others = (Object.keys(propFactories) as PropName[]).filter((name) => name !== 'guitar')

  it('brings at most three new materials: its gold, its rosewood, and its black pickups', () => {
    const model = propFactories.guitar()
    const mine = model.parts.map((part) => part.material)
    const before = new Set(others.flatMap((name) => propFactories[name]().parts.map((part) => part.material)))
    const added = mine.filter((material) => !before.has(material)).sort()
    expect(added).toEqual(['gold', 'pickup', 'rosewood'])
    expect(added.length).toBeLessThanOrEqual(3)
    // The bone inlays share the props' paper.
    expect(mine).toContain('paper')
    for (const part of model.parts) part.geometry.dispose()
  })

  // Where a line across the outline at height y is inside the body: [from, to] spans, left to right.
  function across(points: THREE.Vector2[], y: number): [number, number][] {
    const xs: number[] = []
    points.forEach((a, i) => {
      const b = points[(i + 1) % points.length]!
      if (a.y > y !== b.y > y) xs.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y))
    })
    xs.sort((m, n) => m - n)
    return xs.flatMap((x, i) => (i % 2 === 0 ? [[x, xs[i + 1]!] as [number, number]] : []))
  }

  it('draws the Mockingbird: two horns, the treble one longer, above the neck joint', () => {
    const { neckFrom: joint, neckWidth } = tuning.world.props.guitar
    const points = mockingbirdOutline().getPoints(20)
    const bass = points.filter((p) => p.x < -neckWidth / 2)
    const treble = points.filter((p) => p.x > neckWidth / 2)
    const top = (list: typeof points) => Math.max(...list.map((p) => p.y))
    expect(top(bass)).toBeGreaterThan(joint)
    expect(top(treble)).toBeGreaterThan(top(bass))
    // The deep cutaways at the neck joint: over the top of the rise from the joint to the short horn's
    // tip, the body falls away beside the neck on both sides (nothing within a neck's width of the
    // centre), while each horn rises past, clear of it.
    for (const rise of [0.7, 0.8, 0.9]) {
      const spans = across(points, joint + rise * (top(bass) - joint))
      expect(spans.filter(([from, to]) => to > -neckWidth && from < neckWidth)).toEqual([])
      expect(spans.some(([, to]) => to <= -neckWidth)).toBe(true)
      expect(spans.some(([from]) => from >= neckWidth)).toBe(true)
    }
  })

  // Whether two edges cross or touch (a, b and c, d: their ends).
  function meet(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2, d: THREE.Vector2): boolean {
    const turn = (o: THREE.Vector2, p: THREE.Vector2, q: THREE.Vector2) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x)
    const within = (p: THREE.Vector2, q: THREE.Vector2, r: THREE.Vector2) =>
      Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y)
    const [d1, d2, d3, d4] = [turn(c, d, a), turn(c, d, b), turn(a, b, c), turn(a, b, d)]
    if (d1 * d2 < 0 && d3 * d4 < 0) return true
    return (d1 === 0 && within(c, d, a)) || (d2 === 0 && within(c, d, b)) || (d3 === 0 && within(a, b, c)) || (d4 === 0 && within(a, b, d))
  }

  it('keeps the outline one simple closed loop, and extrudes it cleanly', () => {
    const outline = mockingbirdOutline()
    // Closed: each curve ends where the next begins, the last where the first began.
    outline.curves.forEach((curve, i) => {
      const next = outline.curves[(i + 1) % outline.curves.length]!
      expect(curve.getPoint(1).distanceTo(next.getPoint(0))).toBeLessThan(1e-9)
    })
    // The loop the extrusion triangulates, at the tuned curve segments, without its repeated end.
    const loop = outline.extractPoints(tuning.world.props.guitar.curveSegments).shape
    if (loop[0]!.equals(loop.at(-1)!)) loop.pop()
    expect(THREE.ShapeUtils.area(loop)).toBeGreaterThan(0)
    // Simple: no two edges cross or touch, except neighbours at their shared corner.
    const n = loop.length
    const crossings: [number, number][] = []
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue
        if (meet(loop[i]!, loop[(i + 1) % n]!, loop[j]!, loop[(j + 1) % n]!)) crossings.push([i, j])
      }
    }
    expect(crossings).toEqual([])
    // The body as the guitar extrudes it: every vertex a number, every triangle with an area.
    const body = mockingbirdBody()
    for (const name of ['position', 'normal']) expect(Array.from(body.attributes[name]!.array).every(Number.isFinite)).toBe(true)
    const position = body.attributes.position!
    const [a, b, c] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
    let flat = 0
    for (let i = 0; i < position.count; i += 3) {
      a.fromBufferAttribute(position, i)
      b.fromBufferAttribute(position, i + 1)
      c.fromBufferAttribute(position, i + 2)
      if (b.sub(a).cross(c.sub(a)).length() / 2 < 1e-10) flat++
    }
    expect(flat).toBe(0)
    body.dispose()
  })

  it('stands on the floor, as tall as a guitar, leaning back against the wall', () => {
    const model = propFactories.guitar()
    const box = new THREE.Box3()
    for (const part of model.parts) {
      part.geometry.computeBoundingBox()
      box.union(part.geometry.boundingBox!)
    }
    const g = tuning.world.props.guitar
    expect(box.min.y).toBeGreaterThanOrEqual(-1e-6)
    expect(box.max.y).toBeGreaterThan(g.headTop * 0.95)
    // The headstock leans back, behind the body's foot.
    expect(box.min.z).toBeLessThan(-g.headTop * Math.sin(THREE.MathUtils.degToRad(g.lean)) * 0.7)
    for (const part of model.parts) part.geometry.dispose()
  })

  it('leans in the corner by the Familia door: past the last station, against the back wall, under the roof', () => {
    const built = buildProps()
    const box = built.boxes.find((b) => b.name === 'guitar')!.box
    const { halfWidth, wallZ, ridge, eave } = tuning.world.attic
    const familiaX = tuning.world.path.length / 2
    expect(box.min.x).toBeGreaterThan(familiaX)
    expect(box.max.x).toBeLessThan(halfWidth)
    expect(box.min.z).toBeGreaterThan(wallZ)
    expect(box.max.z).toBeLessThan(wallZ + 1.5)
    const roof = eave + (ridge - eave) * (1 - box.max.x / halfWidth)
    expect(box.max.y).toBeLessThan(roof)
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
    // The book adds the paper family at the Familia station; level 2 has no book.
    expect(bookAtRest + calls + familyDrawCalls).toBeLessThanOrEqual(book)
    expect(attic + calls).toBeLessThanOrEqual(backdrop)
    expect(propDrawCalls(built).materials + moodMaterials[mood].length).toBeLessThanOrEqual(materials)
    // Dad's guitar is in the count (spec §6): its gold, rosewood, and pickups are merged meshes.
    expect(built.merged.map((m) => m.material)).toEqual(expect.arrayContaining(['gold', 'rosewood', 'pickup']))
    // A low device draws fewer stars and fireflies, never more (the calls stay the same: one each).
    expect(tierCount(tuning.world.stars.count, tier)).toBeLessThanOrEqual(tuning.world.stars.count)
    expect(tierCount(tuning.world.mood.fireflies.count, tier)).toBeLessThanOrEqual(tuning.world.mood.fireflies.count)
    disposeMoodBuild(build)
  })
})
