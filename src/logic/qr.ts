import qrcode from 'qrcode-generator'
import { tuning } from '../tuning'

// Spec §2 The gift QR: the bank's payload re-encoded here, so the screen can draw it in the
// invitation's style. Guardar QR saves the bank's own image instead (controller ruling 1).
// Pure: no DOM.

export type QrLevel = 'L' | 'M' | 'Q' | 'H'

// A QR code's modules, row by row: true is dark.
export interface QrMatrix {
  size: number
  modules: readonly (readonly boolean[])[]
}

// A square of modules: its top row, its left column, and its side.
export interface ModuleRect {
  row: number
  col: number
  size: number
}

// A horizontal run of dark modules in one row, from `from` up to (not including) `to`.
export interface ModuleRun {
  row: number
  from: number
  to: number
}

// The payload as bytes, at the given error correction, in the smallest version that holds it.
export function qrMatrix(payload: string, level: QrLevel): QrMatrix {
  const code = qrcode(0, level)
  code.addData(payload, 'Byte')
  code.make()
  const size = code.getModuleCount()
  const modules = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => code.isDark(row, col)))
  return { size, modules }
}

// The three finder patterns, 7 modules a side, at the top-left, top-right, and bottom-left corners.
export function finderPatterns(size: number): ModuleRect[] {
  return [
    { row: 0, col: 0, size: 7 },
    { row: 0, col: size - 7, size: 7 },
    { row: size - 7, col: 0, size: 7 },
  ]
}

// The rows (and columns) where the alignment patterns are centred, for the code's version
// (ISO/IEC 18004 Annex E). Each pattern is 5 modules a side around its centre.
export function alignmentCentres(size: number): number[] {
  const version = (size - 17) / 4
  if (version < 2) return []
  const count = Math.floor(version / 7) + 2
  const last = size - 7
  const step = version === 32 ? 26 : Math.ceil((last - 6) / (count - 1) / 2) * 2
  return [6, ...Array.from({ length: count - 1 }, (_, i) => last - (count - 2 - i) * step)]
}

// The alignment patterns that exist: every pair of centres except the three under the finders.
export function alignmentPatterns(size: number): ModuleRect[] {
  const centres = alignmentCentres(size)
  const last = centres[centres.length - 1]
  const underFinder = (r: number, c: number) => (r === 6 && c === 6) || (r === 6 && c === last) || (r === last && c === 6)
  return centres.flatMap((r) => centres.filter((c) => !underFinder(r, c)).map((c) => ({ row: r - 2, col: c - 2, size: 5 })))
}

export function overlaps(a: ModuleRect, b: ModuleRect): boolean {
  return a.row < b.row + b.size && b.row < a.row + a.size && a.col < b.col + b.size && b.col < a.col + a.size
}

export function inside(rect: ModuleRect, row: number, col: number): boolean {
  return row >= rect.row && row < rect.row + rect.size && col >= rect.col && col < rect.col + rect.size
}

// The cat emblem's square, centred: an odd side near `emblemShare` of the code's width, shrunk until
// it covers at most `maxEmblemShare` of the code's area and no finder or alignment pattern (a side
// of 0 means no emblem fits).
export function emblemRect(size: number): ModuleRect {
  const { emblemShare, maxEmblemShare } = tuning.qr
  const patterns = [...finderPatterns(size), ...alignmentPatterns(size)]
  let side = Math.floor(size * emblemShare)
  if (side % 2 === 0) side -= 1
  const at = (s: number): ModuleRect => ({ row: (size - s) / 2, col: (size - s) / 2, size: s })
  while (side > 0 && (side * side > maxEmblemShare * size * size || patterns.some((p) => overlaps(at(side), p)))) side -= 2
  return at(Math.max(side, 0))
}

// The dark modules as horizontal runs, row by row, leaving out the squares in `skip` (the finder
// patterns, drawn as eyes, and the emblem).
export function moduleRuns(matrix: QrMatrix, skip: readonly ModuleRect[]): ModuleRun[] {
  const runs: ModuleRun[] = []
  matrix.modules.forEach((line, row) => {
    let from = -1
    for (let col = 0; col <= matrix.size; col++) {
      const dark = col < matrix.size && line[col] === true && !skip.some((rect) => inside(rect, row, col))
      if (dark && from < 0) from = col
      if (!dark && from >= 0) {
        runs.push({ row, from, to: col })
        from = -1
      }
    }
  })
  return runs
}

// What the screen draws (spec §2 On screen): the matrix at tuning.qr.screenLevel, its three eyes, its
// emblem, and the rest of its dark modules as runs.
export interface ScreenCode {
  matrix: QrMatrix
  eyes: ModuleRect[]
  emblem: ModuleRect
  runs: ModuleRun[]
}

export function screenCode(payload: string): ScreenCode {
  const matrix = qrMatrix(payload, tuning.qr.screenLevel)
  const eyes = finderPatterns(matrix.size)
  const emblem = emblemRect(matrix.size)
  return { matrix, eyes, emblem, runs: moduleRuns(matrix, [...eyes, emblem]) }
}
