import { useEffect, useState } from 'react'

export interface Viewport {
  vw: number
  vh: number
}

function read(): Viewport {
  return { vw: window.innerWidth, vh: window.innerHeight }
}

export function useViewport(): Viewport {
  const [size, setSize] = useState(read)
  useEffect(() => {
    const onResize = () => setSize(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}
