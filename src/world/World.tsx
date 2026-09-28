import { Canvas, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { tierCount, type DeviceTier } from '../logic/deviceTier'
import type { LandmarkId } from '../logic/layout'
import { tuning, type MoodId, type ThemeName } from '../tuning'
import { Attic } from './Attic'
import { Book } from './Book'
import { buildPath } from './bookPath'
import { CameraRig } from './CameraRig'
import { MoodProps } from './MoodProps'
import { Dust } from './Dust'
import { Fireflies } from './Fireflies'
import { paletteFor } from './palette'
import { Props } from './Props'
import { useWorldResources } from './resources'
import { StageLighting, type ShadowState } from './StageLighting'
import { Station } from './Station'
import { WindowSky } from './WindowSky'

export { Backdrop } from './Backdrop'

export interface WorldProps {
  ids: readonly LandmarkId[]
  stations: Record<LandmarkId, number>
  progressRef: { readonly current: number }
  content: Record<LandmarkId, ReactNode>
  // Saturday's moonlit night or Sunday's golden dusk (spec §3), from the invite link.
  mood: MoodId
  // Claro or Oscuro: the mood's lighter or darker look. Switching retints the scene in place.
  theme: ThemeName
  // Spec §8 Device tiers: a low device draws about half the stars, fireflies, and dust.
  tier: DeviceTier
  // False while the cover is closed: it is opaque, so the world draws the frame it needs to get
  // ready and then waits, drawing again only when something changes (a resize, new props such as
  // the ticking countdown on a page), never every frame. It runs from the moment the cover starts
  // to open.
  running: boolean
  // The tab is hidden or a full-screen dialog covers the book: nothing draws (spec §8 Pausing).
  paused: boolean
  // False until the cover has swung open: the camera waits on a wide view of the book and the pages
  // lie flat, so the guest sees the whole book before the camera swoops down to the first page.
  awake: boolean
  // Tapping the 3D doorway at the Familia station starts Misha's scratch (spec §6).
  onDoorTap: () => void
  // Every page found (Cuento completo): the doorway glows brighter.
  doorComplete: boolean
  onReady: () => void
  onFail: (error: unknown) => void
}

type SceneProps = Omit<WorldProps, 'onFail' | 'running' | 'paused'>

function Scene({ ids, stations, progressRef, content, mood, theme, tier, awake, onDoorTap, doorComplete, onReady }: SceneProps) {
  const palette = paletteFor(mood, theme)
  const size = useThree((state) => state.size)
  const resources = useWorldResources()
  const aspect = size.width / Math.max(1, size.height)
  const path = useMemo(
    () => buildPath(ids.map((id) => stations[id]), aspect, size.height),
    [ids, stations, aspect, size.height],
  )
  const viewRef = useRef({ progress: 0 })
  // Marked stale by a station while its paper folds, so the candle's shadow map is redrawn only then.
  const shadowRef = useRef<ShadowState>({ drawn: false, stale: true })
  const { fog, phoneMaxPx, dust } = tuning.world

  return (
    <>
      <fog attach="fog" args={[palette.fog, fog.near, fog.far]} />
      <CameraRig path={path} progressRef={progressRef} viewRef={viewRef} awake={awake} onReady={onReady} />
      <StageLighting path={path} viewRef={viewRef} resources={resources} palette={palette} shadowRef={shadowRef} complete={doorComplete} />
      <Attic palette={palette} />
      <WindowSky palette={palette} tier={tier} />
      <Props palette={palette} />
      <MoodProps key={mood} mood={mood} palette={palette} tier={tier} />
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
          shadowRef={shadowRef}
          onDoorTap={id === 'familia' ? onDoorTap : undefined}
        >
          {content[id]}
        </Station>
      ))}
      {/* The Motion rule (spec §3): dust, or fireflies at Sunday's dusk. About half on a low device. */}
      {palette.motes === 'fireflies' ? (
        <Fireflies palette={palette} tier={tier} />
      ) : (
        <Dust count={tierCount(size.width < phoneMaxPx ? dust.phone : dust.desktop, tier)} material={resources.dust} />
      )}
    </>
  )
}

// Design §2: the 3D world, loaded as its own chunk behind the HTML cover. The pages inside it are
// the landmarks' real HTML. If the renderer cannot start, the room falls back to the flat room.
export default function World({ onFail, running, paused, ...props }: WorldProps) {
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
      frameloop={paused ? 'never' : running ? 'always' : 'demand'}
      gl={createRenderer}
      flat
      shadows="percentage"
      camera={{ fov: tuning.world.fovPortrait, near: tuning.world.rig.near, far: tuning.world.rig.far }}
      onCreated={({ gl }) => {
        // The stage lighting redraws the shadow map itself, only when the paper that casts it moves.
        gl.shadowMap.autoUpdate = false
      }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
