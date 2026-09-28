import * as THREE from 'three'
import { familyFigures, rimPath, type FamilyFigure, type FigureId } from '../components/art/family'
import { tokens, tuning } from '../tuning'

// One figure's place on the sheet, in canvas pixels, and its texture coordinates.
export interface SheetCell {
  id: FigureId
  x: number
  y: number
  width: number
  height: number
  u0: number
  v0: number
  u1: number
  v1: number
}

export interface SheetLayout {
  width: number
  height: number
  pxPerUnit: number
  pad: number
  cells: SheetCell[]
}

// Spec §6 and §8: the four figures side by side on one canvas of at most sheetMaxPx a side (a power
// of two), each in its own cell with a margin for its rim of backlight. The cells sit on the canvas's
// bottom edge, so their texture coordinates start at v = 0.
export function familySheetLayout(figures: readonly FamilyFigure[] = familyFigures): SheetLayout {
  const { sheetMaxPx, sheetPad } = tuning.world.family
  const unitsWide = figures.reduce((sum, figure) => sum + figure.box.width + sheetPad * 2, 0)
  const unitsTall = Math.max(...figures.map((figure) => figure.box.height + sheetPad * 2))
  const pxPerUnit = Math.min(sheetMaxPx / unitsWide, sheetMaxPx / unitsTall)
  const width = Math.min(sheetMaxPx, THREE.MathUtils.ceilPowerOfTwo(Math.ceil(unitsWide * pxPerUnit)))
  const height = Math.min(sheetMaxPx, THREE.MathUtils.ceilPowerOfTwo(Math.ceil(unitsTall * pxPerUnit)))
  let x = 0
  const cells = figures.map((figure) => {
    const w = (figure.box.width + sheetPad * 2) * pxPerUnit
    const h = (figure.box.height + sheetPad * 2) * pxPerUnit
    const cell: SheetCell = { id: figure.id, x, y: height - h, width: w, height: h, u0: x / width, v0: 0, u1: (x + w) / width, v1: h / height }
    x += w
    return cell
  })
  return { width, height, pxPerUnit, pad: sheetPad, cells }
}

// A palette color at an opacity, as a CSS color the canvas reads (#rrggbbaa).
function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`
}

// The paper's torn edge (tuning.ink.paperCut): the SVG filter pushes the grown margin in and out by
// up to roughScale / 2 with noise about 1 / roughness units across. A canvas has no displacement
// filter, so the margin is drawn roughScale / 2 inside its edge, and a pass roughScale / 2 outside
// it in uneven dashes over that: the edge steps out and back in at irregular spacing, like
// hand-cut paper. Fixed lengths, so every load looks the same.
function roughDashes(): number[] {
  const wave = 1 / tuning.ink.paperCut.roughness
  return Array.from({ length: 9 }, (_, i) => wave * (0.22 + 0.14 * (1 + Math.sin(i * 2.4 + 0.7))))
}

type Ctx = CanvasRenderingContext2D

// One layer's paper cut-out, as the cats' #paper-cut filter grows it (src/components/art/InkDefs.tsx):
// the layer's ink, fill, and echo, grown by `radius` all round and roughened, in the paper's color.
function paperMargin(ctx: Ctx, path: Path2D) {
  const { line, echo } = tuning.cats
  const { radius, roughScale } = tuning.ink.paperCut
  ctx.fillStyle = tokens.bone
  ctx.strokeStyle = tokens.bone
  ctx.fill(path)
  ctx.lineWidth = line + radius * 2 - roughScale / 2
  ctx.stroke(path)
  ctx.save()
  ctx.translate(echo.dx, echo.dy)
  ctx.lineWidth = echo.width + radius * 2 - roughScale / 2
  ctx.stroke(path)
  ctx.restore()
  ctx.setLineDash(roughDashes())
  ctx.lineWidth = line + radius * 2 + roughScale / 2
  ctx.stroke(path)
  ctx.setLineDash([])
}

// The cats' double ink, in CatSprite's order: the ink stroke, the fill over it (so no inner line
// shows), then the lighter second pass offset along the outline, over the paper's edge.
function inkLayer(ctx: Ctx, path: Path2D) {
  const { line, echo } = tuning.cats
  ctx.globalAlpha = 1
  ctx.strokeStyle = tokens.shadow
  ctx.lineWidth = line
  ctx.stroke(path)
  ctx.fillStyle = tokens.shadow
  ctx.fill(path)
  ctx.save()
  ctx.translate(echo.dx, echo.dy)
  ctx.globalAlpha = echo.opacity
  ctx.strokeStyle = tokens.rose
  ctx.lineWidth = echo.width
  ctx.stroke(path)
  ctx.restore()
}

function context2d(canvas: HTMLCanvasElement): Ctx {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas for the family')
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  return ctx
}

// The figures drawn from the shared SVG paths (src/components/art/family.ts) the way the CSS family
// draws them (src/components/PaperFamily.tsx), back to front: the rim of backlight, a candle stroke
// glowing past the paper; then each layer, body then hair, cut from paper like the cats (a rough
// paper margin in bone, the book's paper, with its soft shadow), and in the cats' double ink on top.
export function familySheet(layout: SheetLayout = familySheetLayout()): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = context2d(canvas)
  // Each layer's paper margin is drawn apart first, so its shadow falls once, under the whole margin.
  const scratch = document.createElement('canvas')
  scratch.width = Math.ceil(Math.max(...layout.cells.map((cell) => cell.width)))
  scratch.height = Math.ceil(Math.max(...layout.cells.map((cell) => cell.height)))
  const paper = context2d(scratch)
  const { pxPerUnit: k, pad } = layout
  const { rimAlpha, rimGlow } = tuning.world.family
  const { shadow } = tuning.ink.paperCut

  familyFigures.forEach((figure, i) => {
    const cell = layout.cells[i]!
    const toDrawing = (target: Ctx, x: number, y: number) => target.setTransform(k, 0, 0, k, x + k * (pad - figure.box.x), y + k * (pad - figure.box.y))

    ctx.save()
    toDrawing(ctx, cell.x, cell.y)
    ctx.globalAlpha = rimAlpha
    ctx.strokeStyle = tokens.candle
    ctx.lineWidth = tuning.family.rimWidth
    ctx.shadowColor = tokens.candle
    ctx.shadowBlur = rimGlow * k
    ctx.stroke(new Path2D(rimPath(figure)))
    ctx.restore()

    for (const d of [figure.body, figure.hair]) {
      const path = new Path2D(d)
      // Drawn at the cell's fraction of a pixel, and placed on whole pixels, so it stays sharp.
      const [left, top] = [Math.floor(cell.x), Math.floor(cell.y)]
      paper.setTransform(1, 0, 0, 1, 0, 0)
      paper.clearRect(0, 0, scratch.width, scratch.height)
      toDrawing(paper, cell.x - left, cell.y - top)
      paperMargin(paper, path)

      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.shadowColor = withAlpha(tokens.shadow, shadow.opacity)
      ctx.shadowOffsetX = shadow.dx * k
      ctx.shadowOffsetY = shadow.dy * k
      // A canvas blur is twice the SVG filter's standard deviation.
      ctx.shadowBlur = shadow.blur * 2 * k
      ctx.drawImage(scratch, left, top)
      ctx.restore()

      toDrawing(ctx, cell.x, cell.y)
      inkLayer(ctx, path)
    }
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
