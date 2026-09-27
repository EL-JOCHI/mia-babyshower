import * as THREE from 'three'
import { tuning, type MoodId, type WorldLook } from '../../tuning'
import { merge, placed, rod } from './shapes'

// Spec §3: each mood's signature props. Saturday: a star-and-crescent mobile over the crib, a paper
// star garland along the rafters, and the moonbeam. Sunday: a string of paper lanterns and the golden
// beam. Saturday's window stars are WindowSky's; Sunday's fireflies are Fireflies'.

export type MoodMaterialKey = 'frame' | 'charm' | 'garland' | 'lantern' | 'shaft' | 'string'

// The materials each mood's props draw with (src/world/MoodProps.tsx creates them).
export const moodMaterials = {
  saturday: ['frame', 'charm', 'garland', 'shaft', 'string'],
  sunday: ['lantern', 'shaft', 'string'],
} as const satisfies Record<MoodId, readonly MoodMaterialKey[]>

// Something hanging from a string: where it hangs, a little turn about z, and its palette color.
export interface Hanging {
  position: THREE.Vector3
  turn: number
  color: THREE.Color
}

export interface SaturdayBuild {
  kind: 'saturday'
  // The mobile in its own space, its hub at the origin; MoodProps hangs it over the crib and turns it.
  mobileFrame: THREE.BufferGeometry
  mobileCharms: THREE.BufferGeometry
  garlandStar: THREE.BufferGeometry
  garland: Hanging[]
  garlandString: THREE.BufferGeometry
  shaft: THREE.BufferGeometry
}

export interface SundayBuild {
  kind: 'sunday'
  lantern: THREE.BufferGeometry
  lanterns: Hanging[]
  lanternString: THREE.BufferGeometry
  shaft: THREE.BufferGeometry
}

export type MoodBuild = SaturdayBuild | SundayBuild

export function starShape(outer: number, inner: number, points = 5): THREE.Shape {
  const shape = new THREE.Shape()
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i + Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  shape.closePath()
  return shape
}

// A crescent moon: the outer arc on the left, the inner arc cut from the right.
export function crescentShape(radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, radius, Math.PI * 0.3, Math.PI * 1.7, false)
  shape.absarc(radius * 0.45, 0, radius * 0.8, Math.PI * 1.55, Math.PI * 0.45, true)
  shape.closePath()
  return shape
}

// A string sagging between two rafters: its height at x, `sag` lower in the middle than at the ends.
export function sagY(x: number, from: number, to: number, y: number, sag: number): number {
  const half = (to - from) / 2
  const u = (x - (from + half)) / half
  return y - sag * (1 - u * u)
}

