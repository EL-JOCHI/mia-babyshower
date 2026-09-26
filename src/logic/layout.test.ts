import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { computeLayout, landmarksFor } from './layout'

const t = tuning.room

describe('landmarksFor (§3, BR-11)', () => {
  it('lists all seven landmarks while the party is current', () => {
    expect(landmarksFor(false)).toEqual(['llegada', 'palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'])
  })

  it('drops Dónde, Confirmar, and Presente once the party is over', () => {
    expect(landmarksFor(true)).toEqual(['llegada', 'palabra', 'cuando', 'familia'])
  })
})

// Expectations come from the tuning module, so tuning a size never breaks the suite (§7).
describe('computeLayout (§4 room size, US-1 AC6)', () => {
  const noOverlap = (vw: number, vh: number, partyOver: boolean) => {
    const layout = computeLayout(vw, vh, landmarksFor(partyOver))
    const xs = layout.order.map((id) => layout.positions[id].x)
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]! - xs[i - 1]!).toBeGreaterThanOrEqual(layout.cardWidth)
    }
    return layout
  }

  it('sizes the room and cards from the tuning values', () => {
    const [vw, vh] = [360, 740]
    const layout = noOverlap(vw, vh, false)
    const slot = Math.min(t.slotVw * vw, t.slotMaxPx)
    expect(layout.slot).toBeCloseTo(slot, 5)
    expect(layout.roomWidth).toBeCloseTo(Math.max(t.minWidthVw * vw, 7 * slot), 5)
    expect(layout.cardWidth).toBeCloseTo(Math.min(t.cardVw * vw, t.cardMaxPx), 5)
    expect(layout.roomHeight).toBeCloseTo(t.heightVh * vh, 5)
  })

  it('keeps cards apart at 320px, 360px, 390px, tablet, and desktop widths', () => {
    for (const [vw, vh] of [
      [320, 568],
      [360, 740],
      [390, 844],
      [768, 1024],
      [1440, 900],
    ] as const) {
      noOverlap(vw, vh, false)
      noOverlap(vw, vh, true)
    }
  })

  it('never makes the room narrower than the minimum width', () => {
    const vw = 1440
    expect(computeLayout(vw, 900, landmarksFor(false)).roomWidth).toBeGreaterThanOrEqual(t.minWidthVw * vw)
  })

  it('lets the next card peek in from Llegada on a phone', () => {
    const layout = computeLayout(360, 740, landmarksFor(false))
    const nextLeftEdge = layout.positions.palabra.x - layout.cardWidth / 2
    expect(nextLeftEdge).toBeLessThan(360)
  })

  it('puts Llegada on the middle line and alternates the rest above and below', () => {
    const vh = 800
    const layout = computeLayout(360, vh, landmarksFor(false))
    const middle = layout.roomHeight / 2
    const offset = t.landmarkOffsetVh * vh
    expect(layout.positions.llegada.y).toBe(middle)
    expect(layout.positions.palabra.y).toBe(middle - offset)
    expect(layout.positions.cuando.y).toBe(middle + offset)
    expect(layout.positions.donde.y).toBe(middle - offset)
  })
})
