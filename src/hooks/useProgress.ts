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
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [awards, setAwards] = useState<Award[]>([])
  const loaded = useRef(progress)

  useEffect(() => {
    if (progress === loaded.current) return
    writeStorage(storageKeys.progress, JSON.stringify(progress))
  }, [progress])

  const dispatch = useCallback((e: ProgressEvent) => {
    setProgress((prev) => {
      const result = applyEvent(prev, e)
      setAwards((a) => [...a, ...result.awards])
      return result.progress
    })
  }, [])

  const dismissAward = useCallback(() => {
    setAwards((a) => a.slice(1))
  }, [])

  return { progress, dispatch, awards, dismissAward }
}
