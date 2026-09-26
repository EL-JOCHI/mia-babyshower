import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../logic/storage'
import { storageKeys } from '../logic/storageKeys'
import type { ThemeName } from '../tuning'

// US-2: a saved choice wins. A first visit follows the operating system, or dark if it cannot be read.
export function initialTheme(): ThemeName {
  const saved = readStorage(storageKeys.theme)
  if (saved === 'dark' || saved === 'light') return saved
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function useTheme(): [ThemeName, (theme: ThemeName) => void] {
  const [theme, setTheme] = useState<ThemeName>(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const choose = useCallback((next: ThemeName) => {
    writeStorage(storageKeys.theme, next)
    setTheme(next)
  }, [])

  return [theme, choose]
}
