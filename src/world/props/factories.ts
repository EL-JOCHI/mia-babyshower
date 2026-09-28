import * as THREE from 'three'
import { tuning } from '../../tuning'
import { block, merge, placed, rod, tilt, type Triple } from './shapes'
import type { PropInstances, PropMaterialKey, PropModel, PropPart } from './types'

// Spec §5: the props shared by both moods, in the pink-noir paper style: flat shapes, slightly
// crooked. Each factory is pure: the same call draws the same prop, in its own space, feet on y = 0.

export type Pieces = Partial<Record<PropMaterialKey, THREE.BufferGeometry[]>>

// Each material's pieces merged into one geometry.
export function parts(pieces: Pieces): PropPart[] {
  return (Object.entries(pieces) as [PropMaterialKey, THREE.BufferGeometry[]][])
    .filter(([, list]) => list.length > 0)
    .map(([material, list]) => ({ material, geometry: merge(list) }))
}

// A point (x, z) turned about y by `turn` radians, as three.js turns it.
function turned(turn: number, x: number, z: number): [number, number] {
  return [x * Math.cos(turn) + z * Math.sin(turn), -x * Math.sin(turn) + z * Math.cos(turn)]
}

function instance(at: Triple, rotate: Triple, scale: Triple): THREE.Matrix4 {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...at),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotate)),
    new THREE.Vector3(...scale),
  )
}

// The centerpiece under the round window: a slatted crib with one post a little taller.
export function crib(): PropModel {
  const length = 1.9
  const depth = 1
  const height = 1.15
  const post = 0.09
  const rail = 1
  const base = 0.35
  const slats = 9
  const wood: THREE.BufferGeometry[] = []
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const tall = sx > 0 && sz > 0 ? 0.08 : 0
      wood.push(block(post, height + tall, post, { at: [(sx * length) / 2, 0, (sz * depth) / 2] }))
    }
  }
  for (const sz of [-1, 1]) wood.push(block(length, 0.07, 0.07, { at: [0, rail, (sz * depth) / 2], rotate: [0, 0, tilt(1.2)] }))
  for (const sx of [-1, 1]) wood.push(block(0.07, 0.07, depth, { at: [(sx * length) / 2, rail, 0] }))
  wood.push(block(length, 0.06, depth, { at: [0, base, 0] }))
  for (let i = 1; i <= slats; i++) {
    const x = -length / 2 + (i * length) / (slats + 1)
    for (const sz of [-1, 1]) wood.push(block(0.035, rail - base, 0.035, { at: [x, base, (sz * depth) / 2] }))
  }
  const cloth = [block(length - 0.12, 0.14, depth - 0.12, { at: [0, base + 0.06, 0] })]
  const paper = [block(0.7, 0.08, depth - 0.2, { at: [0.35, base + 0.2, 0], rotate: [0, tilt(4), 0] })]
  return { parts: parts({ wood, cloth, paper }), instances: [], shadow: 1.2 }
}

// A bookshelf against the wall, its books one instanced set with a palette color each.
export function bookshelf(): PropModel {
  const width = 2.4
  const height = 2.2
  const depth = 0.45
  const board = 0.06
  const shelves = [0.08, 0.78, 1.48]
  const wood = [
    block(board, height, depth, { at: [-width / 2, 0, 0] }),
    block(board, height + 0.05, depth, { at: [width / 2, 0, 0], rotate: [0, 0, tilt(-1.5)] }),
    block(width + 0.1, board, depth + 0.04, { at: [0, height, 0], rotate: [0, 0, tilt(1)] }),
    ...shelves.map((y) => block(width, board, depth, { at: [0, y, 0] })),
  ]
  const woodDark = [block(width, height, 0.03, { at: [0, 0, -depth / 2] })]
  const { books, bookColors } = tuning.world.props
  const perShelf = Math.ceil(books / shelves.length)
  const span = (width - 0.3) / perShelf
  const matrices: THREE.Matrix4[] = []
  const colors: THREE.Color[] = []
  for (let i = 0; i < books; i++) {
    const shelf = Math.floor(i / perShelf)
    const slot = i % perShelf
    const h = 0.42 + ((i * 37) % 17) / 100
    const w = 0.09 + ((i * 13) % 5) / 100
    // The last book on each shelf leans on its neighbour; the others stand a little crooked.
    const lean = slot === perShelf - 1 ? tilt(14) : tilt(((i * 7) % 5) - 2)
    matrices.push(instance([-width / 2 + 0.15 + (slot + 0.5) * span, shelves[shelf]! + board + h / 2, 0.02], [0, 0, lean], [w, h, 0.32]))
    colors.push(new THREE.Color(bookColors[i % bookColors.length]!))
  }
  const set: PropInstances = { name: 'books', material: 'tinted', geometry: new THREE.BoxGeometry(1, 1, 1), matrices, colors }
  return { parts: parts({ wood, woodDark }), instances: [set], shadow: 0 }
}

