import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { tierCount, tierSettings, type DeviceTier } from '../logic/deviceTier'
import { tuning, type MoodId, type ThemeName } from '../tuning'
import { Attic } from './Attic'
import { backdropView } from './backdropView'
import { createDustMaterial, Dust } from './Dust'
import { Fireflies } from './Fireflies'
import { MoodLights } from './MoodLights'
import { MoodProps } from './MoodProps'
import { paint, paletteFor } from './palette'
import { glowTexture } from './paperTextures'
import { Props } from './Props'
import { WindowSky } from './WindowSky'

export interface BackdropProps {
  mood: MoodId
  theme: ThemeName
  tier: DeviceTier
  // The flat room's horizontal position, 0 to 1, read every frame.
  panRef: { readonly current: number }
  // The tab is hidden or a full-screen dialog covers the room: nothing draws (spec §8 Pausing).
  paused: boolean
  // The first frame is drawn: the attic may fade in.
  onReady: () => void
  onFail: (error: unknown) => void
}

// Scratch values, reused every frame. There is one live attic at a time.
const target = new THREE.Vector3()
const targetLook = new THREE.Vector3()
const look = new THREE.Vector3()
const view = backdropView(1, 0.5)

// Spec §7 Level 2 camera: it eases toward its place for the screen's shape and the flat room's pan.
// A resize or a turned phone re-frames it through the new shape.
function BackdropRig({ panRef, onReady }: { panRef: { readonly current: number }; onReady: () => void }) {
  const started = useRef(false)
  useFrame((state, delta) => {
    const camera = state.camera
    backdropView(state.size.width / Math.max(1, state.size.height), panRef.current, view)
    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== view.fov) {
      camera.fov = view.fov
      camera.updateProjectionMatrix()
    }
    target.fromArray(view.position)
    targetLook.fromArray(view.look)
    const k = started.current ? 1 - Math.exp(-tuning.world.backdrop.damping * Math.min(delta, 0.1)) : 1
    camera.position.lerp(target, k)
    look.lerp(targetLook, k)
    camera.lookAt(look)
    if (!started.current) {
      started.current = true
      onReady()
    }
  })
  return null
}

function disposeDust(material: THREE.PointsMaterial) {
  material.map?.dispose()
  material.dispose()
}

function BackdropScene({ mood, theme, tier, panRef, onReady }: Omit<BackdropProps, 'paused' | 'onFail'>) {
  const palette = paletteFor(mood, theme)
  const size = useThree((state) => state.size)
  const [dust] = useState(() => createDustMaterial(glowTexture()))
  useEffect(() => () => disposeDust(dust), [dust])
  useLayoutEffect(() => paint(dust, palette.dust), [dust, palette])
  const { fog, phoneMaxPx } = tuning.world
  const dustCount = tierCount(size.width < phoneMaxPx ? tuning.world.dust.phone : tuning.world.dust.desktop, tier)
  return (
    <>
      <fog attach="fog" args={[palette.fog, fog.near, fog.far]} />
      <BackdropRig panRef={panRef} onReady={onReady} />
      <MoodLights palette={palette} />
      <Attic palette={palette} />
      <WindowSky palette={palette} tier={tier} />
      <Props palette={palette} />
      <MoodProps key={mood} mood={mood} palette={palette} tier={tier} />
      {palette.motes === 'fireflies' ? <Fireflies palette={palette} tier={tier} /> : <Dust count={dustCount} material={dust} />}
    </>
  )
}

// Spec §7 Level 2: the live 3D attic behind the flat room's cards: the mood, the props, and the sky,
// with no book. It renders at backdropMaxDpr, draws at the display rate while it runs, and stops
// while paused. If its renderer cannot start, the room keeps the paper diorama.
export function Backdrop({ mood, theme, tier, panRef, paused, onReady, onFail }: BackdropProps) {
  const [createRenderer] = useState(() => (defaults: THREE.WebGLRendererParameters) => {
    try {
      return new THREE.WebGLRenderer({ ...defaults, powerPreference: 'low-power' })
    } catch (error) {
      onFail(error)
      throw error
    }
  })
  const { backdrop } = tuning.world
  return (
    <Canvas
      className="backdrop-canvas"
      dpr={[1, tierSettings(tier).backdropMaxDpr]}
      frameloop={paused ? 'never' : 'always'}
      gl={createRenderer}
      flat
      camera={{ fov: backdrop.fovPortrait, near: backdrop.near, far: backdrop.far }}
    >
      <BackdropScene mood={mood} theme={theme} tier={tier} panRef={panRef} onReady={onReady} />
    </Canvas>
  )
}
