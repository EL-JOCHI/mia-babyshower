import { useCallback, useEffect, useRef, useState } from 'react'
import { applyEvent, type Award, type Progress, type ProgressEvent, sanitizeProgress } from '../logic/progress'
import { readStorage, writeStorage } from '../logic/storage'
import { storageKeys } from '../logic/storageKeys'

export function loadProgress(): Progress {
  const raw = readStorage(storageKeys.progress)
  if (raw === null) return sanitizeProgress(null)
  try {
    return sanitizeProgress(JSON.parse(raw))
  } catch {
    return sanitizeProgress(null)
  }
}

export interface ProgressApi {
  progress: Progress
  dispatch(e: ProgressEvent): void
  awards: Award[]
  dismissAward(): void
}

// The progress state changes only through the pure functions, then persists.
// Loading the page writes nothing.
export function useProgress(): ProgressApi {
  const [state, setState] = useState<{ progress: Progress; awards: Award[] }>(() => ({
    progress: loadProgress(),
    awards: [],
  }))
  const loaded = useRef(state.progress)

  useEffect(() => {
    if (state.progress === loaded.current) return
    writeStorage(storageKeys.progress, JSON.stringify(state.progress))
  }, [state.progress])

  const dispatch = useCallback((e: ProgressEvent) => {
    setState((s) => {
      const result = applyEvent(s.progress, e)
      return {
        progress: result.progress,
        awards: [...s.awards, ...result.awards],
      }
    })
  }, [])

  const dismissAward = useCallback(() => {
    setState((s) => ({
      ...s,
      awards: s.awards.slice(1),
    }))
  }, [])

  return {
    progress: state.progress,
    dispatch,
    awards: state.awards,
    dismissAward,
  }
}
