import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { shared } from '../content'
import { themeCss } from '../headMeta'
import pagesCss from '../styles/pages.css?raw'
import { tuning, type ThemeName } from '../tuning'
import {
  alignmentCentres,
  alignmentPatterns,
  emblemRect,
  finderPatterns,
  inside,
  moduleRuns,
  overlaps,
  qrMatrix,
  screenCode,
  type ModuleRect,
  type ModuleRun,
  type QrMatrix,
} from './qr'

const payload = shared.giftQr

interface Raster {
  width: number
  height: number
  data: Uint8ClampedArray<ArrayBuffer>
}

const decode = (raster: Raster) => jsQR(raster.data, raster.width, raster.height, { inversionAttempts: 'dontInvert' })?.data

// The colors the page gives the drawing, per theme: the CSS variable each rule of pages.css fills
// with, resolved in the head's theme tokens (src/headMeta.ts), as luminance (Rec. 709, as jsqr
// reads it). A module fill that flipped with the theme would fail the decode in one theme.
const css = pagesCss.replace(/\/\*[\s\S]*?\*\//g, '')

function fillVariable(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const body = css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1]
  const name = body?.match(/(?:^|;|\s)fill:\s*var\((--[\w-]+)\)/)?.[1]
  if (!name) throw new Error(`pages.css gives ${selector} no fill variable`)
  return name
}

function luminance(theme: ThemeName, variable: string): number {
  const block = themeCss().match(new RegExp(`:root\\[data-theme="${theme}"\\]\\{([^}]*)\\}`))?.[1] ?? ''
  const value = block
    .split(';')
    .find((declaration) => declaration.startsWith(`${variable}:`))
    ?.slice(variable.length + 1)
  if (!value || !/^#[0-9A-Fa-f]{6}$/.test(value)) throw new Error(`${variable} is not a hex color in the ${theme} theme`)
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(value.slice(at, at + 2), 16)) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

interface Ink {
  paper: number
  modules: number
  eyes: number
}

function inkFor(theme: ThemeName): Ink {
  return {
    paper: luminance(theme, fillVariable('.gift-qr-paper')),
    modules: luminance(theme, fillVariable('.gift-qr-modules')),
    eyes: luminance(theme, fillVariable('.gift-qr-eye')),
  }
}

const themeNames: ThemeName[] = ['dark', 'light']

function paint(width: number, gray: (x: number, y: number) => number): Raster {
  const data = new Uint8ClampedArray(width * width * 4)
  for (let y = 0; y < width; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      data[i] = data[i + 1] = data[i + 2] = Math.round(gray(x, y))
      data[i + 3] = 255
    }
  }
  return { width, height: width, data }
}

// The code as square modules of `cell` whole pixels, with its quiet zone, in a theme's ink on its
// paper. Modules inside `light` are paper (the emblem's square); modules inside `flip` are the
// opposite of the matrix's (the worst any drawing over them could do).
function squareRaster(matrix: QrMatrix, cell: number, ink: Ink, options: { light?: ModuleRect; flip?: ModuleRect } = {}): Raster {
  const { quiet } = tuning.qr
  const eyes = finderPatterns(matrix.size)
  return paint((matrix.size + 2 * quiet) * cell, (x, y) => {
    const row = Math.floor(y / cell) - quiet
    const col = Math.floor(x / cell) - quiet
    if (row < 0 || col < 0 || row >= matrix.size || col >= matrix.size) return ink.paper
    let dark = matrix.modules[row]![col]!
    if (options.light && inside(options.light, row, col)) dark = false
    if (options.flip && inside(options.flip, row, col)) dark = !dark
    if (!dark) return ink.paper
    return eyes.some((eye) => inside(eye, row, col)) ? ink.eyes : ink.modules
  })
}

function inRoundedRect(x: number, y: number, left: number, top: number, width: number, height: number, radius: number): boolean {
  if (x < left || x > left + width || y < top || y > top + height) return false
  const dx = Math.max(left + radius - x, 0, x - (left + width - radius))
  const dy = Math.max(top + radius - y, 0, y - (top + height - radius))
  return dx * dx + dy * dy <= radius * radius
}

