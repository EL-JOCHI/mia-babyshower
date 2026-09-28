import type { CatDrawing } from './types'

// Minina (Travesura): a small, playful, pure-white cat with a pink nose and no patches, so she reads
// apart from the Misha family. Big playful pupils, one paw up to bat at whatever moves.
export const minina: CatDrawing = {
  coat: { kind: 'white' },
  ground: { cx: 60, rx: 18 },
  tail: {
    d: 'M74 108 C 84 108, 90 101, 88 92',
    tip: 'M88 92 C 87 84, 79 84, 80 90 C 81 94, 86 94, 85 90',
    width: 3.2,
    root: [74, 108],
    joint: [88, 92],
  },
  body: {
    d: 'M52 90 C 47 94, 45 102, 46 107 C 47 111, 51 112, 55 112 L 66 112 C 71 112, 75 110, 75 105 C 75 99, 72 93, 68 90 Z',
    origin: [60, 112],
    stitches: 'M69 97 l4 3 M73 97 l-4 3',
  },
  legs: [
    { d: 'M54 99 C 52 104, 53 107, 53 110', width: 2.4, paw: [52, 110], groom: true },
    { d: 'M66 99 C 67 104, 67 107, 67 110', width: 2.4, paw: [68, 110] },
  ],
  collar: { d: 'M51 91 Q 60 96, 69 91', charm: 'yarn', at: [60, 96] },
  head: {
    d: 'M44 78 C 44 69, 51 63, 60 63 C 69 63, 76 69, 76 78 C 76 86, 69 92, 60 92 C 51 92, 44 86, 44 78 Z',
    origin: [60, 90],
    turn: -8,
  },
  ears: {
    l: {
      d: 'M46 72 C 45 66, 46 60, 48 55 C 52 58, 55 62, 56 65 Z',
      inner: 'M48 68 C 48 65, 48 62, 49 59 C 51 61, 53 63, 54 65 Z',
      origin: [51, 67],
    },
    r: {
      d: 'M64 65 C 67 61, 71 58, 74 56 C 75 61, 75 67, 73 72 Z',
      inner: 'M66 65 C 68 63, 70 61, 72 60 C 73 63, 73 66, 72 69 Z',
      origin: [70, 67],
    },
  },
  eyes: [
    { x: 53.5, y: 77, r: 6.4 },
    { x: 67, y: 76.5, r: 5.6 },
  ],
  droop: 0,
  pupil: 0.45,
  nose: [60.5, 84],
  mouth: 'M57 87 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M50 84 L 45 83.5 M50 87 L 46 88 M71 84 L 76 83.5 M71 87 L 75 88',
  heart: [60, 47],
}
