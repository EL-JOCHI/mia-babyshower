import { describe, expect, it } from 'vitest'
import { familyFigures, familyFloor, rimPath } from './family'

const byId = Object.fromEntries(familyFigures.map((figure) => [figure.id, figure]))
const curls = (d: string) => (d.match(/a/g) ?? []).length / 2

describe('the family drawing (spec §6)', () => {
  it('has four figures: dad, mom, Miguelito, and Mia', () => {
    expect(familyFigures.map((f) => f.id)).toEqual(['dad', 'mom', 'miguelito', 'mia'])
  })

  it('tells them apart by height: dad tallest, then mom, Miguelito, and Mia smallest', () => {
    const heights = familyFigures.map((f) => f.box.height)
    expect([...heights].sort((a, b) => b - a)).toEqual(heights)
  })

  it('stands every figure on the floor', () => {
    for (const figure of familyFigures) expect(figure.box.y + figure.box.height).toBe(familyFloor)
  })

  it('draws no face: each figure is its body and its hair, nothing else', () => {
    for (const figure of familyFigures) {
      expect(Object.keys(figure).sort()).toEqual(['body', 'box', 'hair', 'id'])
      expect(JSON.stringify(figure)).not.toMatch(/face|eye|mouth|nose|brow|smile/i)
    }
  })

  it('closes every outline, so no stray inner line is drawn', () => {
    for (const figure of familyFigures) {
      for (const d of [figure.body, figure.hair, rimPath(figure)]) {
        expect((d.match(/M/g) ?? []).length).toBe((d.match(/Z/g) ?? []).length)
      }
    }
  })

  // Faceless by geometry, not only by name: a second closed shape inside a body or a hair (an eye, a
  // mouth) would keep the move and close counts equal above, so each is pinned to one subpath.
  it('draws every body and every hair as exactly one closed outline, so no eye or mouth can hide inside', () => {
    const subpaths = (d: string) => ({ moves: (d.match(/[Mm]/g) ?? []).length, closes: (d.match(/[Zz]/g) ?? []).length })
    for (const figure of familyFigures) {
      for (const d of [figure.body, figure.hair]) {
        expect(subpaths(d)).toEqual({ moves: 1, closes: 1 })
        // The one move opens the path and the one close ends it, so nothing is drawn after the close.
        expect(d.trim()).toMatch(/^[Mm][^Mm]*[Zz]$/)
      }
      // The rim of backlight strokes the body and the hair together: exactly their two outlines.
      expect(subpaths(rimPath(figure))).toEqual({ moves: 2, closes: 2 })
    }
  })

  it('gives mom straight hair and the others curls, dad the fullest afro', () => {
    expect(curls(byId.mom!.hair)).toBe(0)
    for (const id of ['dad', 'miguelito', 'mia']) expect(curls(byId[id]!.hair)).toBeGreaterThan(8)
    expect(curls(byId.dad!.hair)).toBeGreaterThan(curls(byId.miguelito!.hair))
  })
})