// The drawing as GiftQr's SVG draws it, `sizePx` square for its whole viewBox (the code and its
// quiet zone): each run a pill `module` tall with round ends, each eye a rounded ring and a rounded
// pupil, and the emblem's square left as paper. Each pixel blends paper and ink by how much of it
// the shapes cover (samples² points), as a browser antialiases a shape edge that falls inside a pixel.
function drawnRaster(sizePx: number, ink: Ink, samples = 4): Raster {
  const { quiet, module, eyeOuter, eyeInner, eyePupil } = tuning.qr
  const { matrix, eyes, runs } = screenCode(payload)
  const scale = sizePx / (matrix.size + 2 * quiet)
  const byRow = new Map<number, ModuleRun[]>()
  for (const run of runs) byRow.set(run.row, [...(byRow.get(run.row) ?? []), run])
  const inRun = (x: number, y: number) =>
    (byRow.get(Math.floor(y)) ?? []).some((run) =>
      inRoundedRect(x, y, run.from, run.row + (1 - module) / 2, run.to - run.from, module, module / 2),
    )
  const inEye = (x: number, y: number) =>
    eyes.some(
      ({ row, col }) =>
        (inRoundedRect(x, y, col, row, 7, 7, eyeOuter) && !inRoundedRect(x, y, col + 1, row + 1, 5, 5, eyeInner)) ||
        inRoundedRect(x, y, col + 2, row + 2, 3, 3, eyePupil),
    )
  return paint(sizePx, (px, py) => {
    let modules = 0
    let eyeCover = 0
    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const x = (px + (sx + 0.5) / samples) / scale - quiet
        const y = (py + (sy + 0.5) / samples) / scale - quiet
        if (inRun(x, y)) modules += 1
        else if (inEye(x, y)) eyeCover += 1
      }
    }
    const n = samples * samples
    return ink.paper + ((ink.modules - ink.paper) * modules) / n + ((ink.eyes - ink.paper) * eyeCover) / n
  })
}

describe('the gift QR payload (spec §2)', () => {
  it('is the bank payload: 369 characters of base64-like text', () => {
    expect(payload).toHaveLength(369)
    expect(payload).toMatch(/^[A-Za-z0-9+/=|]+$/)
  })
})

describe('the screen matrix (spec §2 Encoder, controller ruling 2)', () => {
  it('encodes the screen code at error correction Q: version 18, 89 modules', () => {
    // At H the payload needs version 20 (97 modules), too fine to read at 220 px; Q recovers 25%.
    expect(tuning.qr.screenLevel).toBe('Q')
    expect(qrMatrix(payload, 'Q').size).toBe(89)
    expect(qrMatrix(payload, 'H').size).toBe(97)
    expect(screenCode(payload).matrix.size).toBe(89)
  })

  it('knows where the alignment patterns sit', () => {
    expect(alignmentCentres(89)).toEqual([6, 30, 56, 82])
    expect(alignmentCentres(97)).toEqual([6, 34, 62, 90])
    expect(alignmentCentres(69)).toEqual([6, 34, 62])
    expect(alignmentCentres(21)).toEqual([])
    expect(alignmentPatterns(89)).toHaveLength(13)
  })

  it('draws the paper, the modules, and the eyes in colors that do not flip with the theme', () => {
    for (const theme of themeNames) {
      const ink = inkFor(theme)
      expect(ink.modules, theme).toBeLessThan(ink.paper / 4)
      expect(ink.eyes, theme).toBeLessThan(ink.paper / 4)
    }
  })

  // A smaller, idealized grid: square modules of whole pixels, the on-screen module size (about 2.27
  // px) rounded down to 2, so the code is 194 px rather than 220, with crisp edges and the emblem forced
  // light, in both themes.
  it.each(themeNames)('decodes back to the exact payload on an idealized 2 px grid, emblem forced light (%s theme)', (theme) => {
    const { matrix, emblem } = screenCode(payload)
    const cell = Math.round(tuning.qr.minPx / (matrix.size + 2 * tuning.qr.quiet))
    expect(cell).toBe(2)
    expect(decode(squareRaster(matrix, cell, inkFor(theme), { light: emblem }))).toBe(payload)
  })

  // Controller ruling 2: the round trip at the real on-screen module size, tuning.qr.minPx (220 px)
  // across the code and its quiet zone, as the SVG draws it: rounded runs and eyes, antialiased at the
  // fractional module size, the emblem's square left as paper (forced light), in both themes' colors.
  it.each(themeNames)('decodes the drawing itself at the real on-screen size, 220 px, rounded runs and eyes antialiased, to the exact payload (%s theme)', (theme) => {
    expect(tuning.qr.minPx).toBe(220)
    expect(decode(drawnRaster(tuning.qr.minPx, inkFor(theme)))).toBe(payload)
  })

  it('still decodes with every module under the emblem flipped, whatever the cat drawing covers', () => {
    const { matrix, emblem } = screenCode(payload)
    const cell = Math.round(tuning.qr.minPx / (matrix.size + 2 * tuning.qr.quiet))
    expect(decode(squareRaster(matrix, cell, inkFor('light'), { flip: emblem }))).toBe(payload)
  })
})

