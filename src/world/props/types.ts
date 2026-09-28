import type * as THREE from 'three'

// The materials the attic's props share (spec §8: shared, Lambert or unlit). The props are merged
// into one geometry per material, so each key is one draw call. Dad's guitar brings three of its own
// (this work's spec §6): its gold top and hardware, its rosewood, and its black pickups.
export type PropMaterialKey = 'wood' | 'woodDark' | 'cloth' | 'paper' | 'lamp' | 'tinted' | 'gold' | 'rosewood' | 'pickup'

export interface PropPart {
  material: PropMaterialKey
  geometry: THREE.BufferGeometry
}

// A repeated item drawn as one instanced mesh: each copy with its matrix and palette color.
export interface PropInstances {
  name: 'books' | 'yarn'
  material: 'tinted'
  geometry: THREE.BufferGeometry
  matrices: THREE.Matrix4[]
  colors: THREE.Color[]
}

// One prop, in its own space with its feet on y = 0.
export interface PropModel {
  parts: PropPart[]
  instances: PropInstances[]
  // The radius of the painted contact shadow under it (spec §8), or 0 for none.
  shadow: number
}
