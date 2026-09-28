import type { CatDrawing } from './types'

// Delilah (Curiosidad): a curious black cat, as the real Delilah was. Upright on her seat, her head
// leaning in and her nose forward, wide-eyed, whiskers pointing ahead. Sniffs everything, then
// grooms.
export const nana: CatDrawing = {
  coat: { kind: 'black' },
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
  collar: { d: 'M48 63 Q 60 69, 72 63', charm: 'gem', at: [60, 69] },
  head: {
    d: 'M39 47 C 39 35, 47 28, 57 28 C 67 28, 75 35, 75 47 C 75 57, 67 64, 57 64 C 50 64, 44 61, 41 56 C 37 55, 37 50, 39 47 Z',
    origin: [58, 61],
    turn: -9,
  },
  ears: {
    l: {
      d: 'M41 39 C 39 31, 40 24, 42 17 C 47 20, 51 25, 53 29 Z',
      inner: 'M43 35 C 42 30, 43 26, 44 21 C 47 24, 49 26, 50 29 Z',
      origin: [46, 33],
    },
    r: {
      d: 'M62 29 C 66 24, 70 20, 75 17 C 77 24, 77 31, 74 38 Z',
      inner: 'M64 29 C 67 26, 70 23, 73 21 C 74 26, 74 30, 72 34 Z',
      origin: [69, 32],
    },
  },
  eyes: [
    { x: 48.5, y: 45, r: 7.2 },
    { x: 63.5, y: 44.5, r: 7.8 },
  ],
  droop: 0,
  pupil: 0.5,
  nose: [41.5, 52],
  mouth: 'M42 56 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M46 53 L 40 51.5 M46 56 L 41 57 M68 53 L 74 52 M68 56 L 73 57',
  heart: [58, 11],
}
