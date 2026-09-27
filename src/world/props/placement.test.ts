import * as THREE from 'three'
import { afterAll, describe, expect, it } from 'vitest'
import { landmarksFor } from '../../logic/layout'
import { stationProgress } from '../../logic/path'
import { tuning } from '../../tuning'
import { buildPath } from '../bookPath'
import { buildProps, disposeBuiltProps } from './build'

const ids = landmarksFor(false)
const stationMap = stationProgress(ids)
const stations = ids.map((id) => stationMap[id])
const { cardWidth, cardPx, slotPx, lift } = tuning.world.page
const pageTall = (slotPx * cardWidth) / cardPx

// The page standing at a station (its whole slot): its four corners and its middle.
function pagePoints(anchor: THREE.Vector3): THREE.Vector3[] {
  const bottom = anchor.y + lift
  const top = bottom + pageTall
  const half = cardWidth / 2
  return [
    new THREE.Vector3(anchor.x - half, bottom, anchor.z),
    new THREE.Vector3(anchor.x + half, bottom, anchor.z),
    new THREE.Vector3(anchor.x - half, top, anchor.z),
    new THREE.Vector3(anchor.x + half, top, anchor.z),
    new THREE.Vector3(anchor.x, (bottom + top) / 2, anchor.z),
  ]
}

const ray = new THREE.Ray()
const hit = new THREE.Vector3()

// Whether a box stands on the straight line from the camera to a point of the page.
function blocks(from: THREE.Vector3, to: THREE.Vector3, box: THREE.Box3): boolean {
  ray.origin.copy(from)
  ray.direction.subVectors(to, from)
  const length = ray.direction.length()
  ray.direction.normalize()
  return ray.intersectBox(box, hit) !== null && hit.distanceTo(from) <= length
}

const screens = [
  [390, 844],
  [360, 640],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
] as const

describe('the props never cover a page (spec §5 Placement)', () => {
  const built = buildProps()
  afterAll(() => disposeBuiltProps(built))

  it('knows a blocking box when it sees one', () => {
    const box = new THREE.Box3(new THREE.Vector3(-1, -1, 1), new THREE.Vector3(1, 1, 2))
    expect(blocks(new THREE.Vector3(0, 0, 5), new THREE.Vector3(0, 0, 0), box)).toBe(true)
    expect(blocks(new THREE.Vector3(0, 0, 5), new THREE.Vector3(0, 0, 3), box)).toBe(false)
  })

  it.each(screens)('stay out of the camera corridor at every station and along every glide at %i×%i', (width, height) => {
    const path = buildPath(stations, width / height, height)
    const camera = new THREE.Vector3()
    for (let step = 0; step <= 120; step++) {
      const t = step / 120
      path.camera.getPoint(t, camera)
      // The pages the camera is between: the nearest two stations.
      const near = stations
        .map((at, i) => ({ i, distance: Math.abs(at - t) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)
      for (const { i } of near) {
        for (const point of pagePoints(path.anchors[i]!)) {
          for (const { name, box } of built.boxes) {
            expect(blocks(camera, point, box), `${name} at t=${t.toFixed(3)}`).toBe(false)
          }
        }
      }
    }
  })
})
