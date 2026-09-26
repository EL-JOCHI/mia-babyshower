import type { CatDrawing } from './types'

// Mimo (Ternura): low and round, curled up, with a blush body, sleepy lids, and a small bow.
export const mimo: CatDrawing = {
  ground: { cx: 64, rx: 40 },
  tail: {
    d: 'M98 103 C 102 112, 88 115, 72 114 C 62 113, 54 113, 47 112',
    tip: 'M47 112 C 36 113, 30 105, 36 101 C 41 99, 44 105, 40 107',
    width: 4.6,
    root: [98, 103],
    joint: [47, 112],
    front: true,
  },
  body: {
    d: 'M30 96 C 28 84, 44 77, 64 77 C 86 77, 102 85, 102 97 C 102 106, 95 112, 83 112 L 44 112 C 34 112, 30 106, 30 96 Z',
    origin: [66, 112],
    stitches: 'M70 78 C 76 82, 80 88, 81 95 M70 83 l5 -3 M74 88 l5 -3 M77 93 l5 -2',
  },
  legs: [
    { d: 'M36 101 L 35 109', width: 3.2, paw: [34, 109] },
    { d: 'M52 102 L 53 110', width: 3.2, paw: [54, 110] },
  ],
  collar: { d: 'M31 95 Q 44 102, 58 95', charm: 'heart', at: [45, 101] },
  head: {
    d: 'M25 85 C 24 72, 33 64, 45 64 C 57 64, 65 72, 64 84 C 64 94, 56 100, 44 100 C 32 100, 25 94, 25 85 Z',
    origin: [46, 97],
    turn: -7,
    // The bow sits on her right ear.
    extras: [
      { d: 'M60 60 L 52 55 C 51 59, 51 62, 52 65 Z', paint: 'rose' },
      { d: 'M60 60 L 68 55 C 69 59, 69 62, 68 65 Z', paint: 'rose' },
      { d: 'M57.6 60 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z', paint: 'deepRose' },
    ],
  },
  ears: {
    l: {
      d: 'M27 76 C 25 69, 26 63, 28 57 C 33 59, 37 63, 40 67 Z',
      inner: 'M29 71 C 28 67, 28 64, 29 61 C 32 63, 34 65, 36 67 Z',
      origin: [32, 70],
    },
    r: {
      d: 'M50 66 C 54 62, 58 59, 63 57 C 64 62, 64 68, 62 74 Z',
      inner: 'M53 67 C 56 64, 58 63, 61 61 C 61 64, 61 67, 60 70 Z',
      origin: [57, 68],
    },
  },
  eyes: [
    { x: 37, y: 83, r: 6.8 },
    { x: 52, y: 82, r: 5.8 },
  ],
  droop: 0.36,
  pupil: 0.4,
  nose: [45, 90],
  mouth: 'M41 93 q2 2 4 0 q2 2 4 0',
  whiskers: 'M33 90 L 28 89.5 M33 93 L 29 94 M56 89 L 61 88.5 M56 92 L 60 93',
  heart: [45, 46],
}
