import { Canvas, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { LandmarkId } from '../logic/layout'
import { tuning, type ThemeName } from '../tuning'
import { Attic } from './Attic'
import { Book } from './Book'
import { buildPath } from './bookPath'
import { CameraRig } from './CameraRig'
import { Dust } from './Dust'
import { palettes } from './palette'
import { useWorldResources } from './resources'
import { StageLighting } from './StageLighting'
import { Station } from './Station'

export interface WorldProps {
  ids: readonly LandmarkId[]
  stations: Record<LandmarkId, number>
  progressRef: { readonly current: number }
  content: Record<LandmarkId, ReactNode>
  // The same book by night (Oscuro) or by day (Claro). Switching retints the scene in place.
  theme: ThemeName
  // False until the cover has swung open: the camera waits on a wide view of the book and the pages
  // lie flat, so the guest sees the whole book before the camera swoops down to the first page.
  awake: boolean
  onReady: () => void
  onFail: (error: unknown) => void
}

type SceneProps = Omit<WorldProps, 'onFail'>

function Scene({ ids, stations, progressRef, content, theme, awake, onReady }: SceneProps) {
  const palette = palettes[theme]
  const size = useThree((state) => state.size)
  const resources = useWorldResources()
  const aspect = size.width / Math.max(1, size.height)
  const path = useMemo(() => buildPath(ids.map((id) => stations[id]), aspect), [ids, stations, aspect])
  const viewRef = useRef({ progress: 0 })
  const { fog, phoneMaxPx, dust } = tuning.world

  return (
    <>
      <fog attach="fog" args={[palette.fog, fog.near, fog.far]} />
      <CameraRig path={path} progressRef={progressRef} viewRef={viewRef} awake={awake} onReady={onReady} />
      <StageLighting path={path} viewRef={viewRef} resources={resources} palette={palette} />
      <Attic palette={palette} />
      <Book resources={resources} palette={palette} />
      {ids.map((id, i) => (
        <Station
          key={id}
          id={id}
          at={stations[id]}
          anchor={path.anchors[i]!}
          viewRef={viewRef}
          awake={awake}
          resources={resources}
        >
          {content[id]}
        </Station>
      ))}
      <Dust count={size.width < phoneMaxPx ? dust.phone : dust.desktop} material={resources.dust} />
    </>
  )
}

// Design §2: the 3D world, loaded as its own chunk behind the HTML cover. The pages inside it are
// the landmarks' real HTML. If the renderer cannot start, the room falls back to the flat room.
export default function World({ onFail, ...props }: WorldProps) {
  const [createRenderer] = useState(() => (defaults: THREE.WebGLRendererParameters) => {
    try {
      return new THREE.WebGLRenderer({ ...defaults, powerPreference: 'low-power' })
    } catch (error) {
      onFail(error)
      throw error
    }
  })

  return (
    <Canvas
      className="world-canvas"
      dpr={[1, tuning.world.maxDpr]}
      gl={createRenderer}
      flat
      shadows="percentage"
      camera={{ fov: tuning.world.fovPortrait, near: tuning.world.rig.near, far: tuning.world.rig.far }}
      onCreated={({ gl }) => {
        // The stage lighting redraws the shadow map only while the candles are lit.
        gl.shadowMap.autoUpdate = false
      }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
