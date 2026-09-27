import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import type { WorldPalette } from './palette'
import { glowTexture } from './paperTextures'
import { buildProps, disposeBuiltProps } from './props/build'
import type { PropMaterialKey } from './props/types'

// Spec §5: the lived-in attic, shared by both moods: flat-shaded shapes with ink edges. Spec §8: one
// mesh per material, the repeated items instanced, shared Lambert or unlit materials, and no real
// shadows: soft painted decals lie under the crib, the chair, and the trunks.

function createMaterials() {
  // The palette's materials get their color from applyPalette (three.js warns on `color: undefined`).
  const lit = (color?: string) => {
    const material = new THREE.MeshLambertMaterial({ flatShading: true, side: THREE.DoubleSide })
    if (color) material.color.set(color)
    return material
  }
  const shadowMap = glowTexture()
  const byKey: Record<PropMaterialKey, THREE.MeshLambertMaterial | THREE.MeshBasicMaterial> = {
    wood: lit(),
    woodDark: lit(),
    cloth: lit(),
    paper: lit(tokens.bone),
    // White: each book and yarn ball brings its own color.
    tinted: new THREE.MeshLambertMaterial({ flatShading: true }),
    // The crooked lamp glows by its own color only (spec §5).
    lamp: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
  }
  return {
    byKey,
    ink: new THREE.LineBasicMaterial({ color: tokens.ink, transparent: true, opacity: tuning.world.props.inkOpacity }),
    shadow: new THREE.MeshBasicMaterial({
      map: shadowMap,
      color: tokens.shadow,
      transparent: true,
      opacity: tuning.world.props.shadowOpacity,
      depthWrite: false,
    }),
    shadowMap,
    decal: new THREE.PlaneGeometry(1, 1),
  }
}

type PropMaterials = ReturnType<typeof createMaterials>

const candle = new THREE.Color(tokens.candle)

// The look's colors: furniture wood from the floor toward the beams, the lamp from its cloth toward
// candlelight as the look lights it (dark looks: unlit).
function applyPalette(m: PropMaterials, palette: WorldPalette) {
  m.byKey.wood.color.copy(palette.floor).lerp(palette.beam, tuning.world.props.woodMix)
  m.byKey.woodDark.color.copy(palette.beam)
  m.byKey.cloth.color.copy(palette.cloth)
  m.byKey.lamp.color.copy(palette.cloth).lerp(candle, palette.lampGlow)
}

function disposeMaterials(m: PropMaterials) {
  for (const material of Object.values(m.byKey)) material.dispose()
  m.ink.dispose()
  m.shadow.dispose()
  m.shadowMap.dispose()
  m.decal.dispose()
}

function Instances({
  geometry,
  material,
  matrices,
  colors,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  matrices: readonly THREE.Matrix4[]
  colors: readonly THREE.Color[] | null
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    matrices.forEach((matrix, i) => m.setMatrixAt(i, matrix))
    colors?.forEach((color, i) => m.setColorAt(i, color))
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [matrices, colors])
  return <instancedMesh ref={mesh} args={[geometry, material, matrices.length]} />
}

export function Props({ palette }: { palette: WorldPalette }) {
  const [built] = useState(buildProps)
  const [materials] = useState(createMaterials)
  useEffect(() => () => disposeBuiltProps(built), [built])
  useEffect(() => () => disposeMaterials(materials), [materials])
  // Switching theme retints the props in place.
  useLayoutEffect(() => applyPalette(materials, palette), [materials, palette])

  return (
    <group>
      {built.merged.map(({ material, geometry }) => (
        <mesh key={material} geometry={geometry} material={materials.byKey[material]} />
      ))}
      <lineSegments geometry={built.edges} material={materials.ink} />
      {built.instanced.map((set) => (
        <Instances
          key={set.name}
          geometry={set.geometry}
          material={materials.byKey[set.material]}
          matrices={set.matrices}
          colors={set.colors}
        />
      ))}
      {built.shadows.length > 0 && (
        <Instances geometry={materials.decal} material={materials.shadow} matrices={built.shadows} colors={null} />
      )}
    </group>
  )
}
