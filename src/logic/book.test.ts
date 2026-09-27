import { describe, expect, it, vi } from 'vitest'
import { days } from '../content'
import { tuning } from '../tuning'
import { roomLevel, shouldPreloadWorld, wantsBackdrop, wantsBook } from './book'

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

describe('three levels (spec §7)', () => {
  const env = { reducedMotion: false, height: 844, webgl: () => true, bookGaveWay: false, failed: false, backdropReady: false }

  it('gives the full book to a tall screen with motion allowed and WebGL', () => {
    expect(roomLevel(env)).toBe('book')
    expect(roomLevel({ ...env, height: tall })).toBe('book')
  })

  it('gives the diorama with reduced motion, without asking for WebGL', () => {
    const webgl = vi.fn(() => true)
    expect(roomLevel({ ...env, reducedMotion: true, webgl, backdropReady: true })).toBe('diorama')
    expect(webgl).not.toHaveBeenCalled()
  })

  it('gives the diorama without WebGL', () => {
    expect(roomLevel({ ...env, webgl: () => false, backdropReady: true })).toBe('diorama')
  })

  it('gives a short screen the live attic once it has arrived, and the diorama until then', () => {
    expect(roomLevel({ ...env, height: 390 })).toBe('diorama')
    expect(roomLevel({ ...env, height: 390, backdropReady: true })).toBe('backdrop')
  })

  it('gives the live attic after the book timed out or turned too short, once it has arrived', () => {
    expect(roomLevel({ ...env, bookGaveWay: true })).toBe('diorama')
    expect(roomLevel({ ...env, bookGaveWay: true, backdropReady: true })).toBe('backdrop')
  })

  it('gives the diorama for the rest of the visit after a lost context or an error', () => {
    expect(roomLevel({ ...env, failed: true, backdropReady: true })).toBe('diorama')
    expect(roomLevel({ ...env, height: 390, failed: true, backdropReady: true })).toBe('diorama')
  })

  it('loads the live attic only where it can show', () => {
    const start = { reducedMotion: false, height: 390, webgl: () => true, bookGaveWay: false, failed: false }
    expect(wantsBackdrop(start)).toBe(true)
    expect(wantsBackdrop({ ...start, height: 844 })).toBe(false)
    expect(wantsBackdrop({ ...start, height: 844, bookGaveWay: true })).toBe(true)
    expect(wantsBackdrop({ ...start, failed: true })).toBe(false)
    expect(wantsBackdrop({ ...start, reducedMotion: true })).toBe(false)
    expect(wantsBackdrop({ ...start, webgl: () => false })).toBe(false)
  })
})
