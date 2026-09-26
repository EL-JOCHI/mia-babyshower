import { describe, expect, it } from 'vitest'
import { computeLayout, landmarksFor } from './layout'

describe('landmarksFor (§3, BR-11)', () => {
  it('lists all seven landmarks while the party is current', () => {
    expect(landmarksFor(false)).toEqual(['llegada', 'palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'])
  })

  it('drops Dónde, Confirmar, and Presente once the party is over', () => {
    expect(landmarksFor(true)).toEqual(['llegada', 'palabra', 'cuando', 'familia'])
  })
})

describe('computeLayout (§4 room size, US-1 AC6)', () => {
  const noOverlap = (vw: number, vh: number, partyOver: boolean) => {
    const layout = computeLayout(vw, vh, landmarksFor(partyOver))
    const xs = layout.order.map((id) => layout.positions[id].x)
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]! - xs[i - 1]!).toBeGreaterThanOrEqual(layout.cardWidth)
    }
    return layout
  }

  it('keeps cards apart on a 360px phone and sizes the room to fit seven', () => {
    const layout = noOverlap(360, 740, false)
    expect(layout.roomWidth).toBeCloseTo(7 * 306, 0)
    expect(layout.cardWidth).toBeCloseTo(288, 0)
    expect(layout.roomHeight).toBeCloseTo(1110, 0)
  })

  it('keeps cards apart at 320px, 390px, tablet, and desktop widths', () => {
    for (const [vw, vh] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1440, 900],
    ] as const) {
      noOverlap(vw, vh, false)
      noOverlap(vw, vh, true)
    }
  })

  it('never makes the room narrower than three viewport widths', () => {
    expect(computeLayout(1440, 900, landmarksFor(false)).roomWidth).toBe(4320)
  })

  it('lets the next card peek in from Llegada on a phone', () => {
    const layout = computeLayout(360, 740, landmarksFor(false))
    const nextLeftEdge = layout.positions.palabra.x - layout.cardWidth / 2
    expect(nextLeftEdge).toBeLessThan(360)
  })

  it('puts Llegada on the middle line and alternates the rest above and below', () => {
    const layout = computeLayout(360, 800, landmarksFor(false))
    const middle = layout.roomHeight / 2
    expect(layout.positions.llegada.y).toBe(middle)
    expect(layout.positions.palabra.y).toBe(middle - 80)
    expect(layout.positions.cuando.y).toBe(middle + 80)
    expect(layout.positions.donde.y).toBe(middle - 80)
  })
})
