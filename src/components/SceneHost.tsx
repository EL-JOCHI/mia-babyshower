import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import type { Era } from '../logic/era'
import { tuning } from '../tuning'

const loadScene = () => import('../scene/Scene3D')
const Scene3D = lazy(loadScene)

let webglChecked: boolean | null = null

// WebGL is checked once, and only when the 3D era is first reached.
export function hasWebGL(): boolean {
  if (webglChecked !== null) return webglChecked
  try {
    const canvas = document.createElement('canvas')
    webglChecked = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    webglChecked = false
  }
  return webglChecked
}

// If the canvas fails anyway, the landmarks keep their HTML and the room carries on without it.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

interface Props {
  era: Era
  position: number
  reducedMotion: boolean
}

// §4 Three eras, §10: the Three.js far layer loads as its own chunk near the 3D era, mounts the
// first time the camera reaches it, and then stays mounted, paused whenever the camera is outside it.
export function SceneHost({ era, position, reducedMotion }: Props) {
  const active = era === '3d' && !reducedMotion
  const [mounted, setMounted] = useState(false)
  if (active && !mounted && hasWebGL()) setMounted(true)

  const nearby = !reducedMotion && position >= tuning.eras.prefetch3dAt
  useEffect(() => {
    if (nearby) void loadScene()
  }, [nearby])

  return (
    <div className={`scene-host${active ? ' is-active' : ''}`} aria-hidden="true">
      {mounted && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <Scene3D active={active} position={position} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  )
}
