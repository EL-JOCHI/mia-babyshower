import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { tuning } from '../tuning'

// Drifting dust in the attic air. The spots come from a fixed seed, so every load looks the same.
function dustGeometry(count: number): THREE.BufferGeometry {
  const { width, bottom, height, back, depth } = tuning.world.dust.box
  let seed = 11
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (next() - 0.5) * width
    positions[i * 3 + 1] = bottom + next() * height
    positions[i * 3 + 2] = back + next() * depth
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

export function Dust({ count, material }: { count: number; material: THREE.PointsMaterial }) {
  const geometry = useMemo(() => dustGeometry(count), [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  const points = useRef<THREE.Points>(null)

  useFrame((state) => {
    const p = points.current
    if (!p) return
    const { drift, driftSpeed, sway, swaySpeed } = tuning.world.dust
    const t = state.clock.elapsedTime
    p.position.y = Math.sin(t * driftSpeed) * drift
    p.rotation.y = Math.sin(t * swaySpeed) * sway
  })

  return <points ref={points} geometry={geometry} material={material} />
}
