import { tuning } from '../tuning'

export type Era = 'pixel' | 'color' | '3d'

interface EraThresholds {
  color: number
  threeD: number
}

// US-7, BR-12: horizontal camera position picks the era. Vertical movement does not.
export function eraAt(position: number, t: EraThresholds = tuning.eras): Era {
  if (position < t.color) return 'pixel'
  if (position < t.threeD) return 'color'
  return '3d'
}
