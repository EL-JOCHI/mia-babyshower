# Redesign "moonlit pop-up book": implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the working invitation into a 3D pop-up storybook, with hand-drawn rigged cats, a playful legendary battle, a game layer (quest log, XP, levels, badges), and a gate arcade game. Every fact, rule, and link stays as it is.

**Architecture:**

- **The world:** a lazily loaded React Three Fiber scene (attic, book, pop-up paper, lights, fog, particles). The camera follows a spline driven by one progress value.
- **The content:** all cards, cats, and controls are real HTML, rendered once in `Pages` and placed either in 3D (drei `Html transform`) or in the existing flat room. The flat room is also the fallback for reduced motion and for no WebGL.
- **The logic:** new game logic lives in pure, tested modules (`battle`, `progress`, `gateGame`, `path`). Copy stays in `src/content.ts`, and numbers and colors in `src/tuning.ts`.

**Tech stack:** React 19.2.8, Vite 8.3.0, TypeScript 6.0.3, Tailwind 4.3.3, three 0.186.0, @react-three/fiber 9.7.0, **@react-three/drei 10.7.8** (new), Vitest 5.0.1 with Testing Library. Fonts: **@fontsource/mystery-quest, @fontsource/alegreya, @fontsource/pixelify-sans** (new). @fontsource/press-start-2p and @fontsource/source-sans-3 are removed.

**Spec:** `docs/superpowers/specs/2026-09-26-invitation-redesign-design.md` (the redesign) and `docs/requirements.md` (everything the redesign does not change).

**About the art tasks:** the cat art, the pop-up paper, and the 3D scene are iterated by looking at them. Those tasks give exact files, interfaces, and screenshot checks instead of final drawing code. Every logic task is written out test-first in full.

## Global Constraints

- **Links and codes:** `?e=n4vk` is Saturday, `?e=q8lm` is Sunday, anything else is the gate. The clock never picks a day.
- **Instants:** Saturday starts `2026-10-17T16:00:00-04:00` and is over from `2026-10-18T00:00:00-04:00`. Sunday starts `2026-10-18T16:00:00-04:00` and is over from `2026-10-19T00:00:00-04:00`.
- **Copy:** every guest-facing string comes from `src/content.ts`. It is Spanish, taken verbatim from requirements §6 and spec §13.
- **Numbers and colors:** every number and color comes from `src/tuning.ts`. There are no hex values in components.
- **Palette:**

  | Token | Hex |
  | --- | --- |
  | Ink | `#140E14` |
  | Bone | `#F1E7D6` |
  | Rose | `#E08AAB` |
  | Deep rose | `#BB3267` |
  | Plum | `#3C1F3D` |
  | Candle | `#F2B84B` |

- **Feeling colors:**

  | Cat | Hex |
  | --- | --- |
  | Luz | `#F5C542` |
  | Mimo | `#F28DB2` |
  | Susto | `#A98BEA` |
  | Bram | `#F2784B` |
  | Nana | `#7FD9B0` |
  | Misha | `#8EB8F0` |
  | Kira | `#5FD4D0` |

- **Type:** Mystery Quest for titles, Alegreya for reading text, Pixelify Sans only on game screens.
- **Storage keys:** only `mia-cats`, `mia-theme`, `mia-music`, `mia-progress`, and `mia-gate-best`.
- **Always on:** facts are never gated, and there are no analytics. Pinch zoom works. Focusing a control brings it into view. Text meets AA contrast.
- **Reduced motion or no WebGL:** the flat room, no canvas, no line boil, no wipe, no falling gate objects.
- **Nobody loses:** the guest's paciencia never goes below 1, and `Huir` returns to the room.
- **Performance:** the Three.js code stays in its own lazy chunk. Pixel ratio is capped at 1.75. One shadow-casting light at most.

## Review Focus

1. **A battle opened while music, a toast, or Tus gatos is on screen.** Only one dialog at a time; Escape closes the battle (Huir) first. *Test in Task 6.*
2. **Stored progress that is junk or from an older shape.** The page renders and bad data is dropped. *Test in Task 2.*
3. **The gate game while the tab is hidden, or its clock jumps.** A large gap (for example after sleep) does not teleport drops or end the game at once. The game clamps each step to 100 ms. *Test in Task 3.*
4. **A page reached twice, or reached after the party.** A badge is earned once. After the party the page total is 3, and reaching a hidden page never happens. *Test in Task 2.*
5. **Guests whose WebGL fails after the world starts loading.** The flat room takes over, with no blank screen. *Test in Task 5.*

---

## File map

**New logic** (pure functions, with tests beside them):

- `src/logic/battle.ts`: the legendary battle state machine.
- `src/logic/progress.ts`: pages, badges, XP, levels, and sanitizing stored progress.
- `src/logic/gateGame.ts`: the gate arcade game reducer, with a seeded random source.
- `src/logic/path.ts`: station progress on the camera path, drag to progress, nearest station.
- `src/logic/era.ts`: now returns the stages `'boceto' | 'tinta' | 'luz'`.

**New hooks:**

- `useProgress.ts`: progress state, events, and an awards queue; persists `mia-progress`.
- `useGateBest.ts`: persists `mia-gate-best`.
- `useWorldCamera.ts`: one progress value driven by drag, wheel, keys, glide, and focus.

**New components:**

- `art/InkDefs.tsx`: shared SVG filters (line boil, paper edge).
- `art/CatSprite.tsx`: seven rigged Burton-style cats. Replaces `CatArt`.
- `Pages.tsx`: builds the content of each landmark once, for both rooms.
- `PageCard.tsx`: paper card plus the "¡Página encontrada!" stamp.
- Themed objects: `CandleCountdown.tsx`, `TreasureMap.tsx`, `WaxSealConfirm.tsx`, `GiftBox.tsx`.
- Game layer: `QuestLog.tsx`, `BadgeToasts.tsx`, `CardReveal.tsx`.
- Battle: `Battle.tsx`, `BattleWipe.tsx`.
- `GateGame.tsx`.

**New 3D:**

- `src/world/World.tsx`: the lazy chunk (Canvas, rig, attic, book, stations, lights, fog, dust).
- `src/world/Station.tsx`: pop-up paper pieces, plus the `Html` anchor for the page and its cats.
- `src/world/paperTextures.ts`: SVG-drawn textures for the paper pieces.
- `src/components/WorldRoom.tsx`: loads `World`, falls back to `FlatRoom`, and shows the cover while loading.

**Renamed:** `src/components/Room.tsx` becomes `src/components/FlatRoom.tsx` (restyled, and it uses `Pages`).

**Modified:**

- `src/tuning.ts`, `src/content.ts`, `src/headMeta.ts`, `src/index.css`, `src/main.tsx`.
- `src/components/{App,Gate,Cat,Collection,Hud}.tsx`.
- `src/logic/storageKeys.ts`, and the tests that change.

**Docs:** `docs/requirements.md`, `README.md`, `docs/stack-and-resources.md`.

---

### Task 1: Tokens, fonts, texture, and the new copy

**Files:**
- Modify: `package.json`, `src/tuning.ts`, `src/headMeta.ts`, `src/index.css`, `src/main.tsx`, `src/content.ts`, `src/logic/contrast.test.ts`, `src/headMeta.test.ts`

