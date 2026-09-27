import type { DayId } from '../content'
import { tuning, type MoodId, type ThemeName, type WorldLook } from '../tuning'

export type { MoodId }

// Spec §3: the invite link picks the mood (Saturday is a moonlit night, Sunday a golden dusk), and
// the theme picks its lighter (Claro) or darker (Oscuro) version. Never the clock: after the party
// the look stays the same.
export const moodOfDay: Record<DayId, MoodId> = { sat: 'saturday', sun: 'sunday' }

export interface MoodLook {
  mood: MoodId
  theme: ThemeName
  look: WorldLook
}

export function moodFor(day: DayId, theme: ThemeName): MoodLook {
  const mood = moodOfDay[day]
  return { mood, theme, look: tuning.world.looks[mood][theme] }
}
