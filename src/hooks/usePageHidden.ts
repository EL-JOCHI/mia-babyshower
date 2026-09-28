import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

// Spec §8 Pausing: whether the tab is hidden now (the guest switched apps or tabs).
export function usePageHidden(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.hidden,
    () => false,
  )
}
