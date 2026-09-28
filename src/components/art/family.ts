// Spec §6: the family as paper pop-ups. Four faceless figures told apart by height and hair, drawn
// once as SVG paths and used everywhere: the CSS paper family on the Familia card, and the texture of
// the 3D cutouts in the book (src/world/familySheet.ts). Each figure is paper layers: its body (with
// its head), its hair in front, and a rim of backlight behind. No faces, no clothes detail, no inner
// lines but the hair's outline: each layer is one closed outline, so its ink never crosses inside.
// Drawn by hand in the cats' manner (lanky, a little crooked, holding hands), from these shapes,
// never from a photo. Coordinates are the door drawing's (320 × 250, the floor at y = 236).

export type FigureId = 'dad' | 'mom' | 'miguelito' | 'mia'
export type FamilyLayer = 'rim' | 'body' | 'hair'

// Back to front.
export const familyLayers: readonly FamilyLayer[] = ['rim', 'body', 'hair']

export interface FamilyFigure {
  id: FigureId
  // The figure's box in the drawing: left edge, top, width, and height (feet on the floor).
  box: { x: number; y: number; width: number; height: number }
  body: string
  hair: string
}

export const familyFloor = 236
export const familyDrawing = { width: 320, height: 250 }
// The lit doorway inside the arch, where the family stands.
export const familyDoorway = { x: 66, y: 40, width: 188, height: 196 }
export const familyCentreX = 160

const round = (value: number) => Math.round(value * 100) / 100

// A point of an outline. A third value of 0 makes it a corner (a heel, a fingertip, an armpit);
// otherwise the line runs smoothly through it.
type Point = readonly [x: number, y: number, bend?: number]

// A closed, hand-drawn outline through the points: a Catmull-Rom curve, so the line wobbles gently
// from point to point the way a pen does, instead of snapping to circles and straight rules.
function outline(points: readonly Point[]): string {
  const n = points.length
  const at = (i: number) => points[(i + n) % n]!
  const [x0, y0] = at(0)
  const segments = points.map((_, i) => {
    const [ax, ay] = at(i - 1)
    const [bx, by, bBend = 1] = at(i)
    const [cx, cy, cBend = 1] = at(i + 1)
    const [dx, dy] = at(i + 2)
    const c1 = [round(bx + ((cx - ax) / 6) * bBend), round(by + ((cy - ay) / 6) * bBend)]
    const c2 = [round(cx - ((dx - bx) / 6) * cBend), round(cy - ((dy - by) / 6) * cBend)]
    return `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${round(cx)} ${round(cy)}`
  })
  return `M${round(x0)} ${round(y0)} ${segments.join(' ')} Z`
}

// A head of curls as one outline: `pairs` big curls with a small curl between each, round the crown
// (cx, cy, rx by ry) from angle `from` to `to` (degrees; 90 is straight down). Each curl is an arc
// bulging out a little past a half circle, so the curls meet in small nicks like a pen's loops, and
// no two are quite the same size or quite on the ring. A head that is not curly all round closes
// under the crown with a smooth nape. One outline, so its ink shows no line inside the hair.
function curlyHair(cx: number, cy: number, rx: number, ry: number, pairs: number, from: number, to: number): string {
  const count = pairs * 2
  const steps = Array.from({ length: count }, (_, i) => (i % 2 === 0 ? 1.6 : 0.7) * (1 + 0.15 * Math.sin(i * 1.9)))
  const total = steps.reduce((sum, step) => sum + step, 0)
  let angle = from
  const points = [0, ...steps].map((step) => {
    angle += ((to - from) * step) / total
    const a = (angle * Math.PI) / 180
    const wobble = 1 + 0.05 * Math.sin(angle * 0.13 + 1)
    return [round(cx + rx * wobble * Math.cos(a)), round(cy + ry * wobble * Math.sin(a))] as const
  })
  const curls = points.slice(1).map(([x, y], i) => {
    const [px, py] = points[i]!
    const r = round((Math.hypot(x - px, y - py) / 2) * 1.12)
    return `a${r} ${r} 0 1 1 ${round(x - px)} ${round(y - py)}`
  })
  const [x0, y0] = points[0]!
  const [xn, yn] = points[count]!
  const nape = to - from >= 360 ? '' : ` C${round(xn - rx * 0.3)} ${round(yn + ry * 0.35)} ${round(x0 + rx * 0.3)} ${round(y0 + ry * 0.35)} ${x0} ${y0}`
  return `M${x0} ${y0} ${curls.join(' ')}${nape} Z`
}

