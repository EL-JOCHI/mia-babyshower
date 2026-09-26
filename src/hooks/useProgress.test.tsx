import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storageKeys } from '../logic/storageKeys'
import { useProgress } from './useProgress'

describe('useProgress', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('after a greeting (metCat), mia-progress holds xp > 0 and badges includes primerGato', () => {
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.xp).toBe(0)
    expect(result.current.progress.badges).toEqual([])

    act(() => {
      result.current.dispatch({ type: 'metCat', cat: 'luz', metCount: 1 })
    })

    expect(result.current.progress.xp).toBeGreaterThan(0)
    expect(result.current.progress.badges).toContain('primerGato')

    // Verify storage is persisted
    const stored = localStorage.getItem(storageKeys.progress)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.xp).toBeGreaterThan(0)
    expect(parsed.badges).toContain('primerGato')
  })

  it('dismissAward removes the first award', () => {
    const { result } = renderHook(() => useProgress())

    act(() => {
      result.current.dispatch({ type: 'metCat', cat: 'luz', metCount: 1 })
    })

    expect(result.current.awards.length).toBeGreaterThan(0)
    const firstAward = result.current.awards[0]

    act(() => {
      result.current.dismissAward()
    })

    expect(result.current.awards[0]).not.toEqual(firstAward)
  })

  it('loading junk from storage renders emptyProgress', () => {
    localStorage.setItem(storageKeys.progress, 'not valid json')

    const { result } = renderHook(() => useProgress())
    expect(result.current.progress).toEqual({ pages: [], badges: [], xp: 0 })
  })

  it('rendering the hook without dispatching writes nothing to localStorage', () => {
    localStorage.clear()
    renderHook(() => useProgress())

    // The hook should not write to storage on initial load
    const stored = localStorage.getItem(storageKeys.progress)
    expect(stored).toBeNull()
  })
})
