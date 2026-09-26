import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { applyEvent, countablePages, emptyProgress, levelFor, sanitizeProgress } from './progress'
import { landmarksFor } from './layout'

const x = tuning.progress
const all = countablePages(landmarksFor(false))

describe('pages and badges', () => {
  it('counts every landmark except the cover', () => {
    expect(all).toEqual(['palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'])
    expect(countablePages(landmarksFor(true))).toEqual(['palabra', 'cuando', 'familia'])
  })
  it('awards the page badge once, and the page is stored once', () => {
    const a = applyEvent(emptyProgress, { type: 'reachedPage', page: 'cuando', pages: all })
    expect(a.awards).toEqual([{ badge: 'fecha', xp: x.badgeXp.fecha }])
    const b = applyEvent(a.progress, { type: 'reachedPage', page: 'cuando', pages: all })
    expect(b.awards).toEqual([])
    expect(b.progress.pages).toEqual(['cuando'])
  })
  it('ignores the cover and pages that are not on this page', () => {
    expect(applyEvent(emptyProgress, { type: 'reachedPage', page: 'llegada', pages: all }).awards).toEqual([])
    const after = countablePages(landmarksFor(true))
    expect(applyEvent(emptyProgress, { type: 'reachedPage', page: 'donde', pages: after }).awards).toEqual([])
  })
  it('stores a page with no badge of its own (Confirmar) without XP', () => {
    const r = applyEvent(emptyProgress, { type: 'reachedPage', page: 'confirmar', pages: all })
    expect(r.progress.pages).toEqual(['confirmar'])
    expect(r.awards).toEqual([])
  })
  it('awards Cuento completo when the last page is found', () => {
    let p = emptyProgress
    for (const page of all.slice(0, -1)) p = applyEvent(p, { type: 'reachedPage', page, pages: all }).progress
    const r = applyEvent(p, { type: 'reachedPage', page: 'familia', pages: all })
    expect(r.awards.map((a) => a.badge)).toEqual(['puerta', 'cuentoCompleto'])
  })
  it('awards the one-off badges once', () => {
    const moved = applyEvent(emptyProgress, { type: 'moved' })
    expect(moved.awards).toEqual([{ badge: 'openBook', xp: x.badgeXp.openBook }])
    expect(applyEvent(moved.progress, { type: 'moved' }).awards).toEqual([])
    expect(applyEvent(emptyProgress, { type: 'confirmed' }).awards[0]?.badge).toBe('sellada')
    expect(applyEvent(emptyProgress, { type: 'savedQr' }).awards[0]?.badge).toBe('qrGuardado')
  })
})

describe('cats', () => {
  it('gives rarity XP, plus Tu primer gato on the first', () => {
    const r = applyEvent(emptyProgress, { type: 'metCat', cat: 'luz', metCount: 1 })
    expect(r.awards).toEqual([{ xp: x.catXp.comun }, { badge: 'primerGato', xp: x.badgeXp.primerGato }])
    expect(r.progress.xp).toBe(x.catXp.comun + x.badgeXp.primerGato)
  })
  it('awards Todos los gatos on the seventh cat', () => {
    const r = applyEvent({ ...emptyProgress, badges: ['primerGato'] }, { type: 'metCat', cat: 'kira', metCount: 7 })
    expect(r.awards.map((a) => a.badge ?? 'cat')).toEqual(['cat', 'todosLosGatos'])
    expect(r.awards[0]?.xp).toBe(x.catXp.legendario)
  })
})

describe('levels', () => {
  it('maps XP to levels and the next threshold', () => {
    expect(levelFor(0)).toEqual({ level: 1, floor: 0, next: x.levels[1] })
    expect(levelFor(x.levels[2]!)).toEqual({ level: 3, floor: x.levels[2], next: x.levels[3] })
    expect(levelFor(99999)).toEqual({ level: 5, floor: x.levels[4], next: null })
  })
})

describe('sanitizeProgress', () => {
  it('drops junk and unknown values', () => {
    for (const raw of [null, 'x', 3, [], { pages: 'cuando' }]) expect(sanitizeProgress(raw)).toEqual(emptyProgress)
    expect(sanitizeProgress({ pages: ['cuando', 'nope', 'cuando'], badges: ['fecha', 'fake'], xp: -5 })).toEqual({
      pages: ['cuando'], badges: ['fecha'], xp: 0,
    })
  })
})
