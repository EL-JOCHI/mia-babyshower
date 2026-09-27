import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { tierCount, tierSettings, type DeviceTier } from '../logic/deviceTier'
import { tuning } from '../tuning'
import { paint, type WorldPalette } from './palette'
import { glowTexture } from './paperTextures'
import { fireflyAt, fireflyField, fireflyGlow } from './props/fireflies'

function createFireflies() {
  const glow = glowTexture()
  return {
    glow,
    plane: new THREE.PlaneGeometry(1, 1),
    material: new THREE.MeshBasicMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  }
}

type FireflyParts = ReturnType<typeof createFireflies>

function applyPalette(parts: FireflyParts, palette: WorldPalette) {
  paint(parts.material, palette.sparkle)
}

function disposeFireflies(parts: FireflyParts) {
  parts.glow.dispose()
  parts.plane.dispose()
  parts.material.dispose()
}

// One scratch object, reused every frame.
const fly = new THREE.Object3D()

// Spec §3: at Sunday's dusk, fireflies drift through the air behind the book and blink, glowing by
// their own color only. They replace the dust (the Motion rule). About half on a low device.
export function Fireflies({ palette, tier }: { palette: WorldPalette; tier: DeviceTier }) {
  const count = tierCount(tuning.world.mood.fireflies.count, tier)
  const field = useMemo(() => fireflyField(count), [count])
  const [parts] = useState(createFireflies)
  useEffect(() => () => disposeFireflies(parts), [parts])
  useLayoutEffect(() => applyPalette(parts, palette), [parts, palette])
  const mesh = useRef<THREE.InstancedMesh>(null)
  const clock = useRef(0)
  const motion = tierSettings(tier).motionScale

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    clock.current += Math.min(delta, 0.1) * motion
    const t = clock.current
    const { size } = tuning.world.mood.fireflies
    for (let i = 0; i < field.count; i++) {
      fireflyAt(field, i, t, fly.position)
      fly.scale.setScalar(size * (0.25 + 0.75 * fireflyGlow(t, field.phase[i]!)))
      fly.updateMatrix()
      m.setMatrixAt(i, fly.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[parts.plane, parts.material, count]} frustumCulled={false} />
}