// A yarn basket, its balls one instanced set; one ball has rolled out onto the floor.
export function yarnBasket(): PropModel {
  const radius = 0.45
  const height = 0.4
  const woodDark = [
    placed(new THREE.CylinderGeometry(radius, radius * 0.85, height, 14, 1, true), { at: [0, height / 2, 0] }),
    placed(new THREE.CircleGeometry(radius * 0.85, 14), { at: [0, 0.01, 0], rotate: [-Math.PI / 2, 0, 0] }),
    placed(new THREE.TorusGeometry(radius, 0.025, 4, 18), { at: [0, height, 0], rotate: [Math.PI / 2, 0, 0] }),
  ]
  const { yarnBalls, yarnColors } = tuning.world.props
  const matrices: THREE.Matrix4[] = []
  const colors: THREE.Color[] = []
  for (let i = 0; i < yarnBalls; i++) {
    const r = 0.15 + (i % 3) * 0.03
    const a = i * 2.4
    const rolled = i === yarnBalls - 1
    const at: Triple = rolled
      ? [radius + 0.55, r, 0.25]
      : [Math.cos(a) * radius * 0.4, height * 0.7 + (i % 2) * 0.12, Math.sin(a) * radius * 0.4]
    matrices.push(instance(at, [0, a, 0], [r, r, r]))
    colors.push(new THREE.Color(yarnColors[i % yarnColors.length]!))
  }
  const set: PropInstances = { name: 'yarn', material: 'tinted', geometry: new THREE.SphereGeometry(1, 12, 8), matrices, colors }
  return { parts: parts({ woodDark }), instances: [set], shadow: 0 }
}

// A rocking chair with a cushion and a throw over its back.
export function rockingChair(): PropModel {
  const seat = 0.5
  const width = 0.8
  const depth = 0.75
  const back = 0.9
  const lean = tilt(-10)
  const wood: THREE.BufferGeometry[] = [block(width, 0.07, depth, { at: [0, seat, 0] })]
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) wood.push(block(0.06, seat - 0.05, 0.06, { at: [(sx * width) / 2, 0.05, (sz * depth) / 2] }))
    wood.push(block(0.06, back, 0.06, { at: [(sx * width) / 2, seat, -depth / 2], rotate: [lean, 0, 0] }))
    wood.push(block(0.06, 0.05, depth, { at: [(sx * width) / 2, seat + 0.3, 0] }))
  }
  for (let i = -1; i <= 1; i++) wood.push(block(0.05, back - 0.1, 0.03, { at: [i * 0.2, seat, -depth / 2], rotate: [lean, 0, 0] }))
  wood.push(
    block(width + 0.1, 0.08, 0.06, {
      at: [0, seat + back * Math.cos(lean) - 0.04, -depth / 2 + back * Math.sin(lean)],
      rotate: [lean, 0, tilt(2)],
    }),
  )
  // The rockers: arcs under the legs, running front to back, touching the floor at their middle.
  const woodDark = [-1, 1].map((sx) =>
    placed(new THREE.TorusGeometry(1.4, 0.035, 5, 16, 0.9), {
      at: [(sx * width) / 2, 1.4, 0],
      rotate: [0, Math.PI / 2, -Math.PI / 2 - 0.45],
    }),
  )
  const cloth = [
    block(width - 0.1, 0.08, depth - 0.1, { at: [0, seat + 0.07, 0.02] }),
    block(0.5, 0.5, 0.03, { at: [0.1, seat + 0.3, -depth / 2 + 0.03], rotate: [lean, 0, tilt(6)] }),
  ]
  return { parts: parts({ wood, woodDark, cloth }), instances: [], shadow: 0.8 }
}

