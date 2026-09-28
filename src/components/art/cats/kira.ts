import type { CatDrawing } from './types'

// Kira (Asombro), as the real Kira: a long-furred brown-gray tabby with tiger stripes (an M on the
// forehead, bars on the cheeks and flanks), a white chin, chest, and paws, amber-green eyes full of
// stars (tuning.cats.eyes), and a fuller ruff. Slim and tall with tall ears, sitting taller than
// Misha.
export const kira: CatDrawing = {
  coat: {
    kind: 'kira',
    body: [
      { d: 'M53 57 C 56 62, 64 62, 67 57 C 70 66, 66 77, 60 81 C 54 77, 50 66, 53 57 Z', paint: 'white' },
      {
        d: 'M47 70 C 50 71, 51 73, 50 75 M47 90 C 50 91, 51 93, 50 96 M73 70 C 70 71, 69 73, 70 75 M74 80 C 70 81, 69 83, 70 86 M73 90 C 70 91, 69 93, 70 96',
        paint: 'stripe',
      },
    ],
    head: [
      { d: 'M55 25 C 56 28, 56 30, 55 32 M60 23 L 60 31 M65 25 C 64 28, 64 30, 65 32', paint: 'stripe' },
      { d: 'M45 41 L 50 42 M45 45 L 50 45 M75 41 L 70 42 M75 45 L 70 45', paint: 'stripe' },
      { d: 'M53 46 C 55 43, 65 43, 67 46 C 68 51, 65 56, 60 57 C 55 56, 52 51, 53 46 Z', paint: 'white' },
    ],
    paws: 'white',
  },
  ground: { cx: 62, rx: 22 },
  tail: {
    d: 'M72 108 C 86 108, 92 98, 90 84 C 89 76, 86 70, 88 62',
    tip: 'M88 62 C 90 53, 100 53, 99 61 C 98 66, 91 66, 92 61',
    width: 3.8,
    root: [72, 108],
    joint: [88, 62],
  },
  body: {
    d: 'M52 55 C 46 57, 44 61, 47 65 C 44 71, 45 80, 46 93 C 46 105, 49 112, 55 112 L 65 112 C 71 112, 74 105, 74 93 C 75 80, 76 71, 73 65 C 76 61, 74 57, 68 55 Z',
    origin: [60, 112],
    stitches: 'M49 77 C 48.5 80.5, 48.5 84.5, 49 88 M47 79 l5 0.6 M46.8 82.5 l5 0 M47 86 l5 -0.6',
  },
  legs: [
    { d: 'M55 83 C 55 95, 54 103, 54 110', width: 2.6, paw: [53, 110] },
    { d: 'M65 83 C 65 95, 66 103, 66 110', width: 2.6, paw: [67, 110] },
  ],
  collar: { d: 'M50 57 Q 60 62, 70 57', charm: 'star', at: [60, 63] },
  head: {
    d: 'M44 39 C 44 28, 51 21, 60 21 C 69 21, 76 28, 76 39 C 76 42, 79 44, 76 46 C 78 48, 75 50, 74 50 C 71 55, 66 57, 60 57 C 54 57, 49 55, 46 50 C 45 50, 42 48, 44 46 C 41 44, 44 42, 44 39 Z',
    origin: [60, 53],
    turn: -7,
    tufts: 'M44 46 l-3 1 M76 46 l3 1',
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
