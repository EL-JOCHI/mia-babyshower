import type { CatDrawing } from './types'

// Chona (Energía): the energetic Misha, mid-leap in Misha's white-and-silver coat. Stretched out,
// front paws reaching ahead, back paws kicking off, her tail streaming behind.
export const chona: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M40 56 C 50 54, 60 56, 64 60 C 62 68, 52 70, 44 68 C 38 66, 36 60, 40 56 Z', paint: 'patch' },
      { d: 'M22 70 C 24 62, 32 60, 36 64 C 36 72, 30 78, 24 78 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M70 30 L 108 30 L 108 46 C 104 43, 100 42, 97 44 C 95 40, 92 38, 90 38 C 88 38, 86 40, 85 44 C 81 42, 76 43, 70 46 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 58, rx: 30 },
  tail: {
    d: 'M27 66 C 18 60, 14 50, 17 40',
    tip: 'M17 40 C 19 31, 29 30, 29 37 C 29 42, 22 42, 23 37',
    width: 4,
    root: [27, 66],
    joint: [17, 40],
  },
  body: {
    d: 'M26 68 C 30 58, 46 56, 60 58 C 70 59, 80 58, 86 62 C 92 68, 88 80, 78 82 C 66 84, 52 82, 40 84 C 30 86, 22 78, 26 68 Z',
    origin: [56, 84],
    stitches: 'M50 72 C 56 74, 62 74, 68 72 M53 70 l-1 5 M59 71 l0 5 M65 70 l1 5',
  },
  legs: [
    { d: 'M80 78 C 88 84, 96 88, 104 90', width: 3, paw: [105, 90] },
    { d: 'M72 81 C 78 88, 84 94, 90 98', width: 3, paw: [91, 98] },
    { d: 'M34 80 C 26 86, 18 90, 10 92', width: 3.2, paw: [9, 92] },
    { d: 'M42 83 C 36 90, 30 95, 22 99', width: 3.2, paw: [21, 99] },
  ],
  collar: { d: 'M76 60 Q 82 67, 88 63', charm: 'bolt', at: [82, 68] },
  head: {
    d: 'M73 50 C 73 40, 80 34, 89 34 C 98 34, 104 40, 104 50 C 104 58, 98 64, 89 64 C 80 64, 73 58, 73 50 Z',
    origin: [86, 62],
    turn: -6,
  },
  ears: {
    l: {
      d: 'M76 42 C 75 36, 76 30, 78 25 C 82 28, 85 32, 86 35 Z',
      inner: 'M78 38 C 78 34, 78 31, 79 28 C 81 30, 83 32, 84 35 Z',
      origin: [81, 38],
    },
    r: {
      d: 'M92 35 C 95 31, 99 28, 103 26 C 104 31, 104 37, 102 42 Z',
      inner: 'M94 35 C 96 33, 99 31, 101 30 C 102 33, 102 36, 101 39 Z',
      origin: [98, 37],
    },
  },
  eyes: [
    { x: 83, y: 49, r: 6.2 },
    { x: 96, y: 48.5, r: 5.4 },
  ],
  droop: 0,
  pupil: 0.4,
  nose: [89.5, 56],
  mouth: 'M86 59 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M80 56 L 75 55 M80 59 L 76 60 M99 55 L 104 54 M99 58 L 103 59',
  heart: [89, 12],
}