// The string itself, as line segments.
export function stringGeometry(from: number, to: number, y: number, z: number, sag: number, segments = 32): THREE.BufferGeometry {
  const points: number[] = []
  for (let i = 0; i < segments; i++) {
    const x0 = from + ((to - from) * i) / segments
    const x1 = from + ((to - from) * (i + 1)) / segments
    points.push(x0, sagY(x0, from, to, y, sag), z, x1, sagY(x1, from, to, y, sag), z)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

// `count` things hanging `drop` below the string, evenly spaced, each a little turned.
export function hangings(
  count: number,
  from: number,
  to: number,
  y: number,
  z: number,
  sag: number,
  drop: number,
  colors: readonly string[],
): Hanging[] {
  return Array.from({ length: count }, (_, i) => {
    const x = from + ((to - from) * (i + 0.5)) / count
    return {
      position: new THREE.Vector3(x, sagY(x, from, to, y, sag) - drop, z),
      turn: (((i * 37) % 11) - 5) / 20,
      color: new THREE.Color(colors[i % colors.length]!),
    }
  })
}

// Saturday's mobile: a string up to the rafters, crossed arms, and a star or crescent under each end.
export function mobileGeometry(): { frame: THREE.BufferGeometry; charms: THREE.BufferGeometry } {
  const { hang, arms, radius, drop, charm } = tuning.world.mood.mobile
  const frame: THREE.BufferGeometry[] = [rod(0.012, hang)]
  const charms: THREE.BufferGeometry[] = []
  const star = starShape(charm, charm * 0.45)
  const moon = crescentShape(charm)
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI
    frame.push(placed(new THREE.CylinderGeometry(0.01, 0.01, radius * 2, 6), { rotate: [0, a, Math.PI / 2] }))
    for (const end of [0, 1]) {
      const angle = a + end * Math.PI
      const x = Math.cos(angle) * radius
      const z = -Math.sin(angle) * radius
      frame.push(rod(0.006, drop, { at: [x, -drop, z] }))
      charms.push(placed(new THREE.ShapeGeometry((i + end) % 2 === 0 ? star : moon), { at: [x, -drop - charm, z] }))
    }
  }
  return { frame: merge(frame), charms: merge(charms) }
}

// Sunday's paper lantern, centred where it hangs: a round paper body pinched in a little between
// thin wire ribs, with a darker collar at the top and the bottom. One geometry: its vertex colors
// shade the ribs and the collars, and each lantern's own color tints the whole.
export function lanternGeometry(): THREE.BufferGeometry {
  const { size, paper } = tuning.world.mood.lanterns
  const { width, collar, ribs, rib, pinch, ribShade, collarShade, segments, steps } = paper
  const height = size * 2
  // The round body's radius at height y, and the pinched paper's.
  const body = (y: number) => size * width * Math.sqrt(Math.max(0, 1 - (y / size) ** 2))
  const paperAt = (y: number): [number, number] => [body(y) * (1 - pinch), y]
  const neck = size - collar * height
  const ring = body(neck)
  const half = (rib * height) / 2
  const pieces: THREE.BufferGeometry[] = []
  // One run of the profile, as [radius, height] pairs from the bottom up, turned around y in one shade.
  const turn = (shade: number, points: [number, number][]) => {
    const piece = new THREE.LatheGeometry(
      points.map(([r, h]) => new THREE.Vector2(r, h)),
      segments,
    )
    piece.setAttribute('color', new THREE.Float32BufferAttribute(new Array<number>(piece.attributes.position!.count * 3).fill(shade), 3))
    pieces.push(piece)
  }
  const paperRun = (a: number, b: number) => Array.from({ length: steps + 1 }, (_, s) => paperAt(a + ((b - a) * s) / steps))
  // The bottom collar: its underside, its side, and the step in to the paper.
  turn(collarShade, [[0, -size], [ring, -size], [ring, -neck], paperAt(-neck)])
  let from = -neck
  for (let k = 1; k <= ribs; k++) {
    const at = -neck + (2 * neck * k) / (ribs + 1)
    turn(1, paperRun(from, at - half))
    // A wire rib: out from the paper, up, and back in.
    turn(ribShade, [paperAt(at - half), [body(at - half), at - half], [body(at + half), at + half], paperAt(at + half)])
    from = at + half
  }
  turn(1, paperRun(from, neck))
  turn(collarShade, [paperAt(neck), [ring, neck], [ring, size], [0, size]])
  return merge(pieces)
}

// The beam from the window to the floor: an unlit, additive quad, fading toward the floor (its
// vertex colors carry the fade as alpha).
export function shaftGeometry(mood: MoodId): THREE.BufferGeometry {
  const { windowY, windowRadius, wallZ } = tuning.world.attic
  const { topWidth, bottomWidth, bottomAlpha } = tuning.world.mood.shaft
  const { drift, reach } = tuning.world.mood.shaft[mood]
  const topY = windowY + windowRadius * 0.4
  const topZ = wallZ + 0.2
  const bottomZ = wallZ + reach
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [-topWidth / 2, topY, topZ, topWidth / 2, topY, topZ, drift - bottomWidth / 2, 0.02, bottomZ, drift + bottomWidth / 2, 0.02, bottomZ],
      3,
    ),
  )
  geometry.setAttribute('color', new THREE.Float32BufferAttribute([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, bottomAlpha, 1, 1, 1, bottomAlpha], 4))
  geometry.setIndex([0, 2, 1, 1, 2, 3])
  return geometry
}