export const familyFigures: readonly FamilyFigure[] = [
  {
    // Dad: the tallest, lanky, with a full afro of curls (requirements §3 The family door). He
    // holds Mia's hand on one side and mom's on the other.
    id: 'dad',
    box: { x: 90, y: 53, width: 68, height: 183 },
    body: outline([
      [125, 85],
      [134, 88.5],
      [137.5, 98],
      [134.5, 107.5],
      [130, 112.5],
      [129.5, 118.5],
      [137, 120.5],
      [145, 126],
      [149, 139],
      [151.5, 155],
      [153, 170],
      [154.5, 180],
      [156.5, 186],
      [154, 191.5, 0],
      [150, 187.5],
      [148.5, 179],
      [146.5, 166],
      [144.5, 152],
      [139, 142, 0],
      [138.5, 153],
      [137, 166],
      [137.5, 180],
      [136, 200],
      [134.5, 219],
      [134, 229],
      [143.5, 234.5, 0],
      [142.5, 236, 0],
      [130, 236, 0],
      [129.5, 222],
      [128.5, 202],
      [125, 188, 0],
      [121.5, 202],
      [120.5, 222],
      [119.5, 236, 0],
      [107.5, 236, 0],
      [106.5, 234.5, 0],
      [115.5, 229],
      [114.5, 219],
      [113.5, 200],
      [112.5, 180],
      [113, 166],
      [112, 152],
      [111, 141, 0],
      [105.5, 147],
      [104, 157],
      [103.5, 172],
      [104.5, 183],
      [105, 190],
      [101.5, 193.5, 0],
      [99, 188],
      [98.5, 182],
      [97, 171],
      [96.5, 155],
      [98.5, 138],
      [104, 125],
      [112, 120.5],
      [120.5, 118.5],
      [120, 112.5],
      [115.5, 107.5],
      [112.5, 98],
      [116, 88.5],
    ]),
    hair: curlyHair(124, 85, 28.5, 26, 16, 145, 395),
  },
  {
    // Mom: tall and slender in a long A-line shape, her long straight hair falling down her back.
    // One hand in dad's, the other arm round Miguelito.
    id: 'mom',
    box: { x: 149, y: 85, width: 66, height: 151 },
    body: outline([
      [173, 87],
      [182, 91],
      [184, 101],
      [180, 110],
      [177, 114],
      [177, 121],
      [184, 124],
      [190, 129],
      [194, 139],
      [199, 153],
      [204, 167],
      [208, 177],
      [212, 181.5],
      [214, 186.5, 0],
      [210, 187],
      [205.5, 181],
      [200.5, 170],
      [195.5, 156],
      [187.5, 143, 0],
      [185.5, 154],
      [184.5, 165],
      [187.5, 180],
      [191, 196],
      [194, 211, 0],
      [187, 212.5],
      [183, 213, 0],
      [182.5, 224],
      [182, 230],
      [189, 235, 0],
      [188, 236, 0],
      [178, 236, 0],
      [177.5, 226],
      [177.5, 213.5, 0],
      [173.5, 214],
      [169.5, 213.5, 0],
      [169, 226],
      [169, 236, 0],
      [159, 236, 0],
      [158, 235, 0],
      [164.5, 230],
      [164.5, 224],
      [164, 213, 0],
      [160, 212.5],
      [154.5, 211, 0],
      [157.5, 196],
      [160.5, 180],
      [163.5, 165],
      [162.5, 154],
      [161.5, 144, 0],
      [159, 155],
      [157.5, 168],
      [157, 180],
      [156.5, 188],
      [153, 192, 0],
      [150, 187.5],
      [151.5, 181],
      [151.5, 172],
      [152.5, 157],
      [154.5, 141],
      [158, 130],
      [164, 124],
      [170, 121],
      [170, 114],
      [166, 110],
      [162, 101],
      [165, 91],
    ]),
    // Straight: a round crown that hugs the head, then long hair falling straight down her back to
    // a blunt, slightly ragged cut.
    hair: outline([
      [160.5, 148, 0],
      [159.5, 133],
      [159.5, 118],
      [161, 105],
      [165, 93],
      [173, 86.5],
      [181.5, 90],
      [186, 101],
      [188, 116],
      [188.5, 132],
      [187.5, 147, 0],
      [181.5, 149.5, 0],
      [176, 147.5],
      [169.5, 150, 0],
      [165, 147.5],
    ]),
  },
  {
    // Miguelito: shorter than the parents, curly, mom's arm round his shoulders.
    id: 'miguelito',
    box: { x: 202, y: 142, width: 38, height: 94 },
    body: outline([
      [221, 150],
      [228, 152.5],
      [230.5, 160],
      [228, 166.5],
      [224.5, 170.5],
      [224.5, 175.5],
      [230, 177.5],
      [233.5, 181.5],
      [236.5, 189],
      [238, 198],
      [239, 207],
      [239.5, 213],
      [237, 217.5, 0],
      [234.5, 213],
      [234.5, 208],
      [234.5, 200],
      [233.5, 193],
      [229, 190, 0],
      [228, 197],
      [227.5, 205],
      [228, 211],
      [227, 222],
      [227, 230],
      [233.5, 235, 0],
      [233, 236, 0],
      [223, 236, 0],
      [222.5, 226],
      [221, 216, 0],
      [219.5, 226],
      [219, 236, 0],
      [209, 236, 0],
      [208.5, 235, 0],
      [215.5, 230],
      [215, 222],
      [214, 211],
      [214.5, 205],
      [214, 197],
      [213, 190, 0],
      [208.5, 193],
      [207.5, 200],
      [207.5, 208],
      [207.5, 213],
      [205, 217.5, 0],
      [202.5, 213],
      [203, 207],
      [204, 198],
      [205.5, 189],
      [208.5, 181.5],
      [212, 177.5],
      [217.5, 175.5],
      [217.5, 170.5],
      [214, 166.5],
      [211.5, 160],
      [214, 152.5],
    ]),
    hair: curlyHair(221, 155, 9.5, 9, 10, -90, 270),
  },
  {
    // Mia: the smallest, curly, in a little smock, reaching up to hold dad's hand.
    id: 'mia',
    box: { x: 74, y: 184, width: 32, height: 52 },
    body: outline([
      [85, 190],
      [91, 192],
      [92.5, 198.5],
      [90, 204],
      [87.5, 206.5],
      [90.5, 207.5],
      [95, 205],
      [98.5, 201.5],
      [100.5, 196.5],
      [101, 192.5],
      [104, 190, 0],
      [105.5, 193.5],
      [104, 198],
      [101.5, 204],
      [97.5, 209.5],
      [94.5, 212, 0],
      [96.5, 219],
      [98.5, 226, 0],
      [93.5, 227.5],
      [91.5, 227, 0],
      [91.5, 232],
      [96, 235.5, 0],
      [95.5, 236, 0],
      [87.5, 236, 0],
      [87.5, 228, 0],
      [86, 228.5],
      [84.5, 228, 0],
      [84.5, 236, 0],
      [77, 236, 0],
      [76.5, 235.5, 0],
      [81, 232],
      [81, 227, 0],
      [78.5, 227.5],
      [74.5, 226, 0],
      [76, 219],
      [78, 212.5],
      [80.5, 208.5],
      [82.5, 206.5],
      [80, 204],
      [77.5, 198.5],
      [79, 192],
    ]),
    hair: curlyHair(85, 194.5, 7, 6.5, 9, -90, 270),
  },
]

// The rim of backlight follows the whole outline: body and hair together.
export function rimPath(figure: FamilyFigure): string {
  return `${figure.body} ${figure.hair}`
}
