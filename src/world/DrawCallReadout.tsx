import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

// Spec §8: a dev-only readout of the draw calls per frame (renderer.info.render.calls), in a corner
// of the screen. World and Backdrop mount it only when import.meta.env.DEV is true, so production
// builds drop it. It reads the last frame's count every 30 frames.
export function DrawCallReadout({ label }: { label: string }) {
  const out = useRef<HTMLOutputElement | null>(null)
  const frames = useRef(0)

  useEffect(() => {
    const el = document.createElement('output')
    el.className = 'draw-calls'
    document.body.append(el)
    out.current = el
    return () => {
      el.remove()
      out.current = null
    }
  }, [])

  useFrame((state) => {
    frames.current += 1
    const el = out.current
    if (!el || frames.current % 30 !== 0) return
    el.textContent = `${label}: ${state.gl.info.render.calls} calls`
  })

  return null
}
