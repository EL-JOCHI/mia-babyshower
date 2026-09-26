import type { CatDrawing } from './types'

// Nana (Delicadeza): upright and poised, ears shaped like a crown. Grooms on her throne.
export const nana: CatDrawing = {
  ground: { cx: 60, rx: 24 },
  tail: {
    d: 'M77 107 C 81 114, 68 115, 58 114 C 50 113, 44 112, 40 110',
    tip: 'M40 110 C 31 107, 32 98, 38 99 C 43 100, 42 106, 38 105',
    width: 4,
    root: [77, 107],
    joint: [40, 110],
    front: true,
  },
  body: {
    d: 'M52 63 C 45 69, 42 81, 43 95 C 43 106, 46 112, 54 112 L 67 112 C 75 112, 78 106, 78 95 C 78 81, 75 69, 68 63 Z',
    origin: [60, 112],
    stitches: 'M72 76 C 75 82, 76 88, 75 94 M70 79 l6 1 M71 84 l6 0 M71 89 l6 -1',
  },
  legs: [
    { d: 'M55 87 L 55 110', width: 2.8, paw: [54, 110], groom: true },
    { d: 'M65 87 L 65 110', width: 2.8, paw: [66, 110] },
  ],
  collar: { d: 'M48 62 Q 60 68, 72 62', charm: 'gem', at: [60, 68] },
  head: {
    d: 'M42 43 C 42 31, 50 24, 60 24 C 70 24, 78 31, 78 43 C 78 53, 70 60, 60 60 C 50 60, 42 53, 42 43 Z',
    origin: [60, 57],
    turn: -5,
  },
  ears: {
    l: {
      d: 'M43 35 L 40 14 L 45 21 L 48 10 L 51 22 L 56 18 L 55 27 Z',
      inner: 'M45 31 L 44 23 L 47 26 L 49 19 L 50 27 Z',
      origin: [48, 30],
      knobs: [
        [40, 14],
        [48, 10],
        [56, 18],
      ],
    },
    r: {
      d: 'M77 35 L 80 14 L 75 21 L 72 10 L 69 22 L 64 18 L 65 27 Z',
      inner: 'M75 31 L 76 23 L 73 26 L 71 19 L 70 27 Z',
      origin: [72, 30],
      knobs: [
        [80, 14],
        [72, 10],
        [64, 18],
      ],
    },
  },
  eyes: [
    { x: 52.5, y: 42, r: 6.6 },
    { x: 67.5, y: 41.5, r: 7.4 },
  ],
  droop: 0.2,
  pupil: 0.34,
  nose: [60, 50],
  mouth: 'M56 53 q2 2 4 0 q2 2 4 0',
  whiskers: 'M49 50 L 45 49.5 M49 53 L 46 54 M71 50 L 75 49.5 M71 53 L 74 54',
  heart: [60, 2],
}
