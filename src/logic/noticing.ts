import { catById, type CatId } from '../content'
import { tuning } from '../tuning'

type NoticingTuning = typeof tuning.noticing

export interface NoticeInput {
  catId: CatId
  inZone: boolean
  speed: number
  musicPlaying: boolean
}

export interface NoticeTimer {
  stillMs: number
  noticing: boolean
  lingerMs: number
}

export const idleNotice: NoticeTimer = { stillMs: 0, noticing: false, lingerMs: 0 }

export function noticeWaitMs(catId: CatId, musicPlaying: boolean, t: NoticingTuning = tuning.noticing): number {
  if (catId === 'misha' && musicPlaying) return t.mishaMusicWaitMs
  const own: Partial<Record<CatId, number>> = t.catWaitMs
  return own[catId] ?? t.waitMs[catById(catId).rarity]
}

function rushed(input: NoticeInput, t: NoticingTuning): boolean {
  return input.catId === 'susto' && input.speed > t.sustoRushPxPerS
}

// §3 Noticing: a single-shot check from how long the camera has been still with the cat in the middle area.
export function isNoticing(input: NoticeInput & { stillMs: number }, t: NoticingTuning = tuning.noticing): boolean {
  if (!input.inZone || rushed(input, t)) return false
  return input.stillMs >= noticeWaitMs(input.catId, input.musicPlaying, t)
}

// The same rules over time: one step of dtMs. Saludar stays while the cat is in the middle area,
// and leaves lingerMs after it leaves.
export function stepNotice(
  prev: NoticeTimer,
  input: NoticeInput,
  dtMs: number,
  t: NoticingTuning = tuning.noticing,
): NoticeTimer {
  if (!input.inZone) {
    if (!prev.noticing) return idleNotice
    const lingerMs = prev.lingerMs - dtMs
    return lingerMs > 0 ? { stillMs: 0, noticing: true, lingerMs } : idleNotice
  }
  if (rushed(input, t)) return idleNotice

  const still = input.speed < t.stillSpeedPxPerS
  const stillMs = still ? prev.stillMs + dtMs : prev.noticing ? prev.stillMs : 0
  const noticing = prev.noticing || isNoticing({ ...input, stillMs }, t)
  return { stillMs, noticing, lingerMs: t.lingerMs }
}
