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
  // Legacy aliases: components not yet ported to the new palette read these names.
  // A later task removes them once every component uses the tokens above directly.
  fieldDark: '#140E14',
  inkLight: '#140E14',
  hotPink: '#E08AAB',
  deepPink: '#BB3267',
  blush: '#F1E7D6',
  paper: '#F1E7D6',
  gold: '#F2B84B',
  starYellow: '#F2B84B',
  shadow: '#140E14',
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

// Legacy alias: components not yet ported to the new palette still import catAccents.
// A later task removes this once every component reads feelingColors directly.
export const catAccents: Record<CatId, string> = feelingColors

// The shared cat face: big simple eyes and white linework.
export const catFace = {
  eyeWhite: '#FFFFFF',
  pupil: '#0A0A0A',
  line: '#FFFFFF',
  mimoOutline: tokens.inkLight,
} as const

// In the pixel era every accent renders as rose or bone.
// TODO(later task): the pixel era is going away; this map goes with it.
export const catPixelAccents: Record<CatId, string> = {
  luz: tokens.rose,
  mimo: tokens.rose,
  susto: tokens.bone,
  bram: tokens.rose,
  nana: tokens.bone,
  misha: tokens.bone,
  kira: tokens.bone,
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
  catSize: { room: 64, qr: 56, door: 68, gate: 72, collection: 56 },
  qr: { minPx: 220 },
  acts: {
    throwMs: 900,
    autoMinMs: 7000,
    autoMaxMs: 14000,
    actMs: 1200,
    scratchFadeMs: 2200,
  },
  greetingToastMs: 4500,
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
    path: { length: 19.2, sway: 1.1, lift: 1.6, lookHeight: 1, minPullBack: 3.4, frameWidth: 2.2, frameHeight: 5 },
    // Until the cover opens, the camera waits on a wide view of the book, then swoops down to the first page.
    rig: {
      damping: 3,
      tilt: 0.18,
      near: 0.1,
      far: 60,
      overview: {
        landscape: { position: [-5, 6, 12], look: [-5.5, 0.2, -1] },
        portrait: { position: [-5.5, 6.5, 17], look: [-6, 0, -0.5] },
      },
    },
    // The open book: pages curve down to the cover at the outer edges and dip at the gutter.
    book: { pageWidth: 11.6, pageDepth: 8.4, pageTop: 0.42, coverTop: 0.12, gutterDip: 0.12, gutterWidth: 0.35, edgeCurl: 1.6, coverMargin: 0.3 },
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
    // A candle's flame and the lit doorway, as sizes relative to their piece.
    flameSize: 0.4,
    doorway: { width: 0.52, height: 0.8 },
    // How far around each stage threshold the ink and the light blend in.
    stageBlend: 0.08,
    paper: { sketchLightness: 0.72, warmth: 0.32 },
    // Dust fills a box of air over the book: x from -width/2, y from `bottom`, z from `back`.
    dust: { phone: 200, desktop: 500, size: 0.06, opacity: 0.55, drift: 0.3, box: { width: 28, bottom: 0.3, height: 6.5, back: -8, depth: 16 } },
    // How much of the second token each surface mixes in: wood (ink to plum), night sky (ink to moon
    // blue), and the book's cloth cover (plum to deep rose).
    tints: { wood: 0.55, sky: 0.18, cloth: 0.35 },
    light: {
      moonColor: feelingColors.misha,
      // The moonlight is the moon's blue softened toward bone, so the paper reads as paper.
      moonSoften: 0.7,
      moonFrom: [-5, 14, 9],
      moon: { boceto: 1.3, luz: 0.6 },
      ambient: { boceto: 0.25, tinta: 0.6 },
      candle: 14,
      // Candles start at this share of their brightness and reach full brightness at the door.
      candleBase: 0.55,
      candleDistance: 11,
      flicker: 0.12,
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
      // The moon sits a little up and to the right in the window, with a soft halo.
      moon: { x: 0.5, y: 0.4, radius: 0.62, halo: 1.15, haloOpacity: 0.22 },
    },
    coverFlipMs: 900,
  },
  battle: { energy: 100, patience: 100, damage: { ovillo: 35, mimos: 25, ronroneo: 20 }, boost: 1.5, effectiveAt: 35, catDamage: [12, 15, 10, 18], floor: 1, safetyRestore: 30 },
} as const
