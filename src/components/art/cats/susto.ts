import type { CatDrawing } from './types'

// Chavela (Temor): Susto's shy, peeking look in a black coat. Small, ears flat back, huge eyes, a
// scruffy cowlick. Hides, then peeks.
export const susto: CatDrawing = {
  coat: { kind: 'black' },
  ground: { cx: 60, rx: 19 },
  tail: {
    d: 'M74 108 C 83 110, 88 105, 87 99',
    tip: 'M87 99 C 86 92, 78 92, 79 97 C 80 100, 84 100, 83 97',
    width: 3.4,
    root: [74, 108],
    joint: [87, 99],
  },
  body: {
    d: 'M51 91 C 45 95, 42 103, 44 109 C 45 112, 50 112, 54 112 L 66 112 C 71 112, 76 111, 76 106 C 76 100, 73 94, 69 91 Z',
    origin: [60, 112],
    stitches: 'M69 96 l4 3 M73 96 l-4 3 M70 102 l4 3 M74 102 l-4 3',
  },
  legs: [
    { d: 'M54 99 C 56 104, 53 107, 54 110', width: 2.6, paw: [53, 110] },
    { d: 'M64 99 C 62 104, 66 107, 65 110', width: 2.6, paw: [66, 110] },
  ],
  collar: { d: 'M50 92 Q 60 97, 70 92', charm: 'bell', at: [60, 97] },
  head: {
    d: 'M43 77 C 42 67, 50 60, 58 60 C 57 57, 59 55, 60 58 C 61 55, 64 55, 63 60 C 71 61, 78 67, 77 77 C 77 80, 79 82, 77 84 C 75 90, 68 94, 60 94 C 52 94, 45 90, 43 85 C 41 83, 43 80, 43 77 Z',
    origin: [60, 92],
    turn: 7,
  },
  ears: {
    l: {
      d: 'M47 63 C 43 64, 39 66, 35 70 C 39 72, 43 72, 46 71 Z',
      inner: '',
      origin: [46, 67],
    },
    r: {
      d: 'M73 63 C 77 64, 81 66, 85 70 C 81 72, 77 72, 74 71 Z',
      inner: '',
      origin: [74, 67],
    },
  },
  eyes: [
    { x: 52, y: 78, r: 7.6 },
    { x: 68.5, y: 77.5, r: 8.8 },
  ],
  droop: 0,
  pupil: 0.3,
  nose: [60, 87],
  mouth: 'M57 90 q1.5 -1.5 3 0 q1.5 1.5 3 0',
  whiskers: 'M49 86 L 45 85.5 M49 89 L 46 89.5 M71 86 L 75 85.5 M71 89 L 74 89.5',
  heart: [60, 44],
}
