import type { CatDrawing } from './types'

// Bram (Ímpetu): stocky, a notched ear, cool heavy lids, a lightning tail tip, and a guitar pick.
export const bram: CatDrawing = {
  ground: { cx: 60, rx: 36 },
  tail: {
    d: 'M92 101 C 104 99, 109 90, 106 79',
    tip: 'M106 79 C 105 75, 105 72, 106 70',
    width: 5,
    root: [92, 101],
    joint: [106, 79],
    tipExtra: { d: 'M104 73 L 112 60 L 105 61 L 111 46 L 97 64 L 104 63 L 100 74 Z', paint: 'feel' },
  },
  body: {
    d: 'M44 65 C 30 71, 24 87, 26 101 C 27 109, 34 112, 44 112 L 78 112 C 88 112, 95 109, 95 100 C 96 86, 90 71, 76 65 Z',
    origin: [60, 112],
    stitches: 'M31 88 C 33 94, 33 99, 32 104 M29 91 l6 0 M29 96 l6 0 M29 101 l6 0',
  },
  legs: [
    { d: 'M48 91 C 47 99, 46 105, 46 110', width: 4, paw: [45, 110] },
    { d: 'M70 91 C 71 99, 72 105, 73 110', width: 4, paw: [74, 110] },
  ],
  collar: { d: 'M42 66 Q 60 75, 78 66', charm: 'pick', at: [60, 76] },
  head: {
    d: 'M33 47 C 33 33, 45 25, 60 25 C 75 25, 87 33, 87 47 C 87 50, 90 53, 87 55 C 84 63, 73 68, 60 68 C 47 68, 36 63, 33 55 C 30 53, 33 50, 33 47 Z',
    origin: [60, 65],
    turn: -6,
    tufts: 'M34 54 l-4 2 l4 1 M86 54 l4 2 l-4 1',
  },
  ears: {
    l: {
      d: 'M36 36 C 35 28, 36 21, 38 14 L 41 18 L 44 16 C 47 20, 50 24, 52 28 Z',
      inner: 'M39 31 C 39 27, 39 23, 40 20 L 42 22 C 44 24, 46 26, 48 28 Z',
      origin: [44, 31],
    },
    r: {
      d: 'M68 28 C 72 23, 77 18, 83 14 C 85 21, 85 29, 84 36 Z',
      inner: 'M71 28 C 74 25, 77 22, 80 20 C 81 24, 81 28, 80 32 Z',
      origin: [76, 31],
    },
  },
  eyes: [
    { x: 49.5, y: 47, r: 7.8 },
    { x: 70, y: 46, r: 8.8 },
  ],
  droop: 0.34,
  lidCurve: 0,
  pupil: 0.36,
  nose: [60, 56],
  mouth: 'M55 59 q2.5 2.5 5 0 q2.5 2.5 5 0',
  whiskers: 'M42 56 L 36 55.5 M42 59 L 37 60 M78 56 L 84 55.5 M78 59 L 83 60',
  heart: [60, 7],
}
