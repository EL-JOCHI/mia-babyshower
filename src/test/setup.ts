import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom has no matchMedia. Tests set window.__prefersReducedMotion or window.__prefersLight to flip it.
declare global {
  interface Window {
    __prefersReducedMotion?: boolean
    __prefersLight?: boolean
  }
}

function matchMediaStub(query: string): MediaQueryList {
  const matches =
    (query.includes('prefers-reduced-motion') && window.__prefersReducedMotion === true) ||
    (query.includes('prefers-color-scheme: light') && window.__prefersLight === true)
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }
}

beforeEach(() => {
  window.__prefersReducedMotion = false
  window.__prefersLight = false
  window.matchMedia = vi.fn(matchMediaStub)
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  cleanup()
})