**Interfaces:**
- **Produces:**
  - `tokens` with `ink`, `bone`, `rose`, `deepRose`, `plum`, `candle`, `shadow`.
  - `feelingColors: Record<CatId, string>`.
  - `themes.dark` and `themes.light` (same keys as today: `field`, `ink`, `accent`, `accentText`, `surface`, `line`, `buttonBg`, `buttonInk`, `catBody`).
  - CSS variables `--ink --bone --rose --deep-rose --plum --candle` plus the theme variables.
  - Font families: `--font-title: 'Mystery Quest'`, `--font-read: 'Alegreya'`, `--font-game: 'Pixelify Sans'`.
  - New `copy` keys, listed in step 4.

- [ ] **Step 1: Swap the fonts.**

```bash
npm uninstall @fontsource/press-start-2p @fontsource/source-sans-3
npm install --save-exact @fontsource/mystery-quest@5.3.0 @fontsource/alegreya@5.3.0 @fontsource/pixelify-sans@5.3.0 @react-three/drei@10.7.8
```

In `src/main.tsx`, import the `latin-400.css` and `latin-ext-400.css` files of Mystery Quest, Alegreya 400/500/700 (latin and latin-ext), and Pixelify Sans 400/600 (latin).

- [ ] **Step 2: Write the failing contrast test for the new themes.** In `src/logic/contrast.test.ts`, keep the helper and assert:
  - dark theme: `bone`/`ink`, `rose`/`ink`, `ink`/`rose` (buttons), and every feeling color on `ink`, all ≥ 4.5;
  - light theme: `ink`/`bone` and `deepRose`/`bone`, both ≥ 4.5.

Run `npx vitest run src/logic/contrast.test.ts`. Expected: FAIL, because the tokens don't exist yet.

- [ ] **Step 3: Update the tokens.** Replace `tokens` and `themes` in `src/tuning.ts` with the spec §3 values:
  - dark: `field: ink`, `ink: bone`, `accent: rose`, `accentText: rose`, `surface: plum`, `line: 'rgba(224,138,171,0.45)'`, `buttonBg: rose`, `buttonInk: ink`, `catBody: ink`;
  - light: `field: bone`, `ink: ink`, `accent: rose`, `accentText: deepRose`, `surface: '#FBF5EA'`, `line: 'rgba(60,31,61,0.35)'`, `buttonBg: rose`, `buttonInk: ink`.

Add `feelingColors` from spec §3. Emit the new variables in `headMeta.ts` `cssVars`. Run the test. Expected: PASS.

- [ ] **Step 4: Add the copy** from spec §13 to `src/content.ts`, verbatim:

```ts
export const gameCopy = {
  pageFound: '¡Página encontrada!',
  pages: (n: number, total: number) => `Páginas ${n}/${total}`,
  cats: (n: number) => `Gatos ${n}/7`,
  level: (n: number) => `Nivel ${n}`,
  xp: (n: number) => `${n} XP`,
  levelTitles: ['Visitante curioso', 'Amigo de los gatos', 'Guardián del cuento', 'Invitado de honor', 'Leyenda de la casa'],
  levelUp: (n: number) => `¡Subiste a nivel ${n}!`,
  badgeXp: (n: number) => `+${n} XP`,
  badges: {
    openBook: 'Abriste el cuento', palabra: 'La palabra', fecha: 'Guardaste la fecha', lugar: 'Encontraste el lugar',
    sellada: 'Invitación sellada', regalo: 'Encontraste el regalo', qrGuardado: 'QR guardado', puerta: 'Llegaste a la puerta',
    primerGato: 'Tu primer gato', cuentoCompleto: 'Cuento completo', todosLosGatos: 'Todos los gatos',
  },
} as const

export const battleCopy = {
  start: '¡A jugar!',
  intro: (name: string) => `¡${name} quiere jugar!`,
  catBar: 'Energía de juego', youBar: 'Paciencia', you: 'Tú',
  prompt: '¿Qué vas a hacer?',
  moves: { ovillo: 'Lanzar ovillo', mimos: 'Mimos', ronroneo: 'Ronroneo', huir: 'Huir' },
  yourMove: {
    ovillo: (name: string) => `¡Lanzaste el ovillo! ${name} corre tras él.`,
    mimos: (name: string) => `Le diste mimos a ${name}. ¡Ronronea feliz!`,
    ronroneo: (name: string) => `Imitaste un ronroneo. ${name} se relaja…`,
  },
  effective: '¡Es muy efectivo!',
  fled: 'Te fuiste sin hacer ruido.',
  catMoves: {
    misha: ['Misha bosteza…', 'Misha te mira con calma.', 'Misha se estira despacio.', 'Misha amasa una cobija.'],
    kira: ['Kira persigue su cola.', 'Kira hace ojitos.', 'Kira mira una estrella fugaz.', 'Kira salta hacia la puerta.'],
  },
  effectOnYou: 'Tu paciencia baja un poco.',
  safety: (name: string) => `${name} te da un cabezazo cariñoso. ¡Recuperas paciencia!`,
  finisher: { misha: '¡Misha se ha dormido!', kira: '¡Kira se ha echado al suelo!' },
} as const

export const gateGameCopy = {
  start: 'Toca para jugar',
  score: (n: number) => `Puntos ${n}`,
  combo: (n: number) => `Combo ×${n}`,
  seconds: (s: number) => `${s} s`,
  over: '¡Se acabó el tiempo!',
  best: (n: number) => `Tu mejor puntaje: ${n}`,
  record: '¡Nuevo récord!',
} as const
```

- [ ] **Step 5: Restyle the base CSS** in `src/index.css`:
  - map the Tailwind `@theme inline` fonts to the new families;
  - add a paper grain background: an inline SVG `feTurbulence` data URI at 0.08 opacity over the field;
  - remove the pixel-era rules;
  - set body text to Alegreya 17px / 1.5 and headings to Mystery Quest.

- [ ] **Step 6: Run the suite and commit.** Run `npx vitest run && npx eslint . && npx tsc -b`. Expected: all pass. Tests that assert old token values are updated in this step.

```bash
git add -A && git commit -m "Burton pink noir tokens, storybook fonts, paper texture, and the new copy"
```

---

### Task 2: Progress logic (pages, badges, XP, levels)

**Files:**
- Create: `src/logic/progress.ts`, `src/logic/progress.test.ts`, `src/hooks/useProgress.ts`
- Modify: `src/logic/storageKeys.ts` (add `progress: 'mia-progress'`, `gateBest: 'mia-gate-best'`), `src/tuning.ts`

**Interfaces:**
- **Consumes:** `LandmarkId` from `src/logic/layout.ts`, `CatId` and `catById` from `src/content.ts`.
- **Produces:**
  - `type BadgeId`
  - `interface Progress { pages: LandmarkId[]; badges: BadgeId[]; xp: number }`
  - `emptyProgress`
  - `type ProgressEvent`
  - `interface Award { badge?: BadgeId; xp: number }`
  - `applyEvent(p: Progress, e: ProgressEvent): { progress: Progress; awards: Award[] }`
  - `levelFor(xp: number): { level: number; floor: number; next: number | null }`
  - `countablePages(ids: LandmarkId[]): LandmarkId[]`
  - `sanitizeProgress(raw: unknown): Progress`
  - `useProgress(): { progress: Progress; dispatch(e: ProgressEvent): void; awards: Award[]; dismissAward(): void }`

- [ ] **Step 1: Add tuning.**

