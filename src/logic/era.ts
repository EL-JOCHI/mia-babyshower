import { tuning } from '../tuning'

// Design §1 Evolution: the book starts as a pencil sketch, becomes ink, and ends in light.
export type Stage = 'boceto' | 'tinta' | 'luz'

interface StageThresholds {
  color: number
  threeD: number
}

// BR-12: progress along the book picks the stage, with the existing tunable thresholds.
export function stageAt(position: number, t: StageThresholds = tuning.eras): Stage {
  if (position < t.color) return 'boceto'
  if (position < t.threeD) return 'tinta'
  return 'luz'
}
