import { catById, type CatId } from '../content'
import { tuning } from '../tuning'
import type { LandmarkId } from './layout'

export type BadgeId = keyof typeof tuning.progress.badgeXp
export interface Progress { pages: LandmarkId[]; badges: BadgeId[]; xp: number }
export interface Award { badge?: BadgeId; xp: number }
export type ProgressEvent =
  | { type: 'moved' }
  | { type: 'reachedPage'; page: LandmarkId; pages: LandmarkId[] }
  | { type: 'confirmed' }
  | { type: 'savedQr' }
  | { type: 'metCat'; cat: CatId; metCount: number }

export const emptyProgress: Progress = { pages: [], badges: [], xp: 0 }

const pageBadge: Partial<Record<LandmarkId, BadgeId>> = {
  palabra: 'palabra', cuando: 'fecha', donde: 'lugar', presente: 'regalo', familia: 'puerta',
}

export function countablePages(ids: LandmarkId[]): LandmarkId[] {
  return ids.filter((id) => id !== 'llegada')
}

function earn(p: Progress, awards: Award[], badge: BadgeId): Progress {
  if (p.badges.includes(badge)) return p
  const xp = tuning.progress.badgeXp[badge]
  awards.push({ badge, xp })
  return { ...p, badges: [...p.badges, badge], xp: p.xp + xp }
}

export function applyEvent(p: Progress, e: ProgressEvent): { progress: Progress; awards: Award[] } {
  const awards: Award[] = []
  let next = p
  switch (e.type) {
    case 'moved':
      next = earn(next, awards, 'openBook')
      break
    case 'confirmed':
      next = earn(next, awards, 'sellada')
      break
    case 'savedQr':
      next = earn(next, awards, 'qrGuardado')
      break
    case 'reachedPage': {
      if (!e.pages.includes(e.page) || next.pages.includes(e.page)) break
      next = { ...next, pages: [...next.pages, e.page] }
      const badge = pageBadge[e.page]
      if (badge) next = earn(next, awards, badge)
      if (e.pages.every((page) => next.pages.includes(page))) next = earn(next, awards, 'cuentoCompleto')
      break
    }
    case 'metCat': {
      const xp = tuning.progress.catXp[catById(e.cat).rarity]
      awards.push({ xp })
      next = { ...next, xp: next.xp + xp }
      next = earn(next, awards, 'primerGato')
      if (e.metCount >= 7) next = earn(next, awards, 'todosLosGatos')
      break
    }
  }
  return { progress: next, awards }
}

export function levelFor(xp: number): { level: number; floor: number; next: number | null } {
  const levels = tuning.progress.levels
  let i = 0
  while (i + 1 < levels.length && xp >= levels[i + 1]!) i++
  return { level: i + 1, floor: levels[i]!, next: levels[i + 1] ?? null }
}

const pageIds: ReadonlySet<string> = new Set(['palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'])
const badgeIds: ReadonlySet<string> = new Set(Object.keys(tuning.progress.badgeXp))

function unique<T extends string>(raw: unknown, allowed: ReadonlySet<string>): T[] | null {
  if (!Array.isArray(raw)) return null
  const out: T[] = []
  for (const v of raw) if (typeof v === 'string' && allowed.has(v) && !out.includes(v as T)) out.push(v as T)
  return out
}

export function sanitizeProgress(raw: unknown): Progress {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return emptyProgress
  const r = raw as Record<string, unknown>
  const pages = unique<LandmarkId>(r.pages, pageIds)
  const badges = unique<BadgeId>(r.badges, badgeIds)
  if (!pages || !badges) return emptyProgress
  const xp = typeof r.xp === 'number' && Number.isFinite(r.xp) && r.xp > 0 ? Math.floor(r.xp) : 0
  return { pages, badges, xp }
}
