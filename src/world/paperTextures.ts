import * as THREE from 'three'
import { tokens, type PieceSpec } from '../tuning'

// Design §1: pop-up paper pieces, drawn from SVG path strings onto canvases. Each piece has a
// paper texture (a white cut-out with pencil lines, tinted by its material) and an ink texture
// (bold outlines only) that fades in with the tinta stage.

export type PieceKind = PieceSpec['kind']

interface PieceArt {
  // The SVG viewBox size. Width 100; height 100 or 200.
  height: 100 | 200
  // The cut-out silhouette. Holes are drawn with the even-odd rule.
  body: string
  // Inner detail lines.
  lines: string
  // Where a candle's flame sits, as a fraction of the piece (0,0 is the bottom left).
  light?: readonly [number, number]
}

const art: Record<PieceKind, PieceArt> = {
  arch: {
    height: 100,
    body: 'M4 100 L4 46 C4 18 26 2 50 2 C74 2 96 18 96 46 L96 100 Z M22 100 L22 50 C22 32 34 20 50 20 C66 20 78 32 78 50 L78 100 Z',
    lines:
      'M4 64 L22 64 M78 64 L96 64 M4 82 L22 82 M78 82 L96 82 M9 26 L25 36 M91 26 L75 36 M30 7 L36 22 M70 7 L64 22 M44 2 L46 20 L54 20 L56 2',
  },
  tree: {
    height: 200,
    body:
      'M42 200 C45 172 38 150 45 124 C36 114 18 108 8 90 C22 96 34 102 44 106 C42 92 28 72 32 54 C38 68 44 82 49 94 C51 78 49 58 57 42 C59 60 55 78 56 96 C66 86 80 80 92 72 C84 88 68 98 57 112 C59 142 54 172 60 200 Z',
    lines:
      'M47 192 C48 172 45 152 49 132 M54 186 C55 162 52 142 55 122 M57 42 C60 28 74 22 80 32 C85 42 73 48 70 39 M8 90 C3 84 6 76 12 79 M92 72 C98 68 97 60 91 62',
  },
  candle: {
    height: 200,
    body: 'M18 196 L82 196 L75 180 L25 180 Z M37 180 L37 92 C37 84 63 84 63 92 L63 180 Z',
    lines: 'M43 92 C43 102 41 108 43 116 M57 94 C57 100 59 106 57 112 M50 86 L50 74 M30 188 L70 188',
    light: [0.5, 0.64],
  },
  frame: {
    height: 100,
    body:
      'M50 2 C60 2 64 10 60 14 C80 18 94 36 94 56 C94 80 74 98 50 98 C26 98 6 80 6 56 C6 36 20 18 40 14 C36 10 40 2 50 2 Z M50 26 C68 26 80 40 80 57 C80 74 68 86 50 86 C32 86 20 74 20 57 C20 40 32 26 50 26 Z',
    lines: 'M50 20 C71 20 86 36 86 57 C86 78 71 92 50 92 C29 92 14 78 14 57 C14 36 29 20 50 20 M46 8 C48 5 52 5 54 8',
  },
  door: {
    height: 200,
    body: 'M8 200 L8 62 C8 22 92 22 92 62 L92 200 Z M24 200 L24 68 C24 42 76 42 76 68 L76 200 Z',
    lines: 'M8 70 L24 70 M76 70 L92 70 M8 120 L24 120 M76 120 L92 120 M8 168 L24 168 M76 168 L92 168 M40 30 L44 44 M60 30 L56 44',
  },
}

// Canvas pixels per SVG unit. 256 px wide keeps every texture a power of two.
const pxPerUnit = 2.56

function canvasFor(kind: PieceKind): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = 100 * pxPerUnit
  canvas.height = art[kind].height * pxPerUnit
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas for the paper pieces')
  ctx.scale(pxPerUnit, pxPerUnit)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  return { canvas, ctx }
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

