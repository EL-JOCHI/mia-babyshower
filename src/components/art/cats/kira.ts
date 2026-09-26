import type { CatDrawing } from './types'

// Kira (Asombro): slim and tall with tall ears, sitting taller than Misha, eyes full of stars.
export const kira: CatDrawing = {
  ground: { cx: 62, rx: 22 },
  tail: {
    d: 'M72 108 C 86 108, 92 98, 90 84 C 89 76, 86 70, 88 62',
    tip: 'M88 62 C 90 53, 100 53, 99 61 C 98 66, 91 66, 92 61',
    width: 3.4,
    root: [72, 108],
    joint: [88, 62],
  },
  body: {
    d: 'M53 57 C 47 65, 45 79, 46 93 C 46 105, 49 112, 55 112 L 65 112 C 71 112, 74 105, 74 93 C 75 79, 73 65, 67 57 Z',
    origin: [60, 112],
    stitches: 'M49 74 C 48 80, 48 86, 49 92 M47 77 l5 1 M46 82 l5 0 M46 87 l5 -1',
  },
  legs: [
    { d: 'M55 83 C 55 95, 54 103, 54 110', width: 2.6, paw: [53, 110] },
    { d: 'M65 83 C 65 95, 66 103, 66 110', width: 2.6, paw: [67, 110] },
  ],
  collar: { d: 'M50 57 Q 60 62, 70 57', charm: 'star', at: [60, 63] },
  head: {
    d: 'M44 39 C 44 28, 51 21, 60 21 C 69 21, 76 28, 76 39 C 76 48, 69 55, 60 55 C 51 55, 44 48, 44 39 Z',
    origin: [60, 53],
    turn: -7,
  },
  ears: {
    l: {
      d: 'M46 31 C 44 21, 44 11, 46 3 C 51 9, 55 16, 57 22 Z',
      inner: 'M48 26 C 47 20, 47 14, 48 9 C 51 13, 53 17, 54 21 Z',
      origin: [50, 26],
    },
    r: {
      d: 'M63 22 C 66 15, 70 8, 75 3 C 77 11, 77 21, 74 31 Z',
      inner: 'M66 21 C 68 16, 70 12, 73 9 C 74 14, 74 20, 72 26 Z',
      origin: [70, 26],
    },
  },
  eyes: [
    { x: 52.5, y: 38, r: 7.2 },
    { x: 67.5, y: 37.5, r: 6.4 },
  ],
  droop: 0,
  pupil: 0.34,
  starEyes: true,
  nose: [60, 46],
  mouth: 'M56 49 q2 2 4 0 q2 2 4 0',
  whiskers: 'M50 46 L 46 45.5 M50 49 L 47 50 M70 46 L 74 45.5 M70 49 L 73 50',
  heart: [84, 14],
}
