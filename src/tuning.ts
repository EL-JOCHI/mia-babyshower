// The tuning module (requirements §11, BR-21). Every number and color that tunes the feel lives here.
// These are starting values. Change them here; components and tests read them.

import type { CatId, Rarity } from './content.ts'
import type { LandmarkId } from './logic/layout.ts'

export interface PieceSpec {
  kind: 'arch' | 'candle' | 'tree' | 'frame' | 'door'
  x: number
  z: number
  height: number
  flip?: boolean
}

// A color straight from the palette, or a mix: from one token toward another by an amount.
export type ColorMix = string | readonly [from: string, to: string, amount: number]

// How the 3D book looks under one theme (design §3): Oscuro is the moonlit attic, Claro the same
// book by day.
export interface WorldLook {
  fog: ColorMix
  wood: ColorMix
  floor: ColorMix
  beam: ColorMix
  // The window's sky, the moon or sun in it, and its halo.
  sky: ColorMix
  orb: ColorMix
  halo: ColorMix
  cloth: ColorMix
  // The key light through the window, and the ambient light from above and below.
  key: ColorMix
  keyIntensity: { boceto: number; luz: number }
  ambientSky: ColorMix
  ambientGround: ColorMix
  ambient: { boceto: number; tinta: number }
  // Pencil paper is bone with no color at this lightness; candles warm it by `warmth`.
  sketchLightness: number
  warmth: number
  dust: ColorMix
}

export interface GateGameConfig {
  durationMs: number
  spawnEveryMs: number
  fallPerS: number
  catchY: number
  catchRadius: number
  heartChance: number
  points: { yarn: number; heart: number }
  comboMax: number
  maxStepMs: number
  spawnMarginX: number
}

// Burton pink noir (design §3).
export const tokens = {
  ink: '#140E14',
  bone: '#F1E7D6',
  rose: '#E08AAB',
  deepRose: '#BB3267',
  plum: '#3C1F3D',
  candle: '#F2B84B',
  // Palette ink as a constant (the theme's --ink flips with the theme): shadows under paper.
  shadow: '#140E14',
  // Fresh paper, lighter than the page: pinned notes, the letter, the QR plate.
  paperWhite: '#FFFFFF',
  // Deep rose, deepened for text on aged parchment: 5.1:1 on the darkest page tint (pageShade).
  pageRose: '#A3285A',
  // Legacy aliases: components not yet ported to the new palette read these names.
  // A later task removes them once every component uses the tokens above directly.
  hotPink: '#E08AAB',
  deepPink: '#BB3267',
  blush: '#F1E7D6',
  paper: '#F1E7D6',
  starYellow: '#F2B84B',
} as const

export type ThemeName = 'dark' | 'light'

export interface ThemeTokens {
  field: string
  ink: string
  accent: string
  accentText: string
  surface: string
  line: string
  buttonBg: string
  buttonInk: string
  catBody: string
  // The paper each cat is cut from (design §4).
  catPaper: string
  // The pop-up pages are parchment in both themes (design §3: bone parchment cards, rose never as
  // text on bone): the paper, the darkest its aged edges get, its ink, its accent text, and its
  // hand-drawn inner line.
  page: string
  pageShade: string
  pageInk: string
  pageAccentText: string
  pageLine: string
}

export const themes: Record<ThemeName, ThemeTokens> = {
  dark: {
    field: tokens.ink,
    ink: tokens.bone,
    accent: tokens.rose,
    accentText: tokens.rose,
    surface: tokens.plum,
    line: 'rgba(224,138,171,0.45)',
    buttonBg: tokens.rose,
    buttonInk: tokens.ink,
    catBody: tokens.ink,
    catPaper: tokens.bone,
    page: tokens.bone,
    pageShade: '#E8DBC4',
    pageInk: tokens.ink,
    pageAccentText: tokens.pageRose,
    pageLine: 'rgba(60,31,61,0.45)',
  },
  light: {
    field: tokens.bone,
    ink: tokens.ink,
    accent: tokens.rose,
    accentText: tokens.deepRose,
    surface: '#FBF5EA',
    line: 'rgba(60,31,61,0.35)',
    buttonBg: tokens.rose,
    buttonInk: tokens.ink,
    catBody: '#111111',
    catPaper: '#FBF5EA',
    page: '#FBF5EA',
    pageShade: tokens.bone,
    pageInk: tokens.ink,
    pageAccentText: tokens.pageRose,
    pageLine: 'rgba(60,31,61,0.4)',
  },
}