// Three old trunks, stacked a little askew, with straps and a folded quilt on top.
export function trunks(): PropModel {
  // Width, height, depth, turn (degrees), and sideways shift of each trunk, bottom first.
  const stack: readonly (readonly [number, number, number, number, number])[] = [
    [1.3, 0.62, 0.72, 0, 0],
    [1.05, 0.5, 0.62, 7, 0.06],
    [0.72, 0.36, 0.46, -5, -0.04],
  ]
  const wood: THREE.BufferGeometry[] = []
  const woodDark: THREE.BufferGeometry[] = []
  let y = 0
  for (const [w, h, d, degrees, shift] of stack) {
    const turn = tilt(degrees)
    wood.push(block(w, h, d, { at: [shift, y, 0], rotate: [0, turn, 0] }))
    woodDark.push(block(w + 0.02, 0.05, d + 0.02, { at: [shift, y + h * 0.72, 0], rotate: [0, turn, 0] }))
    for (const side of [-0.3, 0.3]) {
      const [x, z] = turned(turn, side * w, 0)
      woodDark.push(block(0.07, h + 0.01, d + 0.02, { at: [shift + x, y, z], rotate: [0, turn, 0] }))
    }
    y += h
  }
  const cloth = [block(0.6, 0.06, 0.4, { at: [0, y, 0], rotate: [0, tilt(-9), 0] })]
  return { parts: parts({ wood, woodDark, cloth }), instances: [], shadow: 1.1 }
}

// A crooked Burton floor lamp: a leaning pole, a bent neck, and a shade that glows by its own color.
export function crookedLamp(): PropModel {
  const poleLean = tilt(6)
  const pole = 1.7
  const neckTurn = tilt(-55)
  const neck = 0.5
  // A rod rising along y and turned by θ about z points along (-sin θ, cos θ).
  const top: Triple = [-Math.sin(poleLean) * pole, Math.cos(poleLean) * pole, 0]
  const end: Triple = [top[0] - Math.sin(neckTurn) * neck, top[1] + Math.cos(neckTurn) * neck, 0]
  const woodDark = [
    placed(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 12), { at: [0, 0.03, 0] }),
    rod(0.03, pole, { rotate: [0, 0, poleLean] }),
    rod(0.025, neck, { at: top, rotate: [0, 0, neckTurn] }),
  ]
  const lamp = [
    placed(new THREE.ConeGeometry(0.32, 0.36, 12, 1, true), { at: [end[0] + 0.02, end[1] - 0.14, 0], rotate: [0, 0, tilt(-18)] }),
    placed(new THREE.SphereGeometry(0.08, 8, 6), { at: [end[0] + 0.04, end[1] - 0.3, 0] }),
  ]
  return { parts: parts({ woodDark, lamp }), instances: [], shadow: 0 }
}

// A round cat bed: a plump, slightly oval rim around a cushion.
export function catBed(): PropModel {
  const cloth = [
    placed(new THREE.TorusGeometry(0.42, 0.13, 8, 20), { at: [0, 0.13, 0], rotate: [Math.PI / 2, 0, 0], scale: [1, 1.08, 1] }),
    placed(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 18), { at: [0, 0.05, 0] }),
  ]
  return { parts: parts({ cloth }), instances: [], shadow: 0 }
}

// A scratching post: a rope-wrapped pole on a base, with a crooked platform on top.
export function scratchingPost(): PropModel {
  const woodDark = [block(0.6, 0.08, 0.6), block(0.5, 0.06, 0.5, { at: [0.04, 1.36, 0], rotate: [0, tilt(10), tilt(3)] })]
  const paper = [rod(0.1, 1.3, { at: [0, 0.08, 0], rotate: [0, 0, tilt(3)] }, 10)]
  return { parts: parts({ woodDark, paper }), instances: [], shadow: 0 }
}

// Curtains at the round window: a rod, and two wavy panels tied aside. Sized from the window, so its
// placement sits at the window's x and just in front of the wall, at scale 1.
export function curtains(): PropModel {
  const { windowY, windowRadius } = tuning.world.attic
  const top = windowY + windowRadius + 0.25
  const drop = windowRadius * 2 + 0.6
  const span = windowRadius * 2 + 1.6
  const woodDark = [placed(new THREE.CylinderGeometry(0.04, 0.04, span, 8), { at: [0, top, 0.08], rotate: [0, 0, Math.PI / 2] })]
  const cloth = [-1, 1].map((side) => {
    const panel = new THREE.PlaneGeometry(0.9, drop, 8, 1)
    const position = panel.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < position.count; i++) position.setZ(i, 0.06 * Math.sin(position.getX(i) * 14))
    panel.computeVertexNormals()
    return placed(panel, { at: [side * (windowRadius + 0.25), top - drop / 2, 0.12], rotate: [0, 0, side * tilt(4)] })
  })
  return { parts: parts({ woodDark, cloth }), instances: [], shadow: 0 }
}
