import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { idleNotice, isNoticing, noticeWaitMs, stepNotice, type NoticeInput } from './noticing'

// Waits and speeds come from the tuning module, so tuning them never breaks the suite (§7).
const n = tuning.noticing
const { comun, pocoComun, legendario } = n.waitMs
const rush = n.sustoRushPxPerS + 100
const moving = n.stillSpeedPxPerS + 100

const base: NoticeInput = { catId: 'luz', inZone: true, speed: 0, musicPlaying: false }

function run(input: NoticeInput, totalMs: number, stepMs = 100, start = idleNotice) {
  let timer = start
  for (let t = 0; t < totalMs; t += stepMs) timer = stepNotice(timer, input, stepMs)
  return timer
}

describe('noticing waits (§3 Noticing, US-9 AC9–11)', () => {
  it('uses the rarity waits, and a shorter wait for Misha while music plays', () => {
    expect(noticeWaitMs('luz', false)).toBe(comun)
    expect(noticeWaitMs('susto', false)).toBe(pocoComun)
    expect(noticeWaitMs('kira', false)).toBe(legendario)
    expect(noticeWaitMs('misha', false)).toBe(legendario)
    expect(noticeWaitMs('misha', true)).toBe(n.mishaMusicWaitMs)
    expect(noticeWaitMs('kira', true)).toBe(legendario)
  })

  it('notices a Común cat after its wait of stillness in the middle area, not one tick sooner', () => {
    expect(run(base, comun - 100).noticing).toBe(false)
    expect(run(base, comun).noticing).toBe(true)
  })

  it('does not notice while the cat is outside the middle area', () => {
    expect(run({ ...base, inZone: false }, 3000).noticing).toBe(false)
  })

  it('restarts the wait while the camera moves before noticing', () => {
    let timer = run(base, comun - 100)
    timer = stepNotice(timer, { ...base, speed: moving }, 100)
    expect(timer.stillMs).toBe(0)
    expect(run(base, comun - 100, 100, timer).noticing).toBe(false)
  })

  it('keeps noticing while the camera moves gently, once noticed', () => {
    const noticed = run(base, comun)
    expect(stepNotice(noticed, { ...base, speed: moving }, 100).noticing).toBe(true)
  })

  it('hides Susto and restarts his wait when the camera rushes past', () => {
    const susto: NoticeInput = { ...base, catId: 'susto' }
    const noticed = run(susto, pocoComun)
    expect(noticed.noticing).toBe(true)
    const rushed = stepNotice(noticed, { ...susto, speed: rush }, 100)
    expect(rushed.noticing).toBe(false)
    expect(rushed.stillMs).toBe(0)
  })

  it('makes Misha notice sooner with music than without', () => {
    const misha: NoticeInput = { ...base, catId: 'misha' }
    expect(run({ ...misha, musicPlaying: true }, n.mishaMusicWaitMs).noticing).toBe(true)
    expect(run(misha, n.mishaMusicWaitMs).noticing).toBe(false)
    expect(run(misha, legendario).noticing).toBe(true)
  })

  it('keeps Saludar for the linger time after the cat leaves the middle area', () => {
    const noticed = run(base, comun)
    const left = run({ ...base, inZone: false }, n.lingerMs - 100, 100, noticed)
    expect(left.noticing).toBe(true)
    expect(run({ ...base, inZone: false }, 100, 100, left).noticing).toBe(false)
  })

  it('agrees with the single-shot check', () => {
    expect(isNoticing({ ...base, stillMs: comun })).toBe(true)
    expect(isNoticing({ ...base, stillMs: comun - 1 })).toBe(false)
    expect(isNoticing({ ...base, catId: 'susto', stillMs: 5000, speed: rush })).toBe(false)
    expect(isNoticing({ ...base, inZone: false, stillMs: 5000 })).toBe(false)
  })
})
