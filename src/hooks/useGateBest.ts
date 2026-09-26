import { useCallback, useEffect, useRef, useState } from 'react'
import { readStorage, writeStorage } from '../logic/storage'
import { storageKeys } from '../logic/storageKeys'

function loadBest(): number {
  const raw = readStorage(storageKeys.gateBest)
  if (raw === null) return 0
  const num = parseInt(raw, 10)
  if (isNaN(num) || num < 0) return 0
  return Math.floor(num)
}

export interface UseGateBestApi {
  best: number
  saveBest: (score: number) => void
}

export function useGateBest(): UseGateBestApi {
  const [best, setBest] = useState<number>(() => loadBest())
  const loaded = useRef(best)

  useEffect(() => {
    if (best === loaded.current) return
    writeStorage(storageKeys.gateBest, String(best))
  }, [best])

  const saveBest = useCallback((score: number) => {
    setBest((current) => {
      if (score > current) {
        return score
      }
      return current
    })
  }, [])

  return { best, saveBest }
}