// A white cut-out with a soft pencil sketch: two slightly offset passes of thin gray lines.
function paperTexture(kind: PieceKind): THREE.CanvasTexture {
  const { canvas, ctx } = canvasFor(kind)
  const body = new Path2D(art[kind].body)
  const lines = new Path2D(art[kind].lines)
  ctx.fillStyle = 'white'
  ctx.fill(body, 'evenodd')
  ctx.strokeStyle = tokens.ink
  ctx.globalAlpha = 0.32
  ctx.lineWidth = 0.9
  for (const [dx, dy] of [
    [0, 0],
    [0.7, -0.5],
  ]) {
    ctx.save()
    ctx.translate(dx, dy)
    ctx.stroke(body)
    ctx.stroke(lines)
    ctx.restore()
  }
  return toTexture(canvas)
}

// Bold ink outlines on a clear background.
function inkTexture(kind: PieceKind): THREE.CanvasTexture {
  const { canvas, ctx } = canvasFor(kind)
  ctx.strokeStyle = tokens.ink
  ctx.lineWidth = 2.6
  ctx.stroke(new Path2D(art[kind].body))
  ctx.lineWidth = 1.6
  ctx.stroke(new Path2D(art[kind].lines))
  return toTexture(canvas)
}

export interface PieceTextures {
  paper: THREE.CanvasTexture
  ink: THREE.CanvasTexture
  // Width over height.
  aspect: number
  light?: readonly [number, number]
}

export function pieceTextures(kind: PieceKind): PieceTextures {
  return { paper: paperTexture(kind), ink: inkTexture(kind), aspect: 100 / art[kind].height, light: art[kind].light }
}

export const pieceKinds: readonly PieceKind[] = ['arch', 'candle', 'tree', 'frame', 'door']

// The open pages: paper grain, a faint border, and a soft shadow down the gutter.
export function pageTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas for the pages')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Grain: a fixed scatter of faint specks, so every load looks the same.
  ctx.fillStyle = tokens.ink
  let seed = 7
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 5000; i++) {
    ctx.globalAlpha = 0.03 + next() * 0.05
    ctx.fillRect(next() * canvas.width, next() * canvas.height, 1.5, 1.5)
  }
  // A sketched border on each page.
  ctx.globalAlpha = 0.22
  ctx.strokeStyle = tokens.ink
  ctx.lineWidth = 2
  ctx.strokeRect(40, 36, canvas.width / 2 - 80, canvas.height - 72)
  ctx.strokeRect(canvas.width / 2 + 40, 36, canvas.width / 2 - 80, canvas.height - 72)
  // The gutter shadow.
  const gutter = ctx.createLinearGradient(canvas.width / 2 - 60, 0, canvas.width / 2 + 60, 0)
  gutter.addColorStop(0, 'rgba(0,0,0,0)')
  gutter.addColorStop(0.5, tokens.plum)
  gutter.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = 0.45
  ctx.fillStyle = gutter
  ctx.fillRect(canvas.width / 2 - 60, 0, 120, canvas.height)
  return toTexture(canvas)
}

// The stacked page edges seen along the front of the book.
export function pageEdgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas for the page edges')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = tokens.ink
  ctx.globalAlpha = 0.18
  for (let y = 2; y < canvas.height; y += 4) ctx.fillRect(0, y, canvas.width, 1)
  const texture = toTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  return texture
}

// Floorboards: long planks with dark seams, repeated across the attic floor.
export function floorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas for the floor')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = tokens.ink
  for (let row = 0; row < 4; row++) {
    const y = row * 64
    ctx.globalAlpha = 0.5
    ctx.fillRect(0, y, 256, 3)
    const joint = (row * 97) % 256
    ctx.fillRect(joint, y, 3, 64)
    ctx.globalAlpha = 0.08
    for (let k = 0; k < 5; k++) ctx.fillRect(0, y + 10 + k * 11, 256, 1)
  }
  const texture = toTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// A soft round glow, for the dust, the flames, and the moon's halo.
export function glowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas for the glow')
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return toTexture(canvas)
}
