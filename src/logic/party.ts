import { days, type DayId } from '../content'

// US-5, BR-11: a day's party is over from midnight at the end of its calendar day, Bolivia time.
export function isPartyOver(day: DayId, now: number): boolean {
  return now >= Date.parse(days[day].overFrom)
}
