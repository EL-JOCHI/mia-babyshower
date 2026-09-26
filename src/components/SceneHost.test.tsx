import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../scene/Scene3D', async () => {
  const { createElement } = await import('react')
  return {
    default: ({ active }: { active: boolean }) =>
      createElement('canvas', { 'data-testid': 'scene', 'data-active': String(active) }),
  }
})

describe('US-7 AC2 the 3D era canvas', () => {
  it('mounts on reaching the 3D era, keeps the canvas, and pauses it outside the era', async () => {
    const canvasProto = HTMLCanvasElement.prototype
    vi.spyOn(canvasProto, 'getContext').mockReturnValue({} as RenderingContext)
    const { SceneHost } = await import('./SceneHost')

    const view = render(<SceneHost era="color" position={0.4} reducedMotion={false} />)
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()

    view.rerender(<SceneHost era="3d" position={0.7} reducedMotion={false} />)
    expect(await screen.findByTestId('scene')).toHaveAttribute('data-active', 'true')

    view.rerender(<SceneHost era="color" position={0.5} reducedMotion={false} />)
    expect(screen.getByTestId('scene')).toHaveAttribute('data-active', 'false')
  })

  it('never mounts with reduced motion', async () => {
    const { SceneHost } = await import('./SceneHost')
    render(<SceneHost era="3d" position={1} reducedMotion />)
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument()
  })
})