```ts
progress: {
  levels: [0, 60, 180, 360, 600],
  badgeXp: { openBook: 10, palabra: 20, fecha: 30, lugar: 30, sellada: 50, regalo: 20, qrGuardado: 20, puerta: 30, primerGato: 20, cuentoCompleto: 100, todosLosGatos: 150 },
  catXp: { comun: 20, pocoComun: 40, legendario: 100 },
},
```

- [ ] **Step 2: Write the failing tests** in `src/logic/progress.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { applyEvent, countablePages, emptyProgress, levelFor, sanitizeProgress } from './progress'
import { landmarksFor } from './layout'

const x = tuning.progress
const all = countablePages(landmarksFor(false))

describe('pages and badges', () => {
  it('counts every landmark except the cover', () => {
    expect(all).toEqual(['palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'])
    expect(countablePages(landmarksFor(true))).toEqual(['palabra', 'cuando', 'familia'])
  })
  it('awards the page badge once, and the page is stored once', () => {
    const a = applyEvent(emptyProgress, { type: 'reachedPage', page: 'cuando', pages: all })
    expect(a.awards).toEqual([{ badge: 'fecha', xp: x.badgeXp.fecha }])
    const b = applyEvent(a.progress, { type: 'reachedPage', page: 'cuando', pages: all })
    expect(b.awards).toEqual([])
    expect(b.progress.pages).toEqual(['cuando'])
  })
  it('ignores the cover and pages that are not on this page', () => {
    expect(applyEvent(emptyProgress, { type: 'reachedPage', page: 'llegada', pages: all }).awards).toEqual([])
    const after = countablePages(landmarksFor(true))
    expect(applyEvent(emptyProgress, { type: 'reachedPage', page: 'donde', pages: after }).awards).toEqual([])
  })
  it('stores a page with no badge of its own (Confirmar) without XP', () => {
    const r = applyEvent(emptyProgress, { type: 'reachedPage', page: 'confirmar', pages: all })
    expect(r.progress.pages).toEqual(['confirmar'])
    expect(r.awards).toEqual([])
  })
  it('awards Cuento completo when the last page is found', () => {
    let p = emptyProgress
    for (const page of all.slice(0, -1)) p = applyEvent(p, { type: 'reachedPage', page, pages: all }).progress
    const r = applyEvent(p, { type: 'reachedPage', page: 'familia', pages: all })
    expect(r.awards.map((a) => a.badge)).toEqual(['puerta', 'cuentoCompleto'])
  })
  it('awards the one-off badges once', () => {
    const moved = applyEvent(emptyProgress, { type: 'moved' })
    expect(moved.awards).toEqual([{ badge: 'openBook', xp: x.badgeXp.openBook }])
    expect(applyEvent(moved.progress, { type: 'moved' }).awards).toEqual([])
    expect(applyEvent(emptyProgress, { type: 'confirmed' }).awards[0]?.badge).toBe('sellada')
    expect(applyEvent(emptyProgress, { type: 'savedQr' }).awards[0]?.badge).toBe('qrGuardado')
  })
})

describe('cats', () => {
  it('gives rarity XP, plus Tu primer gato on the first', () => {
    const r = applyEvent(emptyProgress, { type: 'metCat', cat: 'luz', metCount: 1 })
    expect(r.awards).toEqual([{ xp: x.catXp.comun }, { badge: 'primerGato', xp: x.badgeXp.primerGato }])
    expect(r.progress.xp).toBe(x.catXp.comun + x.badgeXp.primerGato)
  })
  it('awards Todos los gatos on the seventh cat', () => {
    const r = applyEvent({ ...emptyProgress, badges: ['primerGato'] }, { type: 'metCat', cat: 'kira', metCount: 7 })
    expect(r.awards.map((a) => a.badge ?? 'cat')).toEqual(['cat', 'todosLosGatos'])
    expect(r.awards[0]?.xp).toBe(x.catXp.legendario)
  })
})

describe('levels', () => {
  it('maps XP to levels and the next threshold', () => {
    expect(levelFor(0)).toEqual({ level: 1, floor: 0, next: x.levels[1] })
    expect(levelFor(x.levels[2]!)).toEqual({ level: 3, floor: x.levels[2], next: x.levels[3] })
    expect(levelFor(99999)).toEqual({ level: 5, floor: x.levels[4], next: null })
  })
})

describe('sanitizeProgress', () => {
  it('drops junk and unknown values', () => {
    for (const raw of [null, 'x', 3, [], { pages: 'cuando' }]) expect(sanitizeProgress(raw)).toEqual(emptyProgress)
    expect(sanitizeProgress({ pages: ['cuando', 'nope', 'cuando'], badges: ['fecha', 'fake'], xp: -5 })).toEqual({
      pages: ['cuando'], badges: ['fecha'], xp: 0,
    })
  })
})
```

Run `npx vitest run src/logic/progress.test.ts`. Expected: FAIL, because the module doesn't exist.

- [ ] **Step 3: Implement `src/logic/progress.ts`.**

```ts
import { catById, type CatId } from '../content'
import { tuning } from '../tuning'
import type { LandmarkId } from './layout'

export type BadgeId = keyof typeof tuning.progress.badgeXp
export interface Progress { pages: LandmarkId[]; badges: BadgeId[]; xp: number }
export interface Award { badge?: BadgeId; xp: number }
export type ProgressEvent =
  | { type: 'moved' }
  | { type: 'reachedPage'; page: LandmarkId; pages: LandmarkId[] }
  | { type: 'confirmed' }
  | { type: 'savedQr' }
  | { type: 'metCat'; cat: CatId; metCount: number }

export const emptyProgress: Progress = { pages: [], badges: [], xp: 0 }

const pageBadge: Partial<Record<LandmarkId, BadgeId>> = {
  palabra: 'palabra', cuando: 'fecha', donde: 'lugar', presente: 'regalo', familia: 'puerta',
}

export function countablePages(ids: LandmarkId[]): LandmarkId[] {
  return ids.filter((id) => id !== 'llegada')
}

function earn(p: Progress, awards: Award[], badge: BadgeId): Progress {
  if (p.badges.includes(badge)) return p
  const xp = tuning.progress.badgeXp[badge]
  awards.push({ badge, xp })
  return { ...p, badges: [...p.badges, badge], xp: p.xp + xp }
}

export function applyEvent(p: Progress, e: ProgressEvent): { progress: Progress; awards: Award[] } {
  const awards: Award[] = []
  let next = p
  switch (e.type) {
    case 'moved':
      next = earn(next, awards, 'openBook')
      break
    case 'confirmed':
      next = earn(next, awards, 'sellada')
      break
    case 'savedQr':
      next = earn(next, awards, 'qrGuardado')
      break
    case 'reachedPage': {
      if (!e.pages.includes(e.page) || next.pages.includes(e.page)) break
      next = { ...next, pages: [...next.pages, e.page] }
      const badge = pageBadge[e.page]
      if (badge) next = earn(next, awards, badge)
      if (e.pages.every((page) => next.pages.includes(page))) next = earn(next, awards, 'cuentoCompleto')
      break
    }
    case 'metCat': {
      const xp = tuning.progress.catXp[catById(e.cat).rarity]
      awards.push({ xp })
      next = { ...next, xp: next.xp + xp }
      next = earn(next, awards, 'primerGato')
      if (e.metCount >= 7) next = earn(next, awards, 'todosLosGatos')
      break
    }
  }
  return { progress: next, awards }
}

export function levelFor(xp: number): { level: number; floor: number; next: number | null } {
  const levels = tuning.progress.levels
  let i = 0
  while (i + 1 < levels.length && xp >= levels[i + 1]!) i++
  return { level: i + 1, floor: levels[i]!, next: levels[i + 1] ?? null }
}

const pageIds: ReadonlySet<string> = new Set(['palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'])
const badgeIds: ReadonlySet<string> = new Set(Object.keys(tuning.progress.badgeXp))

function unique<T extends string>(raw: unknown, allowed: ReadonlySet<string>): T[] | null {
  if (!Array.isArray(raw)) return null
  const out: T[] = []
  for (const v of raw) if (typeof v === 'string' && allowed.has(v) && !out.includes(v as T)) out.push(v as T)
  return out
}

export function sanitizeProgress(raw: unknown): Progress {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return emptyProgress
  const r = raw as Record<string, unknown>
  const pages = unique<LandmarkId>(r.pages, pageIds)
  const badges = unique<BadgeId>(r.badges, badgeIds)
  if (!pages || !badges) return emptyProgress
  const xp = typeof r.xp === 'number' && Number.isFinite(r.xp) && r.xp > 0 ? Math.floor(r.xp) : 0
  return { pages, badges, xp }
}
```

