import type { CatDrawing } from './types'

// Luz (Alegría): a round head and a high tail. Always about to pounce.
export const luz: CatDrawing = {
  ground: { cx: 60, rx: 27 },
  tail: {
    d: 'M78 106 C 93 104, 99 89, 97 72 C 96 62, 93 54, 95 44',
    tip: 'M95 44 C 97 33, 108 31, 108 40 C 108 46, 100 47, 101 41',
    width: 4.4,
    root: [78, 106],
    joint: [95, 44],
  },
  body: {
    d: 'M50 69 C 41 76, 35 90, 37 103 C 38 110, 45 112, 55 112 L 67 112 C 77 112, 83 108, 82 99 C 81 87, 75 76, 67 69 Z',
    origin: [59, 112],
    stitches: 'M72 86 C 76 92, 77 98, 75 104 M71 90 l6 1 M71 95 l6 0 M71 100 l6 -1',
  },
  legs: [
    { d: 'M51 88 C 50 97, 49 104, 49 110', width: 3, paw: [48, 110] },
    { d: 'M63 89 C 64 97, 64 104, 65 110', width: 3, paw: [66, 110] },
  ],
  collar: { d: 'M46 68 Q 58 75, 71 68', charm: 'sun', at: [58, 75] },
  head: {
    d: 'M34 50 C 33 36, 44 25, 57 25 C 70 25, 81 35, 80 49 C 80 53, 83 55, 79 57 C 77 64, 69 71, 57 71 C 45 71, 37 64, 35 57 C 31 55, 34 53, 34 50 Z',
    origin: [57, 68],
    turn: -8,
  },
  ears: {
    l: {
      d: 'M37 37 C 35 28, 35 20, 37 12 C 43 16, 48 22, 52 28 Z',
      inner: 'M40 32 C 39 27, 39 22, 40 18 C 43 21, 46 25, 48 28 Z',
      origin: [44, 32],
    },
    r: {
      d: 'M63 27 C 68 21, 73 16, 80 12 C 82 20, 82 29, 79 37 Z',
      inner: 'M66 28 C 70 24, 73 21, 77 18 C 78 23, 78 28, 76 32 Z',
      origin: [71, 31],
    },
  },
  eyes: [
    { x: 48, y: 47, r: 9.6 },
    { x: 67.5, y: 46, r: 7.8 },
  ],
  droop: 0,
  pupil: 0.42,
  nose: [57, 58],
  mouth: 'M52 61 q2.5 2.5 5 0 q2.5 2.5 5 0',
  whiskers: 'M43 58 L 37 57 M43 61 L 38 62 M71 57 L 77 56 M71 60 L 76 61',
  heart: [57, 6],
}
