import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { backdropView } from './backdropView'

// Whether a point of the attic is on screen for a screen this size with the flat room panned to `pan`.
function inFrame(width: number, height: number, pan: number, point: THREE.Vector3): boolean {
  const aspect = width / height
  const view = backdropView(aspect, pan)
  const camera = new THREE.PerspectiveCamera(view.fov, aspect, tuning.world.backdrop.near, tuning.world.backdrop.far)
  camera.position.fromArray(view.position)
  camera.lookAt(new THREE.Vector3().fromArray(view.look))
  camera.updateMatrixWorld()
  const p = point.clone().project(camera)
  return Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z < 1
}

const { windowY, wallZ } = tuning.world.attic
const crib = tuning.world.props.placements.crib.at
const windowCentre = new THREE.Vector3(0, windowY, wallZ)
const cribTop = new THREE.Vector3(crib[0], 0.8, crib[1])

describe("level 2's camera (spec §7)", () => {
  it('frames the attic from the front, toward the window and the crib, on every screen and at every pan', () => {
    for (const [width, height] of [
      [390, 600],
      [844, 390],
      [390, 844],
      [1024, 768],
    ] as const) {
      for (const pan of [0, 0.5, 1]) {
        expect(inFrame(width, height, pan, windowCentre), `window at ${width}×${height}, pan ${pan}`).toBe(true)
        expect(inFrame(width, height, pan, cribTop), `crib at ${width}×${height}, pan ${pan}`).toBe(true)
      }
    }
  })

  it('drifts sideways with the horizontal pan, the same amount each way, and centres at the middle', () => {
    const { drift, position } = tuning.world.backdrop
    expect(backdropView(1, 0.5).position[0]).toBeCloseTo(position[0], 9)
    expect(backdropView(1, 0).position[0]).toBeCloseTo(position[0] - drift, 9)
    expect(backdropView(1, 1).position[0]).toBeCloseTo(position[0] + drift, 9)
    expect(backdropView(1, 3).position[0]).toBeCloseTo(position[0] + drift, 9)
  })

  it('turns a little as it drifts, and never moves up, down, or nearer', () => {
    const left = backdropView(1, 0)
    const right = backdropView(1, 1)
    expect(right.look[0] - right.position[0]).toBeGreaterThan(0)
    expect(left.look[0] - left.position[0]).toBeLessThan(0)
    expect([left.position[1], left.position[2]]).toEqual([right.position[1], right.position[2]])
    expect([left.look[1], left.look[2]]).toEqual([right.look[1], right.look[2]])
  })

  it('widens its view for a portrait screen', () => {
    expect(backdropView(0.5, 0.5).fov).toBe(tuning.world.backdrop.fovPortrait)
    expect(backdropView(2, 0.5).fov).toBe(tuning.world.backdrop.fovLandscape)
  })
})