Note: the test for "Tu primer gato" orders the awards as cat XP first, then the badge. The implementation pushes the cat XP before calling `earn`, which matches.

- [ ] **Step 4: Run the tests.** Expected: PASS.

- [ ] **Step 5: Write `src/hooks/useProgress.ts`** on the same pattern as `useCatState`: load with `sanitizeProgress(JSON.parse(readStorage(...)))` inside a try; `dispatch` runs `applyEvent`, sets state, and appends the awards to a queue; persist only after a change (never on load). Add a hook test in `src/components/App.test.tsx`: after a greeting, `mia-progress` holds `xp > 0` and `badges` includes `primerGato`.

- [ ] **Step 6: Commit.** `git commit -m "Progress logic: pages, badges, XP, and levels"`

---

### Task 3: Gate game logic

**Files:**
- Create: `src/logic/gateGame.ts`, `src/logic/gateGame.test.ts`, `src/hooks/useGateBest.ts`
- Modify: `src/tuning.ts`

**Interfaces:**
- **Produces:**
  - `interface Drop { id: number; kind: 'yarn' | 'heart'; x: number; y: number }`
  - `interface GateGame { phase: 'ready' | 'playing' | 'over'; timeLeftMs: number; score: number; combo: number; best: number; newRecord: boolean; catcherX: number; drops: Drop[]; nextId: number; spawnInMs: number; seed: number }`
  - `newGame(best: number, seed?: number): GateGame`
  - `startGame(g): GateGame`
  - `moveCatcher(g, x: number): GateGame`
  - `tick(g, dtMs: number): GateGame`

- [ ] **Step 1: Add tuning.**

```ts
gateGame: { durationMs: 30000, spawnEveryMs: 650, fallPerS: 0.42, catchY: 0.86, catchRadius: 0.09, heartChance: 0.3, points: { yarn: 10, heart: 20 }, comboMax: 5, maxStepMs: 100 },
```

- [ ] **Step 2: Write the failing tests** in `src/logic/gateGame.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { moveCatcher, newGame, startGame, tick, type GateGame } from './gateGame'

const t = tuning.gateGame
const withDrop = (g: GateGame, x: number, y: number, kind: 'yarn' | 'heart' = 'yarn'): GateGame => ({
  ...g, drops: [{ id: 99, kind, x, y }], spawnInMs: 1e9,
})

describe('gate game', () => {
  it('waits in ready, then plays for the full duration', () => {
    const g = newGame(0, 1)
    expect(g.phase).toBe('ready')
    expect(tick(g, 1000)).toEqual(g)
    const s = startGame(g)
    expect(s.phase).toBe('playing')
    expect(s.timeLeftMs).toBe(t.durationMs)
  })
  it('scores a catch under the catcher and grows the combo', () => {
    let g = moveCatcher(startGame(newGame(0, 1)), 0.5)
    g = tick(withDrop(g, 0.52, t.catchY - 0.001), 50)
    expect(g.score).toBe(t.points.yarn)
    expect(g.combo).toBe(2)
    g = tick(withDrop(g, 0.5, t.catchY - 0.001, 'heart'), 50)
    expect(g.score).toBe(t.points.yarn + t.points.heart * 2)
  })
  it('resets the combo on a miss and never goes above the maximum', () => {
    let g = { ...moveCatcher(startGame(newGame(0, 1)), 0.1), combo: t.comboMax }
    g = tick(withDrop(g, 0.9, 0.999), 50)
    expect(g.combo).toBe(1)
    expect(g.drops).toHaveLength(0)
  })
  it('clamps a large time step, so a hidden tab does not end the game at once', () => {
    const g = tick(startGame(newGame(0, 1)), 60000)
    expect(g.phase).toBe('playing')
    expect(g.timeLeftMs).toBe(t.durationMs - t.maxStepMs)
  })
  it('ends at zero, keeps the best score, and flags a new record', () => {
    let g = { ...startGame(newGame(50, 1)), score: 80, timeLeftMs: 40 }
    g = tick(g, 50)
    expect(g.phase).toBe('over')
    expect(g.best).toBe(80)
    expect(g.newRecord).toBe(true)
    const again = { ...startGame(newGame(80, 1)), score: 10, timeLeftMs: 10 }
    expect(tick(again, 50).newRecord).toBe(false)
  })
  it('spawns deterministically from the seed', () => {
    const a = tick(startGame(newGame(0, 7)), t.spawnEveryMs)
    const b = tick(startGame(newGame(0, 7)), t.spawnEveryMs)
    expect(a.drops).toEqual(b.drops)
    expect(a.drops.length).toBeGreaterThan(0)
  })
  it('keeps the catcher inside the play area', () => {
    const g = startGame(newGame(0, 1))
    expect(moveCatcher(g, -3).catcherX).toBe(0)
    expect(moveCatcher(g, 3).catcherX).toBe(1)
  })
})
```

Run it. Expected: FAIL (the module is missing).

- [ ] **Step 3: Implement `src/logic/gateGame.ts`.**

