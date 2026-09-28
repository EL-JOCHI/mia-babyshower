import { useEffect, useRef, useState } from 'react'

export interface DeferredDetailOptions {
  // The canvas has drawn its first frame (the book or the live attic is ready).
  ready: boolean
  // The canvas is paused (the tab is hidden or a full-screen dialog covers it): nothing starts.
  paused: boolean
  // Compiles the mounted detail's shaders without blocking (gl.compileAsync). Missing when the
  // renderer has none.
  compile: (() => Promise<unknown>) | undefined
}

// A guest's first visit has no shader cache, and every new material variant is a program to compile.
// The first frame compiles only the book's own set; the attic's detail (the furniture, the mood's
// props, the window's stars, the fireflies, the family) mounts once that frame is drawn and the canvas
// runs, hidden, compiles off the main thread, and shows when the compile settles, or at once if it
// fails or cannot run. Mounting, compiling, and showing each happen once.
export function useDeferredDetail({ ready, paused, compile }: DeferredDetailOptions): { mounted: boolean; shown: boolean } {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  if (!mounted && ready && !paused) setMounted(true)

  const asked = useRef(false)
  const alive = useRef(false)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (!mounted || asked.current) return
    asked.current = true
    const show = () => {
      if (alive.current) setShown(true)
    }
    let compiling: Promise<unknown>
    try {
      compiling = compile ? compile() : Promise.resolve()
    } catch (error) {
      compiling = Promise.reject(error)
    }
    compiling.then(show, show)
  }, [mounted, compile])

  return { mounted, shown }
}
