import { tuning } from '../tuning'
import { screenScale } from './screen'

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
  // Design §9: how much larger than on a phone the cards are drawn (screenScale). The card's
  // content is drawn at this scale, so a wider card on a large screen is not a sparser one.
  scale: number
  positions: Record<LandmarkId, Point>
}

type RoomTuning = typeof tuning.room

// §4 room size and layout. Positions are landmark centres in room pixels. On a large screen the
// slot and card caps grow with the screen (design §9).
export function computeLayout(vw: number, vh: number, order: LandmarkId[], t: RoomTuning = tuning.room): Layout {
  const scale = screenScale(vw)
  const slot = Math.min(t.slotVw * vw, t.slotMaxPx * scale)
  const cardWidth = Math.min(t.cardVw * vw, t.cardMaxPx * scale)
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
  return { order, roomWidth, roomHeight, cardWidth, slot, scale, positions }
}