```ts
import { tuning } from '../tuning'

export interface Drop { id: number; kind: 'yarn' | 'heart'; x: number; y: number }
export interface GateGame {
  phase: 'ready' | 'playing' | 'over'
  timeLeftMs: number; score: number; combo: number; best: number; newRecord: boolean
  catcherX: number; drops: Drop[]; nextId: number; spawnInMs: number; seed: number
}

const t = () => tuning.gateGame
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

// mulberry32: a tiny seeded random source, so the game is reproducible in tests.
function rand(seed: number): [number, number] {
  let s = (seed + 0x6d2b79f5) | 0
  let r = Math.imul(s ^ (s >>> 15), 1 | s)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  s = s | 0
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, s]
}

export function newGame(best: number, seed = Date.now() % 100000): GateGame {
  return { phase: 'ready', timeLeftMs: t().durationMs, score: 0, combo: 1, best, newRecord: false,
    catcherX: 0.5, drops: [], nextId: 1, spawnInMs: 0, seed }
}

export function startGame(g: GateGame): GateGame {
  return { ...newGame(g.best, g.seed), phase: 'playing' }
}

export function moveCatcher(g: GateGame, x: number): GateGame {
  return { ...g, catcherX: clamp01(x) }
}

export function tick(g: GateGame, dtMs: number): GateGame {
  if (g.phase !== 'playing') return g
  const cfg = t()
  const dt = Math.min(dtMs, cfg.maxStepMs)
  let { score, combo, seed, nextId, spawnInMs } = g
  const drops: Drop[] = []
  for (const d of g.drops) {
    const y = d.y + (cfg.fallPerS * dt) / 1000
    if (y >= cfg.catchY && d.y < cfg.catchY && Math.abs(d.x - g.catcherX) <= cfg.catchRadius) {
      score += cfg.points[d.kind] * combo
      combo = Math.min(cfg.comboMax, combo + 1)
      continue
    }
    if (y > 1) { combo = 1; continue }
    drops.push({ ...d, y })
  }
  spawnInMs -= dt
  while (spawnInMs <= 0) {
    const [rx, s1] = rand(seed)
    const [rk, s2] = rand(s1)
    seed = s2
    drops.push({ id: nextId++, kind: rk < cfg.heartChance ? 'heart' : 'yarn', x: 0.06 + rx * 0.88, y: 0 })
    spawnInMs += cfg.spawnEveryMs
  }
  const timeLeftMs = Math.max(0, g.timeLeftMs - dt)
  if (timeLeftMs === 0) {
    const newRecord = score > g.best
    return { ...g, phase: 'over', timeLeftMs, score, combo, drops: [], best: Math.max(g.best, score), newRecord, seed, nextId, spawnInMs }
  }
  return { ...g, timeLeftMs, score, combo, drops, seed, nextId, spawnInMs }
}
```

- [ ] **Step 4: Run the tests.** Expected: PASS.

- [ ] **Step 5: Write `src/hooks/useGateBest.ts`.** `readStorage('mia-gate-best')` parsed as a non-negative integer, else 0; `saveBest(n)` writes it only when it is larger.

- [ ] **Step 6: Commit.** `git commit -m "Gate game logic: drops, catches, combo, timer, best score"`

---

### Task 4: Battle logic

**Files:**
- Create: `src/logic/battle.ts`, `src/logic/battle.test.ts`
- Modify: `src/tuning.ts`

**Interfaces:**
- **Produces:**
  - `type BattleCat = 'misha' | 'kira'`
  - `type MoveId = 'ovillo' | 'mimos' | 'ronroneo' | 'huir'`
  - `type BattleLine = { kind: 'intro' } | { kind: 'you'; move: Exclude<MoveId, 'huir'> } | { kind: 'effective' } | { kind: 'cat'; index: number } | { kind: 'effect' } | { kind: 'safety' } | { kind: 'finisher' } | { kind: 'fled' }`
  - `interface BattleState { cat: BattleCat; energy: number; patience: number; boosted: boolean; catTurn: number; phase: 'choose' | 'won' | 'fled'; log: BattleLine[] }`
  - `startBattle(cat): BattleState`
  - `chooseMove(s, move): BattleState`

- [ ] **Step 1: Add tuning.**

```ts
battle: { energy: 100, patience: 100, damage: { ovillo: 35, mimos: 25, ronroneo: 20 }, boost: 1.5, effectiveAt: 35, catDamage: [12, 15, 10, 18], floor: 1, safetyRestore: 30 },
```

- [ ] **Step 2: Write the failing tests** in `src/logic/battle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { chooseMove, startBattle } from './battle'

const b = tuning.battle

describe('legendary battle', () => {
  it('starts full, with the intro line', () => {
    const s = startBattle('misha')
    expect(s).toMatchObject({ energy: b.energy, patience: b.patience, phase: 'choose' })
    expect(s.log).toEqual([{ kind: 'intro' }])
  })
  it('applies the move, then the cat answers in a fixed order', () => {
    const s = chooseMove(startBattle('kira'), 'mimos')
    expect(s.energy).toBe(b.energy - b.damage.mimos)
    expect(s.patience).toBe(b.patience - b.catDamage[0]!)
    expect(s.log.slice(1)).toEqual([{ kind: 'you', move: 'mimos' }, { kind: 'cat', index: 0 }, { kind: 'effect' }])
    expect(chooseMove(s, 'mimos').log.at(-2)).toEqual({ kind: 'cat', index: 1 })
  })
  it('marks a strong hit as very effective, and Ronroneo boosts the next move', () => {
    expect(chooseMove(startBattle('misha'), 'ovillo').log).toContainEqual({ kind: 'effective' })
    const boosted = chooseMove(chooseMove(startBattle('misha'), 'ronroneo'), 'mimos')
    expect(boosted.energy).toBe(b.energy - b.damage.ronroneo - b.damage.mimos * b.boost)
    expect(boosted.log).toContainEqual({ kind: 'effective' })
  })
  it('ends with the finisher when energy runs out, with no cat reply', () => {
    let s = startBattle('misha')
    s = chooseMove(chooseMove(s, 'ovillo'), 'ovillo')
    s = chooseMove(s, 'ovillo')
    expect(s.phase).toBe('won')
    expect(s.energy).toBe(0)
    expect(s.log.at(-1)).toEqual({ kind: 'finisher' })
  })
  it('never lets patience fall below the floor', () => {
    let s = { ...startBattle('kira'), patience: 5 }
    s = chooseMove(s, 'mimos')
    expect(s.patience).toBeGreaterThanOrEqual(b.floor)
    expect(s.log).toContainEqual({ kind: 'safety' })
  })
  it('lets the guest flee at any time, saving nothing', () => {
    const s = chooseMove(startBattle('kira'), 'huir')
    expect(s.phase).toBe('fled')
    expect(s.log.at(-1)).toEqual({ kind: 'fled' })
  })
  it('ignores moves after the battle ended', () => {
    const fled = chooseMove(startBattle('kira'), 'huir')
    expect(chooseMove(fled, 'ovillo')).toBe(fled)
  })
})
```

Run it. Expected: FAIL.

- [ ] **Step 3: Implement `src/logic/battle.ts`.**

```ts
import { tuning } from '../tuning'

export type BattleCat = 'misha' | 'kira'
export type MoveId = 'ovillo' | 'mimos' | 'ronroneo' | 'huir'
export type BattleLine =
  | { kind: 'intro' } | { kind: 'you'; move: Exclude<MoveId, 'huir'> } | { kind: 'effective' }
  | { kind: 'cat'; index: number } | { kind: 'effect' } | { kind: 'safety' } | { kind: 'finisher' } | { kind: 'fled' }
export interface BattleState {
  cat: BattleCat; energy: number; patience: number; boosted: boolean; catTurn: number
  phase: 'choose' | 'won' | 'fled'; log: BattleLine[]
}

export function startBattle(cat: BattleCat): BattleState {
  const b = tuning.battle
  return { cat, energy: b.energy, patience: b.patience, boosted: false, catTurn: 0, phase: 'choose', log: [{ kind: 'intro' }] }
}

export function chooseMove(s: BattleState, move: MoveId): BattleState {
  if (s.phase !== 'choose') return s
  const b = tuning.battle
  if (move === 'huir') return { ...s, phase: 'fled', log: [...s.log, { kind: 'fled' }] }
  const log: BattleLine[] = [...s.log, { kind: 'you', move }]
  const hit = b.damage[move] * (s.boosted ? b.boost : 1)
  if (hit >= b.effectiveAt) log.push({ kind: 'effective' })
  const energy = Math.max(0, s.energy - hit)
  if (energy === 0) return { ...s, energy, boosted: false, phase: 'won', log: [...log, { kind: 'finisher' }] }
  const index = s.catTurn % b.catDamage.length
  let patience = s.patience - b.catDamage[index]!
  log.push({ kind: 'cat', index }, { kind: 'effect' })
  if (patience < b.floor) {
    patience = Math.min(b.patience, Math.max(b.floor, patience) + b.safetyRestore)
    log.push({ kind: 'safety' })
  }
  return { ...s, energy, patience, boosted: move === 'ronroneo', catTurn: s.catTurn + 1, log }
}
```

