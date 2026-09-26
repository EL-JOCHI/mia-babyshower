import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import { floorTexture } from './paperTextures'

// Design §1: a cat's attic at night. Floorboards, a gable wall with a round window and the moon
// behind it, and a slanted roof with rafters. Static: nothing here moves or changes per frame.

function createAttic() {
  const { wallZ, frontZ, halfWidth, ridge, eave, windowY, windowRadius } = tuning.world.attic
  const depth = frontZ - wallZ
  const { tints } = tuning.world
  const wood = new THREE.Color(tokens.ink).lerp(new THREE.Color(tokens.plum), tints.wood)

  const floorMap = floorTexture()
  floorMap.repeat.set(halfWidth / 3, depth / 3)
  const floor = new THREE.MeshStandardMaterial({ map: floorMap, color: tokens.plum, roughness: 0.95 })
  const wall = new THREE.MeshStandardMaterial({ color: wood, roughness: 1, side: THREE.DoubleSide })
  const beam = new THREE.MeshStandardMaterial({ color: tokens.ink, roughness: 1 })
  const sky = new THREE.MeshBasicMaterial({
    color: new THREE.Color(tokens.ink).lerp(new THREE.Color(tuning.world.light.moonColor), tints.sky),
    fog: false,
  })
  const moon = new THREE.MeshBasicMaterial({ color: tokens.bone, fog: false })
  const halo = new THREE.MeshBasicMaterial({
    color: tuning.world.light.moonColor,
    transparent: true,
    opacity: tuning.world.attic.moon.haloOpacity,
    depthWrite: false,
    fog: false,
  })

  const gable = new THREE.Shape()
  gable.moveTo(-halfWidth, 0)
  gable.lineTo(halfWidth, 0)
  gable.lineTo(halfWidth, eave)
  gable.lineTo(0, ridge)
  gable.lineTo(-halfWidth, eave)
  gable.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, windowY, windowRadius, 0, Math.PI * 2, false)
  gable.holes.push(hole)

  const slope = Math.hypot(halfWidth, ridge - eave)
  return {
    materials: [floor, wall, beam, sky, moon, halo],
    textures: [floorMap],
    floor,
    wall,
    beam,
    sky,
    moon,
    halo,
    floorGeometry: new THREE.PlaneGeometry(halfWidth * 2, depth),
    gableGeometry: new THREE.ShapeGeometry(gable, 32),
    frameGeometry: new THREE.TorusGeometry(windowRadius, 0.14, 8, 48),
    barGeometry: new THREE.BoxGeometry(windowRadius * 2, 0.1, 0.12),
    discGeometry: new THREE.CircleGeometry(1, 40),
    roofGeometry: new THREE.PlaneGeometry(slope, depth),
    rafterGeometry: new THREE.BoxGeometry(slope, 0.28, 0.32),
    ridgeGeometry: new THREE.BoxGeometry(0.4, 0.4, depth),
    slope,
    pitch: Math.atan2(ridge - eave, halfWidth),
  }
}

type AtticParts = ReturnType<typeof createAttic>

function disposeAttic(parts: AtticParts) {
  for (const texture of parts.textures) texture.dispose()
  for (const material of parts.materials) material.dispose()
  for (const geometry of [
    parts.floorGeometry,
    parts.gableGeometry,
    parts.frameGeometry,
    parts.barGeometry,
    parts.discGeometry,
    parts.roofGeometry,
    parts.rafterGeometry,
    parts.ridgeGeometry,
  ])
    geometry.dispose()
}

export function Attic() {
  const [parts] = useState(createAttic)
  useEffect(() => () => disposeAttic(parts), [parts])
  const { wallZ, frontZ, halfWidth, ridge, eave, windowY, windowRadius, rafterGap, moon } = tuning.world.attic
  const midZ = (wallZ + frontZ) / 2
  const rafterZs: number[] = []
  for (let z = wallZ + rafterGap / 2; z < frontZ; z += rafterGap) rafterZs.push(z)

  return (
    <group>
      <mesh geometry={parts.floorGeometry} material={parts.floor} rotation-x={-Math.PI / 2} position-z={midZ} receiveShadow />

      <mesh geometry={parts.gableGeometry} material={parts.wall} position-z={wallZ} />
      <group position={[0, windowY, wallZ + 0.05]}>
        <mesh geometry={parts.frameGeometry} material={parts.beam} />
        <mesh geometry={parts.barGeometry} material={parts.beam} />
        <mesh geometry={parts.barGeometry} material={parts.beam} rotation-z={Math.PI / 2} />
      </group>
      <mesh geometry={parts.discGeometry} material={parts.sky} position={[0, windowY, wallZ - 0.8]} scale={windowRadius * 1.3} />
      <mesh geometry={parts.discGeometry} material={parts.halo} position={[moon.x, windowY + moon.y, wallZ - 0.7]} scale={moon.halo} />
      <mesh geometry={parts.discGeometry} material={parts.moon} position={[moon.x, windowY + moon.y, wallZ - 0.6]} scale={moon.radius} />

      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[(side * halfWidth) / 2, (ridge + eave) / 2, midZ]}
          rotation-z={-side * parts.pitch}
        >
          <mesh geometry={parts.roofGeometry} material={parts.wall} rotation-x={Math.PI / 2} />
          {rafterZs.map((z) => (
            <mesh key={z} geometry={parts.rafterGeometry} material={parts.beam} position={[0, -0.16, z - midZ]} />
          ))}
        </group>
      ))}
      <mesh geometry={parts.ridgeGeometry} material={parts.beam} position={[0, ridge - 0.2, midZ]} />
    </group>
  )
}
