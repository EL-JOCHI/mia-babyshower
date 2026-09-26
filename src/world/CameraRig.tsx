import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { tuning } from '../tuning'
import type { BookPath } from './bookPath'

interface Props {
  path: BookPath
  progressRef: { readonly current: number }
  // The progress the camera has actually reached, damped, for the lights and the pop-ups.
  viewRef: RefObject<{ progress: number }>
  // False while the cover is closed: the camera waits on a wide view of the book.
  awake: boolean
  onReady: () => void
}

// Scratch vectors, reused every frame. There is one rig per world.
const target = new THREE.Vector3()
const targetLook = new THREE.Vector3()
const look = new THREE.Vector3()

// Design §2: the camera damps its position and look-at toward path(progress) each frame. A small
// pointer tilt adds depth (the world never runs with reduced motion).
export function CameraRig({ path, progressRef, viewRef, awake, onReady }: Props) {
  const started = useRef(false)

  useFrame((state, delta) => {
    const { damping, tilt } = tuning.world.rig
    const camera = state.camera
    // Portrait and landscape frame the book with their own field of view (design §9).
    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== path.fov) {
      camera.fov = path.fov
      camera.updateProjectionMatrix()
    }
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1)
    if (awake) {
      path.camera.getPoint(progress, target)
      path.look.getPoint(progress, targetLook)
    } else {
      const overview = tuning.world.rig.overview[state.size.width < state.size.height ? 'portrait' : 'landscape']
      target.fromArray(overview.position)
      targetLook.fromArray(overview.look)
    }
    target.x += state.pointer.x * tilt
    target.y += state.pointer.y * tilt * 0.5
    // The first frame lands on the path; after that the camera eases toward it.
    const k = started.current ? 1 - Math.exp(-damping * Math.min(delta, 0.1)) : 1
    camera.position.lerp(target, k)
    look.lerp(targetLook, k)
    camera.lookAt(look)
    viewRef.current.progress += (progress - viewRef.current.progress) * k
    if (!started.current) {
      started.current = true
      onReady()
    }
  })

  return null
}