- [ ] **Step 4: Run the tests.** Expected: PASS.

- [ ] **Step 5: Commit.** `git commit -m "Legendary battle logic: moves, fixed cat order, safety net, win, flee"`

---

### Task 5: Camera path, the World chunk, and the fallback

**Files:**
- Create: `src/logic/path.ts`, `src/logic/path.test.ts`, `src/hooks/useWorldCamera.ts`, `src/world/World.tsx`, `src/world/Station.tsx`, `src/world/paperTextures.ts`, `src/components/WorldRoom.tsx`
- Modify: `src/logic/era.ts` (stages `'boceto' | 'tinta' | 'luz'`; update `era.test.ts`), `src/components/App.tsx`
- Rename: `src/components/Room.tsx` becomes `src/components/FlatRoom.tsx`

**Interfaces:**
- **Consumes:** `landmarksFor`, `isPartyOver`, `Pages` (Task 7 provides the full version; this task renders the existing landmark content through a temporary adapter), `hasWebGL`.
- **Produces:**
  - `stationProgress(ids: LandmarkId[]): Record<LandmarkId, number>`: evenly spaced from 0 to 1.
  - `progressFromDrag(progress: number, dx: number, dy: number, vw: number): number`: both axes advance; −dx and −dy move forward; the result is clamped to 0–1.
  - `nearestStation(progress: number, map: Record<LandmarkId, number>): LandmarkId`.
  - `useWorldCamera({ stations, reducedMotion }): { progress, glideTo(id), surfaceProps }`, using the same drag, wheel, keys, and click-suppression rules as `useCamera`, in one dimension.
  - `WorldRoom` props are the same as `Room`'s. It renders `FlatRoom` when reduced motion is on, WebGL is missing, or the world fails. It shows the HTML cover until the world is ready and the guest makes a first move.

- [ ] **Step 1: Write the failing tests** in `src/logic/path.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { landmarksFor } from './layout'
import { nearestStation, progressFromDrag, stationProgress } from './path'

describe('camera path', () => {
  it('spaces stations evenly from 0 to 1', () => {
    const m = stationProgress(landmarksFor(false))
    expect(m.llegada).toBe(0)
    expect(m.familia).toBe(1)
    expect(m.cuando).toBeCloseTo(2 / 6, 5)
  })
  it('moves forward with a left or up drag, and stays within 0 to 1', () => {
    expect(progressFromDrag(0.5, -100, 0, 1000)).toBeGreaterThan(0.5)
    expect(progressFromDrag(0.5, 0, -100, 1000)).toBeGreaterThan(0.5)
    expect(progressFromDrag(0, 500, 0, 1000)).toBe(0)
    expect(progressFromDrag(1, -5000, 0, 1000)).toBe(1)
  })
  it('finds the nearest station', () => {
    const m = stationProgress(landmarksFor(true))
    expect(nearestStation(0.4, m)).toBe('palabra')
    expect(nearestStation(0.95, m)).toBe('familia')
  })
})
```

Add `tuning.world: { dragProgressPerViewport: 0.5, glideMs: 700, stationEps: 0.04, fovPortrait: 58, fovLandscape: 42, maxDpr: 1.75 }`.

- [ ] **Step 2: Run the tests** (expect FAIL), **implement `path.ts`**, and run them again (expect PASS). `progressFromDrag` returns `clamp01(progress + (-(dx + dy) / vw) * tuning.world.dragProgressPerViewport)`.

- [ ] **Step 3: Build `World.tsx`** (the lazy default export):
  - A `Canvas` with `dpr={[1, maxDpr]}` and alpha.
  - `<fog>` in plum.
  - An attic: floorboards, a slanted roof, and a round window with a moon.
  - A giant open book lying on the floor. Its pages curve down to the floor at the edges.
  - `Station`s placed along a gentle S-curve across the pages.
  - A camera rig that damps its position and look-at toward `path(progress)` each frame (`THREE.CatmullRomCurve3` over the station anchors, lifted 1.6 units and pulled back).
  - Stage lighting by progress: boceto has a cool moon light only and gray paper; tinta adds ink outlines and plum shadows; luz lights candles (point lights, one casting shadows) and warms the paper tint.
  - Dust motes as `Points`, with 200 on phones and 500 on desktop.
  - Framing: the field of view comes from the aspect ratio (portrait `fovPortrait`, landscape `fovLandscape`), so wide screens show more of the book instead of stretching.

- [ ] **Step 4: Build `Station.tsx`.**
  - Layered paper cut-out planes, textured from `paperTextures.ts` (SVG strings for arches, candles, trees, frames, the door, rendered to canvas textures).
  - The pieces rotate up from flat as `|progress − stationProgress| < 0.18`, with spring damping.
  - The pieces' ink amount follows the stage.
  - `<Html transform distanceFactor={…} occlude={false}>` holds the station's page (the landmark HTML) and its perched cats.
  - The `Html` wrapper keeps the `data-landmark-id` attribute, so focus into view and the tests still work.

