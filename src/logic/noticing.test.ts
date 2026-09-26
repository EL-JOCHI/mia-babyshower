import { describe, expect, it } from 'vitest'
import { idleNotice, isNoticing, noticeWaitMs, stepNotice, type NoticeInput } from './noticing'

const base: NoticeInput = { catId: 'luz', inZone: true, speed: 0, musicPlaying: false }

function run(input: NoticeInput, totalMs: number, stepMs = 100, start = idleNotice) {
  let timer = start
  for (let t = 0; t < totalMs; t += stepMs) timer = stepNotice(timer, input, stepMs)
  return timer
}

describe('noticing waits (§3 Noticing, US-9 AC9–11)', () => {
  it('uses the rarity waits, and a shorter wait for Misha while music plays', () => {
    expect(noticeWaitMs('luz', false)).toBe(500)
    expect(noticeWaitMs('susto', false)).toBe(1500)
    expect(noticeWaitMs('kira', false)).toBe(2500)
    expect(noticeWaitMs('misha', false)).toBe(2500)
    expect(noticeWaitMs('misha', true)).toBe(1200)
    expect(noticeWaitMs('kira', true)).toBe(2500)
  })

  it('notices a Común cat after 0.5 s of stillness in the middle area, not at 0.4 s', () => {
    expect(run(base, 400).noticing).toBe(false)
    expect(run(base, 500).noticing).toBe(true)
  })

  it('does not notice while the cat is outside the middle area', () => {
    expect(run({ ...base, inZone: false }, 3000).noticing).toBe(false)
  })

  it('restarts the wait while the camera moves before noticing', () => {
    let timer = run(base, 400)
    timer = stepNotice(timer, { ...base, speed: 300 }, 100)
    expect(timer.stillMs).toBe(0)
    expect(run(base, 400, 100, timer).noticing).toBe(false)
  })

  it('keeps noticing while the camera moves gently, once noticed', () => {
    const noticed = run(base, 500)
    expect(stepNotice(noticed, { ...base, speed: 300 }, 100).noticing).toBe(true)
  })

  it('hides Susto and restarts his wait when the camera rushes past', () => {
    const susto: NoticeInput = { ...base, catId: 'susto' }
    const noticed = run(susto, 1500)
    expect(noticed.noticing).toBe(true)
    const rushed = stepNotice(noticed, { ...susto, speed: 700 }, 100)
    expect(rushed.noticing).toBe(false)
    expect(rushed.stillMs).toBe(0)
  })

  it('makes Misha notice after 1.2 s with music and 2.5 s without', () => {
    const misha: NoticeInput = { ...base, catId: 'misha' }
    expect(run({ ...misha, musicPlaying: true }, 1200).noticing).toBe(true)
    expect(run(misha, 1200).noticing).toBe(false)
    expect(run(misha, 2500).noticing).toBe(true)
  })

  it('keeps Saludar for 1 s after the cat leaves the middle area', () => {
    const noticed = run(base, 500)
    const left = run({ ...base, inZone: false }, 900, 100, noticed)
    expect(left.noticing).toBe(true)
    expect(run({ ...base, inZone: false }, 100, 100, left).noticing).toBe(false)
  })

  it('agrees with the single-shot check', () => {
    expect(isNoticing({ ...base, stillMs: 500 })).toBe(true)
    expect(isNoticing({ ...base, stillMs: 499 })).toBe(false)
    expect(isNoticing({ ...base, catId: 'susto', stillMs: 5000, speed: 700 })).toBe(false)
    expect(isNoticing({ ...base, inZone: false, stillMs: 5000 })).toBe(false)
  })
})
