import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { bookQrPx } from '../logic/book'
import { buildPath } from './bookPath'

// How large a page is drawn at its foot, as a share of its design size, with the camera at rest on
// it. The camera looks slightly down, so the foot (the page's lowest line) is the farthest point
// of the page along the line of sight, and the smallest.
function restingScale(width: number, height: number): number {
  const path = buildPath([0, 0.5, 1], width / height, height)
  const camera = path.camera.getPoint(0.5)
  const forward = path.look.getPoint(0.5).sub(camera).normalize()
  const foot = path.anchors[1]!.clone().add(new THREE.Vector3(0, tuning.world.page.lift, 0))
  const depth = foot.sub(camera).dot(forward)
  const pxPerUnit = height / 2 / Math.tan(THREE.MathUtils.degToRad(path.fov) / 2) / depth
  const { cardPx, cardWidth } = tuning.world.page
  return (pxPerUnit * cardWidth) / cardPx
}

// How far the camera sits back from a page at rest.
function pullBack(width: number, height: number): number {
  const path = buildPath([0, 0.5, 1], width / height, height)
  return path.camera.getPoint(0.5).z - path.anchors[1]!.z
}

describe('the book frames its pages readably (design §9)', () => {
  it.each([
    [390, 660],
    [360, 640],
    [375, 553],
    [1280, 720],
  ])('keeps a page at its minimum scale or more at %i×%i', (width, height) => {
    expect(restingScale(width, height)).toBeGreaterThanOrEqual(tuning.world.page.minScale - 1e-9)
  })

  // Design §9: a screen tall enough frames a whole page, as before: the camera backs off until a
  // frame of path.frameHeight fits, and the floor does not bind.
  it.each([
    [390, 844, tuning.world.fovPortrait],
    [1440, 900, tuning.world.fovLandscape],
    [1920, 1080, tuning.world.fovLandscape],
  ])('backs off to fit the frame as before on a screen tall enough at %i×%i', (width, height, fov) => {
    const fit = tuning.world.path.frameHeight / 2 / Math.tan(THREE.MathUtils.degToRad(fov) / 2)
    expect(pullBack(width, height)).toBeCloseTo(fit, 5)
    expect(restingScale(width, height)).toBeGreaterThanOrEqual(tuning.world.page.minScale)
  })

  it('draws the QR in the book large enough to stay at its minimum size at the smallest page scale', () => {
    expect(bookQrPx * tuning.world.page.minScale).toBeGreaterThanOrEqual(tuning.qr.minPx)
  })
})
