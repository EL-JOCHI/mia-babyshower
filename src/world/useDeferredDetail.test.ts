import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDeferredDetail, type DeferredDetailOptions } from './useDeferredDetail'

// A compile the test settles by hand, like gl.compileAsync waiting on KHR_parallel_shader_compile.
function pendingCompile() {
  let settle: { resolve: () => void; reject: (error: unknown) => void } = { resolve: () => {}, reject: () => {} }
  const compile = vi.fn(
    () =>
      new Promise<void>((resolve, reject) => {
        settle = { resolve, reject }
      }),
  )
  return { compile, resolve: () => settle.resolve(), reject: (error: unknown) => settle.reject(error) }
}

const start = (options: DeferredDetailOptions) =>
  renderHook((props: DeferredDetailOptions) => useDeferredDetail(props), { initialProps: options })

// The concern fix (first-visit shader compile): the first frame compiles only the book's own set; the
// attic's detail mounts after it has drawn, hidden, compiles without blocking, then shows.
describe('the attic detail waits for the first frame, compiles, then shows', () => {
  it('mounts nothing and compiles nothing before the first frame is drawn', () => {
    const { compile } = pendingCompile()
    const { result } = start({ ready: false, paused: false, compile })
    expect(result.current).toEqual({ mounted: false, shown: false })
    expect(compile).not.toHaveBeenCalled()
  })

  it('mounts the detail hidden once the first frame is drawn, and compiles it once', () => {
    const { compile } = pendingCompile()
    const view = start({ ready: false, paused: false, compile })
    view.rerender({ ready: true, paused: false, compile })
    expect(view.result.current).toEqual({ mounted: true, shown: false })
    expect(compile).toHaveBeenCalledTimes(1)
    view.rerender({ ready: true, paused: false, compile })
    expect(compile).toHaveBeenCalledTimes(1)
  })

  it('shows the detail when the compile resolves', async () => {
    const { compile, resolve } = pendingCompile()
    const { result } = start({ ready: true, paused: false, compile })
    expect(result.current.shown).toBe(false)
    await act(async () => resolve())
    expect(result.current).toEqual({ mounted: true, shown: true })
  })

  it('still shows the detail when the compile rejects', async () => {
    const { compile, reject } = pendingCompile()
    const { result } = start({ ready: true, paused: false, compile })
    await act(async () => reject(new Error('no parallel compile')))
    expect(result.current.shown).toBe(true)
  })

  it('shows the detail at once when the renderer has no async compile, or it throws', async () => {
    const missing = start({ ready: true, paused: false, compile: undefined })
    await act(async () => {})
    expect(missing.result.current.shown).toBe(true)
    const throwing = start({
      ready: true,
      paused: false,
      compile: () => {
        throw new Error('compileAsync failed')
      },
    })
    await act(async () => {})
    expect(throwing.result.current.shown).toBe(true)
  })

  it('neither mounts nor compiles while paused, and starts once the canvas runs again', () => {
    const { compile } = pendingCompile()
    const view = start({ ready: true, paused: true, compile })
    expect(view.result.current).toEqual({ mounted: false, shown: false })
    expect(compile).not.toHaveBeenCalled()
    view.rerender({ ready: true, paused: false, compile })
    expect(view.result.current.mounted).toBe(true)
    expect(compile).toHaveBeenCalledTimes(1)
  })

  it('keeps a compile that started going through a pause, and shows when it lands', async () => {
    const { compile, resolve } = pendingCompile()
    const view = start({ ready: true, paused: false, compile })
    view.rerender({ ready: true, paused: true, compile })
    view.rerender({ ready: true, paused: false, compile })
    expect(compile).toHaveBeenCalledTimes(1)
    await act(async () => resolve())
    expect(view.result.current).toEqual({ mounted: true, shown: true })
  })

  it('does nothing after it is gone', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { compile, resolve } = pendingCompile()
    const view = start({ ready: true, paused: false, compile })
    view.unmount()
    await act(async () => resolve())
    expect(error).not.toHaveBeenCalled()
  })
})