// Feeling colors (design §3, an Inside Out touch, original art only).
export const feelingColors: Record<CatId, string> = {
  luz: '#F5C542',
  mimo: '#F28DB2',
  susto: '#A98BEA',
  bram: '#F2784B',
  nana: '#7FD9B0',
  misha: '#8EB8F0',
  kira: '#5FD4D0',
}

// A CSS color mix: from one color toward another by an amount. The colors may be CSS variables,
// so a mix of theme variables follows the theme.
export function cssColor(spec: ColorMix): string {
  if (typeof spec === 'string') return spec
  const [from, to, amount] = spec
  return `color-mix(in oklab, ${from}, ${to} ${Math.round(amount * 100)}%)`
}

export const tuning = {
  room: {
    slotVw: 0.85,
    slotMaxPx: 420,
    cardVw: 0.8,
    cardMaxPx: 380,
    minWidthVw: 3,
    heightVh: 1.5,
    landmarkOffsetVh: 0.1,
  },
  camera: {
    edgeMarginPx: 24,
    arrowStepPx: 120,
    glideMs: 400,
    dragThresholdPx: 6,
  },
  depth: { far: 0.25, mid: 1, near: 1.15 },
  eras: { color: 0.33, threeD: 0.66 },
  noticing: {
    zone: 0.6,
    stillSpeedPxPerS: 40,
    waitMs: { comun: 500, pocoComun: 1500, legendario: 2500 } satisfies Record<Rarity, number>,
    mishaMusicWaitMs: 1200,
    sustoRushPxPerS: 600,
    lingerMs: 1000,
    tickMs: 100,
  },
  gate: {
    countFrom: 9,
    stepMs: 1000,
    finaleMs: 1500,
    // Where the three gate cats rest, as a share of the screen.
    spots: {
      luz: { left: '26%', top: '58%' },
      mimo: { left: '80%', top: '34%' },
      susto: { left: '70%', top: '70%' },
    },
  },
  catSize: { room: 64, qr: 56, door: 68, gate: 72, collection: 56, card: 176, battle: 176 },
  // The cats (design §4): one family of paper cut-outs, drawn in pencil (boceto), then ink (tinta),
  // then light (luz). Line widths and offsets are in the drawing's units (a 120 by 120 box).
  cats: {
    // Pencil graphite on the cut-out paper: ink faded toward the paper.
    pencil: ['var(--shadow)', 'var(--cat-paper)', 0.32] as ColorMix,
    // Mimo keeps a blush body.
    mimoBody: [tokens.bone, tokens.rose, 0.5] as ColorMix,
    // In tinta the feeling color is muted toward pencil gray: this much of it shows.
    tintaFeel: 0.5,
    // The ink stroke, and the lighter second pass offset beside it.
    line: 2.4,
    echo: { width: 1.3, opacity: 0.35, dx: 1.5, dy: -1.1 },
    detail: 1.2,
    // How far the lids' lower edge bows down, as a share of the eye: soft, sleepy lids.
    lidCurve: 0.35,
    // Luz: the feeling color glows around the cat, this many pixels at the room size.
    glowPx: 5,
    // The rig (ms). Blinks and ear twitches are staggered per cat so the family never moves in unison;
    // the tail tip follows the tail after `tailFollowMs`.
    breathMs: 3200,
    blinkMs: { luz: 4100, mimo: 6000, susto: 4600, bram: 5200, nana: 5600, misha: 5900, kira: 4400 } satisfies Record<CatId, number>,
    blinkDelayMs: { luz: 300, mimo: 1700, susto: 900, bram: 2300, nana: 1200, misha: 2900, kira: 600 } satisfies Record<CatId, number>,
    earMs: { luz: 3700, mimo: 7300, susto: 2900, bram: 4900, nana: 6100, misha: 8300, kira: 5300 } satisfies Record<CatId, number>,
    tailMs: 2600,
    tailFollowMs: 180,
    // Each cat's own behavior loop (design §4), while it roams the page.
    behaviorMs: { luz: 2800, mimo: 6400, susto: 5200, bram: 4200, nana: 5400, misha: 4800, kira: 4800 } satisfies Record<CatId, number>,
  },
  // Line boil (design §4): the ink outlines jitter a few times a second. The turbulence seed steps
  // through `seeds` values at `fps`. The paper cut-out grows a rough margin of `radius` around the
  // drawing and casts a soft shadow on the page; cards get a wobbly hand-drawn edge.
  ink: {
    boil: { fps: 8, seeds: 4, frequency: 0.035, octaves: 2, scale: 2.4 },
    paperCut: { radius: 2.4, roughness: 0.12, roughScale: 2.2, shadow: { dx: 1, dy: 2.2, blur: 1.3, opacity: 0.4 } },
    paperEdge: { frequency: 0.03, octaves: 2, scale: 5 },
  },
  // The collectible card (design §6): it flips in, stays for `greetingToastMs`, then leaves.
  card: { flipMs: 800, leaveMs: 420 },
  // The battle screen (design §7): the spiral wipe, the typewriter, the bars, and the win burst.
  battleScreen: { wipeMs: 700, typeMs: 26, linePauseMs: 520, barMs: 650, burstMs: 1400 },
  qr: { minPx: 220 },
  acts: {
    throwMs: 900,
    autoMinMs: 7000,
    autoMaxMs: 14000,
    actMs: 1200,
    scratchFadeMs: 2200,
  },
  greetingToastMs: 4500,
  // The pop-up pages (design §5). A page counts as found once the view rests on it for `settleMs`:
  // within world.stationEps of its station in the book, or, in the flat room, when it is the page
  // nearest the camera and within `reachShare` of the screen of being centred. Gliding past a page
  // does not count. The stamp presses in over `stampMs`; the paper gives a "fwip" over `fwipMs`.
  // Once a drag is released, or `snapDelayMs` after the wheel stops, the view glides to the nearest
  // page if it is within `snapShare` of the spacing between pages (both rooms; arrows and
  // signposts are not snapped).
  pages: { settleMs: 350, reachShare: 0.25, stampMs: 700, fwipMs: 560, snapDelayMs: 250, snapShare: 0.5 },
  // The themed objects on the pages (design §5).
  objects: {
    // The candle is whole `candleDays` before the party and burns down to `candleStub` of its
    // wax at the start. The flame flickers every `flickerMs`; the hourglass pours for `sandMs`.
    // Palabra's candle stands beside the verse with `verseWax` of its wax left.
    candle: { candleDays: 30, candleStub: 0.12, flickerMs: 1700, verseWax: 0.8 },
    sandMs: 3200,
    // A countdown digit flips down over `flipMs` when it changes.
    flipMs: 420,
    // The treasure map unrolls from the centre, then the pin drops.
    map: { unrollMs: 900, pinDelayMs: 650, pinMs: 520 },
    // The wax seal presses onto the letter.
    sealMs: 640,
    // The gift box: the ribbon unties, then the lid lifts.
    gift: { untieMs: 420, liftMs: 700, liftDelayMs: 260 },
  },
  // The quest log and the badge toasts (design §6). A toast stays `toastMs`, fading out over the
  // last `toastLeaveMs`. The XP bar fills over `barMs`.
  quest: { toastMs: 2800, toastLeaveMs: 320, barMs: 600 },
  familyEnterMs: 1800,
  progress: {
    levels: [0, 60, 180, 360, 600],
    badgeXp: { openBook: 10, palabra: 20, fecha: 30, lugar: 30, sellada: 50, regalo: 20, qrGuardado: 20, puerta: 30, primerGato: 20, cuentoCompleto: 100, todosLosGatos: 150 },
    catXp: { comun: 20, pocoComun: 40, legendario: 100 },
  },
  gateGame: { durationMs: 30000, spawnEveryMs: 650, fallPerS: 0.42, catchY: 0.86, catchRadius: 0.09, heartChance: 0.3, points: { yarn: 10, heart: 20 }, comboMax: 5, maxStepMs: 100, spawnMarginX: 0.06 } satisfies GateGameConfig,
  // The 3D pop-up book (design §1, §2, §9). Distances are world units; the floor is y = 0.
  world: {
    dragProgressPerViewport: 0.5,
    glideMs: 700,
    stationEps: 0.04,
    fovPortrait: 58,
    fovLandscape: 42,
    maxDpr: 1.75,
    // Below this width the screen counts as a phone: fewer dust motes.
    phoneMaxPx: 768,
    // The camera path: stations spread along the book in a gentle S. The camera sits `lift` above
    // each station and backs off until a page of `frameWidth` by `frameHeight` fits the screen.
    // The camera looks `lookHeight` above the page's foot, so the tallest page (Presente, with its
    // QR) stands clear of the HUD at the top of a phone.
    path: { length: 19.2, sway: 1.1, lift: 1.6, lookHeight: 1.3, minPullBack: 3.4, frameWidth: 2.2, frameHeight: 5 },
    // Until the cover opens, the camera waits on a wide view of the book, then swoops down to the first page.
    rig: {
      damping: 3,
      // How far the pointer tilts the camera, across and up.
      tilt: { x: 0.18, y: 0.09 },
      near: 0.1,
      far: 60,
      overview: {
        landscape: { position: [-5, 6, 12], look: [-5.5, 0.2, -1] },
        portrait: { position: [-5.5, 6.5, 17], look: [-6, 0, -0.5] },
      },
    },
    // The open book: pages curve down to the cover at the outer edges and dip at the gutter.
    book: { pageWidth: 11.6, pageDepth: 8.4, pageTop: 0.42, coverTop: 0.12, gutterDip: 0.12, gutterWidth: 0.35, edgeCurl: 1.6, coverMargin: 0.3, clothRoughness: 0.85 },
    // A station's page is HTML: `cardPx` wide in a slot `slotPx` tall, drawn `cardWidth` world units wide.
    // It fades in between `fadeFrom` and `fadeTo` of the way up, so a page lying flat far away is not a sliver.
    page: { cardPx: 320, slotPx: 640, cardWidth: 1.8, lift: 0.04, zIndexRange: [100, 0], fadeFrom: 0.2, fadeTo: 0.7 },
    popUp: { range: 0.18, stiffness: 70, damping: 9, stagger: 0.12 },
    // The paper pieces that pop up around each page: x across the page, z toward the camera
    // (the page stands at z = 0), and height in world units.
    pieces: {
      llegada: [
        { kind: 'arch', x: 0, z: -0.7, height: 2.8 },
        { kind: 'tree', x: -1.7, z: -0.35, height: 2.1 },
        { kind: 'tree', x: 1.8, z: -0.45, height: 1.9, flip: true },
      ],
      palabra: [
        { kind: 'frame', x: 0, z: -0.7, height: 2.7 },
        { kind: 'candle', x: -1.25, z: 0.45, height: 0.8 },
        { kind: 'candle', x: 1.3, z: 0.4, height: 0.7 },
      ],
      cuando: [
        { kind: 'arch', x: 0, z: -0.8, height: 3 },
        { kind: 'tree', x: 1.8, z: -0.3, height: 1.9, flip: true },
        { kind: 'candle', x: -1.25, z: 0.45, height: 0.8 },
      ],
      donde: [
        { kind: 'tree', x: -1.8, z: -0.5, height: 2.3 },
        { kind: 'tree', x: 1.8, z: -0.6, height: 2.1, flip: true },
        { kind: 'tree', x: 0.5, z: -1.1, height: 2.7 },
      ],
      confirmar: [
        { kind: 'frame', x: 0, z: -0.75, height: 2.8 },
        { kind: 'tree', x: -1.8, z: -0.35, height: 2 },
        { kind: 'candle', x: 1.3, z: 0.45, height: 0.8 },
      ],
      presente: [
        { kind: 'arch', x: 0, z: -0.75, height: 2.9 },
        { kind: 'candle', x: -1.3, z: 0.45, height: 0.9 },
        { kind: 'candle', x: 1.35, z: 0.4, height: 0.75 },
      ],
      familia: [
        { kind: 'door', x: 0, z: -0.8, height: 3.3 },
        { kind: 'tree', x: -2.2, z: -0.5, height: 2 },
        { kind: 'candle', x: -1.35, z: 0.45, height: 0.9 },
        { kind: 'candle', x: 1.4, z: 0.45, height: 0.9 },
      ],
    } satisfies Record<LandmarkId, readonly PieceSpec[]>,
    // A candle's flame is `scale` times the candle's width and sinks `sink` of its size below the
    // wick; the lit doorway is sized relative to the door.
    flame: { scale: 0.8, sink: 0.35 },
    doorway: { width: 0.52, height: 0.8 },
    // How far around each stage threshold the ink and the light blend in.
    stageBlend: 0.08,
    paper: { roughness: { piece: 0.95, page: 0.9 } },
    // Dust fills a box of air over the book: x from -width/2, y from `bottom`, z from `back`. It bobs
    // up and down by `drift` and sways by `sway` radians, at those speeds.
    dust: {
      phone: 200,
      desktop: 500,
      size: 0.06,
      opacity: 0.55,
      drift: 0.3,
      driftSpeed: 0.2,
      sway: 0.06,
      swaySpeed: 0.05,
      box: { width: 28, bottom: 0.3, height: 6.5, back: -8, depth: 16 },
    },
    // Oscuro: the moonlit attic. The moonlight is the moon's blue softened toward bone, so the
    // paper reads as paper.
    night: {
      fog: tokens.plum,
      wood: [tokens.ink, tokens.plum, 0.55],
      floor: tokens.plum,
      beam: tokens.ink,
      sky: [tokens.ink, feelingColors.misha, 0.18],
      orb: tokens.bone,
      halo: feelingColors.misha,
      cloth: [tokens.plum, tokens.deepRose, 0.35],
      key: [feelingColors.misha, tokens.bone, 0.7],
      keyIntensity: { boceto: 1.3, luz: 0.6 },
      ambientSky: [feelingColors.misha, tokens.bone, 0.7],
      ambientGround: tokens.plum,
      ambient: { boceto: 0.25, tinta: 0.6 },
      sketchLightness: 0.72,
      warmth: 0.32,
      dust: tokens.bone,
    } satisfies WorldLook,
    // Claro: the same book by day. Bone parchment and pale wood under a daylight window with the
    // sun in it, ink lines, deep rose accents; the candles still warm the pages toward the door.
    day: {
      fog: tokens.bone,
      wood: [tokens.bone, tokens.plum, 0.38],
      floor: [tokens.bone, tokens.plum, 0.5],
      beam: [tokens.plum, tokens.bone, 0.2],
      sky: [feelingColors.misha, tokens.bone, 0.45],
      orb: tokens.candle,
      halo: tokens.candle,
      cloth: tokens.deepRose,
      key: tokens.bone,
      keyIntensity: { boceto: 1.7, luz: 1.2 },
      ambientSky: tokens.bone,
      ambientGround: tokens.rose,
      ambient: { boceto: 0.8, tinta: 1 },
      sketchLightness: 0.86,
      warmth: 0.25,
      dust: tokens.candle,
    } satisfies WorldLook,
    // The canvas drawing of the paper: pencil passes, ink strokes (in SVG units), page grain, and
    // how dark the page border, gutter shadow, page edges, and floor seams are.
    art: {
      pencil: { alpha: 0.32, width: 0.9, offset: [0.7, -0.5] },
      ink: { outline: 2.6, detail: 1.6 },
      grain: { specks: 5000, alpha: 0.03, alphaRange: 0.05 },
      pageBorderAlpha: 0.22,
      gutterShadow: 0.45,
      pageEdgeAlpha: 0.18,
      floor: { seamAlpha: 0.5, grainAlpha: 0.08 },
    },
    light: {
      moonFrom: [-5, 14, 9],
      candle: 14,
      // Candles start at this share of their brightness and reach full brightness at the door.
      candleBase: 0.55,
      candleDistance: 11,
      flicker: 0.12,
      // Two waves per candle make a soft, uneven flicker: their speeds, and each candle's phase step.
      flickerWaves: { fast: 9, slow: 3.1, phase: 1.7 },
      shadowMapPx: 512,
      // Candles stand along the path near the end of the book; the last one lights the door and casts shadows.
      candleAt: [0.83, 1],
      candleOffset: [1.3, 1.2, 0.9],
      doorOffset: [0, 1.5, -1.4],
    },
    fog: { near: 9, far: 32 },
    // The attic: a gable wall with a round window behind the book, and a roof sloping to the eaves.
    attic: {
      wallZ: -10,
      frontZ: 20,
      halfWidth: 18,
      ridge: 10,
      eave: 1.2,
      windowY: 6.4,
      windowRadius: 1.7,
      rafterGap: 4,
      // The moon (or the sun, by day) sits a little up and to the right in the window, with a soft halo.
      moon: { x: 0.5, y: 0.4, radius: 0.62, halo: 1.15, haloOpacity: 0.22 },
      // The sky disc behind the window is this much wider than the window.
      skyScale: 1.3,
      roughness: { floor: 0.95, wall: 1, beam: 1 },
    },
    coverFlipMs: 900,
    // Facts are never gated: if the world has not drawn its first frame by then, the flat room takes over.
    loadTimeoutMs: 6000,
  },
  battle: { energy: 100, patience: 100, damage: { ovillo: 35, mimos: 25, ronroneo: 20 }, boost: 1.5, effectiveAt: 35, catDamage: [12, 15, 10, 18], floor: 1, safetyRestore: 30 },
} as const
