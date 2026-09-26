import { days, type DayId } from '../content'

export type Opening = { kind: 'gate' } | { kind: 'day'; day: DayId }

// US-8, BR-9: only the two codes open a party. The clock is not an input.
export function resolveInvite(search: string): Opening {
  const code = new URLSearchParams(search).get('e')?.trim().toLowerCase()
  if (!code) return { kind: 'gate' }
  const day = (Object.keys(days) as DayId[]).find((id) => days[id].code === code)
  return day ? { kind: 'day', day } : { kind: 'gate' }
}
