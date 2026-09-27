import { useEffect, useLayoutEffect, useState } from 'react'
import * as THREE from 'three'
import { tuning } from '../tuning'
import { paint, type WorldPalette } from './palette'
import { floorTexture } from './paperTextures'

// Design §1: a cat's attic. Floorboards, a gable wall with a round window, and a slanted roof with
// rafters. By night the moon is in the window; by day the sun (design §3). Nothing here moves.

function createAttic() {
  const { wallZ, frontZ, halfWidth, ridge, eave, windowY, windowRadius, roughness } = tuning.world.attic
  const depth = frontZ - wallZ

  // Colors come from the theme's palette once mounted (see applyPalette).
  const floorMap = floorTexture()
  floorMap.repeat.set(halfWidth / 3, depth / 3)
  const floor = new THREE.MeshStandardMaterial({ map: floorMap, roughness: roughness.floor })
  const wall = new THREE.MeshStandardMaterial({ roughness: roughness.wall, side: THREE.DoubleSide })
  const beam = new THREE.MeshStandardMaterial({ roughness: roughness.beam })
  const sky = new THREE.MeshBasicMaterial({ fog: false })
  const moon = new THREE.MeshBasicMaterial({ fog: false })
  const halo = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: tuning.world.attic.orb.haloOpacity,
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
    kneeGeometry: new THREE.PlaneGeometry(depth, eave),
    rafterGeometry: new THREE.BoxGeometry(slope, 0.28, 0.32),
    ridgeGeometry: new THREE.BoxGeometry(0.4, 0.4, depth),
    slope,
    pitch: Math.atan2(ridge - eave, halfWidth),
  }
}

type AtticParts = ReturnType<typeof createAttic>

function applyPalette(parts: AtticParts, palette: WorldPalette) {
  paint(parts.floor, palette.floor)
  paint(parts.wall, palette.wood)
  paint(parts.beam, palette.beam)
  paint(parts.sky, palette.skyBottom)
  paint(parts.moon, palette.orb)
  paint(parts.halo, palette.halo)
}

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
    parts.kneeGeometry,
    parts.rafterGeometry,
    parts.ridgeGeometry,
  ])
    geometry.dispose()
}

export function Attic({ palette }: { palette: WorldPalette }) {
  const [parts] = useState(createAttic)
  useEffect(() => () => disposeAttic(parts), [parts])
  // Switching theme retints the attic in place.
  useLayoutEffect(() => applyPalette(parts, palette), [parts, palette])
  const { wallZ, frontZ, halfWidth, ridge, eave, windowY, windowRadius, rafterGap, orb, skyScale } = tuning.world.attic
  const orbRadius = orb.radius * palette.orbSize
  const [orbX, orbY] = palette.orbAt
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
      <mesh geometry={parts.discGeometry} material={parts.sky} position={[0, windowY, wallZ - 0.8]} scale={windowRadius * skyScale} />
      <mesh geometry={parts.discGeometry} material={parts.halo} position={[orbX, windowY + orbY, wallZ - 0.7]} scale={orbRadius * orb.halo} />
      <mesh geometry={parts.discGeometry} material={parts.moon} position={[orbX, windowY + orbY, wallZ - 0.6]} scale={orbRadius} />

      {/* Short knee walls close the gap under the eaves. */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={parts.kneeGeometry}
          material={parts.wall}
          position={[side * halfWidth, eave / 2, midZ]}
          rotation-y={Math.PI / 2}
        />
      ))}
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
