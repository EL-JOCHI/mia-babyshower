import { tuning } from '../tuning'

export type LandmarkId = 'llegada' | 'palabra' | 'cuando' | 'donde' | 'confirmar' | 'presente' | 'familia'

const allLandmarks: readonly LandmarkId[] = ['llegada', 'palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia']
const currentOnly: ReadonlySet<LandmarkId> = new Set(['donde', 'confirmar', 'presente'])

// §3: Dónde, Confirmar, and Presente exist only until the party is over.
export function landmarksFor(partyOver: boolean): LandmarkId[] {
  return allLandmarks.filter((id) => !partyOver || !currentOnly.has(id))
}

export interface Point {
  x: number
  y: number
}

export interface Layout {
  order: LandmarkId[]
  roomWidth: number
  roomHeight: number
  cardWidth: number
  slot: number
  positions: Record<LandmarkId, Point>
}

type RoomTuning = typeof tuning.room

// §4 room size and layout. Positions are landmark centres in room pixels.
export function computeLayout(vw: number, vh: number, order: LandmarkId[], t: RoomTuning = tuning.room): Layout {
  const slot = Math.min(t.slotVw * vw, t.slotMaxPx)
  const cardWidth = Math.min(t.cardVw * vw, t.cardMaxPx)
  const roomWidth = Math.max(t.minWidthVw * vw, order.length * slot)
  const roomHeight = t.heightVh * vh
  const spacing = roomWidth / order.length
  const middle = roomHeight / 2
  const offset = t.landmarkOffsetVh * vh

  const positions = {} as Record<LandmarkId, Point>
  order.forEach((id, i) => {
    const y = i === 0 ? middle : i % 2 === 1 ? middle - offset : middle + offset
    positions[id] = { x: (i + 0.5) * spacing, y }
  })
  return { order, roomWidth, roomHeight, cardWidth, slot, positions }
}
