// The tuning module (requirements §11, BR-21). Every number and color that tunes the feel lives here.
// These are starting values. Change them here; components and tests read them.

import type { CatId, Rarity } from './content.ts'

export const tokens = {
  fieldDark: '#0A0A0A',
  inkLight: '#141414',
  hotPink: '#FF2D8A',
  deepPink: '#E20064',
  blush: '#F7C5D8',
  paper: '#FFF7FB',
  gold: '#FFC94D',
  starYellow: '#FFF1A8',
  shadow: '#0B0B0B',
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
    field: tokens.fieldDark,
    ink: tokens.paper,
    accent: tokens.hotPink,
    accentText: tokens.hotPink,
    surface: tokens.fieldDark,
    line: 'rgba(255, 45, 138, 0.45)',
    buttonBg: tokens.hotPink,
    buttonInk: tokens.inkLight,
    catBody: '#111111',
  },
  light: {
    field: tokens.paper,
    ink: tokens.inkLight,
    accent: tokens.hotPink,
    accentText: tokens.deepPink,
    surface: '#FFFFFF',
    line: 'rgba(226, 0, 100, 0.35)',
    buttonBg: tokens.hotPink,
    buttonInk: tokens.inkLight,
    catBody: '#111111',
  },
}

export const catAccents: Record<CatId, string> = {
  luz: '#FF2D8A',
  mimo: '#F7C5D8',
  susto: '#FFF7FB',
  bram: '#E20064',
  nana: tokens.gold,
  misha: '#C8A2FF',
  kira: tokens.starYellow,
}

// The shared cat face: big simple eyes and white linework.
export const catFace = {
  eyeWhite: '#FFFFFF',
  pupil: '#0A0A0A',
  line: '#FFFFFF',
  mimoOutline: tokens.inkLight,
} as const

// In the pixel era every accent renders as the one pink or as white.
export const catPixelAccents: Record<CatId, string> = {
  luz: tokens.hotPink,
  mimo: tokens.hotPink,
  susto: tokens.paper,
  bram: tokens.hotPink,
  nana: tokens.paper,
  misha: tokens.paper,
  kira: tokens.paper,
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
  eras: { color: 0.33, threeD: 0.66, prefetch3dAt: 0.5 },
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
} as const
