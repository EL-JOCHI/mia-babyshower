import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { tierSettings, type DeviceTier } from '../logic/deviceTier'
import { tokens, tuning, type MoodId } from '../tuning'
import { paint, type WorldPalette } from './palette'
import {
  buildMoodProps,
  disposeMoodBuild,
  lanternSway,
  type Hanging,
  type SaturdayBuild,
  type SundayBuild,
} from './props/moodProps'

// Spec §3: the mood's signature props. Spec §8: their motion runs in useFrame through refs and
// instance matrices, scaled by frame delta (and slower on a low device), with no allocations.

function createMaterials() {
  return {
    frame: new THREE.MeshLambertMaterial({ flatShading: true }),
    charm: new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }),
    // White: each garland star brings its own color.
    garland: new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }),
    // White times the lanterns' glow: each lantern brings its own color, and glows by it only.
    lantern: new THREE.MeshBasicMaterial(),
    shaft: new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    }),
    string: new THREE.LineBasicMaterial({ color: tokens.ink }),
  }
}

type MoodMaterials = ReturnType<typeof createMaterials>

function applyPalette(m: MoodMaterials, palette: WorldPalette) {
  paint(m.frame, palette.beam)
  paint(m.charm, palette.orb)
  const { dim } = tuning.world.mood.lanterns
  m.lantern.color.setScalar(dim + (1 - dim) * palette.lanternGlow)
  paint(m.shaft, palette.shaft)
  m.shaft.opacity = palette.shaftOpacity
}

function disposeMaterials(m: MoodMaterials) {
  for (const material of Object.values(m)) material.dispose()
}

// One scratch object, reused every frame.
const dummy = new THREE.Object3D()

// Things that hang still: placed once.
function StillHangings({ geometry, material, items }: { geometry: THREE.BufferGeometry; material: THREE.Material; items: readonly Hanging[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    items.forEach((item, i) => {
      dummy.position.copy(item.position)
      dummy.rotation.set(0, 0, item.turn)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, item.color)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={mesh} args={[geometry, material, items.length]} />
}

function SaturdayProps({ build, materials, tier }: { build: SaturdayBuild; materials: MoodMaterials; tier: DeviceTier }) {
  const mobile = useRef<THREE.Group>(null)
  const motion = tierSettings(tier).motionScale
  // The mobile turns slowly over the crib: Saturday's one prop motion.
  useFrame((_, delta) => {
    const group = mobile.current
    if (group) group.rotation.y += Math.min(delta, 0.1) * tuning.world.mood.mobile.speed * motion
  })
  return (
    <>
      <group ref={mobile} position={[...tuning.world.mood.mobile.at]}>
        <mesh geometry={build.mobileFrame} material={materials.frame} />
        <mesh geometry={build.mobileCharms} material={materials.charm} />
      </group>
      <StillHangings geometry={build.garlandStar} material={materials.garland} items={build.garland} />
      <lineSegments geometry={build.garlandString} material={materials.string} />
      <mesh geometry={build.shaft} material={materials.shaft} />
    </>
  )
}

function SundayProps({ build, materials, tier }: { build: SundayBuild; materials: MoodMaterials; tier: DeviceTier }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const clock = useRef(0)
  const motion = tierSettings(tier).motionScale
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    build.lanterns.forEach((item, i) => m.setColorAt(i, item.color))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [build])
  // The lanterns sway gently, each swinging from where it hangs on the string: Sunday's one prop motion.
  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    clock.current += Math.min(delta, 0.1) * motion
    const { drop } = tuning.world.mood.lanterns
    for (let i = 0; i < build.lanterns.length; i++) {
      const { position } = build.lanterns[i]!
      const angle = lanternSway(clock.current, i)
      dummy.position.set(position.x + Math.sin(angle) * drop, position.y + drop - Math.cos(angle) * drop, position.z)
      dummy.rotation.set(0, 0, -angle)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={mesh} args={[build.lantern, materials.lantern, build.lanterns.length]} frustumCulled={false} />
      <lineSegments geometry={build.lanternString} material={materials.string} />
      <mesh geometry={build.shaft} material={materials.shaft} />
    </>
  )
}

// The mood is fixed for a visit (it comes from the link): World keys this by mood.
export function MoodProps({ mood, palette, tier }: { mood: MoodId; palette: WorldPalette; tier: DeviceTier }) {
  const [build] = useState(() => buildMoodProps(mood))
  const [materials] = useState(createMaterials)
  useEffect(() => () => disposeMoodBuild(build), [build])
  useEffect(() => () => disposeMaterials(materials), [materials])
  // Switching theme retints the props in place.
  useLayoutEffect(() => applyPalette(materials, palette), [materials, palette])
  return build.kind === 'saturday' ? (
    <SaturdayProps build={build} materials={materials} tier={tier} />
  ) : (
    <SundayProps build={build} materials={materials} tier={tier} />
  )
}
