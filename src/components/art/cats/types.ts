// One cat drawing (design §4), as data in a 120 by 120 box with the floor at y = 112. The renderer
// (CatSprite) gives every cat the same family style: a paper cut-out, ink bodies with a double
// scratchy outline, big mismatched eyes, spindly legs, a spiral tail, and a few stitch marks.

export type Xy = readonly [x: number, y: number]

// The collar charm, in the cat's feeling color.
export type CharmKind = 'sun' | 'heart' | 'bell' | 'pick' | 'gem' | 'moon' | 'star'

export interface EyeSpec {
  x: number
  y: number
  r: number
}

export interface Ear {
  d: string
  // The pink inside of the ear; empty when the ear is turned away (Susto's, flat back).
  inner: string
  origin: Xy
  // Nana's crown: a jewel on each prong, in the feeling color.
  knobs?: readonly Xy[]
}

export interface Leg {
  d: string
  width: number
  paw: Xy
  // Nana's grooming paw lifts toward her face.
  groom?: boolean
}

// A small painted piece: Mimo's bow, Bram's lightning tail tip.
export interface Extra {
  d: string
  paint: 'feel' | 'rose' | 'deepRose'
}

export interface CatDrawing {
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
