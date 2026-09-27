import type { ReactNode } from 'react'
import type { LandmarkId, Point } from '../logic/layout'

interface Props {
  id: LandmarkId
  at: Point
  width: number
  // Design §9: on a large screen the card is wider and its content is drawn larger by the same
  // amount (layout.scale), the way the book's camera draws its pages larger.
  scale: number
  children: ReactNode
}

// One card in the room, centred on its layout position (§4 room size and layout).
export function Landmark({ id, at, width, scale, children }: Props) {
  return (
    <section className={`landmark landmark-${id}`} data-landmark-id={id} style={{ left: at.x, top: at.y, width }}>
      <div className="landmark-scale" style={{ zoom: scale }}>
        {children}
      </div>
    </section>
  )
}
