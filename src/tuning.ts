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

// Spec §3: the invite link picks the mood. Saturday is a moonlit night, Sunday a golden dusk.
export type MoodId = 'saturday' | 'sunday'

// How the attic looks in one mood and theme (spec §3). Claro is the lighter version of each mood,
// Oscuro the darker. The 3D attic (src/world/palette.ts) and the paper diorama (src/headMeta.ts)
// both read these.
export interface WorldLook {
  fog: ColorMix
  wood: ColorMix
  floor: ColorMix
  // The rafters and the window frame.
  beam: ColorMix
  // The sky behind the round window: a gradient from its top to the horizon.
  skyTop: ColorMix
  skyBottom: ColorMix
  // The moon or the sun in the window: where it sits (world units from the window's centre, y up),
  // its size (times tuning.world.attic.orb.radius), its color, and its halo.
  orbKind: 'moon' | 'sun'
  orbAt: readonly [x: number, y: number]
  orbSize: number
  orb: ColorMix
  halo: ColorMix
  cloth: ColorMix
  // The key light through the window and the ambient light from above and below. The attic is lit
  // at these values on every page (spec §4): only the book's paper and the cats follow the stage.
  key: ColorMix
  keyIntensity: number
  ambientSky: ColorMix
  ambientGround: ColorMix
  ambient: number
  // The beam of light from the window (the moonbeam, or the golden beam): unlit and additive.
  shaft: ColorMix
  shaftOpacity: number
  // The window's stars (Saturday) or the fireflies (Sunday), and how bright the window's stars shine
  // (0: none).
  sparkle: ColorMix
  stars: number
  // What drifts in the air (spec §3 Motion rule): dust, or fireflies at Sunday's dusk.
  motes: 'dust' | 'fireflies'
  // How lit the lanterns (Sunday) and the crooked lamp are, 0 to 1. They glow by their own color only.
  lanternGlow: number
  lampGlow: number
  // Pencil paper is bone with no color at this lightness; candles warm it by `warmth`.
  sketchLightness: number
  warmth: number
  dust: ColorMix
}

// Spec §8 Device tiers: what a tier draws.
export interface TierSettings {
  // The pixel-ratio caps of the book and of level 2's live attic.
  maxDpr: number
  backdropMaxDpr: number
  // The candle's real shadow map.
  shadows: boolean
  // The share of the stars, fireflies, and dust that are drawn.
  countScale: number
  // The speed of the ambient motion (the mobile, the lanterns, the stars, the fireflies).
  motionScale: number
}

// Spec §3 Coats: the coat each cat wears. The Misha family (Misha, Mishona, Choni, Chona, Chori) is
// white with silver-gray patches; the Kira family (Kira, Kiri kiri) a brown-gray tabby with tiger
// stripes and white paws; Delilah and Chavela are black; Minina is pure white.
export type CoatKind = 'misha' | 'kira' | 'black' | 'white'

// A coat's colors: the coat itself, the soft shade along its lower edge (so a light coat keeps its
// edge on the bone paper), its marks (the Misha family's patches, the Kira family's stripes), and
// its white parts (the Kira family's chin, chest, and paws).
export interface CoatColors {
  coat: ColorMix
  shade: ColorMix
  mark: ColorMix
  white: ColorMix
}

// The lived-in attic's props (spec §5).
export type PropName =
  | 'crib'
  | 'bookshelf'
  | 'yarnBasket'
  | 'rockingChair'
  | 'trunks'
  | 'lamp'
  | 'catBed'
  | 'scratchingPost'
  | 'curtains'
  | 'guitar'

