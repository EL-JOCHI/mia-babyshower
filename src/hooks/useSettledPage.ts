import { useEffect, useRef } from 'react'
import type { LandmarkId } from '../logic/layout'
import { tuning } from '../tuning'

// Design §6: a page counts as reached once the view comes to rest on it. `page` is the page the
// view is on now (or undefined between pages); `onSettle` runs once it has stayed there for
// tuning.pages.settleMs, so a glide that only passes a page does not count it.
export function useSettledPage(page: LandmarkId | undefined, onSettle: (page: LandmarkId) => void) {
  const settle = useRef(onSettle)

  useEffect(() => {
    settle.current = onSettle
  }, [onSettle])

  useEffect(() => {
    if (!page) return
    const id = window.setTimeout(() => settle.current(page), tuning.pages.settleMs)
    return () => window.clearTimeout(id)
  }, [page])
}
