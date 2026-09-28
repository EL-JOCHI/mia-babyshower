import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { stationProgress } from '../logic/path'
import { landmarksFor } from '../logic/layout'
import { familySpots, foldUp, walkBegins, walkPose, type WalkPose } from './familyWalk'
import { pieceAspect } from './paperTextures'

const door = tuning.world.pieces.familia.find((piece) => piece.kind === 'door')!
const doorWidth = door.height * pieceAspect.door
const doorwayTop = door.height * tuning.world.doorway.height

describe('the paper family in the 3D doorway (spec §6)', () => {
  const spots = familySpots()

  it("stands the four figures across the door in the drawing's order", () => {
    const x = Object.fromEntries(spots.map((spot) => [spot.id, spot.rest[0]]))
    expect(x.mia!).toBeLessThan(x.dad!)
    expect(x.dad!).toBeLessThan(x.mom!)
    expect(x.mom!).toBeLessThan(x.miguelito!)
  })

  it('makes dad the tuned height, and keeps everyone inside the door, above the card', () => {
    const { height, standY } = tuning.world.family
    expect(Math.max(...spots.map((spot) => spot.height))).toBeCloseTo(height, 6)
    for (const spot of spots) {
      expect(Math.abs(spot.rest[0]) + spot.width / 2).toBeLessThanOrEqual(doorWidth / 2)
      expect(standY + spot.height).toBeLessThanOrEqual(doorwayTop)
    }
  })

  it('walks each figure in after the one before, then rests it in the doorway', () => {
    const { walkS, staggerS } = tuning.world.family
    expect(spots.map((spot) => spot.delay)).toEqual(spots.map((_, i) => i * staggerS))
    const out: WalkPose = { x: 0, z: 0, bob: 0, done: false }
    const mia = spots.at(-1)!
    walkPose(mia, 0, out)
    expect([out.x, out.z]).toEqual([mia.start[0], mia.start[1]])
    expect(out.done).toBe(false)
    walkPose(mia, mia.delay + walkS / 2, out)
    expect(out.z).toBeLessThan(mia.start[1])
    expect(out.z).toBeGreaterThan(mia.rest[1])
    walkPose(mia, mia.delay + walkS + 0.01, out)
    expect(out.x).toBeCloseTo(mia.rest[0], 9)
    expect(out.z).toBeCloseTo(mia.rest[1], 9)
    expect(out.bob).toBe(0)
    expect(out.done).toBe(true)
  })

  // The door already stands when the guest arrives (see below), so each figure folds up on its own
  // as its walk begins, with the book's pop-up spring: flat, a springy overshoot, then standing.
  it('folds each figure up from flat as its walk begins, with the pop-up overshoot, standing once it rests', () => {
    const { walkS } = tuning.world.family
    for (const spot of spots) {
      // Flat while it waits, up to the moment it sets off.
      expect(foldUp(spot, 0)).toBe(0)
      expect(foldUp(spot, spot.delay)).toBe(0)
      const during = Array.from({ length: 50 }, (_, i) => foldUp(spot, spot.delay + (walkS * i) / 50))
      expect(Math.max(...during)).toBeGreaterThan(1)
      expect(foldUp(spot, spot.delay + walkS + 0.01)).toBe(1)
    }
  })

  // The door pops up within popUp.range of its station, which reaches the page before (El regalo):
  // the walk waits for the camera at the Familia station, where the guest sees it.
  it('walks in once the door stands and the camera is at the Familia station, not from the page before', () => {
    const { standAt } = tuning.world.family
    const stations = stationProgress(landmarksFor(false))
    const at = stations.familia
    expect(at - stations.presente).toBeLessThan(tuning.world.popUp.range)
    expect(walkBegins(1, stations.presente, at)).toBe(false)
    expect(walkBegins(standAt / 2, at, at)).toBe(false)
    expect(walkBegins(standAt, at, at)).toBe(true)
    expect(walkBegins(1, at - tuning.world.stationEps, at)).toBe(true)
  })
})
