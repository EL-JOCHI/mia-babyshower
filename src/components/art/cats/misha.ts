import type { CatDrawing } from './types'

// Misha (Calma), as the real Misha: white with silver-gray patches (a gray cap over the ears and the
// crown that comes down the sides of her face, with a white blaze rising between the eyes; gray
// patches on the back and the flank; a gray tail),
// a pink nose, green eyes (tuning.cats.eyes), and short fur. Long and calm, lying by the door, with
// slow, heavy lids.
export const misha: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M30 80 C 38 77, 52 77, 60 80 C 62 86, 56 92, 46 92 C 36 92, 29 88, 30 80 Z', paint: 'patch' },
      { d: 'M62 84 C 70 82, 80 84, 84 90 C 86 97, 78 101, 70 99 C 63 97, 60 90, 62 84 Z', paint: 'patch' },
      { d: 'M14 96 C 16 88, 24 84, 30 86 C 32 92, 28 100, 20 102 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M74 50 L 110 50 L 110 73 C 108 69, 106 66, 104 64 C 100 62, 97 62, 95 61 C 93.5 60, 92.5 58, 92 56.5 C 91.5 58, 90.5 60, 89 61 C 87 62, 84 62, 80 64 C 78 66, 76 69, 74 73 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 60, rx: 46 },
  tail: {
    d: 'M20 97 C 8 89, 7 72, 13 60 C 16 53, 16 46, 18 39',
    tip: 'M18 39 C 19 30, 29 28, 30 35 C 31 41, 24 42, 24 37',
    width: 4.4,
    root: [20, 97],
    joint: [18, 39],
  },
  body: {
    d: 'M16 100 C 14 90, 24 82, 40 81 L 76 80 C 90 80, 98 88, 98 98 C 98 107, 92 112, 82 112 L 26 112 C 19 112, 16 107, 16 100 Z',
    origin: [56, 112],
    stitches: 'M46 82 C 52 85, 58 85, 64 82 M49 80 l-1 6 M55 81 l0 6 M61 80 l1 6',
  },
  legs: [
    { d: 'M84 103 C 92 105, 99 107, 106 109', width: 3, paw: [107, 109] },
    { d: 'M78 108 C 86 110, 93 111, 100 111', width: 3, paw: [101, 111] },
  ],
  collar: { d: 'M79 81 Q 89 88, 101 83', charm: 'moon', at: [90, 88] },
  head: {
    d: 'M76 71 C 76 60, 83 53, 92 53 C 101 53, 108 60, 108 71 C 108 80, 101 86, 92 86 C 83 86, 76 80, 76 71 Z',
    origin: [88, 84],
    turn: -6,
  },
  ears: {
    l: {
      d: 'M79 61 C 78 55, 79 49, 81 44 C 85 47, 88 51, 90 54 Z',
      inner: 'M81 57 C 81 54, 81 51, 82 48 C 84 50, 86 52, 87 54 Z',
      origin: [84, 57],
    },
    r: {
      d: 'M95 54 C 99 50, 103 47, 107 45 C 108 50, 108 56, 106 61 Z',
      inner: 'M98 54 C 100 52, 102 50, 105 49 C 105 52, 105 55, 104 58 Z',
      origin: [101, 56],
    },
  },
  eyes: [
    { x: 85.5, y: 70, r: 5.8 },
    { x: 99, y: 69.5, r: 6.6 },
  ],
  droop: 0.4,
  pupil: 0.3,
  nose: [92, 77],
  mouth: 'M88 80 q2 2 4 0 q2 2 4 0',
  whiskers: 'M83 77 L 79 76.5 M83 80 L 80 81 M101 77 L 105 76.5 M101 80 L 104 81',
  heart: [92, 34],
}
