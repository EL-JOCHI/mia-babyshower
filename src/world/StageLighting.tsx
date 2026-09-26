import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import type { BookPath } from './bookPath'
import { applyStageMix, type WorldResources } from './resources'
import { createStageMix, writeStageMix } from './stageMix'

interface Props {
  path: BookPath
  viewRef: RefObject<{ progress: number }>
  resources: WorldResources
}

const mix = createStageMix()
const { moonColor, moonSoften } = tuning.world.light
const moonlight = new THREE.Color(moonColor).lerp(new THREE.Color(tokens.bone), moonSoften)

// Design §1 Evolution: boceto has a cool moon light and gray paper; tinta adds ink outlines and plum
// shadows; luz lights the candles (one casts shadows) and warms the paper toward the door.
export function StageLighting({ path, viewRef, resources }: Props) {
  const { moon, moonFrom, ambient, candleAt, candleOffset, doorOffset, candleDistance, shadowMapPx } = tuning.world.light
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
    const { candle: candleIntensity, candleBase, flicker } = tuning.world.light
    if (moonLight.current) moonLight.current.intensity = THREE.MathUtils.lerp(moon.boceto, moon.luz, mix.light)
    if (sky.current) sky.current.intensity = THREE.MathUtils.lerp(ambient.boceto, ambient.tinta, mix.ink)

    const t = state.clock.elapsedTime
    const lit = mix.light * (candleBase + (1 - candleBase) * mix.warm)
    for (let i = 0; i < candles.current.length; i++) {
      const light = candles.current[i]
      // Two slow waves per candle make a soft, uneven flicker.
      if (light) light.intensity = candleIntensity * lit * (1 + flicker * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 3.1 + i))
    }

    applyStageMix(resources, mix)

    // Only the lit candles cast shadows, so the shadow map is redrawn only once they are lit. It
    // is drawn once at the start so the shadow texture exists before then.
    state.gl.shadowMap.needsUpdate = mix.light > 0.001 || !shadowDrawn.current
    shadowDrawn.current = true
  })

  return (
    <>
      <hemisphereLight ref={sky} args={[moonlight, tokens.plum, ambient.boceto]} />
      <directionalLight ref={moonLight} position={[...moonFrom]} color={moonlight} intensity={moon.boceto} />
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
