import { tuning } from '../tuning'
import { moodLight } from './lighting'
import type { WorldPalette } from './palette'

// Spec §4: the attic is lit by its mood only. The window's key light and the ambient light from above
// and below keep the mood's values on every page; switching theme copies the new colors in place.
export function MoodLights({ palette }: { palette: WorldPalette }) {
  const light = moodLight(palette)
  return (
    <>
      <hemisphereLight color={palette.ambientSky} groundColor={palette.ambientGround} intensity={light.ambientIntensity} />
      <directionalLight color={palette.key} intensity={light.keyIntensity} position={[...tuning.world.light.moonFrom]} />
    </>
  )
}
