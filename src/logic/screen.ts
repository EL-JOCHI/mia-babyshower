import { tuning } from '../tuning'

type ScreenTuning = typeof tuning.screen

// Design §9: how much larger than on a phone the HUD and the cards are drawn on this screen. 1 up
// to `fromPx` wide, growing in a straight line to `1 + grow` at `toPx`, and no larger after it.
// The head's --ui-px (src/headMeta.ts) is the same ramp in CSS.
export function screenScale(vw: number, t: ScreenTuning = tuning.screen): number {
  const share = Math.min(1, Math.max(0, (vw - t.fromPx) / (t.toPx - t.fromPx)))
  return 1 + t.grow * share
}