// Where a prop stands: [x, z] on the attic floor, turned `turn` radians about y, at `scale` times
// the size its factory draws.
export interface PropPlacement {
  at: readonly [x: number, z: number]
  turn: number
  scale: number
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

// The gate game's screen (design §8): the parts tuning.gateGame's pure logic does not cover, all
// in Pixelify Sans (design §3).
export interface GateScreenConfig {
  // How far one arrow-key press nudges the catcher, as a share of the play field's width.
  catcherStep: number
  // Mishona, the catcher, and the falling drops, in px at the room size.
  catcherSize: number
  dropSize: number
  // Spec §5: the frame loop moves a fixed set of drop slots; there are never more drops falling at
  // once than this (src/components/GateGame.test.tsx checks it against tuning.gateGame).
  dropSlots: number
  // Choni and Chavela's little reactions beside the field, in px.
  sideCatSize: number
  // The HUD's combo readout pulses for this long when the combo grows.
  pulseMs: number
  // Choni cheers once the combo reaches this.
  cheerCombo: number
  cheerMs: number
  startleMs: number
  // How quickly the drawn catcher eases to the game's x: the frame loop's time constant, in ms.
  catcherTransitionMs: number
  // The panel (start button, HUD, field, result panel) paints above every roaming gate cat and its
  // Saludar pill (`.gate-spot`'s z-index is 2; `.saludar`'s is 4 — see src/index.css), whatever
  // they're doing.
  panelZIndex: number
  // Where the three gate cats rest, clear of the panel's footprint (a share of the screen), at
  // every width the design checks (390, 360, 768, 1440). `wanderMarginPx` is the largest excursion
  // any of their `gate-wander-*` keyframes (src/index.css) adds on top of a spot, so the margin
  // between a spot and the panel can be checked with the roam included.
  catSpots: Partial<Record<CatId, { left: string; top: string }>>
  wanderMarginPx: number
  // The gate's camera never moves (it has none), so the usual noticing zone — sized for a guest
  // scrolling a cat into view — would keep these footer-dwelling cats from ever being noticed.
  // A near-whole-screen zone here instead (tuning.noticing.zone stays as it is everywhere else).
  noticeZone: number
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
  // Fresh paper, lighter than the page: the pinned notes, the letter, and the hourglass's glass (mixed
  // with the page); and the white of the cats' coats (the Misha family, Minina, and the white chins,
  // chests, and paws).
  paperWhite: '#FFFFFF',
  // Deep rose, deepened for text on aged parchment: 5.1:1 on the darkest page tint (pageShade).
  pageRose: '#A3285A',
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
  // Spec §3: the three new cats' own colors, in hues none of the others use (Chona's chartreuse,
  // Chori's apricot, Minina's orchid), each light enough to read on ink.
  chona: '#B8E05A',
  chori: '#F6B48C',
  minina: '#E48FE0',
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
  // Large screens (design §9): the HUD, dialogs, the gate, and the flat room's cards grow with the
  // screen's width, from their phone size at `fromPx` to `1 + grow` times it at `toPx`, then stop.
  // The 3D book needs none of this: its camera frames the pages for any screen.
  screen: { fromPx: 390, toPx: 2560, grow: 0.4 },
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
  // Level 3 (spec §7): the paper diorama behind the flat room's cards. Its round window has radius
  // `windowRadius` in the diorama's drawing units. Each layer slides by its rate times `travelPx`
  // across the flat room's whole horizontal pan (reduced motion: no sliding); nothing else in it
  // moves. The rafters, the garland, and the props each cast a still paper shadow `castOffset`
  // drawing units below themselves.
  diorama: {
    windowRadius: 40,
    travelPx: 160,
    rates: { wall: 0.2, rafters: 0.35, garland: 0.5, props: 0.65, floor: 0.85 },
    castOffset: 1.5,
  },
  eras: { color: 0.33, threeD: 0.66 },
  noticing: {
    zone: 0.6,
    stillSpeedPxPerS: 40,
    waitMs: { comun: 500, pocoComun: 1500, legendario: 2500 } satisfies Record<Rarity, number>,
    // Spec §3: the new cats' own waits, in the same family as the rarity waits. Chona needs a little
    // patience, Chori comes if you wait, and Minina notices you after a short stay on Confirmar.
    catWaitMs: { chona: 2000, chori: 3200, minina: 900 } satisfies Partial<Record<CatId, number>>,
    mishaMusicWaitMs: 1200,
    sustoRushPxPerS: 600,
    lingerMs: 1000,
    tickMs: 100,
  },
  catSize: { room: 64, qr: 56, door: 68, gate: 72, collection: 56, card: 176, battle: 176 },
  // The cats (design §4): one family of paper cut-outs, drawn in pencil (boceto), then ink (tinta),
  // then light (luz). Line widths and offsets are in the drawing's units (a 120 by 120 box).
  cats: {
    // Pencil graphite on the cut-out paper: ink faded toward the paper.
    pencil: ['var(--shadow)', 'var(--cat-paper)', 0.32] as ColorMix,
    // Spec §3 Coats. The black coats are the theme's cat body, as before. The light coats get a soft
    // shade along their lower edge: the coat moved `shade.dx`, `shade.dy` up and to the left of the
    // shade color shows it along the bottom and the right. Stripes are `stripe` wide.
    coats: {
      // Misha's white, and her silver-gray patches (from the host's photo of Misha).
      misha: { coat: tokens.paperWhite, shade: [tokens.paperWhite, tokens.plum, 0.18], mark: '#A3A5AD', white: tokens.paperWhite },
      // Kira's brown-gray tabby coat and her dark tiger stripes (from the host's photo of Kira).
      kira: { coat: '#8A7C6C', shade: ['#8A7C6C', tokens.shadow, 0.3], mark: '#3A2F27', white: tokens.paperWhite },
      black: { coat: 'var(--cat-body)', shade: 'var(--cat-body)', mark: 'var(--cat-body)', white: tokens.paperWhite },
      white: { coat: tokens.paperWhite, shade: [tokens.paperWhite, tokens.plum, 0.18], mark: tokens.paperWhite, white: tokens.paperWhite },
    } satisfies Record<CoatKind, CoatColors>,
    shade: { dx: 2.2, dy: 3 },
    stripe: 1.6,
    // Spec §3: the real cats' eyes. Misha's are green (from the photo), Kira's and Kiri kiri's
    // amber-green (from the photo). Every other cat's eyes are its feeling color.
    eyes: { misha: '#9ACB5E', kira: '#C9C24E', bram: '#C9C24E' } satisfies Partial<Record<CatId, string>>,
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
    blinkMs: { luz: 4100, mimo: 6000, susto: 4600, bram: 5200, nana: 5600, chona: 3900, chori: 6600, minina: 4300, misha: 5900, kira: 4400 } satisfies Record<CatId, number>,
    blinkDelayMs: { luz: 300, mimo: 1700, susto: 900, bram: 2300, nana: 1200, chona: 1500, chori: 2600, minina: 700, misha: 2900, kira: 600 } satisfies Record<CatId, number>,
    earMs: { luz: 3700, mimo: 7300, susto: 2900, bram: 4900, nana: 6100, chona: 3300, chori: 7900, minina: 4100, misha: 8300, kira: 5300 } satisfies Record<CatId, number>,
    tailMs: 2600,
    tailFollowMs: 180,
    // Each cat's own behavior loop (design §4), while it roams the page.
    behaviorMs: { luz: 2800, mimo: 6400, susto: 5200, bram: 4200, nana: 5400, chona: 3600, chori: 7200, minina: 3000, misha: 4800, kira: 4800 } satisfies Record<CatId, number>,
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
  // Spec §2 The gift QR, on screen. Error correction Q (controller ruling 2: at H the payload needs
  // version 20, about 2.1 CSS px a module at 220 px, and a 1× screenshot failed to decode; Q is
  // version 18 and recovers 25%). Drawn in rounded runs `module` tall with rounded finder eyes (outer
  // corner radius `eyeOuter`, inner `eyeInner`, the pupil's `eyePupil`, in modules), a quiet zone of
  // `quiet` modules, and a cat emblem in the centre about `emblemShare` of the code's width, never
  // more than `maxEmblemShare` of its area. Guardar QR saves the bank's own image instead
  // (src/assets/qr-bank.png, controller ruling 1), so nothing here tunes the download.
  qr: {
    minPx: 220,
    screenLevel: 'Q',
    quiet: 4,
    module: 1,
    eyeOuter: 2,
    eyeInner: 1.3,
    eyePupil: 0.9,
    emblemShare: 0.22,
    maxEmblemShare: 0.05,
  },
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
  // Spec §6: the CSS paper family on the Familia card. The first time the door is `inViewShare` in
  // view, the four figures fold up over `foldMs`, then walk in over `walkMs`, `staggerMs` apart, from
  // `walkFromPx` toward the viewer, seen with `perspectivePx` of perspective. Their paper layers sit
  // at these depths (px): the rim of backlight behind, the hair in front. The rim is a stroke
  // `rimWidth` wide in the drawing's units, wide enough to glow past each figure's paper edge.
  family: {
    foldMs: 700,
    walkMs: 1100,
    staggerMs: 200,
    inViewShare: 0.4,
    perspectivePx: 600,
    walkFromPx: 60,
    depthPx: { rim: -8, hair: 5 },
    rimWidth: 10,
  },
  progress: {
    levels: [0, 60, 180, 360, 600],
    badgeXp: { openBook: 10, palabra: 20, fecha: 30, lugar: 30, sellada: 50, regalo: 20, qrGuardado: 20, puerta: 30, primerGato: 20, cuentoCompleto: 100, todosLosGatos: 150 },
    catXp: { comun: 20, pocoComun: 40, legendario: 100 },
  },
  gateGame: { durationMs: 30000, spawnEveryMs: 650, fallPerS: 0.42, catchY: 0.86, catchRadius: 0.09, heartChance: 0.3, points: { yarn: 10, heart: 20 }, comboMax: 5, maxStepMs: 100, spawnMarginX: 0.06 } satisfies GateGameConfig,
  gateScreen: {
    catcherStep: 0.06,
    catcherSize: 72,
    dropSize: 30,
    dropSlots: 6,
    sideCatSize: 48,
    pulseMs: 420,
    cheerCombo: 3,
    cheerMs: 900,
    startleMs: 900,
    catcherTransitionMs: 60,
    panelZIndex: 10,
    // The panel is tallest while playing (HUD + field): its footprint reaches about 75%–80% of the
    // screen's height on the narrowest phones the design checks. These spots rest below that, with
    // `wanderMarginPx` of roaming room to spare.
    catSpots: {
      luz: { left: '18%', top: '94%' },
      mimo: { left: '50%', top: '93%' },
      susto: { left: '82%', top: '94%' },
    },
    wanderMarginPx: 44,
    noticeZone: 0.94,
  } satisfies GateScreenConfig,
  // The 3D pop-up book (design §1, §2, §9). Distances are world units; the floor is y = 0.
  world: {
    dragProgressPerViewport: 0.5,
    glideMs: 700,
    stationEps: 0.04,
    fovPortrait: 58,
    fovLandscape: 42,
    maxDpr: 1.75,
    // Level 2 (spec §7): the live attic behind the flat room's cards renders at this pixel ratio,
    // and fades in over backdropFadeMs once it has drawn its first frame.
    backdropMaxDpr: 1.25,
    backdropFadeMs: 600,
    // Level 2's camera (spec §7): it frames the attic from the front, toward the window and the crib,
    // with a wider view on portrait screens. The flat room's horizontal position (0 to 1) drifts it
    // sideways by up to ±drift and turns it by up to ±yaw radians; vertical panning does not move it.
    // It eases toward its place at `damping`.
    backdrop: {
      position: [0, 3.4, 5.5],
      look: [0, 3.1, -9],
      fovPortrait: 64,
      fovLandscape: 46,
      drift: 1.6,
      yaw: 0.07,
      damping: 4,
      near: 0.1,
      far: 40,
    },
    // Spec §8 Device tiers: `lowMemoryGb` of memory or less, or `lowCores` cores or fewer, is a low
    // device. The core count only counts where the browser also reports memory (Chromium); a
    // browser without a memory reading (Safari, Firefox) counts as normal. Normal devices use maxDpr and
    // backdropMaxDpr above, with shadows and full counts.
    tiers: {
      lowCores: 2,
      lowMemoryGb: 2,
      low: { maxDpr: 1.25, backdropMaxDpr: 1, shadows: false, countScale: 0.5, motionScale: 0.6 } satisfies TierSettings,
    },
    // Below this width the screen counts as a phone: fewer dust motes.
    phoneMaxPx: 768,
    // A screen shorter than this cannot show the tallest page (Presente, with its QR) whole at
    // page.minScale between the HUD and the signposts, so it gets the flat room instead: phones
    // held sideways, and the smallest phones with their browser toolbars. Checked at start, and
    // on resize, when the book hands over to the flat room on the page the guest was on.
    minHeightPx: 640,
    // The camera path: stations spread along the book in a gentle S. The camera sits `lift` above
    // each station and backs off until a page of `frameWidth` by `frameHeight` fits the screen, but
    // never so far that the page drops below page.minScale. The camera looks `lookHeight` above the
    // page's foot: level with its own height, so the whole page is drawn at one scale, and high
    // enough that the tallest page (Presente, with its QR) sits centred between the HUD and the
    // signposts of a phone.
    path: { length: 19.2, sway: 1.1, lift: 1.6, lookHeight: 1.6, minPullBack: 3.4, frameWidth: 2.2, frameHeight: 5 },
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
    // At rest the page is never drawn smaller than `minScale` of its design size (its text stays at
    // 90% or more): on a short screen the camera stops backing off there and the pop-ups crop instead.
    page: { cardPx: 320, slotPx: 640, cardWidth: 1.8, lift: 0.04, zIndexRange: [100, 0], fadeFrom: 0.2, fadeTo: 0.7, minScale: 0.9 },
    // A piece that turns less than `stillEps` of its fold in a frame counts as still: the candle's
    // shadow map is redrawn only while some piece moves.
    popUp: { range: 0.18, stiffness: 70, damping: 9, stagger: 0.12, stillEps: 0.0001 },
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
        // Tall enough that the paper family stands in its doorway clear of the card and its stamp.
        { kind: 'door', x: 0, z: -0.8, height: 3.6 },
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
    // Saturday's stars in the window (spec §3): `count` of them (about half on a low device), each
    // `size` to size + sizeRange across, twinkling between `min` and full size at `speed`.
    stars: { count: 40, size: 0.05, sizeRange: 0.05, min: 0.35, speed: 1.6 },
    // Spec §5: the lived-in attic, shared by both moods. The props stand along the back wall, behind
    // the book's far edge and clear of the camera's corridor at every station and glide
    // (src/world/props/placement.test.ts); at level 2 they frame the view behind the cards. The
    // books and yarn balls take their colors from the palette. Furniture wood is the floor's tone
    // pulled toward the beams by `woodMix`. Ink edges are drawn where faces meet at more than
    // `edgeAngle` degrees. Painted contact shadows lie `shadowLift` above the floor.
    props: {
      placements: {
        crib: { at: [0, -8.2], turn: 0, scale: 1.5 },
        bookshelf: { at: [-7.4, -9.35], turn: 0.03, scale: 1.3 },
        yarnBasket: { at: [-3.8, -8.1], turn: 0.4, scale: 1.3 },
        rockingChair: { at: [5.8, -7.9], turn: -0.55, scale: 1.4 },
        trunks: { at: [-12.4, -7.6], turn: 0.35, scale: 1.3 },
        lamp: { at: [3.2, -9.1], turn: 0, scale: 1.4 },
        catBed: { at: [9.2, -8.5], turn: 0.25, scale: 1.3 },
        scratchingPost: { at: [11.6, -7.6], turn: 0, scale: 1.3 },
        curtains: { at: [0, -9.85], turn: 0, scale: 1 },
        // This work's spec §6: dad's guitar leans against the back wall at the Familia end of the
        // attic, turned a little toward the Familia station's camera.
        guitar: { at: [12.4, -9.35], turn: -0.2, scale: 1.7 },
      } satisfies Record<PropName, PropPlacement>,
      // Dad's B.C. Rich Mockingbird Contour in gold top (spec §6), in its own units (about a metre
      // long at scale 1): the body `depth` thick with a `bevel`, its outline drawn with
      // `curveSegments` per curve; the neck from `neckFrom` to the nut at `nut`, `neckWidth` wide; the
      // headstock up to `headTop`, `headWidth` wide; the two humbuckers centred at `pickupsAt`; the
      // knobs at `knobsAt`. It leans back `lean` degrees against the wall. The neck joint, pickups,
      // and knobs are measured from the host's photo, like the body's outline.
      guitar: {
        depth: 0.045,
        bevel: 0.008,
        curveSegments: 10,
        neckFrom: 0.335,
        nut: 0.86,
        neckWidth: 0.05,
        headTop: 1.02,
        headWidth: 0.09,
        pickupsAt: [0.31, 0.224],
        knobsAt: [
          [0.078, 0.207],
          [0.105, 0.174],
          [0.124, 0.141],
          [0.093, 0.112],
        ],
        lean: 12,
        colors: {
          // The gold top and the gold hardware: the candle token itself (the host's photo), so it still
          // reads gold under the dark looks' dim moonlight.
          gold: tokens.candle,
          // Dark rosewood for the neck, the headstock, and the body's sides (the host's photo).
          rosewood: '#4A2A1E',
          // The black humbuckers.
          pickup: tokens.ink,
        },
      },
      books: 16,
      yarnBalls: 5,
      bookColors: [tokens.rose, tokens.deepRose, tokens.plum, tokens.candle, tokens.bone, feelingColors.misha, feelingColors.nana],
      yarnColors: [tokens.rose, feelingColors.luz, feelingColors.susto, feelingColors.kira, tokens.bone],
      woodMix: 0.35,
      edgeAngle: 35,
      inkOpacity: 0.55,
      shadowOpacity: 0.35,
      shadowLift: 0.012,
    },
    // Draw calls per frame (spec §8), as renderer.info.render.calls counts them. `bookAtRest` is what
    // the book drew at rest in luz before this work (the attic, the book, its stations in view, and
    // the dust); `attic` is the attic's own meshes and its window (sky, halo, moon or sun). The new
    // props must fit in what is left.
    // `materials` grew by three for dad's guitar (this work's spec §6: at most three new materials).
    budget: { book: 100, backdrop: 60, bookAtRest: 47, attic: 27, materials: 17 },
    // Spec §3: each mood's own props, in world units, with speeds in radians per second.
    mood: {
      // Saturday: a star-and-crescent mobile turning slowly over the crib, its string rising `hang`
      // to the rafters, with `arms` crossed arms of `radius` and a charm of size `charm` hanging
      // `drop` below each end.
      mobile: { at: [0, 3.6, -8.2], hang: 4, arms: 3, radius: 0.55, drop: 0.3, charm: 0.14, speed: 0.22 },
      // Saturday: paper stars on a string sagging between two rafters. It holds still (the Motion rule).
      // Its ends meet the sloping roof, so every star hangs under it (src/world/props/moodProps.test.ts).
      garland: { from: -6, to: 6, y: 7, z: -7.8, sag: 0.6, drop: 0.14, count: 14, size: 0.2, colors: [tokens.bone, tokens.candle, tokens.rose] },
      // Sunday: paper lanterns on a string, swaying by up to `sway` radians at `speed`, `phase` apart,
      // glowing by their own color only. Unlit, they keep `dim` of their brightness. Every lantern
      // hangs under the sloping roof, at the top of its swing too.
      lanterns: {
        from: -7.5,
        to: 7.5,
        y: 6.6,
        z: -6.6,
        sag: 1,
        drop: 0.3,
        count: 9,
        size: 0.3,
        sway: 0.14,
        speed: 0.9,
        phase: 0.8,
        dim: 0.45,
        colors: [tokens.rose, tokens.candle, tokens.bone, tokens.deepRose],
        // Each lantern's paper shape, `size` up and down from its middle: `width` times as wide as
        // tall, a collar at the top and bottom `collar` of its height, and `ribs` wire ribs each `rib`
        // of its height, the paper pinched in by `pinch` between them (each stretch of paper drawn in
        // `steps`, `segments` sides around). The ribs and collars are darker shades of the lantern's
        // own color, as multipliers (the paper is 1).
        paper: { width: 0.8, collar: 0.1, ribs: 4, rib: 0.05, pinch: 0.07, steps: 3, segments: 12, ribShade: 0.5, collarShade: 0.22 },
      },
      // The beam from the window to the floor (the moonbeam, or Sunday's golden beam): how wide it
      // leaves the window and lands, how much of its light reaches the floor, and per mood where it
      // lands (sideways, away from the moon or sun, and how far from the back wall).
      shaft: { topWidth: 2.6, bottomWidth: 4.2, bottomAlpha: 0.2, saturday: { drift: -1.6, reach: 4.8 }, sunday: { drift: 1.4, reach: 5.4 } },
      // Sunday's dusk: fireflies drifting by up to `drift` around their spots in a box of air behind
      // the book, blinking at `blink`. They replace the dust.
      fireflies: { count: 60, size: 0.08, drift: 0.35, speed: 0.5, blink: 1.4, box: { width: 24, bottom: 0.8, height: 4.5, back: -9.2, depth: 6 } },
    },
    // Spec §6: the paper family in the 3D doorway at the Familia station. Dad is `height` tall and the
    // others to scale. They stand `standY` up the doorway, above the Familia card's top and its
    // ¡Página encontrada! stamp (the card is HTML, drawn over the canvas), `restZ` in front of the
    // door. The first time the door stands (its spring past `standAt`) with the camera within
    // `startWithin` of the station (the door already stands from the page before), each folds up
    // from flat with the pop-up spring (popUp's stiffness and damping) and walks in from `walkFromX`
    // aside and `walkFromZ` out on the page, over `walkS`, `staggerS` after the one before, bobbing
    // by `bob` at `bobHz` steps a second. A dark copy `edge` behind each figure gives the paper its
    // thickness; each figure stands `layer` in front of the one before, as the drawing overlaps them
    // (their held hands), so no two sheets of paper share a depth. The texture sheet is at most
    // `sheetMaxPx` a side, each figure with `sheetPad` drawing units of margin for its rim (drawn at
    // `rimAlpha`, glowing `rimGlow` drawing units past it like the CSS family's drop-shadow, cut out
    // at `alphaTest`). After Cuento completo, the doorway's glow moves `completeGlow` of the way
    // toward bone.
    family: {
      height: 1.45,
      standY: 1.36,
      restZ: 0.06,
      walkFromX: 0.5,
      walkFromZ: 0.55,
      walkS: 1.1,
      staggerS: 0.35,
      bob: 0.03,
      bobHz: 2.4,
      standAt: 0.95,
      startWithin: 0.06,
      edge: 0.012,
      layer: 0.015,
      sheetMaxPx: 1024,
      sheetPad: 10,
      rimAlpha: 0.85,
      rimGlow: 4,
      alphaTest: 0.4,
      completeGlow: 0.5,
    },
    // Spec §3: two moods, one attic, each in a lighter (Claro) and a darker (Oscuro) version. Every
    // color is a mix of the palette tokens and the feeling colors. The 3D attic mixes in linear light,
    // so a little of a light color goes a long way (and the window's sky blends the same way).
    looks: {
      saturday: {
        // Noche de luna, Oscuro: full night. A big moon with a halo, twinkling stars, and cool
        // moonlight tinted toward Misha's blue.
        dark: {
          fog: tokens.plum,
          wood: [tokens.plum, tokens.rose, 0.15],
          // Lifted a little toward rose: the furniture's wood mixes from the floor (props.woodMix), so
          // the crib, chair, and trunks read as plum wood rather than black, still darker than Claro.
          floor: [tokens.plum, tokens.rose, 0.18],
          beam: tokens.ink,
          skyTop: [tokens.ink, feelingColors.misha, 0.06],
          skyBottom: [tokens.plum, feelingColors.misha, 0.22],
          orbKind: 'moon',
          orbAt: [0.5, 0.4],
          orbSize: 1.25,
          orb: tokens.bone,
          halo: feelingColors.misha,
          cloth: [tokens.plum, tokens.deepRose, 0.35],
          key: [feelingColors.misha, tokens.bone, 0.55],
          keyIntensity: 1.2,
          ambientSky: [feelingColors.misha, tokens.bone, 0.7],
          ambientGround: tokens.plum,
          ambient: 0.8,
          shaft: [feelingColors.misha, tokens.bone, 0.6],
          shaftOpacity: 0.14,
          sparkle: tokens.bone,
          stars: 1,
          motes: 'dust',
          lanternGlow: 0,
          lampGlow: 0,
          sketchLightness: 0.72,
          warmth: 0.32,
          dust: tokens.bone,
        },
        // Noche de luna, Claro: blue hour. A deep blue sky with a rising moon; the attic reads clearly,
        // lilac plum in the blue light.
        light: {
          fog: [tokens.plum, feelingColors.misha, 0.4],
          wood: [tokens.plum, feelingColors.susto, 0.35],
          floor: [tokens.plum, feelingColors.susto, 0.25],
          beam: [tokens.ink, tokens.plum, 0.6],
          skyTop: [tokens.ink, feelingColors.misha, 0.3],
          skyBottom: [feelingColors.misha, tokens.rose, 0.5],
          orbKind: 'moon',
          orbAt: [0.7, -0.35],
          orbSize: 1,
          orb: tokens.bone,
          halo: [feelingColors.misha, tokens.bone, 0.5],
          cloth: [tokens.plum, tokens.deepRose, 0.5],
          key: [feelingColors.misha, tokens.bone, 0.65],
          keyIntensity: 1.35,
          ambientSky: [feelingColors.misha, tokens.bone, 0.55],
          ambientGround: [tokens.plum, tokens.rose, 0.3],
          ambient: 1.2,
          shaft: [feelingColors.misha, tokens.bone, 0.75],
          shaftOpacity: 0.1,
          sparkle: tokens.bone,
          stars: 0.45,
          motes: 'dust',
          lanternGlow: 0,
          lampGlow: 0.7,
          sketchLightness: 0.8,
          warmth: 0.28,
          dust: tokens.bone,
        },
      },
      sunday: {
        // Atardecer dorado, Oscuro: late dusk. The sun on the horizon, the sky going candle → rose →
        // plum, the lanterns lit, and fireflies out.
        dark: {
          fog: [tokens.plum, tokens.deepRose, 0.25],
          wood: [tokens.plum, tokens.rose, 0.2],
          // Lifted toward deep rose, so the furniture's wood (mixed from the floor) reads as wine, not black.
          floor: [tokens.plum, tokens.deepRose, 0.4],
          beam: tokens.ink,
          skyTop: [tokens.ink, tokens.plum, 0.6],
          skyBottom: [tokens.candle, tokens.rose, 0.6],
          orbKind: 'sun',
          orbAt: [0.15, -1.05],
          orbSize: 1.35,
          orb: tokens.candle,
          halo: [tokens.candle, tokens.rose, 0.5],
          cloth: [tokens.plum, tokens.deepRose, 0.45],
          key: [tokens.candle, tokens.rose, 0.4],
          keyIntensity: 0.9,
          ambientSky: [tokens.rose, tokens.bone, 0.5],
          ambientGround: tokens.plum,
          ambient: 0.75,
          shaft: [tokens.candle, tokens.rose, 0.3],
          shaftOpacity: 0.14,
          sparkle: tokens.candle,
          stars: 0,
          motes: 'fireflies',
          lanternGlow: 1,
          lampGlow: 0,
          sketchLightness: 0.74,
          warmth: 0.36,
          dust: tokens.candle,
        },
        // Atardecer dorado, Claro: golden afternoon. A warm sun in the window, honey-gold wood, and
        // candle-gold light on the floor.
        light: {
          fog: [tokens.bone, tokens.candle, 0.2],
          wood: [tokens.bone, tokens.candle, 0.45],
          floor: [tokens.bone, tokens.plum, 0.5],
          beam: [tokens.plum, tokens.bone, 0.2],
          skyTop: [feelingColors.misha, tokens.bone, 0.25],
          skyBottom: [tokens.candle, tokens.bone, 0.4],
          orbKind: 'sun',
          orbAt: [-0.45, 0.35],
          orbSize: 1,
          orb: tokens.candle,
          halo: tokens.candle,
          cloth: tokens.deepRose,
          key: [tokens.candle, tokens.bone, 0.6],
          keyIntensity: 1.5,
          ambientSky: tokens.bone,
          ambientGround: [tokens.rose, tokens.candle, 0.4],
          ambient: 1,
          shaft: tokens.candle,
          shaftOpacity: 0.16,
          sparkle: tokens.candle,
          stars: 0,
          motes: 'dust',
          lanternGlow: 0.25,
          lampGlow: 0.8,
          sketchLightness: 0.86,
          warmth: 0.25,
          dust: tokens.candle,
        },
      },
    } satisfies Record<MoodId, Record<ThemeName, WorldLook>>,
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
      // The moon or the sun sits where the look puts it (WorldLook.orbAt), `radius` times the look's
      // orbSize, with a soft halo `halo` times its radius (`sunHalo` for the sun, which is wider).
      orb: { radius: 0.62, halo: 1.85, sunHalo: 2.4, haloOpacity: 0.45 },
      // The sky's gradient behind the window is this much wider than the window.
      skyScale: 1.3,
      roughness: { floor: 0.95, wall: 1, beam: 1 },
    },
    coverFlipMs: 900,
    // Facts are never gated: if the world has not drawn its first frame by then, the flat room takes over.
    loadTimeoutMs: 6000,
  },
  battle: { energy: 100, patience: 100, damage: { ovillo: 35, mimos: 25, ronroneo: 20 }, boost: 1.5, effectiveAt: 35, catDamage: [12, 15, 10, 18], floor: 1, safetyRestore: 30 },
} as const
