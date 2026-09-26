import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import type { BookPath } from './bookPath'
import type { WorldPalette } from './palette'
import { applyStageMix, type WorldResources } from './resources'
import { createStageMix, writeStageMix } from './stageMix'

interface Props {
  path: BookPath
  viewRef: RefObject<{ progress: number }>
  resources: WorldResources
  palette: WorldPalette
}

const mix = createStageMix()

// Design §1 Evolution: boceto has the window's light only (cool moonlight by night, soft daylight
// by day) and gray paper; tinta adds ink outlines and shadows from below (plum by night, rose by
// day); luz lights the candles (one casts shadows) and warms the paper toward the door.
export function StageLighting({ path, viewRef, resources, palette }: Props) {
  const { moonFrom, candleAt, candleOffset, doorOffset, candleDistance, shadowMapPx } = tuning.world.light
  const moonLight = useRef<THREE.DirectionalLight>(null)
  const sky = useRef<THREE.HemisphereLight>(null)
  const candles = useRef<(THREE.PointLight | null)[]>([])
  const shadowDrawn = useRef(false)

  // Candles stand beside the path; the last one waits behind the family door.
  const spots = useMemo(
    () =>
      candleAt.map((t, i) => {
        const [x, y, z] = i === candleAt.length - 1 ? doorOffset : candleOffset
        return path.ground.getPoint(t).add(new THREE.Vector3(x, y, z))
      }),
    [candleAt, candleOffset, doorOffset, path],
  )

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

    // Only the lit candles cast shadows, so the shadow map is redrawn only once they are lit. It
    // is drawn once at the start so the shadow texture exists before then.
    state.gl.shadowMap.needsUpdate = mix.light > 0.001 || !shadowDrawn.current
    shadowDrawn.current = true
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
