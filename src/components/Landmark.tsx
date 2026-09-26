import type { ReactNode } from 'react'
import type { LandmarkId, Point } from '../logic/layout'

interface Props {
  id: LandmarkId
  at: Point
  width: number
  children: ReactNode
}

// One card in the room, centred on its layout position (§4 room size and layout).
export function Landmark({ id, at, width, children }: Props) {
  return (
    <section className={`landmark landmark-${id}`} data-landmark-id={id} style={{ left: at.x, top: at.y, width }}>
      {children}
    </section>
  )
}