- [ ] **Step 5: Build `WorldRoom.tsx`.**
  - Choose `FlatRoom` if `reducedMotion || !hasWebGL()`.
  - Otherwise render the cover overlay (title, hero line, `Muévete para explorar`), and lazy-load `World` behind it.
  - Wrap `World` in the existing `SceneBoundary`-style error boundary. On an error, switch to `FlatRoom`.
  - The first drag, wheel, or key opens the cover (a page-flip CSS animation) and dispatches the `moved` progress event.
  - Wire `useWorldCamera`, `Signposts`, and focus into view (the focused element's closest `[data-landmark-id]` glides to its station).
  - Add a test to `src/components/RoomCamera.test.tsx`: with `hasWebGL` mocked true and `World` mocked to throw, `WorldRoom` ends on `FlatRoom` (the `room-mid` test id is present).

- [ ] **Step 6: Switch `App`** to render `WorldRoom`. The existing tests keep passing, because jsdom has no WebGL and gets `FlatRoom`.

- [ ] **Step 7: Screenshot check.** Take Playwright shots at 390×844 and 1920×1080, at progress 0, 0.5, and 1:
  - the cover shows at once;
  - the book is visible;
  - pages pop up;
  - light warms toward the door;
  - no page-level scrollbar.

- [ ] **Step 8: Commit.** `git commit -m "3D pop-up book world with camera path, stages, and flat fallback"`

---

### Task 6: New cats, the card reward, and the battle UI

**Files:**
- Create: `src/components/art/InkDefs.tsx`, `src/components/art/CatSprite.tsx`, `src/components/CardReveal.tsx`, `src/components/Battle.tsx`, `src/components/BattleWipe.tsx`
- Modify: `src/components/Cat.tsx`, `src/components/Collection.tsx`, `src/components/App.tsx`
- Delete: `src/components/CatArt.tsx`

**Interfaces:**
- **Consumes:** `battle.ts`, `battleCopy`, `feelingColors`, `useProgress().dispatch`.
- **Produces:**
  - `CatSprite({ id, pose: 'playing' | 'noticing' | 'staying', size, silhouette?, boil? })`: an SVG with named groups `.cat-body`, `.cat-head`, `.cat-ear-l`, `.cat-ear-r`, `.cat-lid`, `.cat-tail`, animated by CSS springs. It uses `filter="url(#ink-boil)"` when `boil` is set.
  - `InkDefs`: mounted once in `App`. It defines `#ink-boil` (an `feTurbulence` whose seed is stepped by SMIL `<animate calcMode="discrete">` at about 8 fps, omitted with reduced motion) and `#paper-edge`.
  - `Cat` changes: for `misha` and `kira`, the noticing button reads `battleCopy.start` and calls `onChallenge(id)` instead of `onGreet`.
  - `CardReveal({ catId })`: the card flip with the rarity tier, triggered on every successful greeting.
  - `Battle({ cat, onWin(cat), onFlee() })`.

- [ ] **Step 1: Write the failing battle UI tests** in `src/components/Battle.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { battleCopy } from '../content'
import { Battle } from './Battle'

describe('Battle dialog (spec §7)', () => {
  it('opens as a dialog with the intro, both bars, and the four moves', () => {
    render(<Battle cat="misha" onWin={vi.fn()} onFlee={vi.fn()} />)
    const dialog = screen.getByRole('dialog', { name: battleCopy.intro('Misha') })
    expect(within(dialog).getByText(battleCopy.catBar)).toBeInTheDocument()
    expect(within(dialog).getByText(battleCopy.youBar)).toBeInTheDocument()
    for (const label of Object.values(battleCopy.moves)) expect(within(dialog).getByRole('button', { name: label })).toBeInTheDocument()
  })
  it('announces lines in a live region and wins with the finisher', () => {
    const onWin = vi.fn()
    render(<Battle cat="kira" onWin={onWin} onFlee={vi.fn()} instant />)
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: battleCopy.moves.ovillo }))
    expect(screen.getByRole('log')).toHaveTextContent(battleCopy.finisher.kira)
    fireEvent.click(screen.getByRole('button', { name: /continuar|Se quedó contigo/i }))
    expect(onWin).toHaveBeenCalledWith('kira')
  })
  it('treats Escape as Huir', () => {
    const onFlee = vi.fn()
    render(<Battle cat="misha" onWin={vi.fn()} onFlee={onFlee} instant />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onFlee).toHaveBeenCalled()
  })
})
```

`instant` skips the typewriter and the wipe, for tests and reduced motion. The win control's label reuses `copy.caught(name)`, so no new string is needed. Run the tests. Expected: FAIL.

- [ ] **Step 2: Implement `Battle.tsx` and `BattleWipe.tsx`.**
  - A full-screen dialog with `aria-labelledby` pointing at the intro, and focus moved to the first move.
  - Two HP bars (Pixelify Sans labels) that animate toward their values.
  - The cat's `CatSprite` in its feeling color on a spotlight, with a gold name plate `★★★ Legendario`.
  - Moves as 2×2 buttons.
  - The message box types each new `BattleLine` (resolved to copy through `battleCopy`) into a `role="log"` live region.
  - Moves are disabled while a line is typing.
  - On `won`: a gold burst, then a single button labelled `copy.caught(name)` that calls `onWin`.
  - Escape calls `onFlee`, and `Huir` calls `onFlee` after its line.
  - `BattleWipe`: a conic-gradient mask spiral of 700 ms before the dialog. Skipped when `instant` is set or reduced motion is on.

  Run the tests. Expected: PASS.

- [ ] **Step 3: Draw the seven cats in `CatSprite.tsx`,** following spec §4:
  - one shared style: double scratchy outline (an ink stroke, plus an offset lighter stroke at 0.35 opacity), mismatched eyes, spindly legs, a spiral tail, stitch marks;
  - each cat keeps its silhouette cue and wears its feeling color in its eyes, glow, and collar charm;
  - poses: `noticing` turns the head and opens the eyes; `staying` adds a small heart;
  - CSS: breathing (body `scaleY` 1 to 1.03, 3.2 s), blinking (lid `scaleY` every 4–6 s, staggered per cat), ear twitches, and a tail sway with follow-through via chained `animation-delay`;
  - behaviors per cat, as spec §4 lists;
  - no animation with reduced motion.

  Replace every `CatArt` use (`Cat`, `Collection`) and delete `CatArt.tsx`. Update the tests that referred to `.cat-art`.

- [ ] **Step 4: Implement `CardReveal.tsx`.**
  - A 3D card flip (CSS `rotateY`) with the cat, name, line, and feeling-color frame.
  - The rarity shown big: Común silver shimmer, Poco común rose burst, Legendario gold with stars.
  - It stays for `tuning.greetingToastMs`, and closes on a tap.
  - `GreetingToast` stays as the screen-reader live region.

- [ ] **Step 5: Wire it into `App`.**
  - `onChallenge` opens `Battle`, rendered as the only dialog; the page behind becomes inert.
  - `onWin(cat)` calls `greetCat(cat)`, closes the battle, shows the legendary `CardReveal`, and dispatches `metCat` when the cat was new.
  - Normal greetings show `CardReveal` and dispatch `metCat` when new.

  App tests to add:
  - greeting Misha through the battle stores her in `mia-cats` and shows `Legendario`;
  - `Huir` stores nothing;
  - while the battle is open, `Tus gatos` cannot open (Review Focus 1).

- [ ] **Step 6: Screenshot check.**
  - All seven cats side by side, at 64 px and 160 px, in dark and light;
  - the battle at 390 px and 1440 px;
  - a card reveal for each rarity.

  Line boil must be visible but subtle.

- [ ] **Step 7: Commit.** `git commit -m "Burton cats with rigs and line boil, card rewards, and the legendary battle"`

---

### Task 7: Pop-up pages, themed objects, and the game layer

**Files:**
- Create: `src/components/Pages.tsx`, `src/components/PageCard.tsx`, `src/components/CandleCountdown.tsx`, `src/components/TreasureMap.tsx`, `src/components/WaxSealConfirm.tsx`, `src/components/GiftBox.tsx`, `src/components/QuestLog.tsx`, `src/components/BadgeToasts.tsx`
- Modify: `src/components/FlatRoom.tsx`, `src/world/Station.tsx`, `src/components/App.tsx`, `src/components/Hud.tsx`, `src/components/Location.tsx`, `src/components/Confirmation.tsx`, `src/components/Gift.tsx`, `src/components/Countdown.tsx`

**Interfaces:**
- **Consumes:** `useProgress`, `levelFor`, `countablePages`, `gameCopy`.
- **Produces:**
  - `Pages({ day, now, partyOver, acts, cats, onEvent })`: returns `Record<LandmarkId, ReactNode>`, used by both `FlatRoom` and `Station`.
  - `PageCard({ id, found, children })`: paper card with a torn edge (`filter: url(#paper-edge)`), and the "¡Página encontrada!" stamp the first time `found` flips to true.
  - `QuestLog({ pages, total, cats, xp })`: compact, in the top-left of the HUD, Pixelify Sans.
  - `BadgeToasts({ awards, onDone })`: the queue; one toast at a time; `badges[id]` plus `+{xp} XP`; `levelUp` when the level rises.

- [ ] **Step 1: Write the failing game-layer tests** in `src/components/App.test.tsx`:
  - after `reachedPage cuando` (the signpost `La fecha` in `FlatRoom`, then the camera's arrival), the quest log reads `Páginas 1/6` and a toast shows `Guardaste la fecha` and `+30 XP`;
  - after the party, the quest log reads `Páginas n/3`;
  - tapping `Confirmar por WhatsApp` earns `Invitación sellada` and keeps the link's `href` and `target`;
  - `Guardar QR` earns `QR guardado`.

  Run them. Expected: FAIL.

- [ ] **Step 2: Build `Pages.tsx`** by moving the landmark content out of `FlatRoom`, then add the themed objects:
  - `CandleCountdown`: a candle SVG whose wax height tracks the time remaining (from `now` and the start), an hourglass with sand falling (CSS), and flip-card digits (a CSS 3D flip on change). Numbers come from `countdown()`. It stays silent to screen readers.
  - `TreasureMap`: parchment that unrolls with a `clip-path` from the center, a pin that drops, and the address plus `Ver en el mapa` on the map.
  - `WaxSealConfirm`: a normal link. On click it dispatches `confirmed` and plays a seal-press animation, while the browser opens WhatsApp in a new tab at once. No delay, so popup blockers stay happy.
  - `GiftBox`: when the page is found, the ribbon unties and the lid lifts (CSS), revealing the existing QR plate and `Guardar QR` (which dispatches `savedQr`). The pending sentence shows inside the box when there is no QR.
  - `PageCard` wraps every page.
  - Reaching a page (camera within `stationEps` of it in the world, or the signpost/camera centred on it in `FlatRoom`) dispatches `reachedPage`.

  Run the tests. Expected: PASS.

- [ ] **Step 3: Build `QuestLog` and `BadgeToasts`,** and add them to `Hud` and `App`. The XP bar fill is `(xp − floor) / (next − floor)`. Screen readers get one polite status line per award.

- [ ] **Step 4: Screenshot check.** Every page in 3D and flat, dark and light, at 390 px and 1920 px:
  - the stamp shows;
  - the objects animate once;
  - text is readable and never covered by cats or particles.

- [ ] **Step 5: Commit.** `git commit -m "Pop-up pages, themed objects, quest log, badges, and XP"`

---

### Task 8: Gate game UI

**Files:**
- Create: `src/components/GateGame.tsx`, `src/components/GateGame.test.tsx`
- Modify: `src/components/Gate.tsx`, `src/components/App.test.tsx`

**Interfaces:**
- **Consumes:** `gateGame.ts`, `useGateBest`, `gateGameCopy`, `CatSprite`.
- **Produces:** `GateGame({ reducedMotion })`, which renders inside `Gate` under the two sentences.

- [ ] **Step 1: Write the failing tests** in `src/components/GateGame.test.tsx`:

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gateGameCopy } from '../content'
import { storageKeys } from '../logic/storageKeys'
import { tuning } from '../tuning'
import { GateGame } from './GateGame'

describe('Gate game (spec §8)', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'setInterval'] }))
  afterEach(() => vi.useRealTimers())

  it('starts on a tap, counts down, and ends with the score and best', () => {
    render(<GateGame reducedMotion={false} />)
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(screen.getByText(gateGameCopy.seconds(tuning.gateGame.durationMs / 1000))).toBeInTheDocument()
    for (let t = 0; t < tuning.gateGame.durationMs + 500; t += 50) act(() => { vi.advanceTimersByTime(50) })
    expect(screen.getByText(gateGameCopy.over)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jugar otra vez' })).toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.gateBest)).not.toBeNull()
  })
  it('shows no falling objects with reduced motion', () => {
    render(<GateGame reducedMotion />)
    expect(screen.queryByRole('button', { name: gateGameCopy.start })).not.toBeInTheDocument()
  })
})
```

Run them. Expected: FAIL.

- [ ] **Step 2: Implement `GateGame.tsx`.**
  - A `requestAnimationFrame` loop calls `tick(game, dt)`.
  - Drops are absolutely positioned: yarn and heart SVGs, with a line boil.
  - Luz as a `CatSprite` catcher follows the pointer (`pointermove` over the play area maps x to 0–1) and the arrow keys (±0.06 per press).
  - HUD in Pixelify Sans: `Puntos`, `Combo ×n` (pulses on growth), and the time left.
  - Mimo cheers at combo ≥ 3; Susto startles on a miss.
  - Game over: `¡Se acabó el tiempo!`, the score, `Tu mejor puntaje` or `¡Nuevo récord!`, and `Jugar otra vez`.
  - `saveBest` runs on game over.
  - The loop pauses while the tab is hidden.
  - The gate sentences stay visible above the game at all times.

  Run the tests. Expected: PASS.

- [ ] **Step 3: Update `Gate.tsx`.** Remove the 9-to-0 loop and its tests (`useGateLoop`; US-10 tests are rewritten for the game). Keep the gate cats, which can be greeted, and keep all the "nothing leaks" tests.

- [ ] **Step 4: Screenshot check** at 390 px and 1440 px: ready, playing (with drops and combo), and game over.

- [ ] **Step 5: Commit.** `git commit -m "Gate arcade game: catch yarn and hearts with Luz"`

---

### Task 9: Large screens, performance, docs, and review

**Files:**
- Modify: `src/index.css`, `src/world/World.tsx`, `docs/requirements.md`, `README.md`, `docs/stack-and-resources.md`, `public/og-image.jpg`

- [ ] **Step 1: Large screens.**
  - Cap card and HUD widths with `clamp()`.
  - Scale type between 390 px and 2560 px.
  - Check the world framing at 1920×1080 and 2560×1440.
  - Take a screenshot at every width in spec §9.

- [ ] **Step 2: Performance.**
  - Throttled Chromium check (4× CPU, Fast 3G): the cover visible in under 2 s.
  - Confirm that `World` is a separate chunk and that `dpr` is capped.
  - Check that frames stay smooth while moving (Chrome performance panel or `renderer.info`).

- [ ] **Step 3: Update `docs/requirements.md` per spec §11:**
  - the battle, the gate game, the stages, the palette, fonts, and textures;
  - the new copy in §6;
  - BR-16 with the two keys;
  - US-14, US-15, and US-16, with US-7 and US-10 adjusted;
  - the tokens in §16.

  Update the README (features, fonts, the new files) and `docs/stack-and-resources.md` (drei, fonts).

- [ ] **Step 4: Regenerate `public/og-image.jpg`** with the new cats and fonts: 1200×630, JPEG under 300 KB, no date or place.

- [ ] **Step 5: Full check, then commit.** Run `npm test && npm run lint && npm run build && npx vite preview`, with a subpath check under `/mia-babyshower/`. Then:

```bash
git commit -m "Large screens, performance, and docs for the pop-up book redesign"
```

- [ ] **Step 6: Whole-branch review.** Use `superpowers:requesting-code-review`. Fix every Critical and Important finding, then commit.
