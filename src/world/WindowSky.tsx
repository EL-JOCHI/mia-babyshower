import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { tierCount, tierSettings, type DeviceTier } from '../logic/deviceTier'
import { tuning } from '../tuning'
import { paint, type WorldPalette } from './palette'
import { glowTexture } from './paperTextures'
import { starField, twinkle, writeSkyColors } from './sky'

// Spec §3: what the round window shows, per look: the sky as a gradient, the moon or the sun with its
// halo, and on Saturday twinkling stars. It all sits behind the gable wall and shows through the
// window's hole. Nothing here casts or takes light.

function createSky() {
  const plane = new THREE.PlaneGeometry(1, 1, 1, 8)
  plane.setAttribute('color', new THREE.BufferAttribute(new Float32Array(plane.attributes.position!.count * 3), 3))
  const glow = glowTexture()
  return {
    plane,
    disc: new THREE.CircleGeometry(1, 40),
    haloPlane: new THREE.PlaneGeometry(2, 2),
    star: new THREE.PlaneGeometry(1, 1),
    glow,
    sky: new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }),
    orb: new THREE.MeshBasicMaterial({ fog: false }),
    halo: new THREE.MeshBasicMaterial({ map: glow, transparent: true, depthWrite: false, fog: false }),
    starMaterial: new THREE.MeshBasicMaterial({
      map: glow,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  }
}

type SkyParts = ReturnType<typeof createSky>

function applySky(parts: SkyParts, palette: WorldPalette) {
  writeSkyColors(
    parts.plane.attributes.color as THREE.BufferAttribute,
    parts.plane.attributes.position as THREE.BufferAttribute,
    palette.skyTop,
    palette.skyBottom,
  )
  paint(parts.orb, palette.orb)
  paint(parts.halo, palette.halo)
  parts.halo.opacity = tuning.world.attic.orb.haloOpacity
  paint(parts.starMaterial, palette.sparkle)
  parts.starMaterial.opacity = palette.stars
}

function disposeSky(parts: SkyParts) {
  for (const geometry of [parts.plane, parts.disc, parts.haloPlane, parts.star]) geometry.dispose()
  for (const material of [parts.sky, parts.orb, parts.halo, parts.starMaterial]) material.dispose()
  parts.glow.dispose()
}

// One scratch object, reused every frame.
const star = new THREE.Object3D()

function Stars({ parts, tier }: { parts: SkyParts; tier: DeviceTier }) {
  const count = tierCount(tuning.world.stars.count, tier)
  const field = useMemo(() => starField(count, tuning.world.attic.windowRadius), [count])
  const mesh = useRef<THREE.InstancedMesh>(null)
  const clock = useRef(0)
  const motion = tierSettings(tier).motionScale

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    clock.current += Math.min(delta, 0.1) * motion
    const t = clock.current
    for (let i = 0; i < field.count; i++) {
      star.position.set(field.x[i]!, field.y[i]!, 0)
      star.scale.setScalar(field.size[i]! * twinkle(t, field.phase[i]!))
      star.updateMatrix()
      m.setMatrixAt(i, star.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[parts.star, parts.starMaterial, count]} frustumCulled={false} />
}

export function WindowSky({ palette, tier }: { palette: WorldPalette; tier: DeviceTier }) {
  const [parts] = useState(createSky)
  useEffect(() => () => disposeSky(parts), [parts])
  // Switching theme repaints the sky in place.
  useLayoutEffect(() => applySky(parts, palette), [parts, palette])
  const { wallZ, windowY, windowRadius, skyScale, orb } = tuning.world.attic
  const radius = orb.radius * palette.orbSize
  const halo = radius * (palette.orbKind === 'sun' ? orb.sunHalo : orb.halo)
  const [x, y] = palette.orbAt

  return (
    <group position={[0, windowY, wallZ]}>
      <mesh geometry={parts.plane} material={parts.sky} position-z={-0.8} scale={windowRadius * skyScale * 2} />
      {palette.stars > 0 && (
        <group position-z={-0.78}>
          <Stars parts={parts} tier={tier} />
        </group>
      )}
      <mesh geometry={parts.haloPlane} material={parts.halo} position={[x, y, -0.7]} scale={halo} />
      <mesh geometry={parts.disc} material={parts.orb} position={[x, y, -0.6]} scale={radius} />
    </group>
  )
}
