import type { CatDrawing } from './types'

// Mishona (Coquetería): the flirty Misha. Misha's white-and-silver coat and build, with the patches
// shifted, a small bow on her right ear, lashes, and a high, swishy tail. Always about to pounce.
export const luz: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [{ d: 'M66 70 C 74 72, 82 80, 83 92 C 78 96, 70 94, 66 88 C 63 82, 62 74, 66 70 Z', paint: 'patch' }],
    head: [
      {
        d: 'M32 22 L 82 22 L 82 44 C 78 40, 72 38, 67 40 C 64 34, 60 32, 57 32 C 54 32, 51 35, 49 40 C 44 38, 38 40, 32 44 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
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
    stitches: 'M40 88 C 38 94, 38 99, 40 104 M38 91 l5 1 M37 96 l5 0 M38 101 l5 -1',
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
    // The bow sits on her right ear.
    extras: [
      { d: 'M74 25 L 66 20 C 65 24, 65 27, 66 30 Z', paint: 'rose' },
      { d: 'M74 25 L 82 20 C 83 24, 83 27, 82 30 Z', paint: 'rose' },
      { d: 'M71.6 25 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z', paint: 'deepRose' },
    ],
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
  lashes: 'M40.5 41 l-4 -3 M43 38.6 l-2.6 -4 M46.4 37.6 l-1 -4.4 M73.4 41.2 l3.6 -3 M71.4 38.9 l2.2 -3.8 M68.6 38.3 l0.8 -4',
  droop: 0,
  pupil: 0.42,
  nose: [57, 58],
  mouth: 'M52 61 q2.5 2.5 5 0 q2.5 2.5 5 0',
  whiskers: 'M43 58 L 37 57 M43 61 L 38 62 M71 57 L 77 56 M71 60 L 76 61',
  heart: [57, 6],
}
