// One cat drawing (design §4), as data in a 120 by 120 box with the floor at y = 112. The renderer
// (CatSprite) gives every cat the same family style: a paper cut-out, a double scratchy ink outline,
// big mismatched eyes, spindly legs, a spiral tail, and a few stitch marks. Each cat wears its
// family's coat (spec §3 Coats).

import type { CoatKind } from '../../../tuning'

export type Xy = readonly [x: number, y: number]

// The collar charm, in the cat's feeling color.
export type CharmKind = 'sun' | 'heart' | 'bell' | 'pick' | 'gem' | 'moon' | 'star' | 'bolt' | 'fish' | 'yarn'

export interface EyeSpec {
  x: number
  y: number
  r: number
}

export interface Ear {
  d: string
  // The pink inside of the ear; empty when the ear is turned away (Chavela's, flat back).
  inner: string
  origin: Xy
  // A jewel on each prong of a crown-shaped ear, in the feeling color.
  knobs?: readonly Xy[]
}

export interface Leg {
  d: string
  width: number
  paw: Xy
  // A paw that lifts from the shoulder: Delilah's grooming paw, Minina's batting paw.
  groom?: boolean
}

// A small painted piece: Mishona's bow, a tail tip.
export interface Extra {
  d: string
  paint: 'feel' | 'rose' | 'deepRose'
}

// A mark on the coat, clipped to its part: a silver-gray patch (the Misha family), a tiger stripe
// (the Kira family, drawn as a line), or a white chin, muzzle, or chest (the Kira family).
export interface CoatMark {
  d: string
  paint: 'patch' | 'stripe' | 'white'
}

export interface Coat {
  kind: CoatKind
  body?: readonly CoatMark[]
  head?: readonly CoatMark[]
  // The ears and the tail wear the mark color (Misha's gray cap and tail).
  ears?: 'mark'
  tail?: 'mark'
  // White paws (the Kira family).
  paws?: 'white'
}

export interface CatDrawing {
  coat: Coat
  // The soft shadow on the paper under the cat.
  ground: { cx: number; rx: number }
  // The tail is a tube: `d` from the root, then the spiral `tip` from the joint, which follows the
  // tail's sway a moment later. A front tail wraps around the paws, over the body.
  tail: { d: string; tip: string; width: number; root: Xy; joint: Xy; front?: boolean; tipExtra?: Extra }
  body: { d: string; origin: Xy; stitches: string }
  legs: readonly Leg[]
  collar: { d: string; charm: CharmKind; at: Xy }
  // `turn` is the head's turn toward the guest when the cat notices them, in degrees.
  head: { d: string; origin: Xy; turn: number; tufts?: string; extras?: readonly Extra[] }
  ears: { l: Ear; r: Ear }
  // Slightly mismatched on purpose.
  eyes: readonly [EyeSpec, EyeSpec]
  // Mishona's lashes, drawn over the eyes' upper edge.
  lashes?: string
  // How far the lids rest down (0 wide awake, 1 closed). Noticing opens them.
  droop: number
  // How much the lids' lower edge bows (tuning.cats.lidCurve when unset; 0 is flat and cool).
  lidCurve?: number
  // Pupil width as a share of the iris.
  pupil: number
  starEyes?: boolean
  nose: Xy
  mouth: string
  whiskers: string
  heart: Xy
}
