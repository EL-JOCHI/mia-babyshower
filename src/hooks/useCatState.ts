import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatId } from '../content'
import { greet, playAgain, sanitizeCatState, type CatState } from '../logic/catState'
import { readStorage, writeStorage } from '../logic/storage'
import { storageKeys } from '../logic/storageKeys'

export function loadCatState(): CatState {
  const raw = readStorage(storageKeys.cats)
  if (raw === null) return sanitizeCatState(null)
  try {
    return sanitizeCatState(JSON.parse(raw))
  } catch {
    return sanitizeCatState(null)
  }
}

export interface CatStateApi {
  state: CatState
  greetCat: (id: CatId) => void
  startNewRound: () => void
}

// FR-16: the cat state changes only through the pure functions, then persists.
// Loading the page writes nothing (US-3 AC4).
export function useCatState(): CatStateApi {
  const [state, setState] = useState<CatState>(loadCatState)
  const loaded = useRef(state)

  useEffect(() => {
    if (state === loaded.current) return
    writeStorage(storageKeys.cats, JSON.stringify(state))
  }, [state])

  const greetCat = useCallback((id: CatId) => setState((prev) => greet(prev, id)), [])
  const startNewRound = useCallback(() => setState((prev) => playAgain(prev)), [])

  return { state, greetCat, startNewRound }
}
