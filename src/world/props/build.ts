import * as THREE from 'three'
import { tuning, type PropName } from '../../tuning'
import { bookshelf, catBed, crib, crookedLamp, curtains, rockingChair, scratchingPost, trunks, yarnBasket } from './factories'
import { guitar } from './guitar'
import { merge } from './shapes'
import type { PropInstances, PropMaterialKey, PropModel } from './types'

export const propFactories: Record<PropName, () => PropModel> = {
  crib,
  bookshelf,
  yarnBasket,
  rockingChair,
  trunks,
  lamp: crookedLamp,
  catBed,
  scratchingPost,
  curtains,
  guitar,
}

export interface BuiltProps {
  // One geometry per material, across every prop.
  merged: { material: PropMaterialKey; geometry: THREE.BufferGeometry }[]
  instanced: PropInstances[]
  // The ink edges of every static piece, as one set of lines (spec §5: ink edges).
  edges: THREE.BufferGeometry
  // Where the painted contact shadows lie, one matrix each, for one instanced quad.
  shadows: THREE.Matrix4[]
  // Each prop's box in the attic, to keep it out of the camera's way.
  boxes: { name: PropName; box: THREE.Box3 }[]
}

const up = new THREE.Vector3(0, 1, 0)
const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)

// Where a prop stands in the attic.
export function placement(name: PropName): THREE.Matrix4 {
  const { at, turn, scale } = tuning.world.props.placements[name]
  return new THREE.Matrix4().compose(
    new THREE.Vector3(at[0], 0, at[1]),
    new THREE.Quaternion().setFromAxisAngle(up, turn),
    new THREE.Vector3(scale, scale, scale),
  )
}

// Spec §5 and §8: every prop placed; the static pieces merged into one geometry per material across
// all the props; the repeated items kept as instanced sets; the ink edges as one set of lines; and
// the contact shadows as one instanced quad.
export function buildProps(): BuiltProps {
  const { edgeAngle, shadowLift, placements } = tuning.world.props
  const byMaterial = new Map<PropMaterialKey, THREE.BufferGeometry[]>()
  const edges: THREE.BufferGeometry[] = []
  const instanced: PropInstances[] = []
  const shadows: THREE.Matrix4[] = []
  const boxes: BuiltProps['boxes'] = []
  for (const name of Object.keys(propFactories) as PropName[]) {
    const model = propFactories[name]()
    const place = placement(name)
    const box = new THREE.Box3()
    for (const part of model.parts) {
      part.geometry.applyMatrix4(place)
      part.geometry.computeBoundingBox()
      box.union(part.geometry.boundingBox!)
      edges.push(new THREE.EdgesGeometry(part.geometry, edgeAngle))
      byMaterial.set(part.material, [...(byMaterial.get(part.material) ?? []), part.geometry])
    }
    for (const set of model.instances) {
      const matrices = set.matrices.map((m) => m.clone().premultiply(place))
      set.geometry.computeBoundingBox()
      for (const m of matrices) box.union(set.geometry.boundingBox!.clone().applyMatrix4(m))
      instanced.push({ ...set, matrices })
    }
    if (model.shadow > 0) {
      const { at, scale } = placements[name]
      const size = model.shadow * scale * 2
      shadows.push(new THREE.Matrix4().compose(new THREE.Vector3(at[0], shadowLift, at[1]), flat, new THREE.Vector3(size, size, 1)))
    }
    boxes.push({ name, box })
  }
  return {
    merged: [...byMaterial].map(([material, list]) => ({ material, geometry: merge(list) })),
    instanced,
    edges: merge(edges),
    shadows,
    boxes,
  }
}

export function disposeBuiltProps(built: BuiltProps) {
  for (const { geometry } of built.merged) geometry.dispose()
  for (const set of built.instanced) set.geometry.dispose()
  built.edges.dispose()
}

export interface PropCalls {
  meshes: number
  instanced: number
  lines: number
  materials: number
}

// What the props cost per frame (spec §8): one mesh per material, one instanced mesh per set and one
// for the contact shadows, and one set of ink lines. Materials: the merged ones, the instanced
// items', the shadows', and the ink's.
export function propDrawCalls(built: BuiltProps): PropCalls {
  const decals = built.shadows.length > 0 ? 1 : 0
  const materials = new Set<string>([...built.merged.map((m) => m.material), ...built.instanced.map((s) => s.material)])
  return {
    meshes: built.merged.length,
    instanced: built.instanced.length + decals,
    lines: 1,
    materials: materials.size + decals + 1,
  }
}

export const totalCalls = (calls: PropCalls) => calls.meshes + calls.instanced + calls.lines
