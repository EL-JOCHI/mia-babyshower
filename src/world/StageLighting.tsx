import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import type { BookPath } from './bookPath'
import { candleBrightness, candleFlicker } from './lighting'
import { MoodLights } from './MoodLights'
import type { WorldPalette } from './palette'
import { applyStageMix, type WorldResources } from './resources'
import { createStageMix, writeStageMix } from './stageMix'

export interface ShadowState {
  drawn: boolean
  stale: boolean
}

interface Props {
  path: BookPath
  viewRef: RefObject<{ progress: number }>
  resources: WorldResources
  palette: WorldPalette
  // The candle's shadow map: whether it has been drawn yet, and whether a paper piece has moved
  // since (Station marks it stale).
  shadowRef: RefObject<ShadowState>
}

const mix = createStageMix()

// Spec §4 Lit from the start: the attic is lit by its mood on every page (MoodLights). The stage
// (design §1 Evolution) drives only the book: its paper warms, its ink fades in, and in luz the
// candles light (one casts shadows) and warm the paper toward the door.
export function StageLighting({ path, viewRef, resources, palette, shadowRef }: Props) {
  const { candleAt, candleOffset, doorOffset, candleDistance, shadowMapPx } = tuning.world.light
  const candles = useRef<(THREE.PointLight | null)[]>([])

  // Candles stand beside the path; the last one waits behind the family door.
  const spots = useMemo(
    () =>
      candleAt.map((t, i) => {
        const [x, y, z] = i === candleAt.length - 1 ? doorOffset : candleOffset
        return path.ground.getPoint(t).add(new THREE.Vector3(x, y, z))
      }),
    [candleAt, candleOffset, doorOffset, path],
  )

  // A new path (the screen changed shape) moves the candles and the pages: redraw the shadows.
  useEffect(() => {
    shadowRef.current.stale = true
  }, [spots, shadowRef])

  useFrame((state) => {
    writeStageMix(viewRef.current.progress, mix)
    const t = state.clock.elapsedTime
    const lit = candleBrightness(mix)
    for (let i = 0; i < candles.current.length; i++) {
      const light = candles.current[i]
      if (light) light.intensity = lit * candleFlicker(t, i)
    }

    applyStageMix(resources, mix, palette)

    // One candle casts shadows (six passes, a point light's cube). The light stands still and only
    // the paper pieces cast, so the map is redrawn only after a piece has moved, and only while
    // the candles are lit; the first frame draws it so the texture exists. A settled book in luz
    // redraws nothing.
    const shadow = shadowRef.current
    const draw = !shadow.drawn || (shadow.stale && mix.light > 0.001)
    state.gl.shadowMap.needsUpdate = draw
    if (draw) {
      shadow.drawn = true
      shadow.stale = false
    }
  })

  return (
    <>
      <MoodLights palette={palette} />
      {spots.map((spot, i) => {
        const door = i === spots.length - 1
        return (
          <pointLight
            key={i}
            ref={(light) => {
              candles.current[i] = light
            }}
            position={spot}
            color={tokens.candle}
            intensity={0}
            distance={candleDistance}
            decay={2}
            castShadow={door}
            shadow-mapSize={[shadowMapPx, shadowMapPx]}
            shadow-camera-near={0.1}
            shadow-camera-far={candleDistance}
            shadow-bias={-0.003}
          />
        )
      })}
    </>
  )
}
