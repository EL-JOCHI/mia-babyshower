import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type Triple = readonly [number, number, number]

// Where a piece sits in its prop: a position, a rotation (radians, x then y then z as three.js
// applies them), and a scale.
export interface Pose {
  at?: Triple
  rotate?: Triple
  scale?: Triple
}

// Scratch objects for placing pieces.
const matrix = new THREE.Matrix4()
const position = new THREE.Vector3()
const quaternion = new THREE.Quaternion()
const euler = new THREE.Euler()
const size = new THREE.Vector3()

// The props' crooked angles are written in degrees (spec §5: slightly crooked proportions).
export const tilt = (degrees: number) => THREE.MathUtils.degToRad(degrees)

// A piece placed in its prop and made ready to merge: non-indexed, with position, normal, and uv.
export function placed(geometry: THREE.BufferGeometry, pose: Pose = {}): THREE.BufferGeometry {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry
  if (flat !== geometry) geometry.dispose()
  const [rx, ry, rz] = pose.rotate ?? [0, 0, 0]
  position.fromArray(pose.at ?? [0, 0, 0])
  size.fromArray(pose.scale ?? [1, 1, 1])
  quaternion.setFromEuler(euler.set(rx, ry, rz))
  flat.applyMatrix4(matrix.compose(position, quaternion, size))
  return flat
}

// A box standing on its bottom face at the pose's position: w wide, h tall, d deep.
export function block(w: number, h: number, d: number, pose: Pose = {}): THREE.BufferGeometry {
  const box = new THREE.BoxGeometry(w, h, d)
  box.translate(0, h / 2, 0)
  return placed(box, pose)
}

// A round rod rising from the pose's position.
export function rod(radius: number, length: number, pose: Pose = {}, segments = 8): THREE.BufferGeometry {
  const cylinder = new THREE.CylinderGeometry(radius, radius, length, segments)
  cylinder.translate(0, length / 2, 0)
  return placed(cylinder, pose)
}

// Merges pieces that share their attributes into one geometry, and disposes the pieces.
export function merge(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(geometries)
  for (const geometry of geometries) geometry.dispose()
  if (!merged) throw new Error('The attic props could not be merged')
  return merged
}

// A geometry's draw groups, each as a geometry of its own (an extrusion's caps, then its sides),
// ready to merge. Disposes the original.
export function splitGroups(geometry: THREE.BufferGeometry): THREE.BufferGeometry[] {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry
  const pieces = flat.groups.map(({ start, count }) => {
    const piece = new THREE.BufferGeometry()
    for (const [name, attribute] of Object.entries(flat.attributes)) {
      const size = attribute.itemSize
      piece.setAttribute(name, new THREE.BufferAttribute(attribute.array.slice(start * size, (start + count) * size), size))
    }
    return piece
  })
  if (flat !== geometry) flat.dispose()
  geometry.dispose()
  return pieces
}
