import * as THREE from 'three'
import { tuning } from '../tuning'

// The height of the open pages at x: flat across, dipping at the gutter, and curving down to the
// cover at the outer edges (design §1: a giant open book lying on the floor).
export function pageHeight(x: number): number {
  const { pageWidth, pageTop, coverTop, gutterDip, gutterWidth, edgeCurl } = tuning.world.book
  const edge = Math.abs(x) - (pageWidth - edgeCurl)
  let y = pageTop
  if (edge > 0) y = coverTop + (pageTop - coverTop) * Math.cos((Math.min(1, edge / edgeCurl) * Math.PI) / 2)
  return y - gutterDip * Math.exp(-((x / gutterWidth) ** 2))
}

export interface BookPath {
  // Where the camera sits and where it looks, for progress 0 to 1.
  camera: THREE.CatmullRomCurve3
  look: THREE.CatmullRomCurve3
  // The stations' feet on the page.
  ground: THREE.CatmullRomCurve3
  anchors: THREE.Vector3[]
  fov: number
}

// Design §2 Camera path and §9 Large screens: a Catmull-Rom spline over one point per station,
// lifted and pulled back. Portrait and landscape get their own field of view, and the camera
// backs off until a page fits, so wide screens show more of the book instead of stretching.
export function buildPath(stationProgress: readonly number[], aspect: number): BookPath {
  const { fovPortrait, fovLandscape } = tuning.world
  const { length, sway, lift, lookHeight, minPullBack, frameWidth, frameHeight } = tuning.world.path
  const fov = aspect < 1 ? fovPortrait : fovLandscape
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(fov) / 2)
  const pullBack = Math.max(minPullBack, frameWidth / 2 / (halfHeight * aspect), frameHeight / 2 / halfHeight)

  const anchors = stationProgress.map((t) => {
    const x = -length / 2 + t * length
    return new THREE.Vector3(x, pageHeight(x), sway * Math.sin(2 * Math.PI * t))
  })
  const curve = (offset: THREE.Vector3) =>
    new THREE.CatmullRomCurve3(
      anchors.map((a) => a.clone().add(offset)),
      false,
      'centripetal',
    )
  return {
    camera: curve(new THREE.Vector3(0, lift, pullBack)),
    look: curve(new THREE.Vector3(0, lookHeight, 0)),
    ground: curve(new THREE.Vector3()),
    anchors,
    fov,
  }
}
