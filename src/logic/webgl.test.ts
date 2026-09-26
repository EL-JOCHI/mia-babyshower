import { beforeEach, describe, expect, it, vi } from 'vitest'

// The check runs once per page load, so each test loads a fresh copy of the module.
async function freshHasWebGL() {
  vi.resetModules()
  const { hasWebGL } = await import('./webgl')
  return hasWebGL
}

describe('hasWebGL (design §2 flat fallback)', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  it('is false when the browser gives no WebGL context', async () => {
    const hasWebGL = await freshHasWebGL()
    expect(hasWebGL()).toBe(false)
  })

  it('is true with a context, and releases the test context', async () => {
    const loseContext = vi.fn()
    const gl = { getExtension: vi.fn(() => ({ loseContext })) }
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(gl as unknown as RenderingContext)
    const hasWebGL = await freshHasWebGL()
    expect(hasWebGL()).toBe(true)
    expect(gl.getExtension).toHaveBeenCalledWith('WEBGL_lose_context')
    expect(loseContext).toHaveBeenCalled()
  })

  it('checks only once', async () => {
    const hasWebGL = await freshHasWebGL()
    hasWebGL()
    hasWebGL()
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(2)
  })

  it('is false when asking for a context throws', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => {
      throw new Error('blocked')
    })
    const hasWebGL = await freshHasWebGL()
    expect(hasWebGL()).toBe(false)
  })
})
