import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import type { BookPath } from './bookPath'
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

// Design §1 Evolution: boceto has the window's light only (cool moonlight by night, soft daylight
// by day) and gray paper; tinta adds ink outlines and shadows from below (plum by night, rose by
// day); luz lights the candles (one casts shadows) and warms the paper toward the door.
export function StageLighting({ path, viewRef, resources, palette, shadowRef }: Props) {
  const { moonFrom, candleAt, candleOffset, doorOffset, candleDistance, shadowMapPx } = tuning.world.light
  const moonLight = useRef<THREE.DirectionalLight>(null)
  const sky = useRef<THREE.HemisphereLight>(null)
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
    const { candle: candleIntensity, candleBase, flicker, flickerWaves } = tuning.world.light
    const key = moonLight.current
    if (key) {
      key.color.copy(palette.key)
      key.intensity = THREE.MathUtils.lerp(palette.keyIntensity.boceto, palette.keyIntensity.luz, mix.light)
    }
    const ambient = sky.current
    if (ambient) {
      ambient.color.copy(palette.ambientSky)
      ambient.groundColor.copy(palette.ambientGround)
      ambient.intensity = THREE.MathUtils.lerp(palette.ambient.boceto, palette.ambient.tinta, mix.ink)
    }

    const t = state.clock.elapsedTime
    const lit = mix.light * (candleBase + (1 - candleBase) * mix.warm)
    for (let i = 0; i < candles.current.length; i++) {
      const light = candles.current[i]
      const { fast, slow, phase } = flickerWaves
      if (light) light.intensity = candleIntensity * lit * (1 + flicker * Math.sin(t * fast + i * phase) * Math.sin(t * slow + i))
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
      <hemisphereLight ref={sky} />
      <directionalLight ref={moonLight} position={[...moonFrom]} />
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
