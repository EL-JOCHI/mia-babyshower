import { describe, expect, it, vi } from 'vitest'
import { days } from '../content'
import { tuning } from '../tuning'
import { shouldPreloadWorld, wantsBook } from './book'

const tall = tuning.world.minHeightPx
const guest = { reducedMotion: false, height: 844, webgl: () => true }

describe('the 3D book or the flat room (design §2)', () => {
  it('gives the book to a screen tall enough, with motion allowed and WebGL', () => {
    expect(wantsBook(guest)).toBe(true)
    expect(wantsBook({ ...guest, height: tall })).toBe(true)
  })

  it('gives the flat room with reduced motion, without checking WebGL', () => {
    const webgl = vi.fn(() => true)
    expect(wantsBook({ ...guest, reducedMotion: true, webgl })).toBe(false)
    expect(webgl).not.toHaveBeenCalled()
  })

  it('gives the flat room without WebGL', () => {
    expect(wantsBook({ ...guest, webgl: () => false })).toBe(false)
  })

  // Design §9: a page is never drawn below its minimum scale, so a screen too short to show one
  // whole at that scale (a phone held sideways, a small phone with its toolbars) gets the flat room.
  it.each([390, 430, 553, 600])('gives the flat room to a screen %i px tall', (height) => {
    expect(wantsBook({ ...guest, height })).toBe(false)
  })

  it('keeps the book for a phone in a browser or in WhatsApp, with its toolbars', () => {
    for (const height of [640, 659, 660, 664, 844]) expect(wantsBook({ ...guest, height })).toBe(true)
  })
})

describe('preloading the book (design §2 Loading)', () => {
  it('fetches the book at page start for a guest on a day link who will get it', () => {
    expect(shouldPreloadWorld(`?e=${days.sat.code}`, guest)).toBe(true)
    expect(shouldPreloadWorld(`?e=${days.sun.code}`, guest)).toBe(true)
  })

  it('does not fetch it on the gate, with reduced motion, without WebGL, or on a short screen', () => {
    expect(shouldPreloadWorld('', guest)).toBe(false)
    expect(shouldPreloadWorld('?e=nope', guest)).toBe(false)
    expect(shouldPreloadWorld(`?e=${days.sat.code}`, { ...guest, reducedMotion: true })).toBe(false)
    expect(shouldPreloadWorld(`?e=${days.sat.code}`, { ...guest, webgl: () => false })).toBe(false)
    expect(shouldPreloadWorld(`?e=${days.sat.code}`, { ...guest, height: 390 })).toBe(false)
  })
})
