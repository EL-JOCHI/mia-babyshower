import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storageKeys } from '../logic/storageKeys'
import { useGateBest } from './useGateBest'

describe('useGateBest', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('with nothing stored, the best is 0', () => {
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(0)
  })

  it('with junk in storage (non-number), reads as 0', () => {
    localStorage.setItem(storageKeys.gateBest, 'abc')
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(0)
  })

  it('with negative number in storage, reads as 0', () => {
    localStorage.setItem(storageKeys.gateBest, '-5')
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(0)
  })

  it('with decimal in storage, floors positive decimals', () => {
    localStorage.setItem(storageKeys.gateBest, '3.7')
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(3)
  })

  it('saveBest(n) writes and updates the best only when n is larger', () => {
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(0)

    act(() => {
      result.current.saveBest(50)
    })

    expect(result.current.best).toBe(50)
    const stored = localStorage.getItem(storageKeys.gateBest)
    expect(stored).toBe('50')
  })

  it('a smaller score changes nothing', () => {
    localStorage.setItem(storageKeys.gateBest, '100')
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(100)

    act(() => {
      result.current.saveBest(50)
    })

    expect(result.current.best).toBe(100)
    const stored = localStorage.getItem(storageKeys.gateBest)
    expect(stored).toBe('100')
  })

  it('an equal score changes nothing', () => {
    localStorage.setItem(storageKeys.gateBest, '100')
    const { result } = renderHook(() => useGateBest())
    expect(result.current.best).toBe(100)

    act(() => {
      result.current.saveBest(100)
    })

    expect(result.current.best).toBe(100)
    const stored = localStorage.getItem(storageKeys.gateBest)
    expect(stored).toBe('100')
  })

  it('can write multiple times when scores increase', () => {
    const { result } = renderHook(() => useGateBest())

    act(() => {
      result.current.saveBest(30)
    })
    expect(result.current.best).toBe(30)

    act(() => {
      result.current.saveBest(60)
    })
    expect(result.current.best).toBe(60)

    const stored = localStorage.getItem(storageKeys.gateBest)
    expect(stored).toBe('60')
  })
})
