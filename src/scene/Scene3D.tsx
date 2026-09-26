import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'

// §4 The 3D era: a simple Three.js space behind the cards. A stroller with a small pink bow, a crown,
// a pink spotlight, floating hearts and stars, and one guitar pick. No invitation copy is imported here.

const gold = tokens.gold
const starYellow = tokens.starYellow

function heartShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, -0.5)
  s.bezierCurveTo(-0.1, -0.35, -0.6, -0.1, -0.6, 0.2)
  s.bezierCurveTo(-0.6, 0.5, -0.2, 0.6, 0, 0.35)
  s.bezierCurveTo(0.2, 0.6, 0.6, 0.5, 0.6, 0.2)
  s.bezierCurveTo(0.6, -0.1, 0.1, -0.35, 0, -0.5)
  return s
}

function starShape(): THREE.Shape {
  const s = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i + Math.PI / 2
    const r = i % 2 === 0 ? 0.5 : 0.22
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

function pickShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, -0.55)
  s.bezierCurveTo(-0.3, -0.25, -0.5, 0.1, -0.45, 0.3)
  s.bezierCurveTo(-0.4, 0.55, 0.4, 0.55, 0.45, 0.3)
  s.bezierCurveTo(0.5, 0.1, 0.3, -0.25, 0, -0.55)
  return s
}

const extrude = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }

type Spot = readonly [number, number, number]

// Spots are fractions of the visible frame, so a phone and a desktop both see them at the edges.
function Floaters({ geometry, color, spots, scale, frame }: {
  geometry: THREE.BufferGeometry
  color: string
  spots: readonly Spot[]
  scale: number
  frame: { w: number; h: number }
}) {
  const group = useRef<THREE.Group>(null)
  const placed = spots.map(([fx, fy, z]) => [fx * frame.w, fy * frame.h, z] as const)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current?.children.forEach((child, i) => {
      const [, y] = placed[i]!
      child.position.y = y + Math.sin(t * 0.9 + i) * 0.12
      child.rotation.y = Math.sin(t * 0.6 + i) * 0.6
    })
  })
  return (
    <group ref={group}>
      {placed.map((p, i) => (
        <mesh key={i} geometry={geometry} position={p} scale={scale}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Stroller({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} rotation={[0, 0.5, 0]} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={tokens.shadow} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.05, 0.3, 0]} rotation={[0, 0, Math.PI / 5]}>
        <sphereGeometry args={[0.92, 32, 16, 0, Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color={tokens.hotPink} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, -0.75, 0.55]}>
          <torusGeometry args={[0.28, 0.07, 12, 32]} />
          <meshStandardMaterial color={tokens.blush} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-1.05, 0.75, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
        <meshStandardMaterial color={tokens.blush} />
      </mesh>
      <group position={[0.2, 0.15, 0.92]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.14, 0, 0]}>
          <coneGeometry args={[0.13, 0.26, 3]} />
          <meshStandardMaterial color={tokens.hotPink} emissive={tokens.hotPink} emissiveIntensity={0.3} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.14, 0, 0]}>
          <coneGeometry args={[0.13, 0.26, 3]} />
          <meshStandardMaterial color={tokens.hotPink} emissive={tokens.hotPink} emissiveIntensity={0.3} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={tokens.deepPink} />
        </mesh>
      </group>
    </group>
  )
}

function Crown({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.32, 32, 1, true]} />
        <meshStandardMaterial color={gold} metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 6
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, 0.3, Math.sin(a) * 0.55]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color={gold} metalness={0.6} roughness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

function Pick({ geometry, position, scale }: { geometry: THREE.BufferGeometry; position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.8
    ref.current.position.y = position[1] + Math.sin(t) * 0.12
  })
  return (
    <mesh ref={ref} geometry={geometry} position={position} scale={scale}>
      <meshStandardMaterial color={tokens.deepPink} emissive={tokens.deepPink} emissiveIntensity={0.4} roughness={0.35} />
    </mesh>
  )
}

function Contents({ position }: { position: number }) {
  const heart = useMemo(() => new THREE.ExtrudeGeometry(heartShape(), extrude), [])
  const star = useMemo(() => new THREE.ExtrudeGeometry(starShape(), extrude), [])
  const pick = useMemo(() => new THREE.ExtrudeGeometry(pickShape(), extrude), [])
  const target = useMemo(() => new THREE.Object3D(), [])
  const viewport = useThree((state) => state.viewport)
  const frame = { w: viewport.width, h: viewport.height }
  // Objects shrink on narrow screens so they stay at the edges, behind the cards.
  const k = Math.min(0.6, viewport.width / 10)
  const stroller: [number, number, number] = [-frame.w * 0.3, -frame.h * 0.32, 0]
  const crown: [number, number, number] = [frame.w * 0.3, frame.h * 0.3, -1]
  const pickAt: [number, number, number] = [frame.w * 0.28, -frame.h * 0.3, 0.4]

  return (
    <group position={[-(position - 0.83) * frame.w * tuning.depth.far, 0, 0]}>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 2, 4]} intensity={18} color={tokens.blush} />
      <primitive object={target} position={stroller} />
      <spotLight
        position={[stroller[0] + 0.5, 5, 3]}
        angle={0.45}
        penumbra={0.6}
        intensity={120}
        color={tokens.hotPink}
        target={target}
      />
      <Stroller position={stroller} scale={k} />
      <Crown position={crown} scale={k} />
      <Pick geometry={pick} position={pickAt} scale={0.7 * k} />
      <Floaters
        geometry={heart}
        color={tokens.hotPink}
        scale={0.34 * k}
        frame={frame}
        spots={[
          [-0.42, 0.36, -1.5],
          [0.44, -0.08, -1],
          [0.12, 0.44, -2],
          [-0.1, -0.42, -0.5],
          [0.36, 0.46, -2.5],
        ]}
      />
      <Floaters
        geometry={star}
        color={starYellow}
        scale={0.3 * k}
        frame={frame}
        spots={[
          [-0.34, 0.46, -2],
          [0.2, 0.2, -1.2],
          [0.46, 0.2, -2.2],
          [-0.46, -0.12, -1.4],
          [0.02, 0.48, -3],
          [0.3, -0.36, -0.8],
        ]}
      />
    </group>
  )
}

export default function Scene3D({ active, position }: { active: boolean; position: number }) {
  return (
    <Canvas
      className="scene-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <Contents position={position} />
    </Canvas>
  )
}
