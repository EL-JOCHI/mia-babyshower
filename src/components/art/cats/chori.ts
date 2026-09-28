import type { CatDrawing } from './types'

// Chori (Apapacho): the round, chubby Misha, sprawled belly-up in Misha's white-and-silver coat, her
// paws in the air and her head resting on the floor. Calm, round, and always hungry.
export const chori: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M86 76 C 94 82, 100 92, 98 102 C 92 104, 86 98, 84 90 C 82 84, 82 78, 86 76 Z', paint: 'patch' },
      { d: 'M34 88 C 36 80, 42 76, 48 76 C 50 84, 46 92, 38 94 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M6 66 L 50 66 L 50 84 C 46 81, 42 80, 39 81 C 36 77, 32 76, 28 76 C 25 76, 22 78, 20 81 C 16 80, 10 81, 6 84 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 58, rx: 46 },
  tail: {
    d: 'M96 100 C 106 100, 112 92, 110 82',
    tip: 'M110 82 C 109 73, 100 72, 101 79 C 102 83, 107 83, 106 79',
    width: 4.4,
    root: [96, 100],
    joint: [110, 82],
  },
  body: {
    d: 'M30 96 C 30 80, 46 70, 64 70 C 84 70, 98 82, 98 96 C 98 106, 90 112, 78 112 L 46 112 C 36 112, 30 106, 30 96 Z',
    origin: [64, 112],
    stitches: 'M56 96 C 62 99, 68 99, 74 96 M59 94 l-1 5 M65 95 l0 5 M71 94 l1 5',
  },
  legs: [
    { d: 'M50 76 C 47 72, 44 69, 43 64', width: 3.4, paw: [43, 63] },
    { d: 'M60 72 C 58 68, 58 64, 60 60', width: 3.4, paw: [60, 59] },
    { d: 'M76 72 C 78 68, 79 65, 82 62', width: 3.4, paw: [82, 61] },
    { d: 'M87 78 C 90 74, 93 72, 97 71', width: 3.4, paw: [98, 70] },
  ],
  collar: { d: 'M44 82 Q 50 91, 45 101', charm: 'fish', at: [52, 93] },
  head: {
    d: 'M10 92 C 10 80, 18 73, 28 73 C 38 73, 45 80, 45 91 C 45 101, 38 107, 28 107 C 18 107, 10 101, 10 92 Z',
    origin: [28, 105],
    turn: 8,
  },
  ears: {
    l: {
      d: 'M12 84 C 10 78, 11 72, 13 67 C 17 70, 20 74, 22 77 Z',
      inner: 'M14 80 C 13 77, 13 74, 14 71 C 16 73, 18 75, 20 77 Z',
      origin: [17, 79],
    },
    r: {
      d: 'M33 76 C 36 72, 40 69, 44 67 C 45 72, 45 78, 43 83 Z',
      inner: 'M35 76 C 37 74, 40 72, 42 71 C 43 74, 43 77, 42 80 Z',
      origin: [39, 78],
    },
  },
  eyes: [
    { x: 21, y: 90, r: 5.6 },
    { x: 35, y: 89.5, r: 5 },
  ],
  droop: 0.3,
  pupil: 0.4,
  nose: [28, 97],
  mouth: 'M24.5 100 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M17 97 L 12 96.5 M17 100 L 13 101 M39 97 L 44 96.5 M39 100 L 43 101',
  heart: [64, 40],
}