describe('the emblem (spec §2 On screen, controller ruling 2)', () => {
  const { matrix, emblem, eyes } = screenCode(payload)

  it('sits in the centre and covers at most about 5% of the code', () => {
    expect(emblem.size).toBeGreaterThan(0)
    expect(emblem.size % 2).toBe(1)
    expect(emblem.row).toBe((matrix.size - emblem.size) / 2)
    expect(emblem.col).toBe(emblem.row)
    expect(emblem.size ** 2 / matrix.size ** 2).toBeLessThanOrEqual(tuning.qr.maxEmblemShare)
    expect(tuning.qr.maxEmblemShare).toBeLessThanOrEqual(0.05)
  })

  it('never lies over a finder pattern or an alignment pattern', () => {
    for (const eye of eyes) expect(overlaps(emblem, eye)).toBe(false)
    for (const pattern of alignmentPatterns(matrix.size)) expect(overlaps(emblem, pattern)).toBe(false)
    expect(finderPatterns(matrix.size)).toEqual(eyes)
  })

  it('shrinks when a pattern sits in the centre: no emblem at all on a version-13 code', () => {
    expect(emblemRect(69).size).toBe(0)
  })
})

describe('the screen drawing (spec §2 On screen)', () => {
  const { matrix, emblem, eyes, runs } = screenCode(payload)

  it('draws every dark module outside the eyes and the emblem once, and no light module', () => {
    const drawn = new Set<string>()
    for (const run of runs) {
      expect(run.to).toBeGreaterThan(run.from)
      for (let col = run.from; col < run.to; col++) {
        const key = `${run.row},${col}`
        expect(drawn.has(key), key).toBe(false)
        drawn.add(key)
        expect(matrix.modules[run.row]![col], key).toBe(true)
      }
    }
    let expected = 0
    matrix.modules.forEach((line, row) =>
      line.forEach((dark, col) => {
        if (dark && ![...eyes, emblem].some((rect) => inside(rect, row, col))) expected += 1
      }),
    )
    expect(drawn.size).toBe(expected)
  })

  it("leaves the finder patterns to the eyes, which match the code's own finders", () => {
    for (const eye of eyes) {
      // A finder: a dark 7×7 ring, a light ring, and a dark 3×3 pupil.
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const ring = r === 0 || r === 6 || c === 0 || c === 6
          const pupil = r >= 2 && r <= 4 && c >= 2 && c <= 4
          expect(matrix.modules[eye.row + r]![eye.col + c]).toBe(ring || pupil)
        }
      }
    }
    expect(moduleRuns(matrix, eyes).some((run) => eyes.some((eye) => inside(eye, run.row, run.from)))).toBe(false)
  })
})
