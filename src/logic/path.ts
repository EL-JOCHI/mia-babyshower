import { tuning } from '../tuning'
import type { LandmarkId } from './layout'

// Adding 0 turns -0 into 0.
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1) + 0

// Design §2 Camera path: one point per station, evenly spaced along progress 0 to 1.
export function stationProgress(ids: readonly LandmarkId[]): Record<LandmarkId, number> {
  const map = {} as Record<LandmarkId, number>
  const last = Math.max(1, ids.length - 1)
  ids.forEach((id, i) => {
    map[id] = i / last
  })
  return map
}

// Both drag axes advance the book: a left or an up drag moves forward.
export function progressFromDrag(progress: number, dx: number, dy: number, vw: number): number {
  return clamp01(progress + (-(dx + dy) / vw) * tuning.world.dragProgressPerViewport)
}

export function nearestStation(progress: number, map: Record<LandmarkId, number>): LandmarkId {
  let best: LandmarkId | null = null
  let bestDistance = Infinity
  for (const [id, at] of Object.entries(map) as [LandmarkId, number][]) {
    const distance = Math.abs(at - progress)
    if (distance < bestDistance) {
      best = id
      bestDistance = distance
    }
  }
  if (best === null) throw new Error('No stations on the path')
  return best
}