export function buildMoodProps(mood: MoodId): MoodBuild {
  if (mood === 'saturday') {
    const { from, to, y, z, sag, drop, count, size, colors } = tuning.world.mood.garland
    const mobile = mobileGeometry()
    return {
      kind: 'saturday',
      mobileFrame: mobile.frame,
      mobileCharms: mobile.charms,
      garlandStar: new THREE.ShapeGeometry(starShape(size, size * 0.45)),
      garland: hangings(count, from, to, y, z, sag, drop, colors),
      garlandString: stringGeometry(from, to, y, z, sag),
      shaft: shaftGeometry('saturday'),
    }
  }
  const { from, to, y, z, sag, drop, count, colors } = tuning.world.mood.lanterns
  const lantern = lanternGeometry()
  return {
    kind: 'sunday',
    lantern,
    lanterns: hangings(count, from, to, y, z, sag, drop, colors),
    lanternString: stringGeometry(from, to, y, z, sag),
    shaft: shaftGeometry('sunday'),
  }
}

// One draw call per geometry: each merged mesh, each instanced set, each string, and the beam.
export function moodDrawCalls(build: MoodBuild): number {
  return Object.values(build).filter((value) => value instanceof THREE.BufferGeometry).length
}

export function disposeMoodBuild(build: MoodBuild): void {
  for (const value of Object.values(build)) if (value instanceof THREE.BufferGeometry) value.dispose()
}

function boxOf(geometry: THREE.BufferGeometry, offset?: THREE.Vector3): THREE.Box3 {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!.clone()
  if (offset) box.translate(offset)
  return box
}

// Each mood prop's box in the attic, for the placement test. The mobile turns, so its box covers
// every turn: as wide as its farthest reach on every side.
export function moodBoxes(build: MoodBuild): THREE.Box3[] {
  if (build.kind === 'saturday') {
    const mobile = boxOf(build.mobileFrame).union(boxOf(build.mobileCharms))
    const reach = Math.max(-mobile.min.x, mobile.max.x, -mobile.min.z, mobile.max.z)
    mobile.min.x = -reach
    mobile.max.x = reach
    mobile.min.z = -reach
    mobile.max.z = reach
    mobile.translate(new THREE.Vector3(...tuning.world.mood.mobile.at))
    return [
      mobile,
      ...build.garland.map((item) => boxOf(build.garlandStar, item.position)),
      boxOf(build.garlandString),
      boxOf(build.shaft),
    ]
  }
  return [...build.lanterns.map((item) => boxOf(build.lantern, item.position)), boxOf(build.lanternString), boxOf(build.shaft)]
}

// A lantern's swing at time t: gentle, and each a phase apart from the next.
export function lanternSway(t: number, index: number): number {
  const { sway, speed, phase } = tuning.world.mood.lanterns
  return sway * Math.sin(t * speed + index * phase)
}

export type AmbientMotion = 'mobile' | 'lanterns' | 'dust' | 'fireflies'

// Spec §3 Motion rule: at most two ambient motions at once: the mood's mobile or lanterns, plus the
// dust or the fireflies. The garland and the beams hold still; the window's stars are the sky's.
export function ambientMotions(mood: MoodId, motes: 'dust' | 'fireflies'): AmbientMotion[] {
  return [mood === 'saturday' ? 'mobile' : 'lanterns', motes]
}

// The window's stars (one instanced mesh, on Saturday) and the dust or the fireflies (one each).
export function skyAndMotesCalls(look: WorldLook): number {
  return (look.stars > 0 ? 1 : 0) + 1
}
