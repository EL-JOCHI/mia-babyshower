import { useThree } from '@react-three/fiber'
import { useCallback, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useDeferredDetail } from './useDeferredDetail'

interface Props {
  // The canvas has drawn its first frame.
  ready: boolean
  // What to draw, or a function of whether it shows yet (the family waits for it to walk in).
  children: ReactNode | ((shown: boolean) => ReactNode)
}

// Detail that must not slow the first frame (see useDeferredDetail): mounted hidden once the canvas
// has drawn and runs, compiled with gl.compileAsync (KHR_parallel_shader_compile where the browser has
// it, so the main thread never waits on the GPU), then shown. It compiles against the whole scene, so
// its programs are built for the scene's lights and fog and are reused as they are when it shows.
export function DeferredDetail({ ready, children }: Props) {
  const group = useRef<THREE.Group>(null)
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  // A paused canvas (frameloop 'never') starts nothing until it runs again.
  const paused = useThree((state) => state.frameloop === 'never')
  const compile = useCallback(() => {
    const detail = group.current
    if (!detail || typeof gl.compileAsync !== 'function') return Promise.resolve()
    return gl.compileAsync(detail, camera, scene)
  }, [gl, camera, scene])
  const { mounted, shown } = useDeferredDetail({ ready, paused, compile })
  if (!mounted) return null
  return (
    <group ref={group} visible={shown}>
      {typeof children === 'function' ? children(shown) : children}
    </group>
  )
}
