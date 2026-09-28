import { describe, expect, it } from 'vitest'
import { familyFigures } from '../components/art/family'
import { tuning } from '../tuning'
import { familySheetLayout } from './familySheet'

describe('the family sheet (spec §6, §8)', () => {
  const layout = familySheetLayout()

  it('fits all four figures on one canvas of at most 1024 px a side', () => {
    expect(tuning.world.family.sheetMaxPx).toBeLessThanOrEqual(1024)
    expect(layout.width).toBeLessThanOrEqual(tuning.world.family.sheetMaxPx)
    expect(layout.height).toBeLessThanOrEqual(tuning.world.family.sheetMaxPx)
    expect(layout.cells.map((cell) => cell.id)).toEqual(familyFigures.map((f) => f.id))
  })

  it('gives each figure its own cell, side by side, inside the canvas and its texture coordinates', () => {
    layout.cells.forEach((cell, i) => {
      if (i > 0) {
        const before = layout.cells[i - 1]!
        expect(cell.x).toBeGreaterThanOrEqual(before.x + before.width - 1e-9)
      }
      expect(cell.x + cell.width).toBeLessThanOrEqual(layout.width + 1e-9)
      expect(cell.y + cell.height).toBeLessThanOrEqual(layout.height + 1e-9)
      for (const uv of [cell.u0, cell.v0, cell.u1, cell.v1]) {
        expect(uv).toBeGreaterThanOrEqual(0)
        expect(uv).toBeLessThanOrEqual(1)
      }
    })
  })

  it("keeps each figure's shape: a cell is as wide for its height as the figure with its margin", () => {
    familyFigures.forEach((figure, i) => {
      const cell = layout.cells[i]!
      const pad = layout.pad * 2
      expect(cell.width / cell.height).toBeCloseTo((figure.box.width + pad) / (figure.box.height + pad), 6)
    })
  })
})
