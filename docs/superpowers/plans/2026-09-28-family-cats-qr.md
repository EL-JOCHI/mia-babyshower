# The real gift QR, the family's cats, clearer controls, music, and dad's guitar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the real Banco Ganadero QR on the gift page (styled on screen, plain in the download), turn the seven cats into the family's ten in their real coats, replace the theme words with a sun and a moon and give Tus gatos a cat icon with a count, play the host's music, make the gate game smooth, and lean dad's gold-top Mockingbird in the attic's corner by the family door.

**Architecture:**

- **Cats.** Each cat drawing gains a `coat` (the Misha family, the Kira family, black, or white) that `CatSprite` paints as a shaded fill with clipped marks (patches, stripes, white) under the unchanged scratchy ink outline. The ids stay (`luz`, `mimo`, …), so stored `mia-cats` keep working; names, lines, and the three new records live in `src/content.ts`, their colors and waits in `src/tuning.ts`, their perches in `Pages`, which both rooms share.
- **The QR.** The payload is a fact in `src/content.ts`. A pure module, `src/logic/qr.ts`, turns it into module matrices with `qrcode-generator` (H for the screen, M for the download), finds the finder eyes and a safe centre square for the cat emblem, and rasterizes a matrix to pixels. `GiftQr` draws the screen matrix as SVG; the download is the same raster put on a canvas and encoded as a PNG. Tests decode both with `jsqr`.
- **Everything else is local.** Icon buttons in `ThemeControl` and `Hud`; the MP3 dropped where `src/assets.ts` already looks; the gate game's frame loop writes transforms through refs and React renders only on events; the guitar is one more pure prop factory merged by material in the lazy World chunk.

**Tech Stack:** Vite 8.3, React 19.2, TypeScript 6.0 (strict), Tailwind 4.3, three 0.186, @react-three/fiber 9.7, @react-three/drei 10.7, Vitest 5 with jsdom 30 and Testing Library. New: `qrcode-generator` 2.0.4 (dependency, MIT) and `jsqr` 1.4.0 (devDependency, Apache-2.0).

**Spec:** `docs/superpowers/specs/2026-09-28-family-cats-qr-design.md` (this work), with `docs/requirements.md` for everything it does not change.

**About the art:** the cats, the QR's emblem, the icons, and the guitar are drawn in code. Every drawing below is complete, compiling data with its starting values in `src/tuning.ts`; the screenshot steps say what to judge, and changing a patch, a placement, or a color afterwards is a data or tuning change, not a code change.

**Verified:** every task below was applied, in order, to a throwaway copy of this worktree. After each task `npx tsc -b` and `npx eslint .` were clean and the full suite passed (469 tests before Task 1; 482, 496, 512, 518, 521, 526, and 526 after Tasks 1–7), and the build kept three out of the entry chunk. The failing-first runs quoted in each task are the real failures from applying only that task's tests.

## Controller rulings (binding; they override the task text where they differ)

1. **Download = the bank's own QR (Task 3).** The bank's code is error correction L at version 13 with a UTF-8 ECI marker. A re-encode at M comes out as version 15 without the ECI. Same payload, different code, and this is the money path. So `Guardar QR` shares or downloads the bank's own cropped image.
   - Copy `QR-code-cutoff.png` from the host's `ideas/` folder (local, never committed) to `src/assets/qr-bank.png`. It holds only the QR and the bank's `$`, with no name or account text. Never use `ideas/QR-code.jpg`.
   - The file name stays `qr-regalo-mia.png`, and the share-else-download logic and the `QR guardado` badge are unchanged.
   - Drop the canvas PNG render and the error-correction-M download matrix.
   - Keep a test that decodes the committed `qr-bank.png` (jsqr with pngjs as a dev dependency) to the stored payload exactly.
2. **The screen QR at error correction Q, not H (Task 3).** At H it is version 20, about 2.1 CSS px per module at 220 px, and a 1× screenshot failed to decode in the light theme.
   - Use Q, which recovers 25%. The emblem stays clear of the finder and alignment patterns and at most about 5% of the area.
   - Add a round-trip test that rasterizes the screen matrix at the real on-screen module size, `tuning.qr.minPx` divided by (modules + 2 × quiet zone), and decodes it with the emblem area forced light, in both theme color pairs, to the exact payload.
   - Verify a 1× browser screenshot decodes in both themes.
3. **Gate game: profile first (Task 5).**
   - Before changing code, take a Chrome performance trace while playing, at 390×844, unthrottled and at 4× CPU, and name the dominant cost.
   - Fix that cost as well as the per-frame React renders. If it is the SVG ink-boil filters, turn the boil off on every gate cat while a round is playing and restore it after.
   - Report the frame times before and after, unthrottled and at 4× CPU. Target: at most about 17 ms per frame unthrottled while playing.
4. **Accepted from the plan's notes:**
   - `budget.materials` goes from 14 to 17 for the guitar; the draw-call budget is unchanged.
   - BR-5 is rewritten, because the site now generates the screen QR.
   - Chona and Minina move inward on Inicio.
   - The pre-existing perches outside the noticing zone at rest are left as they are.

## Global Constraints

- **Environment:** every shell starts with `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null`, from the worktree root (branch `family-cats-qr`). Every Run line below includes it. In the scripts below, `<worktree>` stands for that root's absolute path, and `<host-ideas>` for the host's `ideas/` folder (local, never committed).
- **Tests:** one file with `npx vitest run <file>`; the full suite with `npx vitest run --maxWorkers=2`. Checks: `npx eslint .`, `npx tsc -b`, `npm run build`.
- **Copy:** every guest-facing string comes from `src/content.ts`, verbatim from the spec (Spanish, with its accents): the family line `La familia se hace más grande, y nos encantaría que nos acompañes.`, the gift line `El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.`, the hint `Toca el gatito para guardar el QR en tu celular.`, and the cats' names, feelings, and lines in spec §3.
- **Numbers and colors:** every number and color comes from `src/tuning.ts`. There are no hex values in components or CSS; CSS colors come only from variables generated by `src/headMeta.ts` or set inline from tuning. A new hex value is allowed only in `tuning.ts`, with a comment saying why. `src/cssVariables.test.ts` must pass.
- **Lint:** eslint-plugin-react-hooks 7 compiler rules: no ref access during render, no setState synchronously in effects, no impure calls (`Math.random`, `Date.now`, `performance.now`) in render. `npx eslint .` and `npx tsc -b` stay clean after every task.
- **Dependencies:** exactly two new ones, pinned: `qrcode-generator` `2.0.4` in `dependencies` and `jsqr` `1.4.0` in `devDependencies` (`npm install --save-exact`). Both are recorded in `docs/stack-and-resources.md` (Task 7). `jsqr` is imported by tests only.
- **Loading:** the World chunk stays lazy; the entry chunk must not import three. `qrcode-generator` lives in the entry chunk (spec §2). The one shadow-casting light, the dpr caps, and the draw-call budget (≤ 100 in the book, ≤ 60 at level 2, in the static budget test) are unchanged. Props stay out of the camera's view of the pages (`src/world/props/placement.test.ts`).
- **Behavior that stays:** storage keys are unchanged (`mia-cats`, `mia-theme`, `mia-music`, `mia-progress`, `mia-gate-best`); a stored `mia-cats` with today's ids still loads; nobody loses; facts are never gated; the battle, the card reveal, and rarity visibility are unchanged; the gate keeps `luz`, `mimo`, and `susto`.
- **Privacy:** the payload is the only thing taken from the host's QR images. `ideas/QR-code.jpg`, and any name or account number printed on it, never enter the repo, a commit, or a test. Decoding is local only.
- **Browser checks:** use your own dev server from this worktree, `npm run dev -- --port 5174 --strictPort`, and Playwright MCP. Take every screenshot with `mcp__playwright__browser_run_code_unsafe` and `page.screenshot({ path })` using an **absolute** path under the worktree's `.playwright-mcp/` (`<worktree>/.playwright-mcp/`, git-ignored). Never pass a relative path: the Playwright server's working directory may be another checkout, even the main repo. Look at each screenshot with the Read tool. Stop the dev server when the task is done.
- **Scratch files:** throwaway pages and scripts go in `.superpowers/` (git-ignored) and are deleted when their task ends.
- **Git:** never push; never touch `main` or the host's own checkout of `main`; never commit `ideas/`. Commit with this form, the trailer after a blank line:

  ```bash
  git commit -m "$(cat <<'EOF'
  <subject>

  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  EOF
  )"
  ```

## Review Focus

1. **A returning guest who met the seven cats before the rename.** Their `mia-cats` still loads: all seven show under their new names and lines, the quest log reads `Gatos 7/10`, **Tus gatos** reads `7 de 10`, the three new cats show `Aún no se acerca`, and nothing is rewritten in storage. *Test in Task 2 (App).*
2. **The downloaded PNG imported into a bank app's "scan from gallery".** It is exactly 1024 px square, pure black on pure white and fully opaque, has a clean white quiet zone of at least 4 modules on every side, carries no emblem, and decodes to the payload exactly; the canvas paints exactly those pixels. *Tests in Task 3 (`qr.test.ts`, `Gift.test.tsx`).*
3. **A white coat on the bone card in the light theme.** Minina's body and head keep an ink outline (`--cat-line`, ink) over the coat and a soft shade band under it, the light coats' tube edges and whiskers are ink rather than the bone meant for black cats, and ink reads on both themes' paper. *Test in Task 1.*
4. **Ten cats on the four pages left after the party.** Llegada holds Chavela, Chona, and Minina; Palabra Choni, Delilah, and Chori; Cuándo Mishona and Kiri kiri; Familia Misha and Kira; each cat once, each in its own spot, on both days and in both the flat room and the book. *Tests in Task 2 (Room, RoomCamera).*
5. **The gate game on a slow phone.** A second and a half of frames, and pointer moves, cause no React render at all; the drops and the catcher still move; there is a drop slot for every drop that can fall at once. *Tests in Task 5, plus the before/after frame-time check.*

"A tap on the empty space near the seal stays Chavela's startle, and the confirm link never fires anything" is pinned in Task 2; "the SVG has no emblem over the finder patterns" in Task 3.

---

## File map

**New:**

- `src/components/art/cats/{chona,chori,minina}.ts`: the three new drawings (Task 1).
- `src/content.test.ts`: the cats table, the rarity mix, and the copy, verbatim (Tasks 2 and 4).
- `src/logic/qr.ts`, `src/logic/qr.test.ts`: matrices, eyes, emblem, runs, raster, and the decode proofs (Task 3).
- `src/components/GiftQr.tsx`: the screen QR as SVG, and `qrPng` (Task 3).
- `src/assets/audio/ambience.mp3`, `src/assets.test.ts`, `src/components/Hud.test.tsx` (Task 4).
- `src/world/props/guitar.ts`: the Mockingbird (Task 6).

**Modified:** `src/content.ts`, `src/tuning.ts`, `src/index.css`, `src/styles/{pages,game}.css`, `src/assets.ts`, `src/components/art/CatSprite.tsx`, `src/components/art/cats/*.ts`, `src/components/{App,Pages,Confirmation,Collection,QuestLog,Gift,Hud,ThemeControl,GateGame,FlatRoom,WorldRoom}.tsx`, `src/logic/{noticing,progress}.ts`, `src/world/Props.tsx`, `src/world/props/{build,factories,shapes,types}.ts`, the tests beside them, `src/test/helpers.tsx`, `package.json`, `package-lock.json`, `public/og-image.jpg`.

**Docs (Task 7):** `docs/requirements.md`, `README.md`, `docs/publishing.md`, `docs/stack-and-resources.md`.

---

### Task 1: Cat coats and art

**Files:**
- Modify: `src/content.ts` (`CatId`), `src/tuning.ts` (`CoatKind`, `CoatColors`, `feelingColors`, `tuning.cats`), `src/components/art/cats/types.ts`, `src/components/art/cats/{misha,kira,luz,mimo,bram,nana,susto,index}.ts`, `src/components/art/CatSprite.tsx`, `src/index.css` (the cat sprite rules)
- Create: `src/components/art/cats/chona.ts`, `src/components/art/cats/chori.ts`, `src/components/art/cats/minina.ts`
- Test: `src/components/art/CatSprite.test.tsx`

**Interfaces:**
- **Consumes:** `ColorMix`, `cssColor`, `tokens`, `feelingColors`, `tuning` from `src/tuning.ts`; `Stage` from `src/logic/era.ts`.
- **Produces:**
  - `type CatId = 'luz' | 'mimo' | 'susto' | 'bram' | 'nana' | 'chona' | 'chori' | 'minina' | 'misha' | 'kira'` (`src/content.ts`). `cats` is not touched here: Task 2 adds the three records.
  - `type CoatKind = 'misha' | 'kira' | 'black' | 'white'`; `interface CoatColors { coat: ColorMix; shade: ColorMix; mark: ColorMix; white: ColorMix }` (`src/tuning.ts`).
  - `tuning.cats.coats: Record<CoatKind, CoatColors>`, `tuning.cats.shade: { dx: number; dy: number }`, `tuning.cats.stripe: number`, `tuning.cats.eyes: { misha: string; kira: string; bram: string }`; `feelingColors.chona`, `.chori`, `.minina`; `tuning.cats.blinkMs`, `blinkDelayMs`, `earMs`, `behaviorMs` for all ten ids. `tuning.cats.mimoBody` is removed.
  - In `src/components/art/cats/types.ts`: `interface CoatMark { d: string; paint: 'patch' | 'stripe' | 'white' }`; `interface Coat { kind: CoatKind; body?: readonly CoatMark[]; head?: readonly CoatMark[]; ears?: 'mark'; tail?: 'mark'; paws?: 'white' }`; `CatDrawing.coat: Coat`; `CatDrawing.lashes?: string`; `CharmKind` gains `'bolt' | 'fish' | 'yarn'`. `index.ts` re-exports `Coat` and `CoatMark`.
  - `catDrawings: Record<CatId, CatDrawing>` with ten drawings.
  - `CatSprite` adds the class `coat-<kind>` to its `<svg>` and sets `--coat`, `--coat-shade`, `--coat-mark`, `--coat-white`, `--eye`, and `--eye-muted` inline (no more `--mimo-body`). The CSS classes `.cat-coat-shade`, `.cat-coat`, `.cat-mark-patch`, `.cat-mark-stripe`, `.cat-mark-white`, `.cat-outline`, `.cat-ear-mark`, `.cat-tube-mark`, `.cat-paw-white`, and `.cat-lash` are what later tasks' tests read.

- [ ] **Step 1: Write the failing tests.**

In `src/components/art/CatSprite.test.tsx`, make this replacement (each block to find appears exactly once):

Find:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { catIds } from '../../content'
import { feelingColors } from '../../tuning'
import { CatSprite } from './CatSprite'
import { InkDefs } from './InkDefs'

const sprite = (container: HTMLElement) => container.querySelector('svg.cat-sprite')!

describe('CatSprite (design §4)', () => {
  it.each(catIds)('draws %s with the named rig groups', (id) => {
    const { container } = render(<CatSprite id={id} stage="luz" size={64} />)
    const svg = sprite(container)
    for (const part of ['.cat-body', '.cat-head', '.cat-ear-l', '.cat-ear-r', '.cat-tail']) {
```

Replace with:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CatId } from '../../content'
import { contrastRatio } from '../../logic/contrast'
import { cssColor, feelingColors, themes, tokens, tuning } from '../../tuning'
import indexCss from '../../index.css?raw'
import { CatSprite } from './CatSprite'
import { catDrawings } from './cats'
import { InkDefs } from './InkDefs'

const sprite = (container: HTMLElement) => container.querySelector('svg.cat-sprite')! as SVGElement
const drawn = Object.keys(catDrawings) as CatId[]

// The declarations of the CSS rule whose selector list contains `selector`.
function ruleFor(css: string, selector: string): string {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const rule = rules.find(([, selectors]) => selectors!.split(',').some((s) => s.trim() === selector))
  return rule?.[2] ?? ''
}

describe('the ten cats (spec §3)', () => {
  it('draws every one of the ten cats', () => {
    expect([...drawn].sort()).toEqual(['bram', 'chona', 'chori', 'kira', 'luz', 'mimo', 'minina', 'misha', 'nana', 'susto'])
  })

  it('dresses each family in its coat: the Misha family, the Kira family, black, and pure white', () => {
    const coats = Object.fromEntries(drawn.map((id) => [id, catDrawings[id].coat.kind]))
    expect(coats).toEqual({
      luz: 'misha',
      mimo: 'misha',
      chona: 'misha',
      chori: 'misha',
      misha: 'misha',
      bram: 'kira',
      kira: 'kira',
      nana: 'black',
      susto: 'black',
      minina: 'white',
    })
  })

  it('draws Misha white with silver-gray patches, a gray cap over the ears, and green eyes', () => {
    const svg = sprite(render(<CatSprite id="misha" stage="luz" size={68} />).container)
    expect(svg).toHaveClass('coat-misha')
    expect(svg.style.getPropertyValue('--coat')).toBe(cssColor(tuning.cats.coats.misha.coat))
    expect(svg.style.getPropertyValue('--coat-mark')).toBe(cssColor(tuning.cats.coats.misha.mark))
    expect(svg.style.getPropertyValue('--eye')).toBe(tuning.cats.eyes.misha)
    expect(svg.querySelectorAll('.cat-body .cat-mark-patch').length).toBeGreaterThanOrEqual(2)
    expect(svg.querySelectorAll('.cat-head .cat-mark-patch')).toHaveLength(1)
    expect(svg.querySelectorAll('.cat-ear-mark')).toHaveLength(2)
    expect(svg.querySelectorAll('.cat-tube-mark').length).toBeGreaterThan(0)
  })

  it.each(['kira', 'bram'] as const)('draws %s as a brown-gray tabby with stripes, a white chest, white paws, and amber-green eyes', (id) => {
    const svg = sprite(render(<CatSprite id={id} stage="luz" size={64} />).container)
    expect(svg).toHaveClass('coat-kira')
    expect(svg.style.getPropertyValue('--eye')).toBe(tuning.cats.eyes[id])
    expect(svg.querySelectorAll('.cat-body .cat-mark-stripe').length).toBeGreaterThan(0)
    expect(svg.querySelectorAll('.cat-head .cat-mark-stripe').length).toBeGreaterThan(0)
    expect(svg.querySelector('.cat-body .cat-mark-white')).not.toBeNull()
    expect(svg.querySelectorAll('.cat-paw-white')).toHaveLength(catDrawings[id].legs.length)
  })

  it('draws Minina pure white, with no patches, apart from the Misha family', () => {
    const svg = sprite(render(<CatSprite id="minina" stage="luz" size={64} />).container)
    expect(svg).toHaveClass('coat-white')
    expect(svg.querySelector('.cat-mark, .cat-ear-mark, .cat-tube-mark')).toBeNull()
  })

  it.each(['nana', 'susto'] as const)('keeps %s black, in the theme\'s cat body', (id) => {
    const svg = sprite(render(<CatSprite id={id} stage="luz" size={64} />).container)
    expect(svg).toHaveClass('coat-black')
    expect(svg.style.getPropertyValue('--coat')).toBe('var(--cat-body)')
  })

  it('gives Mishona her bow and her lashes, and no one else lashes', () => {
    for (const id of drawn) {
      const svg = sprite(render(<CatSprite id={id} stage="luz" size={64} />).container)
      expect(svg.querySelector('.cat-lash') !== null, id).toBe(id === 'luz')
    }
    const luz = sprite(render(<CatSprite id="luz" stage="luz" size={64} />).container)
    expect(luz.querySelectorAll('.cat-head .cat-paint-rose')).toHaveLength(2)
  })

  // Review Focus 3: a white coat on the bone card, in the light theme.
  it('keeps a white coat readable on the bone card: an ink outline over the coat, and a soft shade under it', () => {
    const svg = sprite(render(<CatSprite id="minina" stage="luz" size={tuning.catSize.card} />).container)
    for (const part of ['.cat-body', '.cat-head']) {
      const group = svg.querySelector(part)!
      expect(group.querySelector('.cat-coat-shade')).not.toBeNull()
      expect(group.querySelector('.cat-coat')).toHaveAttribute('transform', `translate(${-tuning.cats.shade.dx} ${-tuning.cats.shade.dy})`)
      expect(group.querySelector('.cat-outline')).toHaveAttribute('stroke-width', String(tuning.cats.line))
    }
    expect(tuning.cats.coats.white.shade).not.toEqual(tuning.cats.coats.white.coat)
    // The outline is ink (--cat-line is --shadow), and ink reads on both themes' paper.
    expect(ruleFor(indexCss, '.cat-outline')).toMatch(/stroke:\s*var\(--cat-line\)/)
    expect(ruleFor(indexCss, '.cat-sprite')).toMatch(/--cat-line:\s*var\(--shadow\)/)
    for (const name of ['dark', 'light'] as const) {
      expect(contrastRatio(tokens.shadow, themes[name].page)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(tokens.shadow, tokens.bone)).toBeGreaterThanOrEqual(4.5)
    }
    // The light coats' tube edges, paw pads, and whiskers are ink too, never the bone meant for a black coat.
    for (const kind of ['misha', 'kira', 'white']) {
      expect(ruleFor(indexCss, `.cat-sprite.coat-${kind}:not(.stage-boceto)`)).toMatch(/--cat-edge:\s*var\(--shadow\)/)
    }
  })
})

describe('CatSprite (design §4)', () => {
  it.each(drawn)('draws %s with the named rig groups', (id) => {
    const { container } = render(<CatSprite id={id} stage="luz" size={64} />)
    const svg = sprite(container)
    for (const part of ['.cat-body', '.cat-head', '.cat-ear-l', '.cat-ear-r', '.cat-tail']) {
```

- [ ] **Step 2: Run them to see them fail.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/components/art/CatSprite.test.tsx
```

Expected: FAIL, `10 failed | 12 passed (22)`. Among them: "draws every one of the ten cats" (`expected [ 'bram', 'kira', 'luz', 'mimo', …(3) ] to deeply equal [ 'bram', 'chona', 'chori', …(7) ]`), "dresses each family in its coat" (`Cannot read properties of undefined (reading 'kind')`), and "draws Misha white with silver-gray patches…" (`toHaveClass("coat-misha")`).

- [ ] **Step 3: Add the three ids, and the coats, eyes, and timings in tuning.**

In `src/content.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
// Copy is Spanish and comes verbatim from requirements §6. Code stays English.

export type DayId = 'sat' | 'sun'
export type CatId = 'luz' | 'mimo' | 'susto' | 'bram' | 'nana' | 'misha' | 'kira'
export type Rarity = 'comun' | 'pocoComun' | 'legendario'
export type CatPage = 'gate' | 'invitation'
```

Replace with:

```ts
// Copy is Spanish and comes verbatim from requirements §6. Code stays English.

export type DayId = 'sat' | 'sun'
export type CatId = 'luz' | 'mimo' | 'susto' | 'bram' | 'nana' | 'chona' | 'chori' | 'minina' | 'misha' | 'kira'
export type Rarity = 'comun' | 'pocoComun' | 'legendario'
export type CatPage = 'gate' | 'invitation'
```

In `src/tuning.ts`, make these 4 replacements (each block to find appears exactly once):

1. Find:

```ts
  motionScale: number
}

// The lived-in attic's props (spec §5).
export type PropName =
  | 'crib'
```

Replace with:

```ts
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
```

2. Find:

```ts
  susto: '#A98BEA',
  bram: '#F2784B',
  nana: '#7FD9B0',
  misha: '#8EB8F0',
  kira: '#5FD4D0',
}
```

Replace with:

```ts
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
```

3. Find:

```ts
  cats: {
    // Pencil graphite on the cut-out paper: ink faded toward the paper.
    pencil: ['var(--shadow)', 'var(--cat-paper)', 0.32] as ColorMix,
    // Mimo keeps a blush body.
    mimoBody: [tokens.bone, tokens.rose, 0.5] as ColorMix,
    // In tinta the feeling color is muted toward pencil gray: this much of it shows.
    tintaFeel: 0.5,
    // The ink stroke, and the lighter second pass offset beside it.
```

Replace with:

```ts
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
```

4. Find:

```ts
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
```

Replace with:

```ts
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
```

- [ ] **Step 4: Give the drawings a coat.**

Replace the whole of `src/components/art/cats/types.ts` with:

```ts
// One cat drawing (design §4), as data in a 120 by 120 box with the floor at y = 112. The renderer
// (CatSprite) gives every cat the same family style: a paper cut-out, a double scratchy ink outline,
// big mismatched eyes, spindly legs, a spiral tail, and a few stitch marks. Each cat wears its
// family's coat (spec §3 Coats).

import type { CoatKind } from '../../../tuning'

export type Xy = readonly [x: number, y: number]

// The collar charm, in the cat's feeling color.
export type CharmKind = 'sun' | 'heart' | 'bell' | 'pick' | 'gem' | 'moon' | 'star' | 'bolt' | 'fish' | 'yarn'

export interface EyeSpec {
  x: number
  y: number
  r: number
}

export interface Ear {
  d: string
  // The pink inside of the ear; empty when the ear is turned away (Chavela's, flat back).
  inner: string
  origin: Xy
  // A jewel on each prong of a crown-shaped ear, in the feeling color.
  knobs?: readonly Xy[]
}

export interface Leg {
  d: string
  width: number
  paw: Xy
  // A paw that lifts from the shoulder: Delilah's grooming paw, Minina's batting paw.
  groom?: boolean
}

// A small painted piece: Mishona's bow, a tail tip.
export interface Extra {
  d: string
  paint: 'feel' | 'rose' | 'deepRose'
}

// A mark on the coat, clipped to its part: a silver-gray patch (the Misha family), a tiger stripe
// (the Kira family, drawn as a line), or a white chin, muzzle, or chest (the Kira family).
export interface CoatMark {
  d: string
  paint: 'patch' | 'stripe' | 'white'
}

export interface Coat {
  kind: CoatKind
  body?: readonly CoatMark[]
  head?: readonly CoatMark[]
  // The ears and the tail wear the mark color (Misha's gray cap and tail).
  ears?: 'mark'
  tail?: 'mark'
  // White paws (the Kira family).
  paws?: 'white'
}

export interface CatDrawing {
  coat: Coat
  // The soft shadow on the paper under the cat.
  ground: { cx: number; rx: number }
  // The tail is a tube: `d` from the root, then the spiral `tip` from the joint, which follows the
  // tail's sway a moment later. A front tail wraps around the paws, over the body.
  tail: { d: string; tip: string; width: number; root: Xy; joint: Xy; front?: boolean; tipExtra?: Extra }
  body: { d: string; origin: Xy; stitches: string }
  legs: readonly Leg[]
  collar: { d: string; charm: CharmKind; at: Xy }
  // `turn` is the head's turn toward the guest when the cat notices them, in degrees.
  head: { d: string; origin: Xy; turn: number; tufts?: string; extras?: readonly Extra[] }
  ears: { l: Ear; r: Ear }
  // Slightly mismatched on purpose.
  eyes: readonly [EyeSpec, EyeSpec]
  // Mishona's lashes, drawn over the eyes' upper edge.
  lashes?: string
  // How far the lids rest down (0 wide awake, 1 closed). Noticing opens them.
  droop: number
  // How much the lids' lower edge bows (tuning.cats.lidCurve when unset; 0 is flat and cool).
  lidCurve?: number
  // Pupil width as a share of the iris.
  pupil: number
  starEyes?: boolean
  nose: Xy
  mouth: string
  whiskers: string
  heart: Xy
}
```

- [ ] **Step 5: Redraw Misha and Kira as the real cats.** Misha keeps her long lying pose and gains the gray cap (with a white blaze between the eyes), the back and flank patches, and a gray tail; Kira keeps her tall sitting pose and gains a fuller ruff, the tabby stripes, a white chin and chest, and white paws. Their eye colors come from `tuning.cats.eyes`.

Replace the whole of `src/components/art/cats/misha.ts` with:

```ts
import type { CatDrawing } from './types'

// Misha (Calma), as the real Misha: white with silver-gray patches (a gray cap over the ears and the
// crown with a white blaze between the eyes, gray patches on the back and the flank, a gray tail),
// a pink nose, green eyes (tuning.cats.eyes), and short fur. Long and calm, lying by the door, with
// slow, heavy lids.
export const misha: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M30 80 C 38 77, 52 77, 60 80 C 62 86, 56 92, 46 92 C 36 92, 29 88, 30 80 Z', paint: 'patch' },
      { d: 'M62 84 C 70 82, 80 84, 84 90 C 86 97, 78 101, 70 99 C 63 97, 60 90, 62 84 Z', paint: 'patch' },
      { d: 'M14 96 C 16 88, 24 84, 30 86 C 32 92, 28 100, 20 102 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M74 50 L 110 50 L 110 66 C 106 63, 102 62, 97 64 C 95 60, 93 58, 92 58 C 91 58, 89 60, 87 64 C 82 62, 78 63, 74 66 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 60, rx: 46 },
  tail: {
    d: 'M20 97 C 8 89, 7 72, 13 60 C 16 53, 16 46, 18 39',
    tip: 'M18 39 C 19 30, 29 28, 30 35 C 31 41, 24 42, 24 37',
    width: 4.4,
    root: [20, 97],
    joint: [18, 39],
  },
  body: {
    d: 'M16 100 C 14 90, 24 82, 40 81 L 76 80 C 90 80, 98 88, 98 98 C 98 107, 92 112, 82 112 L 26 112 C 19 112, 16 107, 16 100 Z',
    origin: [56, 112],
    stitches: 'M46 82 C 52 85, 58 85, 64 82 M49 80 l-1 6 M55 81 l0 6 M61 80 l1 6',
  },
  legs: [
    { d: 'M84 103 C 92 105, 99 107, 106 109', width: 3, paw: [107, 109] },
    { d: 'M78 108 C 86 110, 93 111, 100 111', width: 3, paw: [101, 111] },
  ],
  collar: { d: 'M79 81 Q 89 88, 101 83', charm: 'moon', at: [90, 88] },
  head: {
    d: 'M76 71 C 76 60, 83 53, 92 53 C 101 53, 108 60, 108 71 C 108 80, 101 86, 92 86 C 83 86, 76 80, 76 71 Z',
    origin: [88, 84],
    turn: -6,
  },
  ears: {
    l: {
      d: 'M79 61 C 78 55, 79 49, 81 44 C 85 47, 88 51, 90 54 Z',
      inner: 'M81 57 C 81 54, 81 51, 82 48 C 84 50, 86 52, 87 54 Z',
      origin: [84, 57],
    },
    r: {
      d: 'M95 54 C 99 50, 103 47, 107 45 C 108 50, 108 56, 106 61 Z',
      inner: 'M98 54 C 100 52, 102 50, 105 49 C 105 52, 105 55, 104 58 Z',
      origin: [101, 56],
    },
  },
  eyes: [
    { x: 85.5, y: 70, r: 5.8 },
    { x: 99, y: 69.5, r: 6.6 },
  ],
  droop: 0.4,
  pupil: 0.3,
  nose: [92, 77],
  mouth: 'M88 80 q2 2 4 0 q2 2 4 0',
  whiskers: 'M83 77 L 79 76.5 M83 80 L 80 81 M101 77 L 105 76.5 M101 80 L 104 81',
  heart: [92, 34],
}
```

Replace the whole of `src/components/art/cats/kira.ts` with:

```ts
import type { CatDrawing } from './types'

// Kira (Asombro), as the real Kira: a long-furred brown-gray tabby with tiger stripes (an M on the
// forehead, bars on the cheeks and flanks), a white chin, chest, and paws, amber-green eyes full of
// stars (tuning.cats.eyes), and a fuller ruff. Slim and tall with tall ears, sitting taller than
// Misha.
export const kira: CatDrawing = {
  coat: {
    kind: 'kira',
    body: [
      { d: 'M53 57 C 56 62, 64 62, 67 57 C 70 66, 66 77, 60 81 C 54 77, 50 66, 53 57 Z', paint: 'white' },
      {
        d: 'M47 70 C 50 71, 51 73, 50 75 M46 80 C 50 81, 51 83, 50 86 M47 90 C 50 91, 51 93, 50 96 M73 70 C 70 71, 69 73, 70 75 M74 80 C 70 81, 69 83, 70 86 M73 90 C 70 91, 69 93, 70 96',
        paint: 'stripe',
      },
    ],
    head: [
      { d: 'M55 25 C 56 28, 56 30, 55 32 M60 23 L 60 31 M65 25 C 64 28, 64 30, 65 32', paint: 'stripe' },
      { d: 'M45 41 L 50 42 M45 45 L 50 45 M75 41 L 70 42 M75 45 L 70 45', paint: 'stripe' },
      { d: 'M53 46 C 55 43, 65 43, 67 46 C 68 51, 65 56, 60 57 C 55 56, 52 51, 53 46 Z', paint: 'white' },
    ],
    paws: 'white',
  },
  ground: { cx: 62, rx: 22 },
  tail: {
    d: 'M72 108 C 86 108, 92 98, 90 84 C 89 76, 86 70, 88 62',
    tip: 'M88 62 C 90 53, 100 53, 99 61 C 98 66, 91 66, 92 61',
    width: 3.8,
    root: [72, 108],
    joint: [88, 62],
  },
  body: {
    d: 'M52 55 C 46 57, 44 61, 47 65 C 44 71, 45 80, 46 93 C 46 105, 49 112, 55 112 L 65 112 C 71 112, 74 105, 74 93 C 75 80, 76 71, 73 65 C 76 61, 74 57, 68 55 Z',
    origin: [60, 112],
    stitches: 'M49 74 C 48 80, 48 86, 49 92 M47 77 l5 1 M46 82 l5 0 M46 87 l5 -1',
  },
  legs: [
    { d: 'M55 83 C 55 95, 54 103, 54 110', width: 2.6, paw: [53, 110] },
    { d: 'M65 83 C 65 95, 66 103, 66 110', width: 2.6, paw: [67, 110] },
  ],
  collar: { d: 'M50 57 Q 60 62, 70 57', charm: 'star', at: [60, 63] },
  head: {
    d: 'M44 39 C 44 28, 51 21, 60 21 C 69 21, 76 28, 76 39 C 76 42, 79 44, 76 46 C 78 48, 75 50, 74 50 C 71 55, 66 57, 60 57 C 54 57, 49 55, 46 50 C 45 50, 42 48, 44 46 C 41 44, 44 42, 44 39 Z',
    origin: [60, 53],
    turn: -7,
    tufts: 'M44 46 l-3 1 M76 46 l3 1',
  },
  ears: {
    l: {
      d: 'M46 31 C 44 21, 44 11, 46 3 C 51 9, 55 16, 57 22 Z',
      inner: 'M48 26 C 47 20, 47 14, 48 9 C 51 13, 53 17, 54 21 Z',
      origin: [50, 26],
    },
    r: {
      d: 'M63 22 C 66 15, 70 8, 75 3 C 77 11, 77 21, 74 31 Z',
      inner: 'M66 21 C 68 16, 70 12, 73 9 C 74 14, 74 20, 72 26 Z',
      origin: [70, 26],
    },
  },
  eyes: [
    { x: 52.5, y: 38, r: 7.2 },
    { x: 67.5, y: 37.5, r: 6.4 },
  ],
  droop: 0,
  pupil: 0.34,
  starEyes: true,
  nose: [60, 46],
  mouth: 'M56 49 q2 2 4 0 q2 2 4 0',
  whiskers: 'M50 46 L 46 45.5 M50 49 L 47 50 M70 46 L 74 45.5 M70 49 L 73 50',
  heart: [84, 14],
}
```

- [ ] **Step 6: Redraw the renamed cats as their families.** Mishona (`luz`) takes Misha's coat, a bow, and lashes; Choni (`mimo`) loses the blush and the bow and takes Misha's coat; Kiri kiri (`bram`) takes Kira's tabby coat and white paws and loses the lightning tip; Delilah (`nana`) loses the crown ears and leans in, nose forward; Chavela (`susto`) keeps her shape in black.

Replace the whole of `src/components/art/cats/luz.ts` with:

```ts
import type { CatDrawing } from './types'

// Mishona (Coquetería): the flirty Misha. Misha's white-and-silver coat and build, with the patches
// shifted, a small bow on her right ear, lashes, and a high, swishy tail. Always about to pounce.
export const luz: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [{ d: 'M66 70 C 74 72, 82 80, 83 92 C 78 96, 70 94, 66 88 C 63 82, 62 74, 66 70 Z', paint: 'patch' }],
    head: [
      {
        d: 'M32 22 L 82 22 L 82 44 C 78 40, 72 38, 67 40 C 64 34, 60 32, 57 32 C 54 32, 51 35, 49 40 C 44 38, 38 40, 32 44 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 60, rx: 27 },
  tail: {
    d: 'M78 106 C 93 104, 99 89, 97 72 C 96 62, 93 54, 95 44',
    tip: 'M95 44 C 97 33, 108 31, 108 40 C 108 46, 100 47, 101 41',
    width: 4.4,
    root: [78, 106],
    joint: [95, 44],
  },
  body: {
    d: 'M50 69 C 41 76, 35 90, 37 103 C 38 110, 45 112, 55 112 L 67 112 C 77 112, 83 108, 82 99 C 81 87, 75 76, 67 69 Z',
    origin: [59, 112],
    stitches: 'M40 88 C 38 94, 38 99, 40 104 M38 91 l5 1 M37 96 l5 0 M38 101 l5 -1',
  },
  legs: [
    { d: 'M51 88 C 50 97, 49 104, 49 110', width: 3, paw: [48, 110] },
    { d: 'M63 89 C 64 97, 64 104, 65 110', width: 3, paw: [66, 110] },
  ],
  collar: { d: 'M46 68 Q 58 75, 71 68', charm: 'sun', at: [58, 75] },
  head: {
    d: 'M34 50 C 33 36, 44 25, 57 25 C 70 25, 81 35, 80 49 C 80 53, 83 55, 79 57 C 77 64, 69 71, 57 71 C 45 71, 37 64, 35 57 C 31 55, 34 53, 34 50 Z',
    origin: [57, 68],
    turn: -8,
    // The bow sits on her right ear.
    extras: [
      { d: 'M74 25 L 66 20 C 65 24, 65 27, 66 30 Z', paint: 'rose' },
      { d: 'M74 25 L 82 20 C 83 24, 83 27, 82 30 Z', paint: 'rose' },
      { d: 'M71.6 25 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z', paint: 'deepRose' },
    ],
  },
  ears: {
    l: {
      d: 'M37 37 C 35 28, 35 20, 37 12 C 43 16, 48 22, 52 28 Z',
      inner: 'M40 32 C 39 27, 39 22, 40 18 C 43 21, 46 25, 48 28 Z',
      origin: [44, 32],
    },
    r: {
      d: 'M63 27 C 68 21, 73 16, 80 12 C 82 20, 82 29, 79 37 Z',
      inner: 'M66 28 C 70 24, 73 21, 77 18 C 78 23, 78 28, 76 32 Z',
      origin: [71, 31],
    },
  },
  eyes: [
    { x: 48, y: 47, r: 9.6 },
    { x: 67.5, y: 46, r: 7.8 },
  ],
  lashes: 'M40.5 41 l-4 -3 M43 38.6 l-2.6 -4 M46.4 37.6 l-1 -4.4 M73.4 41.2 l3.6 -3 M71.4 38.9 l2.2 -3.8 M68.6 38.3 l0.8 -4',
  droop: 0,
  pupil: 0.42,
  nose: [57, 58],
  mouth: 'M52 61 q2.5 2.5 5 0 q2.5 2.5 5 0',
  whiskers: 'M43 58 L 37 57 M43 61 L 38 62 M71 57 L 77 56 M71 60 L 76 61',
  heart: [57, 6],
}
```

Replace the whole of `src/components/art/cats/mimo.ts` with:

```ts
import type { CatDrawing } from './types'

// Choni (Cariño): the cuddly Misha, low and round, curled up with a little heart, in Misha's
// white-and-silver coat, with sleepy lids.
export const mimo: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M66 77 C 76 76, 88 79, 95 85 C 93 94, 83 97, 75 93 C 69 90, 64 84, 66 77 Z', paint: 'patch' },
      { d: 'M86 100 C 92 98, 100 100, 104 104 C 102 110, 94 113, 88 110 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M22 60 L 68 60 L 68 79 C 64 76, 59 75, 55 76 C 52 72, 48 70, 45 70 C 42 70, 39 72, 37 76 C 32 75, 26 76, 22 79 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 64, rx: 40 },
  tail: {
    d: 'M98 103 C 102 112, 88 115, 72 114 C 62 113, 54 113, 47 112',
    tip: 'M47 112 C 36 113, 30 105, 36 101 C 41 99, 44 105, 40 107',
    width: 4.6,
    root: [98, 103],
    joint: [47, 112],
    front: true,
  },
  body: {
    d: 'M30 96 C 28 84, 44 77, 64 77 C 86 77, 102 85, 102 97 C 102 106, 95 112, 83 112 L 44 112 C 34 112, 30 106, 30 96 Z',
    origin: [66, 112],
    stitches: 'M60 80 C 58 86, 58 92, 60 98 M58 83 l5 1 M57 88 l5 0 M58 93 l5 -1',
  },
  legs: [
    { d: 'M36 101 L 35 109', width: 3.2, paw: [34, 109] },
    { d: 'M52 102 L 53 110', width: 3.2, paw: [54, 110] },
  ],
  collar: { d: 'M31 95 Q 44 102, 58 95', charm: 'heart', at: [45, 101] },
  head: {
    d: 'M25 85 C 24 72, 33 64, 45 64 C 57 64, 65 72, 64 84 C 64 94, 56 100, 44 100 C 32 100, 25 94, 25 85 Z',
    origin: [46, 97],
    turn: -7,
  },
  ears: {
    l: {
      d: 'M27 76 C 25 69, 26 63, 28 57 C 33 59, 37 63, 40 67 Z',
      inner: 'M29 71 C 28 67, 28 64, 29 61 C 32 63, 34 65, 36 67 Z',
      origin: [32, 70],
    },
    r: {
      d: 'M50 66 C 54 62, 58 59, 63 57 C 64 62, 64 68, 62 74 Z',
      inner: 'M53 67 C 56 64, 58 63, 61 61 C 61 64, 61 67, 60 70 Z',
      origin: [57, 68],
    },
  },
  eyes: [
    { x: 37, y: 83, r: 6.8 },
    { x: 52, y: 82, r: 5.8 },
  ],
  droop: 0.36,
  pupil: 0.4,
  nose: [45, 90],
  mouth: 'M41 93 q2 2 4 0 q2 2 4 0',
  whiskers: 'M33 90 L 28 89.5 M33 93 L 29 94 M56 89 L 61 88.5 M56 92 L 60 93',
  heart: [45, 46],
}
```

Replace the whole of `src/components/art/cats/bram.ts` with:

```ts
import type { CatDrawing } from './types'

// Kiri kiri (Juego): the playful Kira. Kira's brown-gray tabby coat with tiger stripes, a white
// muzzle and chest, white paws, and amber-green eyes (tuning.cats.eyes). Stocky, a notched ear, cool
// heavy lids, and a guitar pick on the collar.
export const bram: CatDrawing = {
  coat: {
    kind: 'kira',
    body: [
      { d: 'M50 66 C 55 70, 65 70, 70 66 C 72 76, 67 86, 60 90 C 53 86, 48 76, 50 66 Z', paint: 'white' },
      {
        d: 'M30 80 C 34 81, 35 84, 34 87 M28 92 C 32 93, 33 96, 32 99 M91 80 C 87 81, 86 84, 87 87 M93 92 C 89 93, 88 96, 89 99 M80 70 C 79 74, 79 77, 80 80 M40 70 C 41 74, 41 77, 40 80',
        paint: 'stripe',
      },
    ],
    head: [
      { d: 'M54 29 C 55 32, 55 35, 54 38 M60 27 L 60 36 M66 29 C 65 32, 65 35, 66 38', paint: 'stripe' },
      { d: 'M35 48 L 41 49 M36 52 L 41 52 M85 48 L 79 49 M84 52 L 79 52', paint: 'stripe' },
      { d: 'M52 55 C 54 51, 66 51, 68 55 C 69 61, 65 66, 60 66 C 55 66, 51 61, 52 55 Z', paint: 'white' },
    ],
    paws: 'white',
  },
  ground: { cx: 60, rx: 36 },
  tail: {
    d: 'M92 101 C 104 99, 109 90, 106 79',
    tip: 'M106 79 C 105 72, 98 70, 98 76 C 98 80, 103 80, 103 77',
    width: 5,
    root: [92, 101],
    joint: [106, 79],
  },
  body: {
    d: 'M44 65 C 30 71, 24 87, 26 101 C 27 109, 34 112, 44 112 L 78 112 C 88 112, 95 109, 95 100 C 96 86, 90 71, 76 65 Z',
    origin: [60, 112],
    stitches: 'M31 88 C 33 94, 33 99, 32 104 M29 91 l6 0 M29 96 l6 0 M29 101 l6 0',
  },
  legs: [
    { d: 'M48 91 C 47 99, 46 105, 46 110', width: 4, paw: [45, 110] },
    { d: 'M70 91 C 71 99, 72 105, 73 110', width: 4, paw: [74, 110] },
  ],
  collar: { d: 'M42 66 Q 60 75, 78 66', charm: 'pick', at: [60, 76] },
  head: {
    d: 'M33 47 C 33 33, 45 25, 60 25 C 75 25, 87 33, 87 47 C 87 50, 90 53, 87 55 C 84 63, 73 68, 60 68 C 47 68, 36 63, 33 55 C 30 53, 33 50, 33 47 Z',
    origin: [60, 65],
    turn: -6,
    tufts: 'M34 54 l-4 2 l4 1 M86 54 l4 2 l-4 1',
  },
  ears: {
    l: {
      d: 'M36 36 C 35 28, 36 21, 38 14 L 41 18 L 44 16 C 47 20, 50 24, 52 28 Z',
      inner: 'M39 31 C 39 27, 39 23, 40 20 L 42 22 C 44 24, 46 26, 48 28 Z',
      origin: [44, 31],
    },
    r: {
      d: 'M68 28 C 72 23, 77 18, 83 14 C 85 21, 85 29, 84 36 Z',
      inner: 'M71 28 C 74 25, 77 22, 80 20 C 81 24, 81 28, 80 32 Z',
      origin: [76, 31],
    },
  },
  eyes: [
    { x: 49.5, y: 47, r: 7.8 },
    { x: 70, y: 46, r: 8.8 },
  ],
  droop: 0.34,
  lidCurve: 0,
  pupil: 0.36,
  nose: [60, 56],
  mouth: 'M55 59 q2.5 2.5 5 0 q2.5 2.5 5 0',
  whiskers: 'M42 56 L 36 55.5 M42 59 L 37 60 M78 56 L 84 55.5 M78 59 L 83 60',
  heart: [60, 7],
}
```

Replace the whole of `src/components/art/cats/nana.ts` with:

```ts
import type { CatDrawing } from './types'

// Delilah (Curiosidad): a curious black cat, as the real Delilah was. Upright on her seat, her head
// leaning in and her nose forward, wide-eyed, whiskers pointing ahead. Sniffs everything, then
// grooms.
export const nana: CatDrawing = {
  coat: { kind: 'black' },
  ground: { cx: 60, rx: 24 },
  tail: {
    d: 'M77 107 C 81 114, 68 115, 58 114 C 50 113, 44 112, 40 110',
    tip: 'M40 110 C 31 107, 32 98, 38 99 C 43 100, 42 106, 38 105',
    width: 4,
    root: [77, 107],
    joint: [40, 110],
    front: true,
  },
  body: {
    d: 'M52 63 C 45 69, 42 81, 43 95 C 43 106, 46 112, 54 112 L 67 112 C 75 112, 78 106, 78 95 C 78 81, 75 69, 68 63 Z',
    origin: [60, 112],
    stitches: 'M72 76 C 75 82, 76 88, 75 94 M70 79 l6 1 M71 84 l6 0 M71 89 l6 -1',
  },
  legs: [
    { d: 'M55 87 L 55 110', width: 2.8, paw: [54, 110], groom: true },
    { d: 'M65 87 L 65 110', width: 2.8, paw: [66, 110] },
  ],
  collar: { d: 'M48 63 Q 60 69, 72 63', charm: 'gem', at: [60, 69] },
  head: {
    d: 'M39 47 C 39 35, 47 28, 57 28 C 67 28, 75 35, 75 47 C 75 57, 67 64, 57 64 C 50 64, 44 61, 41 56 C 37 55, 37 50, 39 47 Z',
    origin: [58, 61],
    turn: -9,
    tufts: 'M36 50 l-4 -1 M36 54 l-4 1',
  },
  ears: {
    l: {
      d: 'M41 39 C 39 31, 40 24, 42 17 C 47 20, 51 25, 53 29 Z',
      inner: 'M43 35 C 42 30, 43 26, 44 21 C 47 24, 49 26, 50 29 Z',
      origin: [46, 33],
    },
    r: {
      d: 'M62 29 C 66 24, 70 20, 75 17 C 77 24, 77 31, 74 38 Z',
      inner: 'M64 29 C 67 26, 70 23, 73 21 C 74 26, 74 30, 72 34 Z',
      origin: [69, 32],
    },
  },
  eyes: [
    { x: 50, y: 45, r: 7.2 },
    { x: 65, y: 44.5, r: 7.8 },
  ],
  droop: 0,
  pupil: 0.5,
  nose: [41.5, 52],
  mouth: 'M42 56 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M46 53 L 40 51.5 M46 56 L 41 57 M68 53 L 74 52 M68 56 L 73 57',
  heart: [58, 8],
}
```

In `src/components/art/cats/susto.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
import type { CatDrawing } from './types'

// Susto (Temor): small, ears flat back, huge eyes, a scruffy cowlick. Hides, then peeks.
export const susto: CatDrawing = {
  ground: { cx: 60, rx: 19 },
  tail: {
    d: 'M74 108 C 83 110, 88 105, 87 99',
```

Replace with:

```ts
import type { CatDrawing } from './types'

// Chavela (Temor): Susto's shy, peeking look in a black coat. Small, ears flat back, huge eyes, a
// scruffy cowlick. Hides, then peeks.
export const susto: CatDrawing = {
  coat: { kind: 'black' },
  ground: { cx: 60, rx: 19 },
  tail: {
    d: 'M74 108 C 83 110, 88 105, 87 99',
```

- [ ] **Step 7: Draw the three new cats and register all ten.**

Create `src/components/art/cats/chona.ts`:

```ts
import type { CatDrawing } from './types'

// Chona (Energía): the energetic Misha, mid-leap in Misha's white-and-silver coat. Stretched out,
// front paws reaching ahead, back paws kicking off, her tail streaming behind.
export const chona: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M40 56 C 50 54, 60 56, 64 60 C 62 68, 52 70, 44 68 C 38 66, 36 60, 40 56 Z', paint: 'patch' },
      { d: 'M22 70 C 24 62, 32 60, 36 64 C 36 72, 30 78, 24 78 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M70 30 L 108 30 L 108 46 C 104 43, 100 42, 97 44 C 95 40, 92 38, 90 38 C 88 38, 86 40, 85 44 C 81 42, 76 43, 70 46 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 58, rx: 30 },
  tail: {
    d: 'M27 66 C 18 60, 14 50, 17 40',
    tip: 'M17 40 C 19 31, 29 30, 29 37 C 29 42, 22 42, 23 37',
    width: 4,
    root: [27, 66],
    joint: [17, 40],
  },
  body: {
    d: 'M26 68 C 30 58, 46 56, 60 58 C 70 59, 80 58, 86 62 C 92 68, 88 80, 78 82 C 66 84, 52 82, 40 84 C 30 86, 22 78, 26 68 Z',
    origin: [56, 84],
    stitches: 'M50 72 C 56 74, 62 74, 68 72 M53 70 l-1 5 M59 71 l0 5 M65 70 l1 5',
  },
  legs: [
    { d: 'M80 78 C 88 84, 96 88, 104 90', width: 3, paw: [105, 90] },
    { d: 'M72 81 C 78 88, 84 94, 90 98', width: 3, paw: [91, 98] },
    { d: 'M34 80 C 26 86, 18 90, 10 92', width: 3.2, paw: [9, 92] },
    { d: 'M42 83 C 36 90, 30 95, 22 99', width: 3.2, paw: [21, 99] },
  ],
  collar: { d: 'M76 60 Q 82 67, 88 63', charm: 'bolt', at: [82, 68] },
  head: {
    d: 'M73 50 C 73 40, 80 34, 89 34 C 98 34, 104 40, 104 50 C 104 58, 98 64, 89 64 C 80 64, 73 58, 73 50 Z',
    origin: [86, 62],
    turn: -6,
  },
  ears: {
    l: {
      d: 'M76 42 C 75 36, 76 30, 78 25 C 82 28, 85 32, 86 35 Z',
      inner: 'M78 38 C 78 34, 78 31, 79 28 C 81 30, 83 32, 84 35 Z',
      origin: [81, 38],
    },
    r: {
      d: 'M92 35 C 95 31, 99 28, 103 26 C 104 31, 104 37, 102 42 Z',
      inner: 'M94 35 C 96 33, 99 31, 101 30 C 102 33, 102 36, 101 39 Z',
      origin: [98, 37],
    },
  },
  eyes: [
    { x: 83, y: 49, r: 6.2 },
    { x: 96, y: 48.5, r: 5.4 },
  ],
  droop: 0,
  pupil: 0.4,
  nose: [89.5, 56],
  mouth: 'M86 59 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M80 56 L 75 55 M80 59 L 76 60 M99 55 L 104 54 M99 58 L 103 59',
  heart: [88, 22],
}
```

Create `src/components/art/cats/chori.ts`:

```ts
import type { CatDrawing } from './types'

// Chori (Apapacho): the round, chubby Misha, sprawled belly-up in Misha's white-and-silver coat, her
// paws in the air and her head resting on the floor. Calm, round, and always hungry.
export const chori: CatDrawing = {
  coat: {
    kind: 'misha',
    body: [
      { d: 'M86 76 C 94 82, 100 92, 98 102 C 92 104, 86 98, 84 90 C 82 84, 82 78, 86 76 Z', paint: 'patch' },
      { d: 'M34 88 C 36 80, 42 76, 48 76 C 50 84, 46 92, 38 94 Z', paint: 'patch' },
    ],
    head: [
      {
        d: 'M6 66 L 50 66 L 50 84 C 46 81, 42 80, 39 81 C 36 77, 32 76, 28 76 C 25 76, 22 78, 20 81 C 16 80, 10 81, 6 84 Z',
        paint: 'patch',
      },
    ],
    ears: 'mark',
    tail: 'mark',
  },
  ground: { cx: 58, rx: 46 },
  tail: {
    d: 'M96 100 C 106 100, 112 92, 110 82',
    tip: 'M110 82 C 109 73, 100 72, 101 79 C 102 83, 107 83, 106 79',
    width: 4.4,
    root: [96, 100],
    joint: [110, 82],
  },
  body: {
    d: 'M30 96 C 30 80, 46 70, 64 70 C 84 70, 98 82, 98 96 C 98 106, 90 112, 78 112 L 46 112 C 36 112, 30 106, 30 96 Z',
    origin: [64, 112],
    stitches: 'M56 96 C 62 99, 68 99, 74 96 M59 94 l-1 5 M65 95 l0 5 M71 94 l1 5',
  },
  legs: [
    { d: 'M50 76 C 47 72, 44 69, 43 64', width: 3.4, paw: [43, 63] },
    { d: 'M60 72 C 58 68, 58 64, 60 60', width: 3.4, paw: [60, 59] },
    { d: 'M76 72 C 78 68, 79 65, 82 62', width: 3.4, paw: [82, 61] },
    { d: 'M87 78 C 90 74, 93 72, 97 71', width: 3.4, paw: [98, 70] },
  ],
  collar: { d: 'M44 82 Q 50 91, 45 101', charm: 'fish', at: [52, 93] },
  head: {
    d: 'M10 92 C 10 80, 18 73, 28 73 C 38 73, 45 80, 45 91 C 45 101, 38 107, 28 107 C 18 107, 10 101, 10 92 Z',
    origin: [28, 105],
    turn: 8,
  },
  ears: {
    l: {
      d: 'M12 84 C 10 78, 11 72, 13 67 C 17 70, 20 74, 22 77 Z',
      inner: 'M14 80 C 13 77, 13 74, 14 71 C 16 73, 18 75, 20 77 Z',
      origin: [17, 79],
    },
    r: {
      d: 'M33 76 C 36 72, 40 69, 44 67 C 45 72, 45 78, 43 83 Z',
      inner: 'M35 76 C 37 74, 40 72, 42 71 C 43 74, 43 77, 42 80 Z',
      origin: [39, 78],
    },
  },
  eyes: [
    { x: 21, y: 90, r: 5.6 },
    { x: 35, y: 89.5, r: 5 },
  ],
  droop: 0.3,
  pupil: 0.4,
  nose: [28, 97],
  mouth: 'M24.5 100 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M17 97 L 12 96.5 M17 100 L 13 101 M39 97 L 44 96.5 M39 100 L 43 101',
  heart: [64, 40],
}
```

Create `src/components/art/cats/minina.ts`:

```ts
import type { CatDrawing } from './types'

// Minina (Travesura): a small, playful, pure-white cat with a pink nose and no patches, so she reads
// apart from the Misha family. Big playful pupils, one paw up to bat at whatever moves.
export const minina: CatDrawing = {
  coat: { kind: 'white' },
  ground: { cx: 60, rx: 18 },
  tail: {
    d: 'M74 108 C 84 108, 90 101, 88 92',
    tip: 'M88 92 C 87 84, 79 84, 80 90 C 81 94, 86 94, 85 90',
    width: 3.2,
    root: [74, 108],
    joint: [88, 92],
  },
  body: {
    d: 'M52 90 C 47 94, 45 102, 46 107 C 47 111, 51 112, 55 112 L 66 112 C 71 112, 75 110, 75 105 C 75 99, 72 93, 68 90 Z',
    origin: [60, 112],
    stitches: 'M69 97 l4 3 M73 97 l-4 3',
  },
  legs: [
    { d: 'M54 99 C 52 104, 53 107, 53 110', width: 2.4, paw: [52, 110], groom: true },
    { d: 'M66 99 C 67 104, 67 107, 67 110', width: 2.4, paw: [68, 110] },
  ],
  collar: { d: 'M51 91 Q 60 96, 69 91', charm: 'yarn', at: [60, 96] },
  head: {
    d: 'M44 78 C 44 69, 51 63, 60 63 C 69 63, 76 69, 76 78 C 76 86, 69 92, 60 92 C 51 92, 44 86, 44 78 Z',
    origin: [60, 90],
    turn: -8,
  },
  ears: {
    l: {
      d: 'M46 72 C 45 66, 46 60, 48 55 C 52 58, 55 62, 56 65 Z',
      inner: 'M48 68 C 48 65, 48 62, 49 59 C 51 61, 53 63, 54 65 Z',
      origin: [51, 67],
    },
    r: {
      d: 'M64 65 C 67 61, 71 58, 74 56 C 75 61, 75 67, 73 72 Z',
      inner: 'M66 65 C 68 63, 70 61, 72 60 C 73 63, 73 66, 72 69 Z',
      origin: [70, 67],
    },
  },
  eyes: [
    { x: 53.5, y: 77, r: 6.4 },
    { x: 67, y: 76.5, r: 5.6 },
  ],
  droop: 0,
  pupil: 0.45,
  nose: [60.5, 84],
  mouth: 'M57 87 q1.8 1.8 3.5 0 q1.8 1.8 3.5 0',
  whiskers: 'M50 84 L 45 83.5 M50 87 L 46 88 M71 84 L 76 83.5 M71 87 L 75 88',
  heart: [60, 47],
}
```

Replace the whole of `src/components/art/cats/index.ts` with:

```ts
import type { CatId } from '../../../content'
import { bram } from './bram'
import { chona } from './chona'
import { chori } from './chori'
import { kira } from './kira'
import { luz } from './luz'
import { mimo } from './mimo'
import { minina } from './minina'
import { misha } from './misha'
import { nana } from './nana'
import { susto } from './susto'
import type { CatDrawing } from './types'

export type { CatDrawing, CharmKind, Coat, CoatMark, Extra, EyeSpec, Xy } from './types'

export const catDrawings: Record<CatId, CatDrawing> = { luz, mimo, susto, bram, nana, chona, chori, minina, misha, kira }
```

- [ ] **Step 8: Paint the coats in `CatSprite`.** The body and the head each become a shade, the coat moved up and left of it, and the clipped marks, then the ink outline; ears and tails can wear the mark color, paws can be white; Mishona's lashes are drawn over her eyes; three new charms.

In `src/components/art/CatSprite.tsx`, make these 11 replacements (each block to find appears exactly once):

1. Find:

```tsx
import type { CatId } from '../../content'
import type { Stage } from '../../logic/era'
import { cssColor, feelingColors, tuning } from '../../tuning'
import { catDrawings, type CatDrawing, type CharmKind, type Extra, type EyeSpec, type Xy } from './cats'

export type CatPose = 'playing' | 'noticing' | 'staying'
```

Replace with:

```tsx
import type { CatId } from '../../content'
import type { Stage } from '../../logic/era'
import { cssColor, feelingColors, tuning } from '../../tuning'
import { catDrawings, type CatDrawing, type CharmKind, type CoatMark, type Extra, type EyeSpec, type Xy } from './cats'

export type CatPose = 'playing' | 'noticing' | 'staying'
```

2. Find:

```tsx
// How far above the paw a front leg meets the body, in drawing units.
const shoulder = 22

// A tube: an edge stroke with the fill stroke inside it, so thin legs and tails get outlines.
function Tube({ d, width, edge }: { d: string; width: number; edge: 'line' | 'edge' }) {
  return (
    <>
      <path d={d} className={`cat-tube-${edge}`} strokeWidth={width + tuning.cats.line * 1.6} />
      <path d={d} className="cat-tube-fill" strokeWidth={width} />
    </>
  )
}

// The lighter second pass of the scratchy double outline, offset beside the ink stroke.
function Echo({ d }: { d: string }) {
  const { echo } = tuning.cats
```

Replace with:

```tsx
// How far above the paw a front leg meets the body, in drawing units.
const shoulder = 22

// A tube: an edge stroke with the fill stroke inside it, so thin legs and tails get outlines. A
// marked tube wears the coat's mark color (Misha's gray tail).
function Tube({ d, width, edge, mark = false }: { d: string; width: number; edge: 'line' | 'edge'; mark?: boolean }) {
  return (
    <>
      <path d={d} className={`cat-tube-${edge}`} strokeWidth={width + tuning.cats.line * 1.6} />
      <path d={d} className={mark ? 'cat-tube-fill cat-tube-mark' : 'cat-tube-fill'} strokeWidth={width} />
    </>
  )
}

// Spec §3 Coats: one part of the coat (the body or the head). The shade fills the shape; the coat,
// moved up and to the left, covers all of it but a soft band along the bottom and the right; the
// marks (patches, stripes, white) lie on top, all clipped to the shape. The ink outline is drawn
// over it by the caller.
function CoatPart({ d, marks, clipId }: { d: string; marks: readonly CoatMark[] | undefined; clipId: string }) {
  const { shade, stripe } = tuning.cats
  return (
    <>
      <clipPath id={clipId}>
        <path d={d} />
      </clipPath>
      <path d={d} className="cat-coat-shade" />
      <g clipPath={`url(#${clipId})`}>
        <path d={d} className="cat-coat" transform={`translate(${-shade.dx} ${-shade.dy})`} />
        {marks?.map((mark) => (
          <path
            key={mark.d}
            d={mark.d}
            className={`cat-mark cat-mark-${mark.paint}`}
            strokeWidth={mark.paint === 'stripe' ? stripe : tuning.cats.detail}
          />
        ))}
      </g>
    </>
  )
}

// The ink outline of a coat part, drawn over its coat.
function Outline({ d }: { d: string }) {
  return <path d={d} className="cat-outline" strokeWidth={tuning.cats.line} />
}

// The lighter second pass of the scratchy double outline, offset beside the ink stroke.
function Echo({ d }: { d: string }) {
  const { echo } = tuning.cats
```

3. Find:

```tsx
        strokeWidth={w}
      />
    ),
    bell: (
      <path
        d={`M${x - 4} ${y + 3} C ${x - 4} ${y - 1}, ${x - 3} ${y - 4}, ${x} ${y - 4} C ${x + 3} ${y - 4}, ${x + 4} ${y - 1}, ${x + 4} ${y + 3} Z M${x - 1} ${y + 3} a1 1 0 0 0 2 0`}
```

Replace with:

```tsx
        strokeWidth={w}
      />
    ),
    bolt: (
      <path
        d={`M${x + 1.5} ${y - 6} L ${x - 3.5} ${y + 1} L ${x - 0.2} ${y + 1} L ${x - 1.5} ${y + 6} L ${x + 3.5} ${y - 1} L ${x + 0.2} ${y - 1} Z`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    fish: (
      <path
        d={`M${x - 4.5} ${y} C ${x - 2.5} ${y - 3.5}, ${x + 1.5} ${y - 3.5}, ${x + 2.5} ${y} C ${x + 1.5} ${y + 3.5}, ${x - 2.5} ${y + 3.5}, ${x - 4.5} ${y} Z M${x + 2.5} ${y} L ${x + 5.5} ${y - 3} L ${x + 5.5} ${y + 3} Z`}
        className="cat-charm-shape"
        strokeWidth={w}
      />
    ),
    yarn: (
      <>
        <circle cx={x} cy={y} r={4} className="cat-charm-shape" strokeWidth={w} />
        <path d={`M${x - 3.4} ${y - 1.6} Q ${x} ${y + 1} ${x + 3.4} ${y - 1.6} M${x - 3.2} ${y + 1.8} Q ${x} ${y + 4.2} ${x + 3.2} ${y + 1.8}`} className="cat-charm-ray" strokeWidth={w} />
      </>
    ),
    bell: (
      <path
        d={`M${x - 4} ${y + 3} C ${x - 4} ${y - 1}, ${x - 3} ${y - 4}, ${x} ${y - 4} C ${x + 3} ${y - 4}, ${x + 4} ${y - 1}, ${x + 4} ${y + 3} Z M${x - 1} ${y + 3} a1 1 0 0 0 2 0`}
```

4. Find:

```tsx
  )
}

function Tail({ tail, edge }: { tail: CatDrawing['tail']; edge: 'line' | 'edge' }) {
  return (
    <g className="cat-tail" style={{ transformOrigin: origin(tail.root) }}>
      <g className="cat-tail-tip" style={{ transformOrigin: origin(tail.joint) }}>
        <Tube d={tail.tip} width={tail.width * 0.85} edge={edge} />
        {tail.tipExtra && <Paint extra={tail.tipExtra} />}
        <Echo d={tail.tip} />
      </g>
      <Tube d={tail.d} width={tail.width} edge={edge} />
      <Echo d={tail.d} />
    </g>
  )
```

Replace with:

```tsx
  )
}

function Tail({ tail, edge, mark }: { tail: CatDrawing['tail']; edge: 'line' | 'edge'; mark: boolean }) {
  return (
    <g className="cat-tail" style={{ transformOrigin: origin(tail.root) }}>
      <g className="cat-tail-tip" style={{ transformOrigin: origin(tail.joint) }}>
        <Tube d={tail.tip} width={tail.width * 0.85} edge={edge} mark={mark} />
        {tail.tipExtra && <Paint extra={tail.tipExtra} />}
        <Echo d={tail.tip} />
      </g>
      <Tube d={tail.d} width={tail.width} edge={edge} mark={mark} />
      <Echo d={tail.d} />
    </g>
  )
```

5. Find:

```tsx
function Drawing({ d, pose, uid }: { d: CatDrawing; pose: CatPose; uid: string }) {
  const line = tuning.cats.line
  const tailEdge = d.tail.front ? 'edge' : 'line'
  return (
    <>
      {!d.tail.front && <Tail tail={d.tail} edge={tailEdge} />}
      <g className="cat-body" style={{ transformOrigin: origin(d.body.origin) }}>
        <path d={d.body.d} className="cat-shape" strokeWidth={line} />
        <Echo d={d.body.d} />
        <Detail d={d.body.stitches} />
        {d.legs.map((leg) => {
          const limb = (
            <>
              <Tube d={leg.d} width={leg.width} edge="edge" />
              <ellipse cx={leg.paw[0]} cy={leg.paw[1]} rx={leg.width + 0.8} ry={leg.width * 0.62} className="cat-paw-pad" strokeWidth={tuning.cats.detail} />
            </>
          )
          // The grooming paw swings up from the shoulder, a leg's length above the paw.
```

Replace with:

```tsx
function Drawing({ d, pose, uid }: { d: CatDrawing; pose: CatPose; uid: string }) {
  const line = tuning.cats.line
  const tailEdge = d.tail.front ? 'edge' : 'line'
  const { coat } = d
  const tailMark = coat.tail === 'mark'
  const pawClass = coat.paws === 'white' ? 'cat-paw-pad cat-paw-white' : 'cat-paw-pad'
  return (
    <>
      {!d.tail.front && <Tail tail={d.tail} edge={tailEdge} mark={tailMark} />}
      <g className="cat-body" style={{ transformOrigin: origin(d.body.origin) }}>
        <CoatPart d={d.body.d} marks={coat.body} clipId={`${uid}-body`} />
        <Outline d={d.body.d} />
        <Echo d={d.body.d} />
        <Detail d={d.body.stitches} />
        {d.legs.map((leg) => {
          const limb = (
            <>
              <Tube d={leg.d} width={leg.width} edge="edge" />
              <ellipse cx={leg.paw[0]} cy={leg.paw[1]} rx={leg.width + 0.8} ry={leg.width * 0.62} className={pawClass} strokeWidth={tuning.cats.detail} />
            </>
          )
          // The grooming paw swings up from the shoulder, a leg's length above the paw.
```

6. Find:

```tsx
        <path d={d.collar.d} className="cat-collar" strokeWidth={line} />
        <Charm kind={d.collar.charm} at={d.collar.at} />
      </g>
      {d.tail.front && <Tail tail={d.tail} edge={tailEdge} />}
      <g className="cat-head" style={{ transformOrigin: origin(d.head.origin) }}>
        {(['l', 'r'] as const).map((side) => {
          const ear = d.ears[side]
          return (
            <g key={side} className={`cat-ear-${side}`} style={{ transformOrigin: origin(ear.origin) }}>
              <path d={ear.d} className="cat-shape" strokeWidth={line} strokeLinejoin="round" />
              {ear.inner && <path d={ear.inner} className="cat-ear-inner" />}
              <Echo d={ear.d} />
              {ear.knobs?.map(([x, y]) => (
```

Replace with:

```tsx
        <path d={d.collar.d} className="cat-collar" strokeWidth={line} />
        <Charm kind={d.collar.charm} at={d.collar.at} />
      </g>
      {d.tail.front && <Tail tail={d.tail} edge={tailEdge} mark={tailMark} />}
      <g className="cat-head" style={{ transformOrigin: origin(d.head.origin) }}>
        {(['l', 'r'] as const).map((side) => {
          const ear = d.ears[side]
          return (
            <g key={side} className={`cat-ear-${side}`} style={{ transformOrigin: origin(ear.origin) }}>
              <path
                d={ear.d}
                className={coat.ears === 'mark' ? 'cat-shape cat-ear-mark' : 'cat-shape'}
                strokeWidth={line}
                strokeLinejoin="round"
              />
              {ear.inner && <path d={ear.inner} className="cat-ear-inner" />}
              <Echo d={ear.d} />
              {ear.knobs?.map(([x, y]) => (
```

7. Find:

```tsx
            </g>
          )
        })}
        <path d={d.head.d} className="cat-shape" strokeWidth={line} />
        <Echo d={d.head.d} />
        {d.head.tufts && <Detail d={d.head.tufts} />}
        {d.eyes.map((eye, i) => (
```

Replace with:

```tsx
            </g>
          )
        })}
        <CoatPart d={d.head.d} marks={coat.head} clipId={`${uid}-head`} />
        <Outline d={d.head.d} />
        <Echo d={d.head.d} />
        {d.head.tufts && <Detail d={d.head.tufts} />}
        {d.eyes.map((eye, i) => (
```

8. Find:

```tsx
            clipId={`${uid}-eye-${i}`}
          />
        ))}
        <path
          d={`M${d.nose[0] - 2.6} ${d.nose[1] - 1.4} h5.2 l-2.6 3.2 z`}
          className="cat-nose"
```

Replace with:

```tsx
            clipId={`${uid}-eye-${i}`}
          />
        ))}
        {d.lashes && <path d={d.lashes} className="cat-lash" strokeWidth={tuning.cats.detail} />}
        <path
          d={`M${d.nose[0] - 2.6} ${d.nose[1] - 1.4} h5.2 l-2.6 3.2 z`}
          className="cat-nose"
```

9. Find:

```tsx
  )
}

// The seven cats (design §4), one family of paper cut-outs. The rig's parts are named groups
// (.cat-body, .cat-head, .cat-ear-l, .cat-ear-r, .cat-lid, .cat-tail) that CSS moves on springs:
// breathing, blinking, ear twitches, and a tail sway whose tip follows through.
// Memoized: the gate game's catcher and its reactions re-render every animation frame, but a
```

Replace with:

```tsx
  )
}

// The ten cats (design §4, spec §3), one family of paper cut-outs, each in its family's coat. The
// rig's parts are named groups
// (.cat-body, .cat-head, .cat-ear-l, .cat-ear-r, .cat-lid, .cat-tail) that CSS moves on springs:
// breathing, blinking, ear twitches, and a tail sway whose tip follows through.
// Memoized: the gate game's catcher and its reactions re-render every animation frame, but a
```

10. Find:

```tsx
  const uid = useId()
  const c = tuning.cats
  const feel = feelingColors[id]
  const pencil = cssColor(c.pencil)
  const style = {
    '--feel': feel,
    '--feel-muted': cssColor([feel, pencil, 1 - c.tintaFeel]),
    '--pencil': pencil,
    '--mimo-body': cssColor(c.mimoBody),
    '--glow': `${(c.glowPx * size) / tuning.catSize.room}px`,
    // The size asked for, so a screen that grows its HUD can grow the cat with it (design §9).
    '--cat-size': size,
```

Replace with:

```tsx
  const uid = useId()
  const c = tuning.cats
  const feel = feelingColors[id]
  const eyes: Partial<Record<CatId, string>> = c.eyes
  const eye = eyes[id] ?? feel
  const pencil = cssColor(c.pencil)
  const coat = c.coats[d.coat.kind]
  const style = {
    '--feel': feel,
    '--feel-muted': cssColor([feel, pencil, 1 - c.tintaFeel]),
    '--eye': eye,
    '--eye-muted': cssColor([eye, pencil, 1 - c.tintaFeel]),
    '--pencil': pencil,
    '--coat': cssColor(coat.coat),
    '--coat-shade': cssColor(coat.shade),
    '--coat-mark': cssColor(coat.mark),
    '--coat-white': cssColor(coat.white),
    '--glow': `${(c.glowPx * size) / tuning.catSize.room}px`,
    // The size asked for, so a screen that grows its HUD can grow the cat with it (design §9).
    '--cat-size': size,
```

11. Find:

```tsx
    '--tail': `${c.tailMs}ms`,
    '--tail-follow': `${c.tailFollowMs}ms`,
  } as CSSProperties
  const classes = ['cat-sprite', `cat-sprite-${id}`, `stage-${stage}`, `pose-${pose}`, silhouette ? 'is-silhouette' : '']
  return (
    <svg
      className={classes.filter(Boolean).join(' ')}
```

Replace with:

```tsx
    '--tail': `${c.tailMs}ms`,
    '--tail-follow': `${c.tailFollowMs}ms`,
  } as CSSProperties
  const classes = [
    'cat-sprite',
    `cat-sprite-${id}`,
    `coat-${d.coat.kind}`,
    `stage-${stage}`,
    `pose-${pose}`,
    silhouette ? 'is-silhouette' : '',
  ]
  return (
    <svg
      className={classes.filter(Boolean).join(' ')}
```

- [ ] **Step 9: Style the coats.** The light coats get ink edges and details; in pencil (boceto) the marks are only sketched.

In `src/index.css`, make these 7 replacements (each block to find appears exactly once):

1. Find:

```css
  }

  /* The cat sprite (design §4): a paper cut-out drawn in pencil, ink, or light. Colors are theme
     and palette variables; the sprite sets --feel, --feel-muted, --pencil, and --mimo-body itself. */
  .ink-defs {
    position: absolute;
    width: 0;
```

Replace with:

```css
  }

  /* The cat sprite (design §4): a paper cut-out drawn in pencil, ink, or light. Colors are theme
     and palette variables; the sprite sets --feel, --feel-muted, --eye, --eye-muted, --pencil, and
     its coat's --coat, --coat-shade, --coat-mark, and --coat-white itself (spec §3 Coats). */
  .ink-defs {
    position: absolute;
    width: 0;
```

2. Find:

```css
    overflow: visible;
    --cat-line: var(--shadow);
    --cat-edge: color-mix(in oklab, var(--bone) 80%, transparent);
    --cat-fill: var(--cat-body);
    --cat-detail: color-mix(in oklab, var(--bone) 72%, transparent);
    --cat-eye-white: var(--bone);
    --cat-pupil: var(--shadow);
```

Replace with:

```css
    overflow: visible;
    --cat-line: var(--shadow);
    --cat-edge: color-mix(in oklab, var(--bone) 80%, transparent);
    --cat-fill: var(--coat);
    --cat-shade: var(--coat-shade);
    --cat-mark: var(--coat-mark);
    --cat-white: var(--coat-white);
    --cat-iris: var(--eye);
    --cat-detail: color-mix(in oklab, var(--bone) 72%, transparent);
    --cat-eye-white: var(--bone);
    --cat-pupil: var(--shadow);
```

3. Find:

```css

  .cat-sprite.stage-tinta {
    --cat-tone: var(--feel-muted);
  }

  .cat-sprite.stage-boceto {
    --cat-line: var(--pencil);
    --cat-edge: var(--pencil);
    --cat-fill: var(--cat-paper);
    --cat-detail: var(--pencil);
    --cat-eye-white: var(--cat-paper);
    --cat-pupil: var(--pencil);
```

Replace with:

```css

  .cat-sprite.stage-tinta {
    --cat-tone: var(--feel-muted);
    --cat-iris: var(--eye-muted);
  }

  .cat-sprite.stage-boceto {
    --cat-line: var(--pencil);
    --cat-edge: var(--pencil);
    --cat-fill: var(--cat-paper);
    --cat-shade: var(--cat-paper);
    --cat-mark: var(--pencil);
    --cat-white: var(--cat-paper);
    --cat-detail: var(--pencil);
    --cat-eye-white: var(--cat-paper);
    --cat-pupil: var(--pencil);
```

4. Find:

```css
    --cat-echo: var(--pencil);
  }

  .cat-sprite-mimo:not(.stage-boceto) {
    --cat-fill: var(--mimo-body);
    --cat-edge: var(--shadow);
    --cat-detail: color-mix(in oklab, var(--shadow) 70%, transparent);
    --cat-inner: var(--rose);
    --cat-nose: var(--deep-rose);
  }

  .cat-sprite.stage-luz {
```

Replace with:

```css
    --cat-echo: var(--pencil);
  }

  /* The light coats (the Misha family, the Kira family, and Minina) keep their edge on the bone
     paper with ink: ink tube edges and paw pads, and ink whiskers and stitches. */
  .cat-sprite.coat-misha:not(.stage-boceto),
  .cat-sprite.coat-kira:not(.stage-boceto),
  .cat-sprite.coat-white:not(.stage-boceto) {
    --cat-edge: var(--shadow);
    --cat-detail: color-mix(in oklab, var(--shadow) 70%, transparent);
    --cat-inner: var(--rose);
  }

  .cat-sprite.stage-luz {
```

5. Find:

```css
    stroke-linejoin: round;
  }

  .cat-tube-line,
  .cat-tube-edge,
  .cat-tube-fill {
```

Replace with:

```css
    stroke-linejoin: round;
  }

  /* A coat part (spec §3 Coats): the shade under it, the coat, its marks, then the ink outline. */
  .cat-coat-shade {
    fill: var(--cat-shade);
  }

  .cat-coat {
    fill: var(--cat-fill);
  }

  .cat-mark-patch {
    fill: var(--cat-mark);
    stroke: none;
  }

  .cat-mark-white {
    fill: var(--cat-white);
    stroke: none;
  }

  .cat-mark-stripe {
    fill: none;
    stroke: var(--cat-mark);
    stroke-linecap: round;
  }

  /* In pencil the patches are only sketched. */
  .stage-boceto .cat-mark-patch,
  .stage-boceto .cat-mark-white {
    fill: none;
    stroke: var(--pencil);
  }

  .cat-outline {
    fill: none;
    stroke: var(--cat-line);
    stroke-linejoin: round;
  }

  .cat-ear-mark {
    fill: var(--cat-mark);
  }

  .stage-boceto .cat-ear-mark {
    fill: var(--cat-fill);
  }

  .cat-lash {
    fill: none;
    stroke: var(--cat-line);
    stroke-linecap: round;
  }

  .cat-tube-line,
  .cat-tube-edge,
  .cat-tube-fill {
```

6. Find:

```css
    stroke: var(--cat-fill);
  }

  .cat-paw-pad {
    fill: var(--cat-fill);
    stroke: var(--cat-edge);
  }

  .cat-echo,
  .cat-detail {
    fill: none;
```

Replace with:

```css
    stroke: var(--cat-fill);
  }

  .cat-tube-mark {
    stroke: var(--cat-mark);
  }

  .stage-boceto .cat-tube-mark {
    stroke: var(--cat-fill);
  }

  .cat-paw-pad {
    fill: var(--cat-fill);
    stroke: var(--cat-edge);
  }

  .cat-paw-white {
    fill: var(--cat-white);
  }

  .cat-echo,
  .cat-detail {
    fill: none;
```

7. Find:

```css
  }

  .cat-iris {
    fill: var(--cat-tone);
  }

  .stage-boceto .cat-iris {
```

Replace with:

```css
  }

  .cat-iris {
    fill: var(--cat-iris);
  }

  .stage-boceto .cat-iris {
```

- [ ] **Step 10: Run the tests to see them pass.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/components/art/CatSprite.test.tsx src/cssVariables.test.ts src/logic/contrast.test.ts
```

Expected: PASS, every file (the contrast test also checks the three new feeling colors on ink).

- [ ] **Step 11: Lint, type-check, and run the full suite.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx eslint . && npx tsc -b && npx vitest run --maxWorkers=2
```

Expected: no ESLint or tsc output; `Test Files  51 passed (51)`, `Tests  482 passed (482)`.

- [ ] **Step 12: Look at all ten cats on a contact sheet, in both themes.** Create two throwaway files (git-ignored):

Create `.superpowers/cats-sheet.html` (throwaway, git-ignored):

```html
<!doctype html>
<html lang="es" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--head-tags-->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./cats-sheet.tsx"></script>
  </body>
</html>
```

Create `.superpowers/cats-sheet.tsx` (throwaway, git-ignored):

```tsx
// A throwaway contact sheet of every cat (plan Task 1). Not committed.
import { createRoot } from 'react-dom/client'
import '../src/index.css'
import { CatSprite } from '../src/components/art/CatSprite'
import { catDrawings } from '../src/components/art/cats'
import { InkDefs } from '../src/components/art/InkDefs'
import type { CatId } from '../src/content'

const ids = Object.keys(catDrawings) as CatId[]
const theme = new URLSearchParams(location.search).get('theme') ?? 'light'
document.documentElement.setAttribute('data-theme', theme)

function Sheet() {
  return (
    <div style={{ padding: 16, display: 'grid', gap: 12, overflow: 'auto', height: '100vh', boxSizing: 'border-box' }}>
      <InkDefs still />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {ids.map((id) => (
          <div key={id} style={{ background: 'var(--bone)', borderRadius: 12, padding: 8, display: 'grid', placeItems: 'center' }}>
            <CatSprite id={id} stage="luz" pose="staying" size={176} />
            <span style={{ color: 'var(--shadow)', fontSize: 12 }}>{id}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'var(--page)', padding: 10, borderRadius: 12 }}>
        {ids.map((id) => (
          <CatSprite key={id} id={id} stage="luz" size={64} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'var(--field)', padding: 10, borderRadius: 12 }}>
        {ids.map((id) => (
          <CatSprite key={id} id={id} stage="tinta" size={64} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'var(--page)', padding: 10, borderRadius: 12 }}>
        {ids.map((id) => (
          <CatSprite key={id} id={id} stage="boceto" size={64} />
        ))}
        {ids.map((id) => (
          <CatSprite key={`s-${id}`} id={id} stage="luz" size={56} silhouette />
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Sheet />)
```

Start the dev server in the background:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npm run dev -- --port 5174 --strictPort
```

Expected: `Local:   http://localhost:5174/`. Then run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const shots = '<worktree>/.playwright-mcp'
  const context = await page.context().browser().newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 })
  const sheet = await context.newPage()
  for (const theme of ['light', 'dark']) {
    await sheet.goto(`http://localhost:5174/.superpowers/cats-sheet.html?theme=${theme}`)
    await sheet.waitForTimeout(1200)
    await sheet.screenshot({ path: `${shots}/t1-cats-${theme}.png` })
  }
  await context.close()
}
```

Read `.playwright-mcp/t1-cats-light.png` and `.playwright-mcp/t1-cats-dark.png`. Each shows the ten cats on bone cards (top), then a row in luz on the page paper, a row in tinta on the field, and a row in boceto followed by the ten silhouettes. Judge:

- **Misha** reads as the real Misha: white, a gray cap over the ears and crown with a white blaze between the eyes, gray patches on the back and flank, a gray tail, a pink nose, green eyes.
- **Kira** reads as the real Kira: a brown-gray tabby with dark stripes (an M on the forehead, bars on the cheeks and flanks), a white chin and chest, white paws, amber-green star eyes, a fuller ruff.
- **The families:** Mishona (bow, lashes, high tail), Choni (curled with the heart charm), Chona (mid-leap), and Chori (round, belly-up, paws in the air) all wear Misha's white-and-silver coat, each with the patches in a slightly different place; Kiri kiri wears Kira's tabby with white paws and the pick; Delilah and Chavela are black; Minina is small, pure white, and pink-nosed, with no patches.
- **White coats read on bone, in both themes:** every white cat has a clear ink outline and a soft lilac-gray shade along its lower edge; none melts into the card or the page row. The black cats keep their bone paper-cut margin on the dark field.
- **One style:** the scratchy double outline, the mismatched eyes, spindly legs, spiral tails, and stitches are the same on all ten. In boceto the patches and stripes are only pencil lines.

A patch, stripe, or pose that needs a nudge is a data change in `src/components/art/cats/<id>.ts`; a color is a tuning change in `tuning.cats.coats` or `tuning.cats.eyes`. Rerun the step after any change. Then delete the scratch files and stop the dev server:

```bash
rm .superpowers/cats-sheet.html .superpowers/cats-sheet.tsx
```

- [ ] **Step 13: Commit.**

```bash
git add src/content.ts src/tuning.ts src/index.css src/components/art/CatSprite.tsx src/components/art/CatSprite.test.tsx src/components/art/cats
git commit -m "$(cat <<'EOF'
Give the cats their family coats: redraw Misha and Kira as the real cats, and draw Chona, Chori, and Minina

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Cats data and pages

**Files:**
- Modify: `src/content.ts` (`cats`, `copy.roundCount`, `gameCopy.cats`), `src/tuning.ts` (`tuning.noticing.catWaitMs`), `src/logic/noticing.ts`, `src/logic/progress.ts`, `src/components/QuestLog.tsx`, `src/components/Collection.tsx`, `src/components/Pages.tsx`, `src/components/Confirmation.tsx`, `src/index.css` (perches and loops)
- Create: `src/content.test.ts`
- Test: `src/logic/noticing.test.ts`, `src/logic/catState.test.ts`, `src/logic/progress.test.ts`, `src/components/QuestLog.test.tsx`, `src/components/Room.test.tsx`, `src/components/RoomCamera.test.tsx`, `src/components/App.test.tsx`

**Interfaces:**
- **Consumes (Task 1):** `CatId` with the ten ids; `catDrawings`; `feelingColors` and `tuning.cats.behaviorMs` for all ten.
- **Produces:**
  - `cats: readonly CatRecord[]`, ten records in this order: `luz` Mishona, `mimo` Choni, `susto` Chavela, `bram` Kiri kiri, `nana` Delilah, `chona` Chona, `chori` Chori, `minina` Minina, `misha` Misha, `kira` Kira. `catIds` follows it.
  - `copy.roundCount(n: number, total: number): string` → `` `${n} de ${total}` ``; `gameCopy.cats(n: number, total: number): string` → `` `Gatos ${n}/${total}` ``. Callers pass `cats.length`.
  - `tuning.noticing.catWaitMs: { chona: 2000, chori: 3200, minina: 900 }`; `noticeWaitMs(catId, musicPlaying)` returns a cat's own wait when it has one.
  - `applyEvent` earns `todosLosGatos` at `metCount >= cats.length`.
  - Perch classes: `perch-llegada-chona`, `perch-llegada-minina`, `perch-palabra-chori`, `perch-donde-chori`, `perch-confirmar-minina` (plus the existing ones). `Pages` puts every cat in the room (`roomCats` is `catIds`).
  - `Confirmation` ignores a tap whose target is inside `a, button, [data-cat-id]`.

- [ ] **Step 1: Write the failing tests.** The renamed cats change many test strings (`Saludar a Luz` becomes `Saludar a Mishona`, and so on); the new tests pin the table, the rarity mix, the counts out of ten, a returning guest's old collection (Review Focus 1), the perches before and after the party in both rooms (Review Focus 4), the new waits, and Minina's tap.

Create `src/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { catDrawings } from './components/art/cats'
import { catIds, cats, copy, gameCopy } from './content'
import { feelingColors } from './tuning'

// Spec §3: the ten cats, their names, feelings, and lines, verbatim.
describe('the cats (spec §3)', () => {
  it('lists the ten cats with their names, feelings, rarities, and lines', () => {
    expect(cats.map((cat) => [cat.id, cat.name, cat.feeling, cat.rarity, cat.line])).toEqual([
      ['luz', 'Mishona', 'Coquetería', 'comun', 'Se arregla los bigotes antes de saludarte.'],
      ['mimo', 'Choni', 'Cariño', 'comun', 'Se acurruca a tu lado y ronronea bajito.'],
      ['susto', 'Chavela', 'Temor', 'pocoComun', 'Se asoma cuando el mundo está en calma.'],
      ['bram', 'Kiri kiri', 'Juego', 'pocoComun', 'Tira la púa, la persigue y vuelve por más.'],
      ['nana', 'Delilah', 'Curiosidad', 'pocoComun', 'Todo lo huele primero, hasta el QR.'],
      ['chona', 'Chona', 'Energía', 'pocoComun', 'Llega corriendo y no se queda quieta.'],
      ['chori', 'Chori', 'Apapacho', 'pocoComun', 'Redondita, tranquila y siempre con hambre.'],
      ['minina', 'Minina', 'Travesura', 'pocoComun', 'Pequeñita, blanca y lista para jugar.'],
      ['misha', 'Misha', 'Calma', 'legendario', 'Está en calma, y está en casa.'],
      ['kira', 'Kira', 'Asombro', 'legendario', 'Mira la puerta, y se queda cerca.'],
    ])
  })

  it('mixes 2 Común, 6 Poco común, and 2 Legendario', () => {
    const count = (rarity: string) => cats.filter((cat) => cat.rarity === rarity).length
    expect([count('comun'), count('pocoComun'), count('legendario')]).toEqual([2, 6, 2])
  })

  it('keeps three cats at the gate: Mishona, Choni, and Chavela', () => {
    expect(cats.filter((cat) => cat.pages.includes('gate')).map((cat) => cat.id)).toEqual(['luz', 'mimo', 'susto'])
  })

  it('gives every cat art and its own feeling color', () => {
    expect([...catIds].sort()).toEqual(Object.keys(catDrawings).sort())
    const colors = catIds.map((id) => feelingColors[id].toUpperCase())
    expect(new Set(colors).size).toBe(catIds.length)
  })

  it('counts cats out of the whole list, not a fixed seven', () => {
    expect(gameCopy.cats(3, cats.length)).toBe('Gatos 3/10')
    expect(copy.roundCount(3, cats.length)).toBe('3 de 10')
  })
})
```

In `src/logic/noticing.test.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { idleNotice, isNoticing, noticeWaitMs, stepNotice, type NoticeInput } from './noticing'
```

Replace with:

```ts
import { describe, expect, it } from 'vitest'
import { catIds } from '../content'
import { tuning } from '../tuning'
import { idleNotice, isNoticing, noticeWaitMs, stepNotice, type NoticeInput } from './noticing'
```

2. Find:

```ts
    expect(run({ ...base, inZone: false }, 100, 100, left).noticing).toBe(false)
  })

  it('agrees with the single-shot check', () => {
    expect(isNoticing({ ...base, stillMs: comun })).toBe(true)
    expect(isNoticing({ ...base, stillMs: comun - 1 })).toBe(false)
```

Replace with:

```ts
    expect(run({ ...base, inZone: false }, 100, 100, left).noticing).toBe(false)
  })

  it('gives the three new cats their own waits: Chona a little patience, Chori a long wait, Minina a short one (spec §3)', () => {
    const own = n.catWaitMs
    expect(noticeWaitMs('chona', false)).toBe(own.chona)
    expect(noticeWaitMs('chori', false)).toBe(own.chori)
    expect(noticeWaitMs('minina', false)).toBe(own.minina)
    expect(own.chona).toBeGreaterThan(pocoComun)
    expect(own.chori).toBeGreaterThan(own.chona)
    expect(own.minina).toBeLessThan(pocoComun)
    // Music only hurries Misha.
    expect(noticeWaitMs('chori', true)).toBe(own.chori)
    const chori: NoticeInput = { ...base, catId: 'chori' }
    expect(run(chori, own.chori - 100).noticing).toBe(false)
    expect(run(chori, own.chori).noticing).toBe(true)
  })

  it('has a noticing rule for every cat', () => {
    for (const id of catIds) expect(noticeWaitMs(id, false), id).toBeGreaterThan(0)
  })

  it('agrees with the single-shot check', () => {
    expect(isNoticing({ ...base, stillMs: comun })).toBe(true)
    expect(isNoticing({ ...base, stillMs: comun - 1 })).toBe(false)
```

In `src/logic/catState.test.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
    ).toEqual({ caught: ['luz', 'kira'], round: ['kira'], rounds: 3 })
  })

  it('treats a stored list without a round as the first round', () => {
    expect(sanitizeCatState({ caught: ['mimo'] })).toEqual({ caught: ['mimo'], round: ['mimo'], rounds: 1 })
  })
```

Replace with:

```ts
    ).toEqual({ caught: ['luz', 'kira'], round: ['kira'], rounds: 3 })
  })

  it('still loads a collection saved before the rename: the old IDs are the renamed cats (spec §3)', () => {
    const old = { caught: ['luz', 'mimo', 'susto', 'bram', 'nana', 'misha', 'kira'], round: ['nana', 'kira'], rounds: 2 }
    expect(sanitizeCatState(old)).toEqual(old)
    expect(sanitizeCatState({ caught: ['chona', 'chori', 'minina'] }).caught).toEqual(['chona', 'chori', 'minina'])
  })

  it('treats a stored list without a round as the first round', () => {
    expect(sanitizeCatState({ caught: ['mimo'] })).toEqual({ caught: ['mimo'], round: ['mimo'], rounds: 1 })
  })
```

In `src/logic/progress.test.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { applyEvent, countablePages, emptyProgress, levelFor, sanitizeProgress } from './progress'
import { landmarksFor } from './layout'
```

Replace with:

```ts
import { describe, expect, it } from 'vitest'
import { cats } from '../content'
import { tuning } from '../tuning'
import { applyEvent, countablePages, emptyProgress, levelFor, sanitizeProgress } from './progress'
import { landmarksFor } from './layout'
```

2. Find:

```ts
    expect(r.awards).toEqual([{ xp: x.catXp.comun }, { badge: 'primerGato', xp: x.badgeXp.primerGato }])
    expect(r.progress.xp).toBe(x.catXp.comun + x.badgeXp.primerGato)
  })
  it('awards Todos los gatos on the seventh cat', () => {
    const r = applyEvent({ ...emptyProgress, badges: ['primerGato'] }, { type: 'metCat', cat: 'kira', metCount: 7 })
    expect(r.awards.map((a) => a.badge ?? 'cat')).toEqual(['cat', 'todosLosGatos'])
    expect(r.awards[0]?.xp).toBe(x.catXp.legendario)
  })
```

Replace with:

```ts
    expect(r.awards).toEqual([{ xp: x.catXp.comun }, { badge: 'primerGato', xp: x.badgeXp.primerGato }])
    expect(r.progress.xp).toBe(x.catXp.comun + x.badgeXp.primerGato)
  })
  it('awards Todos los gatos on the last of the ten cats, and not on the seventh (spec §3)', () => {
    const seventh = applyEvent({ ...emptyProgress, badges: ['primerGato'] }, { type: 'metCat', cat: 'kira', metCount: 7 })
    expect(seventh.awards.map((a) => a.badge ?? 'cat')).toEqual(['cat'])
    const r = applyEvent({ ...emptyProgress, badges: ['primerGato'] }, { type: 'metCat', cat: 'kira', metCount: cats.length })
    expect(cats).toHaveLength(10)
    expect(r.awards.map((a) => a.badge ?? 'cat')).toEqual(['cat', 'todosLosGatos'])
    expect(r.awards[0]?.xp).toBe(x.catXp.legendario)
  })
```

In `src/components/QuestLog.test.tsx`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { gameCopy } from '../content'
import { QuestLog } from './QuestLog'

const fill = () => (document.querySelector('.quest-log') as HTMLElement).style.getPropertyValue('--fill')
```

Replace with:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cats, gameCopy } from '../content'
import { QuestLog } from './QuestLog'

const fill = () => (document.querySelector('.quest-log') as HTMLElement).style.getPropertyValue('--fill')
```

2. Find:

```tsx
  it('shows the pages, the cats, the level with its title, and the XP', () => {
    render(<QuestLog pages={2} total={6} cats={3} xp={70} />)
    expect(screen.getByText(gameCopy.pages(2, 6))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.cats(3))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.level(2))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.levelTitles[1])).toBeInTheDocument()
    expect(screen.getByText(gameCopy.xp(70))).toBeInTheDocument()
```

Replace with:

```tsx
  it('shows the pages, the cats, the level with its title, and the XP', () => {
    render(<QuestLog pages={2} total={6} cats={3} xp={70} />)
    expect(screen.getByText(gameCopy.pages(2, 6))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.cats(3, cats.length))).toBeInTheDocument()
    // Spec §3: the total is the cats list, ten cats.
    expect(screen.getByText('Gatos 3/10')).toBeInTheDocument()
    expect(screen.getByText(gameCopy.level(2))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.levelTitles[1])).toBeInTheDocument()
    expect(screen.getByText(gameCopy.xp(70))).toBeInTheDocument()
```

In `src/components/Room.test.tsx`, make these 5 replacements (each block to find appears exactly once):

1. Find:

```tsx
})

describe('US-12 Watch the cats play (invitation)', () => {
  it('has all seven cats and the family door line (AC2)', () => {
    renderRoom()
    for (const name of ['Luz', 'Mimo', 'Susto', 'Bram', 'Nana', 'Misha', 'Kira']) {
      expect(screen.getByRole('img', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(copy.doorLine)).toBeInTheDocument()
```

Replace with:

```tsx
})

describe('US-12 Watch the cats play (invitation)', () => {
  it('has all ten cats and the family door line (AC2)', () => {
    renderRoom()
    for (const name of ['Mishona', 'Choni', 'Chavela', 'Kiri kiri', 'Delilah', 'Chona', 'Chori', 'Minina', 'Misha', 'Kira']) {
      expect(screen.getByRole('img', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(copy.doorLine)).toBeInTheDocument()
```

2. Find:

```tsx
    expect(document.querySelector('.figure-mia')).not.toBeNull()
  })

  it('draws the family as faceless paper figures in three layers, whose top copy has no outline (spec §6)', () => {
    renderRoom()
    const figures = document.querySelectorAll('.family-door .paper-family .paper-figure')
```

Replace with:

```tsx
    expect(document.querySelector('.figure-mia')).not.toBeNull()
  })

  // Spec §3: each cat on its page before the party, and all ten on the four pages left after it.
  const perched = (id: string) =>
    [...(landmark(id)?.querySelectorAll('[data-cat-id]') ?? [])].map((el) => el.getAttribute('data-cat-id')).sort()

  it('perches each cat on its page before the party', () => {
    renderRoom()
    expect(perched('llegada')).toEqual(['chona'])
    expect(perched('palabra')).toEqual(['mimo'])
    expect(perched('cuando')).toEqual(['bram', 'luz'])
    expect(perched('donde')).toEqual(['chori'])
    expect(perched('confirmar')).toEqual(['minina', 'susto'])
    expect(perched('presente')).toEqual(['nana'])
    expect(perched('familia')).toEqual(['kira', 'misha'])
  })

  // Review Focus 4: ten cats on four pages after the party.
  it.each([
    ['sat', satCutoff],
    ['sun', sunCutoff],
  ] as const)('keeps all ten cats on the four pages left after the %s party', (day, now) => {
    renderRoom({ day, now })
    expect(perched('llegada')).toEqual(['chona', 'minina', 'susto'])
    expect(perched('palabra')).toEqual(['chori', 'mimo', 'nana'])
    expect(perched('cuando')).toEqual(['bram', 'luz'])
    expect(perched('familia')).toEqual(['kira', 'misha'])
    const all = ['llegada', 'palabra', 'cuando', 'familia'].flatMap(perched)
    expect(all).toHaveLength(10)
    expect(new Set(all).size).toBe(10)
    // Each page's perches are separate spots: no two cats share one.
    const spots = [...document.querySelectorAll('.perch')].map((el) => el.className)
    expect(new Set(spots).size).toBe(spots.length)
  })

  it('draws the family as faceless paper figures in three layers, whose top copy has no outline (spec §6)', () => {
    renderRoom()
    const figures = document.querySelectorAll('.family-door .paper-family .paper-figure')
```

3. Find:

```tsx
      vi.unstubAllGlobals()
    })

    it('startles Susto at an empty spot near the button, and never from the link itself (AC5)', () => {
      renderRoom()
      const spot = document.querySelector('.confirm-spot') as HTMLElement
      fireEvent.click(spot)
      expect(document.querySelector('.cat-susto')).toHaveClass('act-startle')
    })

    it("starts Misha's scratch from the door frame, with the paper family in the doorway (spec §6)", () => {
      renderRoom()
      fireEvent.click(document.querySelector('.door-frame-hit')!)
```

Replace with:

```tsx
      vi.unstubAllGlobals()
    })

    it('startles Chavela at an empty spot near the button, and never from the link itself (AC5)', () => {
      renderRoom()
      const spot = document.querySelector('.confirm-spot') as HTMLElement
      fireEvent.click(spot)
      expect(document.querySelector('.cat-susto')).toHaveClass('act-startle')
    })

    it('does not startle Chavela from a tap on Minina by the seal, nor from the link (spec §3)', () => {
      renderRoom()
      fireEvent.click(document.querySelector('.perch-confirmar-minina .cat-figure')!)
      expect(document.querySelector('.cat-susto')).not.toHaveClass('act-startle')
      fireEvent.click(screen.getByRole('link', { name: copy.confirm }))
      expect(document.querySelector('.cat-susto')).not.toHaveClass('act-startle')
    })

    it("starts Misha's scratch from the door frame, with the paper family in the doorway (spec §6)", () => {
      renderRoom()
      fireEvent.click(document.querySelector('.door-frame-hit')!)
```

4. Find:

```tsx
  it('offers Saludar after the rarity wait, and greets on activation', () => {
    catsInView()
    const { onGreet } = renderRoom()
    expect(screen.queryByRole('button', { name: 'Saludar a Luz' })).not.toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    const button = screen.getByRole('button', { name: 'Saludar a Luz' })
    expect(button).toHaveTextContent(copy.greet)
    expect(screen.queryByRole('button', { name: 'Saludar a Kira' })).not.toBeInTheDocument()
    fireEvent.click(button)
```

Replace with:

```tsx
  it('offers Saludar after the rarity wait, and greets on activation', () => {
    catsInView()
    const { onGreet } = renderRoom()
    expect(screen.queryByRole('button', { name: 'Saludar a Mishona' })).not.toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    const button = screen.getByRole('button', { name: 'Saludar a Mishona' })
    expect(button).toHaveTextContent(copy.greet)
    expect(screen.queryByRole('button', { name: 'Saludar a Kira' })).not.toBeInTheDocument()
    fireEvent.click(button)
```

5. Find:

```tsx
    catsInView()
    renderRoom({ catState: { caught: ['luz'], round: ['luz'], rounds: 1 } })
    advance(3000)
    expect(screen.queryByRole('button', { name: 'Saludar a Luz' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Saludar a Mimo' })).toBeInTheDocument()
  })

  it('offers Misha sooner while music plays', () => {
```

Replace with:

```tsx
    catsInView()
    renderRoom({ catState: { caught: ['luz'], round: ['luz'], rounds: 1 } })
    advance(3000)
    expect(screen.queryByRole('button', { name: 'Saludar a Mishona' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Saludar a Choni' })).toBeInTheDocument()
  })

  it('offers Misha sooner while music plays', () => {
```

In `src/components/RoomCamera.test.tsx`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { tierCount } from '../logic/deviceTier'
import { hasWebGL } from '../logic/webgl'
import { cssColor, tuning } from '../tuning'
import { beforeSatCutoff, beforeSunCutoff, renderRoom } from '../test/helpers'
import { backdropCanvas, bookCanvas } from '../world/canvasSettings'
import { WorldRoom } from './WorldRoom'
```

Replace with:

```tsx
import { tierCount } from '../logic/deviceTier'
import { hasWebGL } from '../logic/webgl'
import { cssColor, tuning } from '../tuning'
import { beforeSatCutoff, beforeSunCutoff, renderRoom, satCutoff } from '../test/helpers'
import { backdropCanvas, bookCanvas } from '../world/canvasSettings'
import { WorldRoom } from './WorldRoom'
```

2. Find:

```tsx
    expect(cover()).toBeNull()
  })

  it('uses the flat room with reduced motion', () => {
    renderWorldRoom({ reducedMotion: true })
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
```

Replace with:

```tsx
    expect(cover()).toBeNull()
  })

  // Review Focus 4, in the book: the same four pages hold all ten cats after the party.
  it('keeps all ten cats on the four pages left after the party, in the book too (spec §3)', async () => {
    world.mode = 'ready'
    renderWorldRoom({ now: satCutoff })
    await bookReady()
    const perched = (id: LandmarkId) =>
      [...document.querySelectorAll(`[data-landmark-id="${id}"] [data-cat-id]`)].map((el) => el.getAttribute('data-cat-id')).sort()
    expect(perched('llegada')).toEqual(['chona', 'minina', 'susto'])
    expect(perched('palabra')).toEqual(['chori', 'mimo', 'nana'])
    expect(perched('cuando')).toEqual(['bram', 'luz'])
    expect(perched('familia')).toEqual(['kira', 'misha'])
    expect(document.querySelectorAll('[data-landmark-id] [data-cat-id]')).toHaveLength(10)
  })

  it('uses the flat room with reduced motion', () => {
    renderWorldRoom({ reducedMotion: true })
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
```

In `src/components/App.test.tsx`, make these 13 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { battleCopy, copy, days, gameCopy, gateGameCopy, shared } from '../content'
import { storageKeys } from '../logic/storageKeys'
import { whatsappUrl } from '../logic/whatsapp'
import { tuning } from '../tuning'
```

Replace with:

```tsx
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { battleCopy, cats, copy, days, gameCopy, gateGameCopy, shared } from '../content'
import { storageKeys } from '../logic/storageKeys'
import { whatsappUrl } from '../logic/whatsapp'
import { tuning } from '../tuning'
```

2. Find:

```tsx
    render(<App search="" />)
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Luz' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(screen.getByText(gateGameCopy.seconds(tuning.gateGame.durationMs / 1000))).toBeInTheDocument()
```

Replace with:

```tsx
    render(<App search="" />)
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mishona' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(screen.getByText(gateGameCopy.seconds(tuning.gateGame.durationMs / 1000))).toBeInTheDocument()
```

3. Find:

```tsx
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
  })

  it('hides the roaming, greetable Luz while a round plays (she is the catcher); she is back after game over', () => {
    render(<App search="" />)
    expect(screen.getByRole('img', { name: 'Luz' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(screen.queryByRole('img', { name: 'Luz' })).not.toBeInTheDocument()
    expect(document.querySelector('[data-cat-id="luz"]')).toBeNull()
    expect(screen.getByRole('img', { name: 'Mimo' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Susto' })).toBeInTheDocument()

    for (let t = 0; t < tuning.gateGame.durationMs + 500; t += 1000) advance(1000)

    expect(screen.getByText(gateGameCopy.over)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Luz' })).toBeInTheDocument()
  })

  it('shows the sentences and still cats, with no start button, with reduced motion (AC3)', () => {
```

Replace with:

```tsx
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
  })

  it('hides the roaming, greetable Mishona while a round plays (she is the catcher); she is back after game over', () => {
    render(<App search="" />)
    expect(screen.getByRole('img', { name: 'Mishona' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(screen.queryByRole('img', { name: 'Mishona' })).not.toBeInTheDocument()
    expect(document.querySelector('[data-cat-id="luz"]')).toBeNull()
    expect(screen.getByRole('img', { name: 'Choni' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Chavela' })).toBeInTheDocument()

    for (let t = 0; t < tuning.gateGame.durationMs + 500; t += 1000) advance(1000)

    expect(screen.getByText(gateGameCopy.over)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mishona' })).toBeInTheDocument()
  })

  it('shows the sentences and still cats, with no start button, with reduced motion (AC3)', () => {
```

4. Find:

```tsx
})

describe('US-12 The gate is a room with cats (AC1)', () => {
  it('has Luz, Mimo, and Susto with the yarn, the box, and a heart; no Bram, Misha, Kira, or door', () => {
    render(<App search="" />)
    for (const name of ['Luz', 'Mimo', 'Susto']) expect(screen.getByRole('img', { name })).toBeInTheDocument()
    for (const name of ['Bram', 'Nana', 'Misha', 'Kira']) expect(screen.queryByRole('img', { name })).not.toBeInTheDocument()
    expect(document.querySelector('.toy-yarn')).not.toBeNull()
    expect(document.querySelector('.toy-box')).not.toBeNull()
    expect(document.querySelector('.toy-heart')).not.toBeNull()
```

Replace with:

```tsx
})

describe('US-12 The gate is a room with cats (AC1)', () => {
  it('has Mishona, Choni, and Chavela with the yarn, the box, and a heart; no other cat, and no door', () => {
    render(<App search="" />)
    for (const name of ['Mishona', 'Choni', 'Chavela']) expect(screen.getByRole('img', { name })).toBeInTheDocument()
    for (const name of ['Kiri kiri', 'Delilah', 'Chona', 'Chori', 'Minina', 'Misha', 'Kira']) {
      expect(screen.queryByRole('img', { name })).not.toBeInTheDocument()
    }
    expect(document.querySelector('.toy-yarn')).not.toBeNull()
    expect(document.querySelector('.toy-box')).not.toBeNull()
    expect(document.querySelector('.toy-heart')).not.toBeNull()
```

5. Find:

```tsx
    localStorage.setItem(storageKeys.cats, '{not json')
    render(<App search="" />)
    openCollection()
    expect(dialog().getByText(copy.roundCount(0))).toBeInTheDocument()
  })
})
```

Replace with:

```tsx
    localStorage.setItem(storageKeys.cats, '{not json')
    render(<App search="" />)
    openCollection()
    expect(dialog().getByText(copy.roundCount(0, cats.length))).toBeInTheDocument()
  })
})
```

6. Find:

```tsx
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('greets Luz, stores her, and shows the caught line, rarity, and line (AC1)', () => {
    vi.setSystemTime(beforeSatCutoff)
    catsInView()
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({ caught: ['luz'], round: ['luz'], rounds: 1 })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(copy.caught('Luz'))
    expect(status).toHaveTextContent('Común')
    expect(status).toHaveTextContent('Siempre encuentra algo que perseguir.')
    advance(tuning.greetingToastMs + 10)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
```

Replace with:

```tsx
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('greets Mishona, stores her, and shows the caught line, rarity, and line (AC1)', () => {
    vi.setSystemTime(beforeSatCutoff)
    catsInView()
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({ caught: ['luz'], round: ['luz'], rounds: 1 })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(copy.caught('Mishona'))
    expect(status).toHaveTextContent('Común')
    expect(status).toHaveTextContent('Se arregla los bigotes antes de saludarte.')
    advance(tuning.greetingToastMs + 10)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
```

7. Find:

```tsx
    expect(stored(storageKeys.cats).caught).toEqual(['misha', 'kira'])
  })

  it('greets Mimo on the gate, where Bram never appears (AC5, AC7)', () => {
    catsInView()
    render(<App search="" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mimo' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!).caught).toEqual(['mimo'])
    expect(screen.queryByRole('img', { name: 'Bram' })).not.toBeInTheDocument()
  })

  it('shows two stored cats with their lines and adds nothing until a new greet (AC6)', () => {
```

Replace with:

```tsx
    expect(stored(storageKeys.cats).caught).toEqual(['misha', 'kira'])
  })

  it('greets Choni on the gate, where Kiri kiri never appears (AC5, AC7)', () => {
    catsInView()
    render(<App search="" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Choni' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!).caught).toEqual(['mimo'])
    expect(screen.queryByRole('img', { name: 'Kiri kiri' })).not.toBeInTheDocument()
  })

  it('shows two stored cats with their lines and adds nothing until a new greet (AC6)', () => {
```

8. Find:

```tsx
    localStorage.setItem(storageKeys.cats, stored)
    render(<App search="?e=q8lm" />)
    openCollection()
    expect(dialog().getByText('Siempre encuentra algo que perseguir.')).toBeInTheDocument()
    expect(dialog().getByText('Elige un solo lugar, y ese es el suyo.')).toBeInTheDocument()
    expect(dialog().getByText(copy.roundCount(2))).toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.cats)).toBe(stored)
  })
```

Replace with:

```tsx
    localStorage.setItem(storageKeys.cats, stored)
    render(<App search="?e=q8lm" />)
    openCollection()
    expect(dialog().getByText('Se arregla los bigotes antes de saludarte.')).toBeInTheDocument()
    expect(dialog().getByText('Todo lo huele primero, hasta el QR.')).toBeInTheDocument()
    expect(dialog().getByText(copy.roundCount(2, cats.length))).toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.cats)).toBe(stored)
  })

  // Review Focus 1: a guest who met every cat before the rename comes back.
  it('keeps a returning guest\'s seven cats under their new names, and shows the three new cats as not yet met', () => {
    vi.setSystemTime(beforeSatCutoff)
    const old = ['luz', 'mimo', 'susto', 'bram', 'nana', 'misha', 'kira']
    const stored = JSON.stringify({ caught: old, round: old, rounds: 1 })
    localStorage.setItem(storageKeys.cats, stored)
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.cats(7, cats.length))).toBeInTheDocument()
    openCollection()
    expect(dialog().getByText(copy.roundCount(7, cats.length))).toBeInTheDocument()
    for (const name of ['Mishona', 'Choni', 'Chavela', 'Kiri kiri', 'Delilah', 'Misha', 'Kira']) {
      expect(dialog().getByText(name)).toBeInTheDocument()
    }
    for (const id of ['chona', 'chori', 'minina']) {
      expect(within(screen.getByTestId(`collection-${id}`)).getByText(copy.notYet)).toBeInTheDocument()
    }
    expect(localStorage.getItem(storageKeys.cats)).toBe(stored)
  })
```

9. Find:

```tsx
  it('shows the card for a normal greeting, and a tap sends it away', () => {
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    const card = screen.getByTestId('card-reveal')
    expect(card).toHaveClass('rarity-comun')
    expect(card).toHaveTextContent('Luz')
    expect(card).toHaveTextContent('Común')
    fireEvent.click(card)
    advance(tuning.card.leaveMs + 10)
```

Replace with:

```tsx
  it('shows the card for a normal greeting, and a tap sends it away', () => {
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    const card = screen.getByTestId('card-reveal')
    expect(card).toHaveClass('rarity-comun')
    expect(card).toHaveTextContent('Mishona')
    expect(card).toHaveTextContent('Común')
    fireEvent.click(card)
    advance(tuning.card.leaveMs + 10)
```

10. Find:

```tsx
  it('a first greeting earns XP for the cat and the first-cat badge (metCat)', () => {
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    const progress = stored(storageKeys.progress)
    expect(progress.xp).toBeGreaterThan(0)
    expect(progress.xp).toBe(tuning.progress.catXp.comun + tuning.progress.badgeXp.primerGato)
```

Replace with:

```tsx
  it('a first greeting earns XP for the cat and the first-cat badge (metCat)', () => {
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    const progress = stored(storageKeys.progress)
    expect(progress.xp).toBeGreaterThan(0)
    expect(progress.xp).toBe(tuning.progress.catXp.comun + tuning.progress.badgeXp.primerGato)
```

11. Find:

```tsx
    localStorage.setItem(storageKeys.progress, progress)
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(stored(storageKeys.cats).round).toEqual(['luz'])
    expect(localStorage.getItem(storageKeys.progress)).toBe(progress)
  })
```

Replace with:

```tsx
    localStorage.setItem(storageKeys.progress, progress)
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    expect(stored(storageKeys.cats).round).toEqual(['luz'])
    expect(localStorage.getItem(storageKeys.progress)).toBe(progress)
  })
```

12. Find:

```tsx
  it('holds the badge toasts until the card has gone, and counts the cat in the quest log', () => {
    catsInView()
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.cats(0))).toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(screen.getByText(gameCopy.cats(1))).toBeInTheDocument()
    expect(screen.getByTestId('card-reveal')).toBeInTheDocument()
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
    advance(tuning.greetingToastMs + 10)
```

Replace with:

```tsx
  it('holds the badge toasts until the card has gone, and counts the cat in the quest log', () => {
    catsInView()
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.cats(0, cats.length))).toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    expect(screen.getByText(gameCopy.cats(1, cats.length))).toBeInTheDocument()
    expect(screen.getByTestId('card-reveal')).toBeInTheDocument()
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
    advance(tuning.greetingToastMs + 10)
```

13. Find:

```tsx
      round: [],
      rounds: 2,
    })
    expect(dialog().getByText(copy.roundCount(0))).toBeInTheDocument()
    expect(dialog().getByText(copy.roundNumber(2))).toBeInTheDocument()
    expect(dialog().getByText('Siempre encuentra algo que perseguir.')).toBeInTheDocument()
    fireEvent.click(dialog().getByRole('button', { name: copy.close }))
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({
      caught: ['luz', 'mimo', 'nana'],
      round: ['luz'],
```

Replace with:

```tsx
      round: [],
      rounds: 2,
    })
    expect(dialog().getByText(copy.roundCount(0, cats.length))).toBeInTheDocument()
    expect(dialog().getByText(copy.roundNumber(2))).toBeInTheDocument()
    expect(dialog().getByText('Se arregla los bigotes antes de saludarte.')).toBeInTheDocument()
    fireEvent.click(dialog().getByRole('button', { name: copy.close }))
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({
      caught: ['luz', 'mimo', 'nana'],
      round: ['luz'],
```

- [ ] **Step 2: Run them to see them fail.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/content.test.ts src/logic/noticing.test.ts src/logic/catState.test.ts src/logic/progress.test.ts src/components/QuestLog.test.tsx src/components/Room.test.tsx src/components/RoomCamera.test.tsx src/components/App.test.tsx
```

Expected: FAIL, 28 tests. Among them: "lists the ten cats with their names, feelings, rarities, and lines", "mixes 2 Común, 6 Poco común, and 2 Legendario", "still loads a collection saved before the rename…" (`sanitizeCatState` drops the not-yet-known new ids), "gives the three new cats their own waits…", "awards Todos los gatos on the last of the ten cats…", "keeps all ten cats on the four pages left after the sat party", "keeps all ten cats on the four pages left after the party, in the book too", "does not startle Chavela from a tap on Minina by the seal, nor from the link", and every App test that greets `Saludar a Mishona`.

- [ ] **Step 3: Name the ten cats, and count out of the list.**

In `src/content.ts`, make these 4 replacements (each block to find appears exactly once):

1. Find:

```ts
export const cats: readonly CatRecord[] = [
  {
    id: 'luz',
    name: 'Luz',
    feeling: 'Alegría',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Siempre encuentra algo que perseguir.',
  },
  {
    id: 'mimo',
    name: 'Mimo',
    feeling: 'Ternura',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Le gusta que te quedes un rato.',
  },
  {
    id: 'susto',
    name: 'Susto',
    feeling: 'Temor',
    rarity: 'pocoComun',
    pages: ['gate', 'invitation'],
```

Replace with:

```ts
export const cats: readonly CatRecord[] = [
  {
    id: 'luz',
    name: 'Mishona',
    feeling: 'Coquetería',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Se arregla los bigotes antes de saludarte.',
  },
  {
    id: 'mimo',
    name: 'Choni',
    feeling: 'Cariño',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Se acurruca a tu lado y ronronea bajito.',
  },
  {
    id: 'susto',
    name: 'Chavela',
    feeling: 'Temor',
    rarity: 'pocoComun',
    pages: ['gate', 'invitation'],
```

2. Find:

```ts
  },
  {
    id: 'bram',
    name: 'Bram',
    feeling: 'Ímpetu',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Hace ruido y después se queda.',
  },
  {
    id: 'nana',
    name: 'Nana',
    feeling: 'Delicadeza',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Elige un solo lugar, y ese es el suyo.',
  },
  {
    id: 'misha',
```

Replace with:

```ts
  },
  {
    id: 'bram',
    name: 'Kiri kiri',
    feeling: 'Juego',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Tira la púa, la persigue y vuelve por más.',
  },
  {
    id: 'nana',
    name: 'Delilah',
    feeling: 'Curiosidad',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Todo lo huele primero, hasta el QR.',
  },
  {
    id: 'chona',
    name: 'Chona',
    feeling: 'Energía',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Llega corriendo y no se queda quieta.',
  },
  {
    id: 'chori',
    name: 'Chori',
    feeling: 'Apapacho',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Redondita, tranquila y siempre con hambre.',
  },
  {
    id: 'minina',
    name: 'Minina',
    feeling: 'Travesura',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Pequeñita, blanca y lista para jugar.',
  },
  {
    id: 'misha',
```

3. Find:

```ts
  greetName: (name: string) => `Saludar a ${name}`,
  caught: (name: string) => `Se quedó contigo: ${name}.`,
  notYet: 'Aún no se acerca',
  roundCount: (n: number) => `${n} de 7`,
  roundNumber: (n: number) => `Vuelta ${n}`,
  playAgain: 'Jugar otra vez',
  doorLine: 'Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.',
```

Replace with:

```ts
  greetName: (name: string) => `Saludar a ${name}`,
  caught: (name: string) => `Se quedó contigo: ${name}.`,
  notYet: 'Aún no se acerca',
  roundCount: (n: number, total: number) => `${n} de ${total}`,
  roundNumber: (n: number) => `Vuelta ${n}`,
  playAgain: 'Jugar otra vez',
  doorLine: 'Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.',
```

4. Find:

```ts
export const gameCopy = {
  pageFound: '¡Página encontrada!',
  pages: (n: number, total: number) => `Páginas ${n}/${total}`,
  cats: (n: number) => `Gatos ${n}/7`,
  level: (n: number) => `Nivel ${n}`,
  xp: (n: number) => `${n} XP`,
  levelTitles: ['Visitante curioso', 'Amigo de los gatos', 'Guardián del cuento', 'Invitado de honor', 'Leyenda de la casa'],
```

Replace with:

```ts
export const gameCopy = {
  pageFound: '¡Página encontrada!',
  pages: (n: number, total: number) => `Páginas ${n}/${total}`,
  cats: (n: number, total: number) => `Gatos ${n}/${total}`,
  level: (n: number) => `Nivel ${n}`,
  xp: (n: number) => `${n} XP`,
  levelTitles: ['Visitante curioso', 'Amigo de los gatos', 'Guardián del cuento', 'Invitado de honor', 'Leyenda de la casa'],
```

In `src/tuning.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
    zone: 0.6,
    stillSpeedPxPerS: 40,
    waitMs: { comun: 500, pocoComun: 1500, legendario: 2500 } satisfies Record<Rarity, number>,
    mishaMusicWaitMs: 1200,
    sustoRushPxPerS: 600,
    lingerMs: 1000,
```

Replace with:

```ts
    zone: 0.6,
    stillSpeedPxPerS: 40,
    waitMs: { comun: 500, pocoComun: 1500, legendario: 2500 } satisfies Record<Rarity, number>,
    // Spec §3: the new cats' own waits, in the same family as the rarity waits. Chona needs a little
    // patience, Chori comes if you wait, and Minina notices you after a short stay on Confirmar.
    catWaitMs: { chona: 2000, chori: 3200, minina: 900 } satisfies Partial<Record<CatId, number>>,
    mishaMusicWaitMs: 1200,
    sustoRushPxPerS: 600,
    lingerMs: 1000,
```

In `src/logic/noticing.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts

export function noticeWaitMs(catId: CatId, musicPlaying: boolean, t: NoticingTuning = tuning.noticing): number {
  if (catId === 'misha' && musicPlaying) return t.mishaMusicWaitMs
  return t.waitMs[catById(catId).rarity]
}

function rushed(input: NoticeInput, t: NoticingTuning): boolean {
```

Replace with:

```ts

export function noticeWaitMs(catId: CatId, musicPlaying: boolean, t: NoticingTuning = tuning.noticing): number {
  if (catId === 'misha' && musicPlaying) return t.mishaMusicWaitMs
  const own: Partial<Record<CatId, number>> = t.catWaitMs
  return own[catId] ?? t.waitMs[catById(catId).rarity]
}

function rushed(input: NoticeInput, t: NoticingTuning): boolean {
```

In `src/logic/progress.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
import { catById, type CatId } from '../content'
import { tuning } from '../tuning'
import type { LandmarkId } from './layout'
```

Replace with:

```ts
import { catById, cats, type CatId } from '../content'
import { tuning } from '../tuning'
import type { LandmarkId } from './layout'
```

2. Find:

```ts
      awards.push({ xp })
      next = { ...next, xp: next.xp + xp }
      next = earn(next, awards, 'primerGato')
      if (e.metCount >= 7) next = earn(next, awards, 'todosLosGatos')
      break
    }
  }
```

Replace with:

```ts
      awards.push({ xp })
      next = { ...next, xp: next.xp + xp }
      next = earn(next, awards, 'primerGato')
      if (e.metCount >= cats.length) next = earn(next, awards, 'todosLosGatos')
      break
    }
  }
```

In `src/components/QuestLog.tsx`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```tsx
import type { CSSProperties } from 'react'
import { gameCopy } from '../content'
import { levelFor } from '../logic/progress'
import { tuning } from '../tuning'
```

Replace with:

```tsx
import type { CSSProperties } from 'react'
import { cats as allCats, gameCopy } from '../content'
import { levelFor } from '../logic/progress'
import { tuning } from '../tuning'
```

2. Find:

```tsx
  // Pages found, out of the pages that count now.
  pages: number
  total: number
  // Cats ever met, out of seven.
  cats: number
  xp: number
}
```

Replace with:

```tsx
  // Pages found, out of the pages that count now.
  pages: number
  total: number
  // Cats ever met, out of every cat (spec §3: the count comes from the cats list).
  cats: number
  xp: number
}
```

3. Find:

```tsx
      <p className="quest-counts">
        <span className="quest-xp">{gameCopy.xp(xp)}</span>
        <span>{gameCopy.pages(pages, total)}</span>
        <span>{gameCopy.cats(cats)}</span>
      </p>
    </div>
  )
```

Replace with:

```tsx
      <p className="quest-counts">
        <span className="quest-xp">{gameCopy.xp(xp)}</span>
        <span>{gameCopy.pages(pages, total)}</span>
        <span>{gameCopy.cats(cats, allCats.length)}</span>
      </p>
    </div>
  )
```

In `src/components/Collection.tsx`, make this replacement (each block to find appears exactly once):

Find:

```tsx
        <div className="collection-header">
          <h2 id="collection-title">{copy.collection}</h2>
          <p className="collection-count">
            <span>{copy.roundCount(state.round.length)}</span>
            {state.rounds > 1 && <span className="collection-round">{copy.roundNumber(state.rounds)}</span>}
          </p>
          <button type="button" className="hud-button collection-close" onClick={onClose}>
```

Replace with:

```tsx
        <div className="collection-header">
          <h2 id="collection-title">{copy.collection}</h2>
          <p className="collection-count">
            <span>{copy.roundCount(state.round.length, cats.length)}</span>
            {state.rounds > 1 && <span className="collection-round">{copy.roundNumber(state.rounds)}</span>}
          </p>
          <button type="button" className="hud-button collection-close" onClick={onClose}>
```

- [ ] **Step 4: Perch the new cats, move them after the party, and keep the empty-spot tap for Chavela.** Before the party: Chona on Llegada, Chori on Dónde's map, Minina by Confirmar's seal. After it: Chavela and Minina join Chona on Llegada, and Delilah and Chori join Choni on Palabra. The same `Pages` feeds the book and the flat room.

In `src/components/Pages.tsx`, make these 6 replacements (each block to find appears exactly once):

1. Find:

```tsx
import type { ReactNode, RefObject } from 'react'
import { copy, days, shared, type CatId, type DayId } from '../content'
import { useActs, type ActId, type ActiveActs } from '../hooks/useActs'
import { useNoticing } from '../hooks/useNoticing'
import type { BattleCat } from '../logic/battle'
```

Replace with:

```tsx
import type { ReactNode, RefObject } from 'react'
import { catIds, copy, days, shared, type CatId, type DayId } from '../content'
import { useActs, type ActId, type ActiveActs } from '../hooks/useActs'
import { useNoticing } from '../hooks/useNoticing'
import type { BattleCat } from '../logic/battle'
```

2. Find:

```tsx
          <p className="hero">{copy.hero}</p>
        )}
        <p className="move-hint">{copy.moveHint}</p>
        {partyOver && cats('susto', 'perch-llegada-susto')}
      </PageCard>
    ),
    // An illuminated manuscript page, with a candle flickering beside the verse.
```

Replace with:

```tsx
          <p className="hero">{copy.hero}</p>
        )}
        <p className="move-hint">{copy.moveHint}</p>
        {cats('chona', 'perch-llegada-chona')}
        {/* After the party (spec §3), Chavela and Minina move here from Confirmar. */}
        {partyOver && cats('susto', 'perch-llegada-susto')}
        {partyOver && cats('minina', 'perch-llegada-minina')}
      </PageCard>
    ),
    // An illuminated manuscript page, with a candle flickering beside the verse.
```

3. Find:

```tsx
        </blockquote>
        <Candle wax={tuning.objects.candle.verseWax} className="verse-candle" />
        {cats('mimo', 'perch-palabra-mimo')}
        {partyOver && cats('nana', 'perch-palabra-nana')}
      </PageCard>
    ),
    // The date and 16:00 pinned to the page, then the melting candle, the flip-card countdown,
```

Replace with:

```tsx
        </blockquote>
        <Candle wax={tuning.objects.candle.verseWax} className="verse-candle" />
        {cats('mimo', 'perch-palabra-mimo')}
        {/* After the party (spec §3), Delilah and Chori move here from Presente and Dónde. */}
        {partyOver && cats('nana', 'perch-palabra-nana')}
        {partyOver && cats('chori', 'perch-palabra-chori')}
      </PageCard>
    ),
    // The date and 16:00 pinned to the page, then the melting candle, the flip-card countdown,
```

4. Find:

```tsx
        <TreasureMap unrolled={open('donde')}>
          <Location />
        </TreasureMap>
      </PageCard>
    ),
    confirmar: (
```

Replace with:

```tsx
        <TreasureMap unrolled={open('donde')}>
          <Location />
        </TreasureMap>
        {cats('chori', 'perch-donde-chori')}
      </PageCard>
    ),
    confirmar: (
```

5. Find:

```tsx
          onEmptySpotTap={() => play('sustoStartle')}
        >
          {cats('susto', 'perch-confirmar-susto')}
        </Confirmation>
      </PageCard>
    ),
```

Replace with:

```tsx
          onEmptySpotTap={() => play('sustoStartle')}
        >
          {cats('susto', 'perch-confirmar-susto')}
          {cats('minina', 'perch-confirmar-minina')}
        </Confirmation>
      </PageCard>
    ),
```

6. Find:

```tsx
  }
}

const roomCats: readonly CatId[] = ['luz', 'mimo', 'susto', 'bram', 'nana', 'misha', 'kira']
const roomActs: readonly ActId[] = [
  'luzBat',
  'bramScratch',
```

Replace with:

```tsx
  }
}

// Every cat is in the room (spec §3: ten cats).
const roomCats: readonly CatId[] = catIds
const roomActs: readonly ActId[] = [
  'luzBat',
  'bramScratch',
```

In `src/components/Confirmation.tsx`, make this replacement (each block to find appears exactly once):

Find:

```tsx
}

// Confirmar (§3, BR-3): a handoff to WhatsApp with that day's message, on the invitation letter.
// A tap on the empty space near the button startles Susto; the link itself never does.
export function Confirmation({ day, sealed, onConfirm, onEmptySpotTap, children }: Props) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    onEmptySpotTap()
  }
  return (
```

Replace with:

```tsx
}

// Confirmar (§3, BR-3): a handoff to WhatsApp with that day's message, on the invitation letter.
// A tap on the empty space near the button startles Chavela; the link itself never does, and
// neither does a tap on a cat (Minina batting at the seal is not empty space).
export function Confirmation({ day, sealed, onConfirm, onEmptySpotTap, children }: Props) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button, [data-cat-id]')) return
    onEmptySpotTap()
  }
  return (
```

- [ ] **Step 5: Place the perches and give the new cats their loops.** Chona dashes, skids, and looks back; Chori rocks on her back; Minina swats toward the seal and pounces. Inicio is the first page, where neither room can pan further left, so Chona and Minina sit well inside the card's width, where a cat can notice the guest on a 390 px phone.

In `src/index.css`, make these 4 replacements (each block to find appears exactly once):

1. Find:

```css
    bottom: -44px;
  }

  .perch-confirmar-susto {
    left: -44px;
    top: 50%;
```

Replace with:

```css
    bottom: -44px;
  }

  /* Spec §3: the new cats. Chona leaps over Inicio's top edge; Minina joins her below it after the
     party. Inicio is the first page, where the camera cannot pan further left, so both sit well
     inside the card's width, in the middle of the screen where a cat can notice the guest. */
  .perch-llegada-chona {
    left: 50%;
    top: -52px;
    margin-left: 28px;
  }

  .perch-llegada-minina {
    left: 50%;
    bottom: -44px;
    margin-left: -96px;
  }

  .perch-palabra-chori {
    right: -24px;
    bottom: -40px;
  }

  /* Chori sprawls on the treasure map's corner. */
  .perch-donde-chori {
    left: -22px;
    bottom: -36px;
  }

  /* Minina bats at the wax seal, beside it on the letter. */
  .perch-confirmar-minina {
    left: 50%;
    top: 22px;
    margin-left: 22px;
  }

  .perch-confirmar-susto {
    left: -44px;
    top: 50%;
```

2. Find:

```css
  .perch-familia-misha .saludar,
  .perch-familia-kira .saludar,
  .perch-palabra-mimo .saludar,
  .perch-cuando-bram .saludar {
    top: -20px;
    bottom: auto;
  }
```

Replace with:

```css
  .perch-familia-misha .saludar,
  .perch-familia-kira .saludar,
  .perch-palabra-mimo .saludar,
  .perch-cuando-bram .saludar,
  .perch-llegada-chona .saludar {
    top: -20px;
    bottom: auto;
  }
```

3. Find:

```css
      nana-groom-head var(--behavior) ease-in-out infinite;
  }

  .cat-misha.is-roaming .cat-sprite.stage-luz,
  .cat-kira.is-roaming .cat-sprite.stage-luz {
    animation: door-glow var(--behavior) ease-in-out infinite;
```

Replace with:

```css
      nana-groom-head var(--behavior) ease-in-out infinite;
  }

  /* Chona races in a short arc, skids, and looks back (spec §3). */
  .cat-chona.is-roaming .cat-figure {
    transform-origin: 50% 100%;
    animation: chona-dash var(--behavior) ease-in-out infinite;
  }

  /* Chori rolls over slowly, paws in the air, breathing slow. */
  .cat-chori.is-roaming .cat-figure {
    transform-origin: 50% 90%;
    animation: chori-roll var(--behavior) ease-in-out infinite;
  }

  .cat-chori.is-roaming .cat-body {
    animation-duration: calc(var(--breath) * 1.4);
  }

  /* Minina bats at the seal's ribbon, then pounces. */
  .cat-minina.is-roaming .pose-playing .cat-paw {
    animation: minina-bat var(--behavior) ease-in-out infinite;
  }

  .cat-minina.is-roaming .cat-figure {
    transform-origin: 50% 100%;
    animation: minina-pounce var(--behavior) ease-in-out infinite;
  }

  .cat-misha.is-roaming .cat-sprite.stage-luz,
  .cat-kira.is-roaming .cat-sprite.stage-luz {
    animation: door-glow var(--behavior) ease-in-out infinite;
```

4. Find:

```css
  }
}

/* Misha and Kira glow by the door. */
@keyframes door-glow {
  0%,
```

Replace with:

```css
  }
}

/* Chona races off in a short arc, lands, skids, looks back over her shoulder, and trots back. */
@keyframes chona-dash {
  0%,
  100% {
    transform: translate(0, 0) scale(1, 1);
  }
  18% {
    transform: translate(6px, -10px) rotate(-6deg);
  }
  34% {
    transform: translate(14px, 0) scale(1.08, 0.92);
  }
  44% {
    transform: translate(18px, 0) scale(1.1, 0.88) rotate(4deg);
  }
  56%,
  74% {
    transform: translate(18px, 0) scale(-1, 1);
  }
  88% {
    transform: translate(6px, 0) scale(1, 1);
  }
}

/* Chori rocks from side to side on her back, slowly. */
@keyframes chori-roll {
  0%,
  50%,
  100% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(-10deg) translateX(-3px);
  }
  70% {
    transform: rotate(9deg) translateX(3px);
  }
}

/* Minina's paw swats twice toward the seal. */
@keyframes minina-bat {
  0%,
  30%,
  60%,
  100% {
    rotate: 0deg;
  }
  36%,
  48% {
    rotate: 50deg;
  }
  42% {
    rotate: 30deg;
  }
}

@keyframes minina-pounce {
  0%,
  60%,
  100% {
    transform: translate(0, 0) scale(1, 1);
  }
  66% {
    transform: translate(1px, 0) scale(1.08, 0.9);
  }
  74% {
    transform: translate(-6px, -10px) scale(0.94, 1.08) rotate(-6deg);
  }
  82% {
    transform: translate(-10px, 0) scale(1.08, 0.92);
  }
  92% {
    transform: translate(-3px, 0);
  }
}

/* Misha and Kira glow by the door. */
@keyframes door-glow {
  0%,
```

- [ ] **Step 6: Run the tests to see them pass.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/content.test.ts src/logic/noticing.test.ts src/logic/catState.test.ts src/logic/progress.test.ts src/components/QuestLog.test.tsx src/components/Room.test.tsx src/components/RoomCamera.test.tsx src/components/App.test.tsx src/cssVariables.test.ts
```

Expected: PASS, every file.

- [ ] **Step 7: Lint, type-check, and run the full suite.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx eslint . && npx tsc -b && npx vitest run --maxWorkers=2
```

Expected: no ESLint or tsc output; `Test Files  52 passed (52)`, `Tests  496 passed (496)`.

- [ ] **Step 8: Look at the perches, the cards, and the move after the party.** Start the dev server (`npm run dev -- --port 5174 --strictPort`, as in Task 1). Run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const shots = '<worktree>/.playwright-mcp'
  const browser = page.context().browser()
  const openBook = async (p) => {
    await p.waitForSelector('.world-canvas canvas', { timeout: 20000 })
    await p.waitForTimeout(1500)
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(600)
  }
  // Before the party, in the book, in both themes.
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const p = await context.newPage()
    await p.goto('http://localhost:5174/?e=n4vk')
    await p.evaluate((t) => localStorage.setItem('mia-theme', t), theme)
    await p.reload()
    await openBook(p)
    for (const [sign, name] of [['Inicio', 'inicio'], ['El lugar', 'lugar'], ['Confirmar', 'confirmar'], ['La fecha', 'fecha']]) {
      await p.getByRole('button', { name: sign }).click()
      await p.waitForTimeout(2500)
      await p.screenshot({ path: `${shots}/t2-${theme}-${name}.png` })
    }
    // Chona's card: she notices the guest on Inicio after her wait.
    await p.getByRole('button', { name: 'Inicio' }).click()
    await p.getByRole('button', { name: 'Saludar a Chona' }).click({ timeout: 8000 })
    await p.waitForTimeout(900)
    await p.screenshot({ path: `${shots}/t2-${theme}-card-chona.png` })
    await context.close()
  }
  // After the Saturday party: the flat room (reduced motion) shows the four pages; Tus gatos with all ten met.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const p = await context.newPage()
  await p.clock.setFixedTime(new Date('2026-10-18T10:00:00-04:00'))
  await p.goto('http://localhost:5174/?e=n4vk')
  await p.waitForTimeout(1500)
  await p.screenshot({ path: `${shots}/t2-over-llegada.png` })
  await p.keyboard.press('ArrowRight')
  await p.keyboard.press('ArrowRight')
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${shots}/t2-over-palabra.png` })
  const all = ['luz', 'mimo', 'susto', 'bram', 'nana', 'chona', 'chori', 'minina', 'misha', 'kira']
  await p.evaluate((ids) => localStorage.setItem('mia-cats', JSON.stringify({ caught: ids, round: ids, rounds: 1 })), all)
  await p.reload()
  await p.waitForTimeout(1200)
  await p.getByRole('button', { name: 'Tus gatos' }).click()
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${shots}/t2-over-tus-gatos.png` })
  await context.close()
}
```

Read every `t2-*.png`. Judge:

- **Before the party:** Chona leaps over the top edge of Inicio's card; Chori sprawls at the corner of Dónde's map; Minina sits beside the wax seal on the letter and Chavela keeps her spot at the letter's left; Mishona and Kiri kiri are on Cuándo. No cat covers a word, the date, the address, or a button. In boceto (the early pages) the cats are pencil; the coats show from tinta on.
- **Chona's card** (`t2-*-card-chona.png`): `Poco común`, her name, and `Llega corriendo y no se queda quieta.`, her white-and-silver coat reading clearly on the bone card in both themes. The quest log reads `Gatos 1/10`.
- **After the party:** Inicio holds Chona, Minina, and Chavela; Palabra holds Choni, Delilah, and Chori; none overlaps another or the text.
- **Tus gatos** lists all ten with their names and lines, in the table's order, and reads `10 de 10`.
- With motion allowed, Chona dashes and looks back, Chori rocks, and Minina swats toward the seal (watch the book for a few seconds on each page).

A perch that crowds text is a CSS change in `src/index.css` (`.perch-*`). Stop the dev server afterwards.

- [ ] **Step 9: Commit.**

```bash
git add src/content.ts src/content.test.ts src/tuning.ts src/index.css src/logic/noticing.ts src/logic/noticing.test.ts src/logic/catState.test.ts src/logic/progress.ts src/logic/progress.test.ts src/components/QuestLog.tsx src/components/QuestLog.test.tsx src/components/Collection.tsx src/components/Pages.tsx src/components/Confirmation.tsx src/components/Room.test.tsx src/components/RoomCamera.test.tsx src/components/App.test.tsx
git commit -m "$(cat <<'EOF'
Name the family's ten cats, perch the new ones, move all ten onto the four pages after the party, and count out of ten

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: The gift QR

**Files:**
- Modify: `package.json`, `package-lock.json` (the two libraries), `src/content.ts` (`shared.giftQr`, `copy.gift`, `copy.qrHint`; `giftLead` and `giftOffer` go), `src/tuning.ts` (`tuning.qr`), `src/components/Gift.tsx`, `src/assets.ts`, `src/components/App.tsx`, `src/components/WorldRoom.tsx`, `src/components/FlatRoom.tsx`, `src/components/Pages.tsx`, `src/styles/pages.css`, `src/test/helpers.tsx`
- Create: `src/logic/qr.ts`, `src/components/GiftQr.tsx`
- Test: `src/logic/qr.test.ts` (new), `src/components/Gift.test.tsx`, `src/components/Room.test.tsx`, `src/components/App.test.tsx`, `src/components/RoomCamera.test.tsx`

**Interfaces:**
- **Consumes:** `copy.qrAlt`, `copy.qrPending`, `copy.qrSave`; `tuning.qr.minPx`; `GiftBox` (`open`, `perch`, `children`, `below`); `bookQrPx` and `--qr-px` from the book (unchanged).
- **Produces:**
  - `shared.giftQr: string`, the 369-character payload; `copy.gift`, `copy.qrHint` (`copy.giftLead` and `copy.giftOffer` are removed).
  - `tuning.qr = { minPx: 220, screenLevel: 'H', downloadLevel: 'M', quiet: 4, module: 1, eyeOuter: 2, eyeInner: 1.3, eyePupil: 0.9, emblemShare: 0.22, maxEmblemShare: 0.1, downloadPx: 1024, revokeUrlMs: 10000 }`.
  - `src/logic/qr.ts`: `type QrLevel = 'L' | 'M' | 'Q' | 'H'`; `interface QrMatrix { size: number; modules: readonly (readonly boolean[])[] }`; `interface ModuleRect { row: number; col: number; size: number }`; `interface ModuleRun { row: number; from: number; to: number }`; `interface QrRaster { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer>; cell: number; offset: number }`; `qrMatrix(payload: string, level: QrLevel): QrMatrix`; `finderPatterns(size: number): ModuleRect[]`; `alignmentCentres(size: number): number[]`; `alignmentPatterns(size: number): ModuleRect[]`; `overlaps(a: ModuleRect, b: ModuleRect): boolean`; `inside(rect: ModuleRect, row: number, col: number): boolean`; `emblemRect(size: number): ModuleRect`; `moduleRuns(matrix: QrMatrix, skip: readonly ModuleRect[]): ModuleRun[]`; `interface ScreenCode { matrix; eyes; emblem; runs }`; `screenCode(payload: string): ScreenCode`; `rasterize(matrix: QrMatrix, sizePx: number, options?: { quiet?: number; light?: ModuleRect }): QrRaster`; `downloadRaster(payload: string): QrRaster`.
  - `src/components/GiftQr.tsx`: `GiftQr({ payload, size }: { payload: string; size: string })` (an `<svg role="img" aria-label={copy.qrAlt}>` with `.gift-qr-paper`, `.gift-qr-modules`, six `.gift-qr-eye` paths, and `.gift-qr-emblem`); `qrPng(payload: string): Blob | null`.
  - `src/components/Gift.tsx`: `saveQr(png: Blob): Promise<void>`; `Gift` takes `qrPayload: string` instead of `qrUrl`. The save button has the class `gift-save-button`, holds `svg.gift-save-cat` (with `.gift-save-cat-arrow`) and the text `Guardar QR`, and is followed by `p.gift-hint`.
  - `qrUrl: string | undefined` becomes `qrPayload: string` in `RoomProps` (`FlatRoom`), `WorldRoom`'s pages, `usePages`, and `Pages`; `App` takes `qrPayload?: string` (default `shared.giftQr`); `renderRoom({ qrPayload })` in `src/test/helpers.tsx` defaults to `shared.giftQr`.
  - `src/assets.ts` exports only `ambienceUrl` (the `qr.png` glob is gone).

- [ ] **Step 1: Install the two libraries, pinned.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npm install --save-exact qrcode-generator@2.0.4 && npm install --save-exact --save-dev jsqr@1.4.0 && git diff package.json
```

Expected: the diff adds exactly `"qrcode-generator": "2.0.4",` under `dependencies` (after `@react-three/fiber`) and `"jsqr": "1.4.0",` under `devDependencies` (after `jsdom`), and `package-lock.json` changes with them.

- [ ] **Step 2: Write the failing tests.** `qr.test.ts` decodes both renderings with `jsqr` and pins the emblem, the runs, and the download's pixels (Review Focus 2); `Gift.test.tsx` checks the share and download paths and that the canvas paints exactly the tested raster; the room and app tests move from an image URL to the payload.

Create `src/logic/qr.test.ts`:

```ts
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { shared } from '../content'
import { tuning } from '../tuning'
import {
  alignmentCentres,
  alignmentPatterns,
  downloadRaster,
  emblemRect,
  finderPatterns,
  inside,
  moduleRuns,
  overlaps,
  qrMatrix,
  rasterize,
  screenCode,
  type QrRaster,
} from './qr'

const payload = shared.giftQr
const decode = (raster: QrRaster) => jsQR(raster.data, raster.width, raster.height, { inversionAttempts: 'dontInvert' })?.data

describe('the gift QR payload (spec §2)', () => {
  it('is the bank payload: 369 characters of base64-like text', () => {
    expect(payload).toHaveLength(369)
    expect(payload).toMatch(/^[A-Za-z0-9+/=|]+$/)
  })
})

describe('the two matrices (spec §2 Encoder)', () => {
  it('encodes the screen code at error correction H and the download at M', () => {
    // H needs version 20 (97 modules) for 369 bytes; M needs version 15 (77 modules).
    expect(qrMatrix(payload, 'H').size).toBe(97)
    expect(qrMatrix(payload, 'M').size).toBe(77)
    expect(screenCode(payload).matrix.size).toBe(qrMatrix(payload, tuning.qr.screenLevel).size)
  })

  it('knows where the alignment patterns sit', () => {
    expect(alignmentCentres(97)).toEqual([6, 34, 62, 90])
    expect(alignmentCentres(77)).toEqual([6, 26, 48, 70])
    expect(alignmentCentres(69)).toEqual([6, 34, 62])
    expect(alignmentPatterns(97)).toHaveLength(13)
  })

  it('decodes the screen code back to the exact payload, with the emblem\'s modules forced light', () => {
    const { matrix, emblem } = screenCode(payload)
    const raster = rasterize(matrix, (matrix.size + 2 * tuning.qr.quiet) * 4, { light: emblem })
    expect(decode(raster)).toBe(payload)
  })

  it('decodes the downloaded image back to the exact payload', () => {
    expect(decode(downloadRaster(payload))).toBe(payload)
  })
})

describe('the emblem (spec §2 On screen)', () => {
  const { matrix, emblem, eyes } = screenCode(payload)

  it('sits in the centre and covers at most 10% of the code', () => {
    expect(emblem.size).toBeGreaterThan(0)
    expect(emblem.size % 2).toBe(1)
    expect(emblem.row).toBe((matrix.size - emblem.size) / 2)
    expect(emblem.col).toBe(emblem.row)
    expect(emblem.size ** 2 / matrix.size ** 2).toBeLessThanOrEqual(tuning.qr.maxEmblemShare)
    expect(tuning.qr.maxEmblemShare).toBeLessThanOrEqual(0.1)
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

  it('leaves the finder patterns to the eyes, which match the code\'s own finders', () => {
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

// Review Focus 2: the downloaded PNG, imported into a bank app's "scan from gallery".
describe('the download (spec §2 Download)', () => {
  const raster = downloadRaster(payload)

  it('is a square of the download size, pure black on pure white', () => {
    expect(raster.width).toBe(tuning.qr.downloadPx)
    expect(raster.height).toBe(tuning.qr.downloadPx)
    const values = new Set(raster.data)
    expect([...values].sort((a, b) => a - b)).toEqual([0, 255])
    // Every pixel is opaque.
    for (let i = 3; i < raster.data.length; i += 4) if (raster.data[i] !== 255) throw new Error(`alpha at ${i}`)
  })

  it('keeps a clean white quiet zone of at least 4 modules on every side', () => {
    const size = qrMatrix(payload, tuning.qr.downloadLevel).size
    expect(raster.offset).toBeGreaterThanOrEqual(4 * raster.cell)
    expect(tuning.qr.downloadPx - raster.offset - size * raster.cell).toBeGreaterThanOrEqual(4 * raster.cell)
    const dark = (x: number, y: number) => raster.data[(y * raster.width + x) * 4] === 0
    for (let y = 0; y < raster.height; y++) {
      for (let x = 0; x < raster.width; x++) {
        const inCode =
          x >= raster.offset && x < raster.offset + size * raster.cell && y >= raster.offset && y < raster.offset + size * raster.cell
        if (!inCode && dark(x, y)) throw new Error(`a dark pixel in the quiet zone at ${x},${y}`)
      }
    }
  })

  it('draws the plain code with no emblem: every dark module of the M matrix is black', () => {
    const matrix = qrMatrix(payload, tuning.qr.downloadLevel)
    const centre = Math.floor(matrix.size / 2)
    const pixel = (row: number, col: number) =>
      raster.data[((raster.offset + row * raster.cell + 1) * raster.width + raster.offset + col * raster.cell + 1) * 4]
    for (let row = centre - 5; row <= centre + 5; row++) {
      for (let col = centre - 5; col <= centre + 5; col++) expect(pixel(row, col)).toBe(matrix.modules[row]![col] ? 0 : 255)
    }
  })
})
```

In `src/components/Gift.test.tsx`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveQr } from './Gift'
import pagesCss from '../styles/pages.css?raw'

describe('US-4 AC4 Guardar QR', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: async () => new Blob(['png'], { type: 'image/png' }) })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'canShare')
    Reflect.deleteProperty(navigator, 'share')
  })

  it('shares the image file when the browser can share files', async () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr('/qr.png')
    expect(share).toHaveBeenCalledTimes(1)
    const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }]
    expect(files[0]).toBeInstanceOf(File)
    expect(files[0]!.type).toBe('image/png')
    expect(click).not.toHaveBeenCalled()
  })

  it('downloads the image otherwise, and opens no bank link', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.getAttribute('href')).toBe('/qr.png')
      expect(this.download).toBe('qr-regalo-mia.png')
    })
    await saveQr('/qr.png')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('does nothing more when the guest cancels the share sheet', async () => {
```

Replace with:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shared } from '../content'
import { downloadRaster } from '../logic/qr'
import { tuning } from '../tuning'
import { saveQr } from './Gift'
import { qrPng } from './GiftQr'
import pagesCss from '../styles/pages.css?raw'

describe('US-4 AC4 Guardar QR', () => {
  const png = new Blob(['png'], { type: 'image/png' })

  beforeEach(() => {
    // jsdom has no object URLs.
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:qr-regalo') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  })

  afterEach(() => {
    vi.useRealTimers()
    Reflect.deleteProperty(navigator, 'canShare')
    Reflect.deleteProperty(navigator, 'share')
    Reflect.deleteProperty(URL, 'createObjectURL')
    Reflect.deleteProperty(URL, 'revokeObjectURL')
  })

  it('shares the PNG as qr-regalo-mia.png when the browser can share files', async () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr(png)
    expect(share).toHaveBeenCalledTimes(1)
    const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }]
    expect(files[0]).toBeInstanceOf(File)
    expect(files[0]!.name).toBe('qr-regalo-mia.png')
    expect(files[0]!.type).toBe('image/png')
    expect(click).not.toHaveBeenCalled()
  })

  it('downloads the PNG otherwise, lets its URL go afterwards, and opens no bank link', async () => {
    vi.useFakeTimers()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.getAttribute('href')).toBe('blob:qr-regalo')
      expect(this.download).toBe('qr-regalo-mia.png')
    })
    await saveQr(png)
    expect(click).toHaveBeenCalledTimes(1)
    expect(URL.createObjectURL).toHaveBeenCalledWith(png)
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(tuning.qr.revokeUrlMs)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:qr-regalo')
  })

  it('does nothing more when the guest cancels the share sheet', async () => {
```

2. Find:

```tsx
      },
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr('/qr.png')
    expect(click).not.toHaveBeenCalled()
  })
})

// The open gift box's folded pieces are invisible but still hit-tested; the front's fold used to
// cover Guardar QR, so a tap on the button landed on the box and saved nothing.
describe('the open gift box lets taps through', () => {
```

Replace with:

```tsx
      },
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr(png)
    expect(click).not.toHaveBeenCalled()
  })
})

// Spec §2 Download: the PNG is the tested raster, drawn on a canvas, 1024 px, black on white.
describe('the downloaded PNG', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('paints exactly the download raster on a canvas of the download size, and encodes it as PNG', () => {
    const putImageData = vi.fn()
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue({ putImageData } as unknown as CanvasRenderingContext2D)
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,iVBORw0KGgo=')
    vi.stubGlobal(
      'ImageData',
      class {
        constructor(
          public data: Uint8ClampedArray,
          public width: number,
          public height: number,
        ) {}
      },
    )
    const blob = qrPng(shared.giftQr)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob!.type).toBe('image/png')
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    const [image, x, y] = putImageData.mock.calls[0] as [{ data: Uint8ClampedArray; width: number; height: number }, number, number]
    expect([image.width, image.height, x, y]).toEqual([tuning.qr.downloadPx, tuning.qr.downloadPx, 0, 0])
    // The same pixels the decode test reads (compared by hand: 4 MB is too big for toEqual).
    const expected = downloadRaster(shared.giftQr).data
    expect(image.data).toHaveLength(expected.length)
    expect(image.data.every((value, i) => value === expected[i])).toBe(true)
  })

  it('has nothing to save where the browser has no canvas', () => {
    expect(qrPng(shared.giftQr)).toBeNull()
  })
})

// The open gift box's folded pieces are invisible but still hit-tested; the front's fold used to
// cover Guardar QR, so a tap on the button landed on the box and saved nothing.
describe('the open gift box lets taps through', () => {
```

In `src/test/helpers.tsx`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { FlatRoom } from '../components/FlatRoom'
import type { CatId, DayId } from '../content'
import type { BattleCat } from '../logic/battle'
import { emptyCatState, type CatState } from '../logic/catState'
import { emptyProgress, type Progress } from '../logic/progress'
```

Replace with:

```tsx
import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { FlatRoom } from '../components/FlatRoom'
import { shared, type CatId, type DayId } from '../content'
import type { BattleCat } from '../logic/battle'
import { emptyCatState, type CatState } from '../logic/catState'
import { emptyProgress, type Progress } from '../logic/progress'
```

2. Find:

```tsx
  onGreet?: (id: CatId) => void
  onChallenge?: (id: BattleCat) => void
  musicPlaying?: boolean
  qrUrl?: string
  progress?: Progress
}
```

Replace with:

```tsx
  onGreet?: (id: CatId) => void
  onChallenge?: (id: BattleCat) => void
  musicPlaying?: boolean
  qrPayload?: string
  progress?: Progress
}
```

3. Find:

```tsx
    onGreet,
    onChallenge,
    musicPlaying: options.musicPlaying ?? false,
    qrUrl: options.qrUrl,
    progress: options.progress ?? emptyProgress,
    onEvent,
    onFirstMove,
```

Replace with:

```tsx
    onGreet,
    onChallenge,
    musicPlaying: options.musicPlaying ?? false,
    qrPayload: options.qrPayload ?? shared.giftQr,
    progress: options.progress ?? emptyProgress,
    onEvent,
    onFirstMove,
```

In `src/components/Room.test.tsx`, make these 7 replacements (each block to find appears exactly once):

1. Find:

```tsx
    const glide = () => advance(tuning.camera.glideMs + 50)

    it('opens the map and the gift box as soon as their pages come into view, before they are found', () => {
      renderRoom({ qrUrl: '/qr.png' })
      // Both pages start off screen, so their objects wait to play.
      expect(document.querySelector('.treasure-map')).not.toHaveClass('is-unrolled')
      expect(document.querySelector('.gift-box')).not.toHaveClass('is-open')
```

Replace with:

```tsx
    const glide = () => advance(tuning.camera.glideMs + 50)

    it('opens the map and the gift box as soon as their pages come into view, before they are found', () => {
      renderRoom()
      // Both pages start off screen, so their objects wait to play.
      expect(document.querySelector('.treasure-map')).not.toHaveClass('is-unrolled')
      expect(document.querySelector('.gift-box')).not.toHaveClass('is-open')
```

2. Find:

```tsx
  })

  it('opens the gift box when something inside it takes focus', () => {
    renderRoom({ qrUrl: '/qr.png' })
    act(() => screen.getByRole('button', { name: copy.qrSave }).focus())
    expect(document.querySelector('.gift-box')).toHaveClass('is-open')
  })

  it('shows the pending sentence inside the box when there is no QR', () => {
    renderRoom({ qrUrl: undefined })
    expect(document.querySelector('.gift-box')).toContainElement(screen.getByText(copy.qrPending))
  })

  it('reports Guardar QR and Confirmar por WhatsApp as progress events', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    try {
      const { onEvent } = renderRoom({ qrUrl: '/qr.png' })
      fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
      expect(onEvent).toHaveBeenCalledWith({ type: 'savedQr' })
      fireEvent.click(screen.getByRole('link', { name: copy.confirm }))
      expect(onEvent).toHaveBeenCalledWith({ type: 'confirmed' })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('presses the wax seal once the invitation is sealed', () => {
```

Replace with:

```tsx
  })

  it('opens the gift box when something inside it takes focus', () => {
    renderRoom()
    act(() => screen.getByRole('button', { name: copy.qrSave }).focus())
    expect(document.querySelector('.gift-box')).toHaveClass('is-open')
  })

  it('shows the pending sentence inside the box when the payload is empty', () => {
    renderRoom({ qrPayload: '' })
    expect(document.querySelector('.gift-box')).toContainElement(screen.getByText(copy.qrPending))
  })

  it('reports Guardar QR and Confirmar por WhatsApp as progress events', () => {
    const { onEvent } = renderRoom()
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'savedQr' })
    fireEvent.click(screen.getByRole('link', { name: copy.confirm }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'confirmed' })
  })

  it('presses the wax seal once the invitation is sealed', () => {
```

3. Find:

```tsx
})

describe('US-4 See the gift QR', () => {
  it('shows the image with its alternative text, on a plate at the minimum size (AC1)', () => {
    renderRoom({ qrUrl: '/qr-fixture.png' })
    const img = screen.getByRole('img', { name: copy.qrAlt })
    expect(img).toHaveAttribute('src', '/qr-fixture.png')
    expect(img).toHaveAttribute('width', String(tuning.qr.minPx))
    expect(img.closest('.qr-plate')).not.toBeNull()
  })

  it('shows the pending sentence, no image, and no Guardar QR when the file is missing (AC2)', () => {
    renderRoom({ qrUrl: undefined })
    expect(screen.getByText(copy.qrPending)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: copy.qrAlt })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
  })

  it('leads with presence and the offer, and names no amount, bank, or account (AC3)', () => {
    renderRoom()
    expect(screen.getByText(copy.giftLead)).toBeInTheDocument()
    expect(screen.getByText(copy.giftOffer)).toBeInTheDocument()
    const text = landmark('presente')?.textContent ?? ''
    expect(text).not.toMatch(/Bs\.?|\d+\s?bs|banco|cuenta/i)
  })
})
```

Replace with:

```tsx
})

describe('US-4 See the gift QR', () => {
  it('draws the QR from its payload, with its alternative text, on a plate at the minimum size (AC1, spec §2)', () => {
    renderRoom()
    const qr = screen.getByRole('img', { name: copy.qrAlt })
    expect(qr.tagName.toLowerCase()).toBe('svg')
    expect(qr).toHaveAttribute('width', String(tuning.qr.minPx))
    expect(qr.closest('.qr-plate')).not.toBeNull()
    // Three rounded finder eyes (a ring and a pupil each), the modules, and the cat emblem.
    expect(qr.querySelectorAll('.gift-qr-eye')).toHaveLength(6)
    expect(qr.querySelector('.gift-qr-modules')).not.toBeNull()
    expect(qr.querySelector('.gift-qr-emblem')).not.toBeNull()
  })

  it('shows the pending sentence, no QR, and no Guardar QR when the payload is empty (AC2)', () => {
    renderRoom({ qrPayload: '' })
    expect(screen.getByText(copy.qrPending)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: copy.qrAlt })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
    expect(screen.queryByText(copy.qrHint)).not.toBeInTheDocument()
  })

  it('leads with presence in one line, and names no amount, bank, or account (AC3, spec §4)', () => {
    renderRoom()
    const gift = within(landmark('presente') as HTMLElement)
    expect(gift.getByText(copy.gift)).toBeInTheDocument()
    expect(copy.gift).toBe(
      'El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.',
    )
    const text = landmark('presente')?.textContent ?? ''
    expect(text).not.toMatch(/Bs\.?|\d+\s?bs|banco|cuenta/i)
    expect(text).not.toContain(shared.giftQr)
  })

  it('makes Guardar QR a cat button: a drawn cat face with a download arrow beside the text, and the hint below', () => {
    renderRoom()
    const button = screen.getByRole('button', { name: copy.qrSave })
    expect(button.querySelector('svg.gift-save-cat')).toHaveAttribute('aria-hidden', 'true')
    expect(button.querySelector('.gift-save-cat-arrow')).not.toBeNull()
    expect(button).toHaveTextContent(copy.qrSave)
    const hint = screen.getByText(copy.qrHint)
    expect(copy.qrHint).toBe('Toca el gatito para guardar el QR en tu celular.')
    expect(button.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // Delilah still perches on the gift box.
    expect(document.querySelector('.gift-box .qr-perch [data-cat-id="nana"]')).not.toBeNull()
  })
})
```

4. Find:

```tsx
    expect(screen.queryByText(shared.city)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: copy.map })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: copy.confirm })).not.toBeInTheDocument()
    expect(screen.queryByText(copy.giftOffer)).not.toBeInTheDocument()
    expect(screen.queryByText(copy.qrPending)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
```

Replace with:

```tsx
    expect(screen.queryByText(shared.city)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: copy.map })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: copy.confirm })).not.toBeInTheDocument()
    expect(screen.queryByText(copy.gift)).not.toBeInTheDocument()
    expect(screen.queryByText(copy.qrPending)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
```

5. Find:

```tsx
  }

  it('removes the place, confirm, gift, countdown, and their signposts at the Saturday cutoff (AC3)', () => {
    renderRoom({ day: 'sat', now: satCutoff, qrUrl: '/qr.png' })
    expectOver()
  })
```

Replace with:

```tsx
  }

  it('removes the place, confirm, gift, countdown, and their signposts at the Saturday cutoff (AC3)', () => {
    renderRoom({ day: 'sat', now: satCutoff })
    expectOver()
  })
```

6. Find:

```tsx
    })

    it('tilts the QR when tapped, then lays it flat again (AC4)', () => {
      renderRoom({ qrUrl: '/qr.png' })
      const plate = document.querySelector('.qr-plate')!
      fireEvent.click(plate)
      expect(plate).toHaveClass('is-tilting')
```

Replace with:

```tsx
    })

    it('tilts the QR when tapped, then lays it flat again (AC4)', () => {
      renderRoom()
      const plate = document.querySelector('.qr-plate')!
      fireEvent.click(plate)
      expect(plate).toHaveClass('is-tilting')
```

7. Find:

```tsx
    })

    it('does not play the tilt from Guardar QR', () => {
      renderRoom({ qrUrl: '/qr.png' })
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
      fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
      expect(document.querySelector('.qr-plate')).not.toHaveClass('is-tilting')
      vi.unstubAllGlobals()
    })

    it('startles Chavela at an empty spot near the button, and never from the link itself (AC5)', () => {
```

Replace with:

```tsx
    })

    it('does not play the tilt from Guardar QR', () => {
      renderRoom()
      fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
      expect(document.querySelector('.qr-plate')).not.toHaveClass('is-tilting')
    })

    it('startles Chavela at an empty spot near the button, and never from the link itself (AC5)', () => {
```

In `src/components/App.test.tsx`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```tsx

describe('US-8 Enter only with the link I was sent', () => {
  it('shows the gate with both sentences, and no date, place, WhatsApp, or QR (AC4, SC-3)', () => {
    render(<App search="" qrUrl="/qr.png" />)
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
    const text = document.body.textContent ?? ''
```

Replace with:

```tsx

describe('US-8 Enter only with the link I was sent', () => {
  it('shows the gate with both sentences, and no date, place, WhatsApp, or QR (AC4, SC-3)', () => {
    render(<App search="" />)
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
    const text = document.body.textContent ?? ''
```

2. Find:

```tsx
  })

  it('earns QR guardado from Guardar QR', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<App search="?e=n4vk" qrUrl="/qr.png" />)
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    expect(toast()).toHaveTextContent(gameCopy.badges.qrGuardado)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.badgeXp.qrGuardado))
```

Replace with:

```tsx
  })

  it('earns QR guardado from Guardar QR', () => {
    render(<App search="?e=n4vk" />)
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    expect(toast()).toHaveTextContent(gameCopy.badges.qrGuardado)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.badgeXp.qrGuardado))
```

3. Find:

```tsx

  it('shows every object already open with reduced motion: the gift box with the QR, and the map', () => {
    window.__prefersReducedMotion = true
    render(<App search="?e=n4vk" qrUrl="/qr.png" />)
    const box = document.querySelector<HTMLElement>('.gift-box')!
    expect(box).toHaveClass('is-open')
    expect(within(box).getByRole('img', { name: copy.qrAlt })).toBeInTheDocument()
```

Replace with:

```tsx

  it('shows every object already open with reduced motion: the gift box with the QR, and the map', () => {
    window.__prefersReducedMotion = true
    render(<App search="?e=n4vk" />)
    const box = document.querySelector<HTMLElement>('.gift-box')!
    expect(box).toHaveClass('is-open')
    expect(within(box).getByRole('img', { name: copy.qrAlt })).toBeInTheDocument()
```

In `src/components/RoomCamera.test.tsx`, make these 5 replacements (each block to find appears exactly once):

1. Find:

```tsx
  })

  it('does not drag when the press starts on a link, a button, or the QR', () => {
    renderRoom({ qrUrl: '/qr.png' })
    const x0 = cameraX()
    drag(screen.getByRole('link', { name: copy.map }), [300, 400], [100, 400])
    drag(screen.getByRole('button', { name: copy.qrSave }), [300, 400], [100, 400])
```

Replace with:

```tsx
  })

  it('does not drag when the press starts on a link, a button, or the QR', () => {
    renderRoom()
    const x0 = cameraX()
    drag(screen.getByRole('link', { name: copy.map }), [300, 400], [100, 400])
    drag(screen.getByRole('button', { name: copy.qrSave }), [300, 400], [100, 400])
```

2. Find:

```tsx
      onGreet={vi.fn()}
      onChallenge={vi.fn()}
      musicPlaying={false}
      qrUrl={undefined}
      progress={emptyProgress}
      onEvent={vi.fn()}
      theme="dark"
```

Replace with:

```tsx
      onGreet={vi.fn()}
      onChallenge={vi.fn()}
      musicPlaying={false}
      qrPayload={shared.giftQr}
      progress={emptyProgress}
      onEvent={vi.fn()}
      theme="dark"
```

3. Find:

```tsx
        onGreet={vi.fn()}
        onChallenge={vi.fn()}
        musicPlaying={false}
        qrUrl={undefined}
        progress={emptyProgress}
        onEvent={vi.fn()}
        theme="light"
```

Replace with:

```tsx
        onGreet={vi.fn()}
        onChallenge={vi.fn()}
        musicPlaying={false}
        qrPayload={shared.giftQr}
        progress={emptyProgress}
        onEvent={vi.fn()}
        theme="light"
```

4. Find:

```tsx

  it('draws the QR in the book large enough to stay at its minimum size on a page at its smallest', async () => {
    world.mode = 'ready'
    renderWorldRoom({ qrUrl: '/qr.png' })
    await bookReady()
    expect(worldSurface().style.getPropertyValue('--qr-px')).toBe(`${bookQrPx}px`)
    expect(screen.getByRole('img', { name: copy.qrAlt }).style.width).toBe(`var(--qr-px, ${tuning.qr.minPx}px)`)
```

Replace with:

```tsx

  it('draws the QR in the book large enough to stay at its minimum size on a page at its smallest', async () => {
    world.mode = 'ready'
    renderWorldRoom()
    await bookReady()
    expect(worldSurface().style.getPropertyValue('--qr-px')).toBe(`${bookQrPx}px`)
    expect(screen.getByRole('img', { name: copy.qrAlt }).style.width).toBe(`var(--qr-px, ${tuning.qr.minPx}px)`)
```

5. Find:

```tsx
  })

  it('draws the book with no shadow map and fewer particles, and still shows every fact', async () => {
    renderWorldRoom({ qrUrl: '/qr.png' })
    await bookReady()
    expect(screen.getByTestId('world')).toHaveAttribute('data-tier', 'low')
    expect(bookCanvas('low').shadows).toBe(false)
```

Replace with:

```tsx
  })

  it('draws the book with no shadow map and fewer particles, and still shows every fact', async () => {
    renderWorldRoom()
    await bookReady()
    expect(screen.getByTestId('world')).toHaveAttribute('data-tier', 'low')
    expect(bookCanvas('low').shadows).toBe(false)
```

- [ ] **Step 3: Run them to see them fail.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/logic/qr.test.ts src/components/Gift.test.tsx src/components/Room.test.tsx src/components/App.test.tsx src/components/RoomCamera.test.tsx
```

Expected: FAIL. `qr.test.ts` and `Gift.test.tsx` fail to load (`Failed to resolve import`: `src/logic/qr.ts` and `src/components/GiftQr.tsx` do not exist yet); 17 room, app, and book tests fail, among them "draws the QR from its payload…", "shows the pending sentence, no QR, and no Guardar QR when the payload is empty", "makes Guardar QR a cat button…", and "earns QR guardado from Guardar QR".

- [ ] **Step 4: Store the payload and the new copy.** The payload below is the bank QR's, decoded locally with `jsqr` from `ideas/QR-code-cutoff.png`: 369 characters, verbatim.

In `src/content.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=-17.73170923809386,-63.15786528996242',
  timezone: 'America/La_Paz',
  clockTime: '16:00',
} as const

export const days: Record<DayId, DayRecord> = {
```

Replace with:

```ts
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=-17.73170923809386,-63.15786528996242',
  timezone: 'America/La_Paz',
  clockTime: '16:00',
  // Spec §2: the Banco Ganadero transfer QR's payload, verbatim, decoded locally from the host's
  // QR (a version-13 code). It holds no readable name or account number. The screen draws it in the
  // invitation's style and Guardar QR saves a plain copy. The bank's QR expires on 27 September 2027.
  giftQr:
    'OT2Cu6AJdj75fvrf5Cw+Tp66oN98EjzvOGWbFVd9icyzcc3KE9GoUMIQJVnMpmjMFG8TqUumfb2+GMCElZMNIpyHNOVxQ2lfmZpEhz1LD8+241Y83+rRkwh1dIGPGXm5qqnpyJ1f+M62e+rpy9UjVMWB8GNyl8Opslvo1h/rUMTBah8ZjSpOrwQ+40u6I/WTrbAFX2N563XmUcOZMv6LKHtOcVM8Z6VAyZbUYrLgqoFcF5SAusQe5C0D4dmEkiS7RUWYa0KDCRJ8BgkBrFDlVf2n9xhcbAQMZ5MNXA+4SOjQe4pa8VmuZRrR4Pxrx6Xt/eJE6xZCRWG28f9cg3RhJQ==|169CFCA97CD583D173238CAA',
} as const

export const days: Record<DayId, DayRecord> = {
```

2. Find:

```ts
  moveHint: 'Muévete para explorar',
  verse: 'Los hijos son una herencia de parte de Jehová.',
  verseCitation: 'Salmo 127:3',
  giftLead: 'Lo más importante es que vengas.',
  giftOffer: 'Si quieres tener un detalle, puedes transferir con este QR. El monto lo eliges tú.',
  qrAlt: 'Código QR para transferir un regalo a Mia',
  qrPending: 'El QR estará aquí pronto.',
  qrSave: 'Guardar QR',
  confirm: 'Confirmar por WhatsApp',
  map: 'Ver en el mapa',
  signposts: {
```

Replace with:

```ts
  moveHint: 'Muévete para explorar',
  verse: 'Los hijos son una herencia de parte de Jehová.',
  verseCitation: 'Salmo 127:3',
  gift: 'El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.',
  qrAlt: 'Código QR para transferir un regalo a Mia',
  qrPending: 'El QR estará aquí pronto.',
  qrSave: 'Guardar QR',
  qrHint: 'Toca el gatito para guardar el QR en tu celular.',
  confirm: 'Confirmar por WhatsApp',
  map: 'Ver en el mapa',
  signposts: {
```

In `src/tuning.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
  card: { flipMs: 800, leaveMs: 420 },
  // The battle screen (design §7): the spiral wipe, the typewriter, the bars, and the win burst.
  battleScreen: { wipeMs: 700, typeMs: 26, linePauseMs: 520, barMs: 650, burstMs: 1400 },
  qr: { minPx: 220 },
  acts: {
    throwMs: 900,
    autoMinMs: 7000,
```

Replace with:

```ts
  card: { flipMs: 800, leaveMs: 420 },
  // The battle screen (design §7): the spiral wipe, the typewriter, the bars, and the win burst.
  battleScreen: { wipeMs: 700, typeMs: 26, linePauseMs: 520, barMs: 650, burstMs: 1400 },
  // Spec §2 The gift QR. On screen: error correction H, drawn in rounded runs `module` tall with
  // rounded finder eyes (outer corner radius `eyeOuter`, inner `eyeInner`, the pupil's `eyePupil`, in
  // modules), a quiet zone of `quiet` modules, and a cat emblem in the centre about `emblemShare` of
  // the code's width, never more than `maxEmblemShare` of its area. The download: error correction
  // M, `downloadPx` square, black on white; its object URL is let go `revokeUrlMs` after the tap.
  qr: {
    minPx: 220,
    screenLevel: 'H',
    downloadLevel: 'M',
    quiet: 4,
    module: 1,
    eyeOuter: 2,
    eyeInner: 1.3,
    eyePupil: 0.9,
    emblemShare: 0.22,
    maxEmblemShare: 0.1,
    downloadPx: 1024,
    revokeUrlMs: 10000,
  },
  acts: {
    throwMs: 900,
    autoMinMs: 7000,
```

- [ ] **Step 5: Build the matrices, the emblem, the runs, and the raster.**

Create `src/logic/qr.ts`:

```ts
import qrcode from 'qrcode-generator'
import { tuning } from '../tuning'

// Spec §2 The gift QR: the bank's payload re-encoded here, so the screen can draw it in the
// invitation's style and Guardar QR can save a plain copy. Pure: no DOM.

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

export interface QrRaster {
  width: number
  height: number
  // RGBA, 4 bytes a pixel, black or white only.
  data: Uint8ClampedArray<ArrayBuffer>
  // How many pixels one module is, and where the code starts (the white margin), in pixels.
  cell: number
  offset: number
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

// What the screen draws (spec §2 On screen): the H matrix, its three eyes, its emblem, and the rest of
// its dark modules as runs.
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

// The code as pixels: black modules on white, a quiet zone of at least `quiet` modules, `sizePx`
// square. Each module is a whole number of pixels; the pixels left over widen the white margin.
// Modules inside `light` are left white (the screen's emblem, for the decode test).
export function rasterize(matrix: QrMatrix, sizePx: number, options: { quiet?: number; light?: ModuleRect } = {}): QrRaster {
  const quiet = options.quiet ?? tuning.qr.quiet
  const cell = Math.floor(sizePx / (matrix.size + 2 * quiet))
  if (cell < 1) throw new Error(`A ${sizePx} px image cannot hold a ${matrix.size}-module code`)
  const offset = Math.floor((sizePx - cell * matrix.size) / 2)
  const data = new Uint8ClampedArray(sizePx * sizePx * 4).fill(255)
  matrix.modules.forEach((line, row) => {
    line.forEach((dark, col) => {
      if (!dark || (options.light && inside(options.light, row, col))) return
      for (let y = offset + row * cell; y < offset + (row + 1) * cell; y++) {
        for (let x = offset + col * cell; x < offset + (col + 1) * cell; x++) {
          const i = (y * sizePx + x) * 4
          data[i] = 0
          data[i + 1] = 0
          data[i + 2] = 0
        }
      }
    })
  })
  return { width: sizePx, height: sizePx, data, cell, offset }
}

// The download (spec §2 Download): the M matrix, no emblem, black on white, `downloadPx` square.
export function downloadRaster(payload: string): QrRaster {
  return rasterize(qrMatrix(payload, tuning.qr.downloadLevel), tuning.qr.downloadPx)
}
```

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/logic/qr.test.ts
```

Expected: PASS, 13 tests (the screen code decodes with its emblem forced light; the download decodes at 1024 px).

- [ ] **Step 6: Draw the QR, and save the PNG.**

Create `src/components/GiftQr.tsx`:

```tsx
import { useMemo } from 'react'
import { copy } from '../content'
import { downloadRaster, screenCode, type ModuleRect, type ModuleRun } from '../logic/qr'
import { tuning } from '../tuning'

// A rounded rectangle as path data.
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  return (
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  )
}

// A finder eye: a rounded 7×7 ring and a rounded 3×3 pupil, ink on bone.
function Eye({ at }: { at: ModuleRect }) {
  const { eyeOuter, eyeInner, eyePupil } = tuning.qr
  const { col: x, row: y } = at
  return (
    <>
      <path className="gift-qr-eye" fillRule="evenodd" d={`${roundedRect(x, y, 7, 7, eyeOuter)}${roundedRect(x + 1, y + 1, 5, 5, eyeInner)}`} />
      <path className="gift-qr-eye" d={roundedRect(x + 2, y + 2, 3, 3, eyePupil)} />
    </>
  )
}

// The cat emblem where the bank's $ was: a small ink cat face in a 24-unit box, fitted to its square.
function Emblem({ at }: { at: ModuleRect }) {
  if (at.size === 0) return null
  return (
    <g className="gift-qr-emblem" transform={`translate(${at.col} ${at.row}) scale(${at.size / 24})`}>
      <path
        className="gift-qr-emblem-head"
        d="M5.4 10 L 5 3.2 L 9.8 6.4 C 11.2 5.9, 12.8 5.9, 14.2 6.4 L 19 3.2 L 18.6 10 C 19.6 11.4, 20 12.6, 20 14 C 20 18.4, 16.4 21, 12 21 C 7.6 21, 4 18.4, 4 14 C 4 12.6, 4.4 11.4, 5.4 10 Z"
      />
      <circle className="gift-qr-emblem-eye" cx={9} cy={13.2} r={1.4} />
      <circle className="gift-qr-emblem-eye" cx={15} cy={13.2} r={1.4} />
      <path className="gift-qr-emblem-nose" d="M11 15.6 h2 l-1 1.2 z" />
      <path className="gift-qr-emblem-line" d="M2.6 15 L 6.6 15.5 M2.6 17.4 L 6.6 17 M21.4 15 L 17.4 15.5 M21.4 17.4 L 17.4 17" />
    </g>
  )
}

// Spec §2 On screen: the gift QR as SVG, in the palette. Ink modules on bone paper, in rounded runs,
// with rounded finder eyes, a quiet zone of tuning.qr.quiet modules, and a cat emblem in the centre.
// Each run of dark modules as a filled pill `module` tall with rounded ends. Filled, like the eyes,
// so every module keeps exactly its size and edge at any scale the page is drawn.
function runsPath(runs: readonly ModuleRun[]): string {
  const { module } = tuning.qr
  const r = module / 2
  const top = (1 - module) / 2
  return runs
    .map((run) => {
      const long = run.to - run.from - module
      return `M${run.from + r} ${run.row + top}h${long}a${r} ${r} 0 0 1 0 ${module}h${-long}a${r} ${r} 0 0 1 0 ${-module}z`
    })
    .join('')
}

export function GiftQr({ payload, size }: { payload: string; size: string }) {
  const code = useMemo(() => screenCode(payload), [payload])
  const runs = useMemo(() => runsPath(code.runs), [code])
  const { quiet } = tuning.qr
  const box = code.matrix.size + 2 * quiet
  return (
    <svg
      className="gift-qr"
      role="img"
      aria-label={copy.qrAlt}
      viewBox={`${-quiet} ${-quiet} ${box} ${box}`}
      width={tuning.qr.minPx}
      height={tuning.qr.minPx}
      style={{ width: size, height: size }}
      shapeRendering="geometricPrecision"
    >
      <rect className="gift-qr-paper" x={-quiet} y={-quiet} width={box} height={box} />
      <path className="gift-qr-modules" d={runs} />
      {code.eyes.map((eye) => (
        <Eye key={`${eye.row}-${eye.col}`} at={eye} />
      ))}
      <Emblem at={code.emblem} />
    </svg>
  )
}

// Spec §2 Download: the plain code as a PNG, black on white, drawn on a canvas from the same pixels
// the decode test checks. Null where the browser has no 2D canvas.
export function qrPng(payload: string): Blob | null {
  const raster = downloadRaster(payload)
  const canvas = document.createElement('canvas')
  canvas.width = raster.width
  canvas.height = raster.height
  const context = canvas.getContext('2d')
  if (!context) return null
  context.putImageData(new ImageData(raster.data, raster.width, raster.height), 0, 0)
  const base64 = canvas.toDataURL('image/png').split(',')[1] ?? ''
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  return new Blob([bytes], { type: 'image/png' })
}
```

Replace the whole of `src/components/Gift.tsx` with:

```tsx
import { useRef, type ReactNode } from 'react'
import { copy } from '../content'
import { tuning } from '../tuning'
import { GiftBox } from './GiftBox'
import { GiftQr, qrPng } from './GiftQr'

interface Props {
  // Spec §2: the bank payload (content's shared.giftQr). Empty, and the box shows the pending line.
  qrPayload: string
  // The gift box stands open (the page is found, or motion is reduced).
  open: boolean
  tilting: boolean
  onQrTap: () => void
  // Guardar QR was tapped (the QR guardado badge).
  onSave: () => void
  nana?: ReactNode
}

const fileName = 'qr-regalo-mia.png'
// The QR's size: tuning.qr.minPx, or larger where the room sets --qr-px (the 3D book, whose pages
// may be drawn below their design size).
const qrSize = `var(--qr-px, ${tuning.qr.minPx}px)`

function download(png: Blob) {
  const url = URL.createObjectURL(png)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), tuning.qr.revokeUrlMs)
}

function share(file: File): Promise<void> | null {
  if (typeof navigator.canShare !== 'function' || !navigator.canShare({ files: [file] })) return null
  return navigator.share({ files: [file] })
}

// US-4 AC4: share the file when the browser can share files, otherwise download it. The PNG is
// already drawn, so sharing runs inside the tap itself, which iOS requires.
export async function saveQr(png: Blob): Promise<void> {
  try {
    const sharing = share(new File([png], fileName, { type: 'image/png' }))
    if (sharing) {
      await sharing
      return
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
  }
  download(png)
}

// Spec §2 The cat button: a small drawn cat face with a download arrow.
function SaveCat() {
  return (
    <svg className="gift-save-cat" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        className="gift-save-cat-head"
        d="M7.2 13 L 6.6 4.6 L 12.6 8.6 C 14.8 7.9, 17.2 7.9, 19.4 8.6 L 25.4 4.6 L 24.8 13 C 25.6 14.4, 26 15.8, 26 17.4 C 26 23.2, 21.6 27, 16 27 C 10.4 27, 6 23.2, 6 17.4 C 6 15.8, 6.4 14.4, 7.2 13 Z"
      />
      <circle className="gift-save-cat-eye" cx={11.6} cy={16} r={1.6} />
      <circle className="gift-save-cat-eye" cx={20.4} cy={16} r={1.6} />
      <path className="gift-save-cat-arrow" d="M16 17.6 V 24.4 M12.8 21.4 L 16 24.6 L 19.2 21.4" />
    </svg>
  )
}

// Presente (BR-6, spec §2): one line (presence first, then the QR), the QR drawn in the gift box, and
// Guardar QR as a cat button with its hint below.
export function Gift({ qrPayload, open, tilting, onQrTap, onSave, nana }: Props) {
  // The PNG is drawn on the first tap and kept for the next.
  const png = useRef<{ payload: string; blob: Blob | null } | null>(null)

  const save = qrPayload ? (
    <div className="gift-save">
      <button
        type="button"
        className="button button-secondary gift-save-button"
        onClick={() => {
          if (png.current?.payload !== qrPayload) png.current = { payload: qrPayload, blob: qrPng(qrPayload) }
          // Share first, still inside the tap, as iOS requires; then count it.
          if (png.current.blob) void saveQr(png.current.blob)
          onSave()
        }}
      >
        <SaveCat />
        <span>{copy.qrSave}</span>
      </button>
      <p className="gift-hint">{copy.qrHint}</p>
    </div>
  ) : null

  return (
    <div className="gift">
      <p className="gift-text">{copy.gift}</p>
      <GiftBox open={open} perch={nana} below={save}>
        {qrPayload ? (
          <figure className={`qr-plate${tilting ? ' is-tilting' : ''}`} data-no-drag onClick={onQrTap}>
            <GiftQr payload={qrPayload} size={qrSize} />
          </figure>
        ) : (
          <p className="qr-pending">{copy.qrPending}</p>
        )}
      </GiftBox>
    </div>
  )
}
```

Replace the whole of `src/assets.ts` with:

```ts
// Host-supplied files, detected at build time (§11). A missing file means the feature is absent.
// The gift QR is no longer a file: it is drawn from its payload (content's shared.giftQr, spec §2).

const audioFiles = import.meta.glob<string>('./assets/audio/ambience.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const ambienceUrl: string | undefined = Object.values(audioFiles)[0]
```

- [ ] **Step 7: Pass the payload through the rooms instead of an image URL.**

In `src/components/App.tsx`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ambienceUrl, qrImageUrl } from '../assets'
import type { CatId } from '../content'
import { useCatState } from '../hooks/useCatState'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useMusic } from '../hooks/useMusic'
```

Replace with:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ambienceUrl } from '../assets'
import { shared, type CatId } from '../content'
import { useCatState } from '../hooks/useCatState'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useMusic } from '../hooks/useMusic'
```

2. Find:

```tsx

interface Props {
  search?: string
  qrUrl?: string
  musicUrl?: string
}

// One page. The opening comes from the query string once; the clock, theme, cats, and music
// are the only live inputs (§10 Quality bar).
export function App({ search = window.location.search, qrUrl = qrImageUrl, musicUrl = ambienceUrl }: Props) {
  const opening = useMemo(() => resolveInvite(search), [search])
  const now = useNow()
  const reducedMotion = useReducedMotion()
```

Replace with:

```tsx

interface Props {
  search?: string
  // Spec §2: the gift QR's payload (an empty one shows the pending line).
  qrPayload?: string
  musicUrl?: string
}

// One page. The opening comes from the query string once; the clock, theme, cats, and music
// are the only live inputs (§10 Quality bar).
export function App({ search = window.location.search, qrPayload = shared.giftQr, musicUrl = ambienceUrl }: Props) {
  const opening = useMemo(() => resolveInvite(search), [search])
  const now = useNow()
  const reducedMotion = useReducedMotion()
```

3. Find:

```tsx
            onGreet={onGreet}
            onChallenge={onChallenge}
            musicPlaying={musicPlaying}
            qrUrl={qrUrl}
            progress={progress}
            onEvent={dispatch}
            onFirstMove={onFirstMove}
```

Replace with:

```tsx
            onGreet={onGreet}
            onChallenge={onChallenge}
            musicPlaying={musicPlaying}
            qrPayload={qrPayload}
            progress={progress}
            onEvent={dispatch}
            onFirstMove={onFirstMove}
```

In `src/components/WorldRoom.tsx`, make these 6 replacements (each block to find appears exactly once):

1. Find:

```tsx
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrUrl: string | undefined
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
```

Replace with:

```tsx
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrPayload: string
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
```

2. Find:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  standing,
```

Replace with:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrPayload,
  progress,
  onEvent,
  standing,
```

3. Find:

```tsx
    onGreet,
    onChallenge,
    musicPlaying,
    qrUrl,
    progress,
    onEvent,
    standing,
```

Replace with:

```tsx
    onGreet,
    onChallenge,
    musicPlaying,
    qrPayload,
    progress,
    onEvent,
    standing,
```

4. Find:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  theme,
```

Replace with:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrPayload,
  progress,
  onEvent,
  theme,
```

5. Find:

```tsx
          onGreet={onGreet}
          onChallenge={onChallenge}
          musicPlaying={musicPlaying}
          qrUrl={qrUrl}
          progress={progress}
          onEvent={onEvent}
          standing={standing}
```

Replace with:

```tsx
          onGreet={onGreet}
          onChallenge={onChallenge}
          musicPlaying={musicPlaying}
          qrPayload={qrPayload}
          progress={progress}
          onEvent={onEvent}
          standing={standing}
```

6. Find:

```tsx
      onGreet={room.onGreet}
      onChallenge={room.onChallenge}
      musicPlaying={room.musicPlaying}
      qrUrl={room.qrUrl}
      progress={room.progress}
      onEvent={room.onEvent}
      onFirstMove={room.onFirstMove}
```

Replace with:

```tsx
      onGreet={room.onGreet}
      onChallenge={room.onChallenge}
      musicPlaying={room.musicPlaying}
      qrPayload={room.qrPayload}
      progress={room.progress}
      onEvent={room.onEvent}
      onFirstMove={room.onFirstMove}
```

In `src/components/FlatRoom.tsx`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```tsx
  // Misha and Kira's ¡A jugar! opens the legendary battle (design §7).
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrUrl: string | undefined
  // The game layer (design §6): pages found and badges so far, and where page events go.
  progress: Progress
  onEvent: (event: ProgressEvent) => void
```

Replace with:

```tsx
  // Misha and Kira's ¡A jugar! opens the legendary battle (design §7).
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrPayload: string
  // The game layer (design §6): pages found and badges so far, and where page events go.
  progress: Progress
  onEvent: (event: ProgressEvent) => void
```

2. Find:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  onFirstMove,
```

Replace with:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrPayload,
  progress,
  onEvent,
  onFirstMove,
```

3. Find:

```tsx
    onGreet,
    onChallenge,
    musicPlaying,
    qrUrl,
    progress,
    onEvent,
    standing,
```

Replace with:

```tsx
    onGreet,
    onChallenge,
    musicPlaying,
    qrPayload,
    progress,
    onEvent,
    standing,
```

In `src/components/Pages.tsx`, make these 6 replacements (each block to find appears exactly once):

1. Find:

```tsx
  // The pages standing, or in view, now: their objects open at once, found or not (design §10:
  // the facts are never gated). Once open, an object stays open.
  standing: readonly LandmarkId[]
  qrUrl: string | undefined
  // Reduced motion: every object is already open and settled.
  still: boolean
  // In the book, the family stands in the 3D doorway above the card (spec §6): the card drops its
```

Replace with:

```tsx
  // The pages standing, or in view, now: their objects open at once, found or not (design §10:
  // the facts are never gated). Once open, an object stays open.
  standing: readonly LandmarkId[]
  qrPayload: string
  // Reduced motion: every object is already open and settled.
  still: boolean
  // In the book, the family stands in the 3D doorway above the card (spec §6): the card drops its
```

2. Find:

```tsx
  onEvent,
  progress,
  standing,
  qrUrl,
  still,
  familyInWorld,
}: PagesInput): Record<LandmarkId, ReactNode> {
```

Replace with:

```tsx
  onEvent,
  progress,
  standing,
  qrPayload,
  still,
  familyInWorld,
}: PagesInput): Record<LandmarkId, ReactNode> {
```

3. Find:

```tsx
    presente: (
      <PageCard id="presente" found={found('presente')}>
        <Gift
          qrUrl={qrUrl}
          open={open('presente')}
          tilting={Boolean(active.nanaSit)}
          onQrTap={() => play('nanaSit')}
```

Replace with:

```tsx
    presente: (
      <PageCard id="presente" found={found('presente')}>
        <Gift
          qrPayload={qrPayload}
          open={open('presente')}
          tilting={Boolean(active.nanaSit)}
          onQrTap={() => play('nanaSit')}
```

4. Find:

```tsx
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrUrl: string | undefined
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
```

Replace with:

```tsx
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrPayload: string
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
```

5. Find:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  progress,
  onEvent,
  standing,
```

Replace with:

```tsx
  onGreet,
  onChallenge,
  musicPlaying,
  qrPayload,
  progress,
  onEvent,
  standing,
```

6. Find:

```tsx
    </div>
  )

  const content = Pages({ day, now, partyOver, acts, cats, onEvent, progress, standing, qrUrl, still: reducedMotion, familyInWorld })
  return { content, playAct: acts.play }
}
```

Replace with:

```tsx
    </div>
  )

  const content = Pages({ day, now, partyOver, acts, cats, onEvent, progress, standing, qrPayload, still: reducedMotion, familyInWorld })
  return { content, playAct: acts.play }
}
```

Then confirm nothing still names the old prop or the old file:

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; grep -rn "qrUrl\|qrImageUrl\|qr\.png\|giftLead\|giftOffer" src; echo "leftover-exit=$?"
```

Expected: no matches, and the last line `leftover-exit=1`.

- [ ] **Step 8: Style the plate, the QR, the cat button, and the hint.**

In `src/styles/pages.css`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```css
  margin-top: 12px;
}

.gift-lead {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.gift-offer {
  font-size: 16px;
  line-height: 1.45;
}

/* The card gives the box its full width on small phones, so it never spills, and keeps the
   tallest page as short as it can. */
.page-card-presente {
```

Replace with:

```css
  margin-top: 12px;
}

/* Spec §4: one line, presence first, then the QR. */
.gift-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.45;
}

/* Spec §2 The cat button: Guardar QR with a small cat face and a download arrow, its hint below. */
.gift-save {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.gift-save-button {
  gap: 8px;
}

.gift-save-cat {
  width: 30px;
  height: 30px;
  flex: none;
  overflow: visible;
}

.gift-save-cat-head {
  fill: var(--bone);
  stroke: var(--shadow);
  stroke-width: 1.8;
  stroke-linejoin: round;
}

.gift-save-cat-eye {
  fill: var(--shadow);
}

.gift-save-cat-arrow {
  fill: none;
  stroke: var(--deep-rose);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.gift-hint {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
}

/* The card gives the box its full width on small phones, so it never spills, and keeps the
   tallest page as short as it can. */
.page-card-presente {
```

2. Find:

```css
  pointer-events: none;
}

.qr-plate {
  margin: 0;
  padding: 8px;
  border-radius: 10px;
  background: var(--paper-white);
  box-shadow: 0 0 0 3px var(--accent);
  cursor: pointer;
  -webkit-touch-callout: default;
}

.qr-plate img {
  display: block;
  image-rendering: auto;
}

.qr-plate.is-tilting {
```

Replace with:

```css
  pointer-events: none;
}

/* Spec §2 On screen: the QR drawn on bone paper, its quiet zone part of the drawing. */
.qr-plate {
  margin: 0;
  padding: 4px;
  border-radius: 10px;
  background: var(--bone);
  box-shadow: 0 0 0 3px var(--accent);
  cursor: pointer;
  -webkit-touch-callout: default;
}

.gift-qr {
  display: block;
}

.gift-qr-paper {
  fill: var(--bone);
}

/* Ink modules in rounded runs, and rounded finder eyes: dark on light, for scanning. */
.gift-qr-modules {
  fill: var(--shadow);
}

.gift-qr-eye {
  fill: var(--shadow);
}

.gift-qr-emblem-head {
  fill: var(--bone);
  stroke: var(--shadow);
  stroke-width: 1.3;
  stroke-linejoin: round;
}

.gift-qr-emblem-eye {
  fill: var(--shadow);
}

.gift-qr-emblem-nose {
  fill: var(--rose);
  stroke: var(--shadow);
  stroke-width: 0.6;
  stroke-linejoin: round;
}

.gift-qr-emblem-line {
  fill: none;
  stroke: var(--shadow);
  stroke-width: 0.9;
  stroke-linecap: round;
}

.qr-plate.is-tilting {
```

- [ ] **Step 9: Run the tests to see them pass.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/logic/qr.test.ts src/components/Gift.test.tsx src/components/Room.test.tsx src/components/App.test.tsx src/components/RoomCamera.test.tsx src/cssVariables.test.ts
```

Expected: PASS, every file.

- [ ] **Step 10: Lint, type-check, run the full suite, and build.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx eslint . && npx tsc -b && npx vitest run --maxWorkers=2 && npm run build && ls dist/assets/*.js && grep -l "WebGLRenderer" dist/assets/*.js && grep -l "getModuleCount" dist/assets/*.js
```

Expected: no ESLint or tsc output; `Test Files  53 passed (53)`, `Tests  512 passed (512)`; the build succeeds; `ls` lists `index-*.js` and `World-*.js`; the `WebGLRenderer` grep prints only the `World-*.js` chunk; the `getModuleCount` grep (qrcode-generator) prints the `index-*.js` entry chunk (spec §2: the encoder runs in the entry chunk).

- [ ] **Step 11: Look at the gift page, and decode what the guest sees and saves.** Create a throwaway decoder (it reads a PNG with Node's own `zlib`, decodes it with `jsqr`, and compares it with the payload in `src/content.ts`):

Create `.superpowers/decode-png.mjs` (throwaway, git-ignored):

```js
// Throwaway check (plan Task 3): decode a PNG with jsqr and compare it with the payload in
// src/content.ts. Usage: node .superpowers/decode-png.mjs <file.png>
import fs from 'node:fs'
import zlib from 'node:zlib'
import jsQR from 'jsqr'

const file = process.argv[2]
const bytes = fs.readFileSync(file)
let at = 8
let width = 0
let height = 0
let type = 0
const idat = []
while (at < bytes.length) {
  const length = bytes.readUInt32BE(at)
  const name = bytes.toString('ascii', at + 4, at + 8)
  const body = bytes.subarray(at + 8, at + 8 + length)
  if (name === 'IHDR') {
    width = body.readUInt32BE(0)
    height = body.readUInt32BE(4)
    if (body[8] !== 8 || body[12] !== 0) throw new Error('only 8-bit, non-interlaced PNGs')
    type = body[9]
  }
  if (name === 'IDAT') idat.push(body)
  at += 12 + length
}
const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[type]
const raw = zlib.inflateSync(Buffer.concat(idat))
const stride = width * channels
const pixels = Buffer.alloc(stride * height)
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)]
  for (let x = 0; x < stride; x++) {
    const value = raw[y * (stride + 1) + 1 + x]
    const a = x >= channels ? pixels[y * stride + x - channels] : 0
    const b = y > 0 ? pixels[(y - 1) * stride + x] : 0
    const c = x >= channels && y > 0 ? pixels[(y - 1) * stride + x - channels] : 0
    const p = a + b - c
    const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c
    const predictor = [0, a, b, (a + b) >> 1, paeth][filter]
    pixels[y * stride + x] = (value + predictor) & 255
  }
}
const rgba = new Uint8ClampedArray(width * height * 4)
for (let i = 0; i < width * height; i++) {
  const gray = channels <= 2
  rgba[i * 4] = pixels[i * channels]
  rgba[i * 4 + 1] = gray ? pixels[i * channels] : pixels[i * channels + 1]
  rgba[i * 4 + 2] = gray ? pixels[i * channels] : pixels[i * channels + 2]
  rgba[i * 4 + 3] = 255
}
const payload = fs.readFileSync('src/content.ts', 'utf8').match(/giftQr:\s*'([^']+)'/)[1]
const code = jsQR(rgba, width, height)
console.log(`${width}x${height}`, code ? (code.data === payload ? `decodes to the exact payload (version ${code.version})` : 'decodes to a DIFFERENT text') : 'does not decode')
```

Start the dev server (`npm run dev -- --port 5174 --strictPort`). Run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const shots = '<worktree>/.playwright-mcp'
  const browser = page.context().browser()
  // The gift page in the book, both themes, at a phone's pixel ratio.
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 })
    const p = await context.newPage()
    await p.goto('http://localhost:5174/?e=n4vk')
    await p.evaluate((t) => localStorage.setItem('mia-theme', t), theme)
    await p.reload()
    await p.waitForSelector('.world-canvas canvas', { timeout: 20000 })
    await p.waitForTimeout(1500)
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(600)
    await p.getByRole('button', { name: 'El regalo' }).click()
    await p.waitForTimeout(3000)
    await p.screenshot({ path: `${shots}/t3-regalo-${theme}.png` })
    await context.close()
  }
  // Where the browser cannot share files, Guardar QR downloads the PNG.
  const downloading = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', acceptDownloads: true })
  const d = await downloading.newPage()
  await d.addInitScript(() => Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false }))
  await d.goto('http://localhost:5174/?e=n4vk')
  await d.waitForTimeout(1500)
  await d.getByRole('button', { name: 'El regalo' }).click()
  await d.waitForTimeout(800)
  const [download] = await Promise.all([d.waitForEvent('download'), d.getByRole('button', { name: 'Guardar QR' }).click()])
  await download.saveAs(`${shots}/qr-regalo-mia.png`)
  const name = download.suggestedFilename()
  await downloading.close()
  // Where it can, Guardar QR shares the same file.
  const sharing = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const s = await sharing.newPage()
  await s.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (data) => { window.__shared = data.files.map((f) => [f.name, f.type, f.size]) } })
  })
  await s.goto('http://localhost:5174/?e=n4vk')
  await s.waitForTimeout(1500)
  await s.getByRole('button', { name: 'El regalo' }).click()
  await s.waitForTimeout(800)
  await s.getByRole('button', { name: 'Guardar QR' }).click()
  await s.waitForTimeout(500)
  const shared = await s.evaluate(() => window.__shared)
  await sharing.close()
  return { name, shared }
}
```

Expected: `name` is `qr-regalo-mia.png`, and `shared` is `[["qr-regalo-mia.png","image/png",<about 34000>]]`. Then decode the saved file and the two screenshots:

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; for f in qr-regalo-mia t3-regalo-light t3-regalo-dark; do node .superpowers/decode-png.mjs .playwright-mcp/$f.png; done
```

Expected, one line each: `1024x1024 decodes to the exact payload (version 15)`, then `1170x2532 decodes to the exact payload (version 20)` twice (the whole page, with the emblem drawn, decodes in both themes). Read `t3-regalo-light.png` and `t3-regalo-dark.png` and judge:

- One gift line, presence first, then the gift box open on the QR: ink modules in rounded runs on bone paper, three rounded finder eyes, a clean quiet zone, and a small ink cat face in a bone square in the centre. The QR reads as the same kind of code in both themes (the plate is bone in both).
- Below the box: the pill `Guardar QR` with a small cat face and a rose download arrow at its left, then `Toca el gatito para guardar el QR en tu celular.`
- Delilah still sits on the gift box, off the code; her `Saludar` pops beside her, not over the QR.
- Nothing is cut off between the HUD and the signposts.

Delete the decoder when you are done, and stop the dev server:

```bash
rm .superpowers/decode-png.mjs
```

- [ ] **Step 12: Commit.**

```bash
git add package.json package-lock.json src/content.ts src/tuning.ts src/logic/qr.ts src/logic/qr.test.ts src/components/GiftQr.tsx src/components/Gift.tsx src/components/Gift.test.tsx src/assets.ts src/components/App.tsx src/components/App.test.tsx src/components/WorldRoom.tsx src/components/FlatRoom.tsx src/components/Pages.tsx src/components/Room.test.tsx src/components/RoomCamera.test.tsx src/test/helpers.tsx src/styles/pages.css
git commit -m "$(cat <<'EOF'
Draw the real gift QR from its payload, save a plain copy from a cat button, and prove both decode

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Controls, music, and the family line

**Files:**
- Modify: `src/content.ts` (`copy.collectionCount`, `copy.doorLine`), `src/components/ThemeControl.tsx`, `src/components/Hud.tsx`, `src/components/App.tsx`, `src/index.css` (the icon buttons and the badge)
- Create: `src/assets/audio/ambience.mp3` (copied from `ideas/`), `src/assets.test.ts`, `src/components/Hud.test.tsx`
- Test: `src/content.test.ts`, `src/components/App.test.tsx`

**Interfaces:**
- **Consumes:** `cats` (Task 2, ten records); `useMusic` and `MusicControl` (unchanged); `ambienceUrl` from `src/assets.ts` (Task 3 left it as the only export).
- **Produces:**
  - `copy.collectionCount(n: number, total: number): string` → `` `${n}/${total}` ``; `copy.doorLine` is the new family line.
  - `Hud` takes `catsMet: number`. Its Tus gatos button keeps the accessible name `Tus gatos` (visually hidden text) and gets the count as its accessible description (`aria-describedby` on the `.hud-badge`).
  - `ThemeControl` renders a moon (`dark`) and a sun (`light`) as `svg.theme-icon`, each button with the class `hud-icon-button`, visually hidden names `Oscuro` / `Claro`, and `aria-pressed`.
  - CSS: `.hud-icon-button` (at least 44 px each way), `.theme-icon`, `.hud-cat`, `.hud-badge`.

- [ ] **Step 1: Write the failing tests.**

Create `src/assets.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ambienceUrl } from './assets'

// Spec §4 Music: the host's track is where the app looks, so the music control appears.
describe('host files (§11)', () => {
  it('finds the ambience track', () => {
    expect(ambienceUrl).toMatch(/ambience.*\.mp3$/)
  })
})
```

Create `src/components/Hud.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cats, copy } from '../content'
import indexCss from '../index.css?raw'
import { Hud } from './Hud'

function renderHud(catsMet = 3) {
  return render(
    <Hud
      theme="dark"
      onTheme={vi.fn()}
      music={{ available: true, playing: false, toggle: vi.fn() }}
      onOpenCollection={vi.fn()}
      collectionOpen={false}
      collectionButtonRef={createRef()}
      catsMet={catsMet}
      quest={null}
    />,
  )
}

// The declarations of the CSS rule whose selector list is exactly `selector`.
function ruleFor(css: string, selector: string): string {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  return rules.find(([, selectors]) => selectors!.trim() === selector)?.[2] ?? ''
}

describe('the controls (spec §4)', () => {
  it('shows a moon for Oscuro and a sun for Claro, named for screen readers, with the active one pressed', () => {
    renderHud()
    const theme = within(screen.getByRole('group', { name: copy.a11y.theme }))
    const dark = theme.getByRole('button', { name: copy.themeDark })
    const light = theme.getByRole('button', { name: copy.themeLight })
    expect(dark).toHaveAttribute('aria-pressed', 'true')
    expect(light).toHaveAttribute('aria-pressed', 'false')
    for (const button of [dark, light]) {
      expect(button.querySelector('svg.theme-icon')).toHaveAttribute('aria-hidden', 'true')
      // The word is there for screen readers only.
      expect(button.querySelector('.sr-only')).not.toBeNull()
    }
  })

  it('makes every icon button a touch target of at least 44 px', () => {
    renderHud()
    expect(ruleFor(indexCss, '.hud-icon-button')).toMatch(/min-width:\s*calc\(44 \* var\(--ui-px\)\)/)
    expect(ruleFor(indexCss, '.hud-icon-button')).toMatch(/min-height:\s*calc\(44 \* var\(--ui-px\)\)/)
    for (const name of [copy.themeDark, copy.themeLight, copy.collection]) {
      expect(screen.getByRole('button', { name })).toHaveClass('hud-icon-button')
    }
  })

  it('shows Tus gatos as a cat head with the cats met out of all of them, and announces the count with its name', () => {
    renderHud(3)
    const button = screen.getByRole('button', { name: copy.collection, description: `3/${cats.length}` })
    expect(button.querySelector('svg.hud-cat')).toHaveAttribute('aria-hidden', 'true')
    expect(within(button).getByText('3/10')).toHaveClass('hud-badge')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
  })
})
```

In `src/content.test.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
    expect(copy.roundCount(3, cats.length)).toBe('3 de 10')
  })
})
```

Replace with:

```ts
    expect(copy.roundCount(3, cats.length)).toBe('3 de 10')
  })
})

// Spec §4 Copy changes, verbatim.
describe('the copy (spec §4)', () => {
  it('has the new family line and the Tus gatos badge', () => {
    expect(copy.doorLine).toBe('La familia se hace más grande, y nos encantaría que nos acompañes.')
    expect(copy.collectionCount(3, cats.length)).toBe('3/10')
  })
})
```

In `src/components/App.test.tsx`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```tsx
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
  })

  it('holds the badge toasts until the card has gone, and counts the cat in the quest log', () => {
    catsInView()
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.cats(0, cats.length))).toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    expect(screen.getByText(gameCopy.cats(1, cats.length))).toBeInTheDocument()
    expect(screen.getByTestId('card-reveal')).toBeInTheDocument()
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
    advance(tuning.greetingToastMs + 10)
```

Replace with:

```tsx
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
  })

  it('holds the badge toasts until the card has gone, and counts the cat in the quest log and on Tus gatos', () => {
    catsInView()
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.cats(0, cats.length))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.collection, description: copy.collectionCount(0, cats.length) })).toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mishona' }))
    expect(screen.getByText(gameCopy.cats(1, cats.length))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.collection, description: '1/10' })).toBeInTheDocument()
    expect(screen.getByTestId('card-reveal')).toBeInTheDocument()
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
    advance(tuning.greetingToastMs + 10)
```

2. Find:

```tsx

describe('US-11 Hear the room when I ask', () => {
  it('has no music control and no audio element without a track (AC1)', () => {
    render(<App search="" musicUrl={undefined} />)
    expect(screen.queryByRole('button', { name: copy.musicOn })).not.toBeInTheDocument()
    expect(document.querySelector('audio')).toBeNull()
  })

  it('starts paused, then plays from the start and reads Silenciar música (AC2, AC3)', async () => {
    const media = stubMedia()
    render(<App search="" musicUrl="/ambience.mp3" />)
```

Replace with:

```tsx

describe('US-11 Hear the room when I ask', () => {
  it('has no music control and no audio element without a track (AC1)', () => {
    render(<App search="" musicUrl="" />)
    expect(screen.queryByRole('button', { name: copy.musicOn })).not.toBeInTheDocument()
    expect(document.querySelector('audio')).toBeNull()
  })

  it("plays the host's track: the music control appears, and the track waits until asked (spec §4)", () => {
    render(<App search="" />)
    expect(screen.getByRole('button', { name: copy.musicOn })).toBeInTheDocument()
    const audio = document.querySelector('audio')!
    expect(audio.getAttribute('src')).toMatch(/ambience.*\.mp3$/)
    expect(audio).toHaveAttribute('preload', 'none')
    expect(audio.loop).toBe(true)
  })

  it('starts paused, then plays from the start and reads Silenciar música (AC2, AC3)', async () => {
    const media = stubMedia()
    render(<App search="" musicUrl="/ambience.mp3" />)
```

- [ ] **Step 2: Run them to see them fail.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/assets.test.ts src/components/Hud.test.tsx src/content.test.ts src/components/App.test.tsx
```

Expected: FAIL, 7 tests: "finds the ambience track" (`ambienceUrl` is undefined), "has the new family line and the Tus gatos badge", the three `Hud` tests, "…counts the cat in the quest log and on Tus gatos", and "plays the host's track: the music control appears…".

- [ ] **Step 3: Put the host's track where the app looks.** It is read, not moved, from the main checkout's git-ignored `ideas/`:

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; mkdir -p src/assets/audio && cp <host-ideas>/soundgrand.mp3 src/assets/audio/ambience.mp3 && ls -l src/assets/audio/ambience.mp3
```

Expected: one file of `4590027` bytes (2 min 23 s at 256 kbps).

- [ ] **Step 4: The family line and the badge's copy.**

In `src/content.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
    familia: 'La familia',
  },
  collection: 'Tus gatos',
  close: 'Cerrar',
  greet: 'Saludar',
  greetName: (name: string) => `Saludar a ${name}`,
```

Replace with:

```ts
    familia: 'La familia',
  },
  collection: 'Tus gatos',
  // Spec §4: the Tus gatos badge, cats met out of all of them.
  collectionCount: (n: number, total: number) => `${n}/${total}`,
  close: 'Cerrar',
  greet: 'Saludar',
  greetName: (name: string) => `Saludar a ${name}`,
```

2. Find:

```ts
  roundCount: (n: number, total: number) => `${n} de ${total}`,
  roundNumber: (n: number) => `Vuelta ${n}`,
  playAgain: 'Jugar otra vez',
  doorLine: 'Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  countdownLabels: { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' },
```

Replace with:

```ts
  roundCount: (n: number, total: number) => `${n} de ${total}`,
  roundNumber: (n: number) => `Vuelta ${n}`,
  playAgain: 'Jugar otra vez',
  doorLine: 'La familia se hace más grande, y nos encantaría que nos acompañes.',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  countdownLabels: { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' },
```

- [ ] **Step 5: A moon and a sun for the theme, and a cat's head with a count for Tus gatos.**

Replace the whole of `src/components/ThemeControl.tsx` with:

```tsx
import { copy } from '../content'
import type { ThemeName } from '../tuning'

interface Props {
  theme: ThemeName
  onTheme: (theme: ThemeName) => void
}

// Spec §4: a sun for Claro and a moon for Oscuro, in the ink style: a filled shape with a lighter
// second line offset beside it, like the cats' scratchy double outline.
function Sun() {
  return (
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle className="theme-icon-echo" cx={12.8} cy={11.3} r={4.6} />
      <circle className="theme-icon-fill" cx={12} cy={12} r={4.4} />
      <path
        className="theme-icon-line"
        d="M12 2.4 V 5 M12 19 V 21.6 M2.4 12 H 5 M19 12 H 21.6 M5.2 5.2 L 7 7 M17 17 L 18.8 18.8 M5.2 18.8 L 7 17 M17 7 L 18.8 5.2"
      />
    </svg>
  )
}

function Moon() {
  return (
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path className="theme-icon-echo" d="M15.8 2.6 A 9 9 0 1 0 21.6 14.8 A 7.2 7.2 0 0 1 15.8 2.6 Z" />
      <path className="theme-icon-fill" d="M15 3.4 A 9 9 0 1 0 20.8 15.6 A 7.2 7.2 0 0 1 15 3.4 Z" />
      <path className="theme-icon-line" d="M19 4.2 V 7 M17.6 5.6 H 20.4" />
    </svg>
  )
}

// US-2: Oscuro and Claro as a moon and a sun, with the active one marked (aria-pressed). Their
// names stay for screen readers, as visually hidden text.
export function ThemeControl({ theme, onTheme }: Props) {
  return (
    <div className="theme-control" role="group" aria-label={copy.a11y.theme}>
      {(['dark', 'light'] as const).map((name) => (
        <button
          key={name}
          type="button"
          className="hud-button hud-icon-button"
          aria-pressed={theme === name}
          onClick={() => onTheme(name)}
        >
          {name === 'dark' ? <Moon /> : <Sun />}
          <span className="sr-only">{name === 'dark' ? copy.themeDark : copy.themeLight}</span>
        </button>
      ))}
    </div>
  )
}
```

Replace the whole of `src/components/Hud.tsx` with:

```tsx
import { useId, type RefObject } from 'react'
import { cats, copy } from '../content'
import type { ThemeName } from '../tuning'
import { MusicControl } from './MusicControl'
import { QuestLog, type QuestLogProps } from './QuestLog'
import { ThemeControl } from './ThemeControl'

interface Props {
  theme: ThemeName
  onTheme: (theme: ThemeName) => void
  music: { available: boolean; playing: boolean; toggle: () => void }
  onOpenCollection: () => void
  collectionOpen: boolean
  collectionButtonRef: RefObject<HTMLButtonElement | null>
  // Cats ever met, for the Tus gatos badge (spec §4).
  catsMet: number
  // The quest log, on the invitation only (design §6).
  quest: QuestLogProps | null
}

// Spec §4: Tus gatos as a cat's head, in the ink style.
function CatHead() {
  return (
    <svg className="hud-cat" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        className="hud-cat-head"
        d="M4.6 10.4 L 4 3.2 L 9.2 6.6 C 11 6.1, 13 6.1, 14.8 6.6 L 20 3.2 L 19.4 10.4 C 20.1 11.5, 20.4 12.7, 20.4 14 C 20.4 18.6, 16.6 21.2, 12 21.2 C 7.4 21.2, 3.6 18.6, 3.6 14 C 3.6 12.7, 3.9 11.5, 4.6 10.4 Z"
      />
      <circle className="hud-cat-eye" cx={9} cy={13.4} r={1.5} />
      <circle className="hud-cat-eye" cx={15} cy={13.4} r={1.5} />
      <path className="hud-cat-nose" d="M11 16 h2 l-1 1.2 z" />
    </svg>
  )
}

// The controls that stay fixed on screen on the gate and on both invitations (§3), with the
// quest log on the left of the invitation. Tus gatos shows how many cats the guest has met, out of
// all of them; the count is its description, so its name stays Tus gatos.
export function Hud({ theme, onTheme, music, onOpenCollection, collectionOpen, collectionButtonRef, catsMet, quest }: Props) {
  const countId = useId()
  return (
    <header className="hud">
      {quest && <QuestLog {...quest} />}
      <ThemeControl theme={theme} onTheme={onTheme} />
      <MusicControl available={music.available} playing={music.playing} onToggle={music.toggle} />
      <button
        ref={collectionButtonRef}
        type="button"
        className="hud-button hud-icon-button hud-collection"
        aria-haspopup="dialog"
        aria-expanded={collectionOpen}
        aria-describedby={countId}
        onClick={onOpenCollection}
      >
        <CatHead />
        <span className="sr-only">{copy.collection}</span>
        <span id={countId} className="hud-badge" aria-hidden="true">
          {copy.collectionCount(catsMet, cats.length)}
        </span>
      </button>
    </header>
  )
}
```

In `src/components/App.tsx`, make this replacement (each block to find appears exactly once):

Find:

```tsx
          onOpenCollection={openCollection}
          collectionOpen={collectionOpen}
          collectionButtonRef={collectionButton}
          quest={quest}
        />
        {opening.kind === 'gate' ? (
```

Replace with:

```tsx
          onOpenCollection={openCollection}
          collectionOpen={collectionOpen}
          collectionButtonRef={collectionButton}
          catsMet={cats.state.caught.length}
          quest={quest}
        />
        {opening.kind === 'gate' ? (
```

In `src/index.css`, make this replacement (each block to find appears exactly once):

Find:

```css
    border-radius: 0;
  }

  .hud-button[aria-pressed='true'] {
    background: var(--button-bg);
    color: var(--button-ink);
```

Replace with:

```css
    border-radius: 0;
  }

  /* Spec §4: the icon buttons (the sun, the moon, and Tus gatos), each a touch target of at least
     44 px. Their names are visually hidden text. */
  .hud-icon-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    min-width: calc(44 * var(--ui-px));
    min-height: calc(44 * var(--ui-px));
    padding: 0 calc(8 * var(--ui-px));
  }

  .theme-icon,
  .hud-cat {
    display: block;
    width: calc(24 * var(--ui-px));
    height: calc(24 * var(--ui-px));
    overflow: visible;
  }

  .theme-icon-fill {
    fill: currentColor;
  }

  .theme-icon-echo {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
    opacity: 0.35;
  }

  .theme-icon-line {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .hud-cat-head {
    fill: var(--field);
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linejoin: round;
  }

  .hud-cat-eye {
    fill: currentColor;
  }

  .hud-cat-nose {
    fill: var(--rose);
  }

  /* Tus gatos' count, a small badge on the cat's shoulder. */
  .hud-badge {
    position: absolute;
    right: calc(-6 * var(--ui-px));
    bottom: calc(-6 * var(--ui-px));
    min-width: calc(22 * var(--ui-px));
    padding: calc(2 * var(--ui-px)) calc(5 * var(--ui-px));
    border-radius: 999px;
    background: var(--button-bg);
    color: var(--button-ink);
    font-family: var(--font-game);
    font-size: calc(11 * var(--ui-px));
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
  }

  .hud-button[aria-pressed='true'] {
    background: var(--button-bg);
    color: var(--button-ink);
```

- [ ] **Step 6: Run the tests to see them pass.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/assets.test.ts src/components/Hud.test.tsx src/content.test.ts src/components/App.test.tsx src/cssVariables.test.ts
```

Expected: PASS, every file.

- [ ] **Step 7: Lint, type-check, and run the full suite.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx eslint . && npx tsc -b && npx vitest run --maxWorkers=2
```

Expected: no ESLint or tsc output; `Test Files  55 passed (55)`, `Tests  518 passed (518)`.

- [ ] **Step 8: Look at the controls, the family line, and the music.** Start the dev server (`npm run dev -- --port 5174 --strictPort`). Run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const shots = '<worktree>/.playwright-mcp'
  const browser = page.context().browser()
  const out = {}
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
    const p = await context.newPage()
    await p.goto('http://localhost:5174/?e=n4vk')
    await p.evaluate((t) => {
      localStorage.setItem('mia-theme', t)
      localStorage.setItem('mia-cats', JSON.stringify({ caught: ['luz', 'nana', 'misha'], round: ['luz', 'nana', 'misha'], rounds: 1 }))
    }, theme)
    await p.reload()
    await p.waitForSelector('.world-canvas canvas', { timeout: 20000 })
    await p.waitForTimeout(1500)
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(600)
    await p.getByRole('button', { name: 'La familia' }).click()
    await p.waitForTimeout(4000)
    await p.screenshot({ path: `${shots}/t4-familia-${theme}.png` })
    await p.screenshot({ path: `${shots}/t4-hud-${theme}.png`, clip: { x: 150, y: 0, width: 240, height: 140 } })
    out[theme] = await p.evaluate(() => [...document.querySelectorAll('.hud-icon-button')].map((b) => {
      const r = b.getBoundingClientRect()
      return [b.textContent, Math.round(r.width), Math.round(r.height), b.getAttribute('aria-pressed')]
    }))
    await context.close()
  }
  // The track downloads only when the guest asks for it.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const p = await context.newPage()
  const mp3 = []
  // The audio itself, not the dev server's tiny module that names its URL.
  p.on('request', (r) => { if (r.resourceType() === 'media') mp3.push(r.url()) })
  await p.goto('http://localhost:5174/?e=n4vk')
  await p.waitForTimeout(2000)
  out.beforeTap = mp3.length
  await p.getByRole('button', { name: 'Activar música' }).click()
  await p.waitForTimeout(1500)
  out.afterTap = mp3.length
  out.control = await p.locator('[data-music-control]').textContent()
  await context.close()
  return out
}
```

Expected: for each theme, three icon buttons, each at least `44` wide and `44` tall (the theme pill may stretch taller, to the quest log's height, as the word buttons did): `Oscuro` and `Claro` with `aria-pressed` `"true"`/`"false"` as the theme says, and `Tus gatos3/10` (the name plus the badge's text) with no `aria-pressed`. `beforeTap` is `0`; `afterTap` is at least `1`; `control` is `Silenciar música` (headless Chromium may refuse to play; then it stays `Activar música`, which is the rule for a refused play, and `afterTap` still shows the request). Read the four screenshots and judge:

- **The HUD:** a round moon and a rayed sun, in the ink style, in the pill where the words were; the pressed one filled with the rose button color. A cat's head where `Tus gatos` was, with a small rose badge `3/10` at its lower right, not clipped. `Activar música` sits between them.
- **The family line** under the door reads `La familia se hace más grande, y nos encantaría que nos acompañes.`, with Misha (white, gray patches) and Kira (tabby) on the card.

Stop the dev server afterwards.

- [ ] **Step 9: Commit.**

```bash
git add src/assets/audio/ambience.mp3 src/assets.test.ts src/content.ts src/content.test.ts src/components/ThemeControl.tsx src/components/Hud.tsx src/components/Hud.test.tsx src/components/App.tsx src/components/App.test.tsx src/index.css
git commit -m "$(cat <<'EOF'
A sun and a moon for the theme, a cat with a count for Tus gatos, the host's music, and the new family line

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: A smooth gate game

**Files:**
- Modify: `src/components/GateGame.tsx`, `src/styles/game.css` (the drop slots and the catcher), `src/tuning.ts` (`GateScreenConfig.dropSlots`, `tuning.gateScreen.dropSlots`, comments), `src/components/art/CatSprite.tsx` (its memo comment)
- Test: `src/components/GateGame.test.tsx`

**Interfaces:**
- **Consumes:** `newGame`, `startGame`, `moveCatcher`, `tick`, and `GateGame` (the state type) from `src/logic/gateGame.ts`, all unchanged; `useGateBest`; `gateGameCopy`; `tuning.gateGame`, `tuning.gateScreen`.
- **Produces:**
  - `GateScreenConfig.dropSlots: number` and `tuning.gateScreen.dropSlots: 6`; `tuning.gateScreen.catcherTransitionMs` is now the frame loop's easing time constant (no CSS transition, and no `--catcher-ms`).
  - `GateGame` renders `tuning.gateScreen.dropSlots` `span.gate-game-drop` slots, each with a `data-kind` of `''`, `'yarn'`, or `'heart'` and both toys inside (`.gate-game-drop-yarn`, `.gate-game-drop-heart`); the loop writes each slot's and `.gate-game-catcher`'s `style.transform` and the `.gate-game-time` text. React state changes only when the score, the combo, the phase, or the best changes (plus the cheer, startle, and pulse flags those events set).
  - The game's props (`reducedMotion`, `onPlayingChange`) and its visible copy are unchanged.

- [ ] **Step 1: Build the game as it is now, to measure it against later.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vite build --outDir /tmp/mia-gate-before --emptyOutDir
```

Expected: the build succeeds into `/tmp/mia-gate-before/` (outside the worktree, so ESLint never reads a bundle). Leave it there until Step 8.

- [ ] **Step 2: Write the failing tests.** A React `Profiler` counts commits across a second and a half of frames and across pointer moves (Review Focus 5); the drop slots must cover every drop that can fall at once.

In `src/components/GateGame.test.tsx`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gateGameCopy } from '../content'
import { storageKeys } from '../logic/storageKeys'
```

Replace with:

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Profiler } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gateGameCopy } from '../content'
import { storageKeys } from '../logic/storageKeys'
```

2. Find:

```tsx
    expect(screen.queryByRole('button', { name: gateGameCopy.start })).not.toBeInTheDocument()
  })

  it('paints the panel above the roaming cats and their Saludar pills (z-index)', () => {
    render(<GateGame reducedMotion={false} />)
    const panel = document.querySelector('.gate-game') as HTMLElement
```

Replace with:

```tsx
    expect(screen.queryByRole('button', { name: gateGameCopy.start })).not.toBeInTheDocument()
  })

  // jsdom lays nothing out: give the play field a size, as a phone would.
  const sizeField = () => {
    const field = document.querySelector('.gate-game-field') as HTMLElement
    Object.defineProperty(field, 'clientWidth', { configurable: true, value: 300 })
    Object.defineProperty(field, 'clientHeight', { configurable: true, value: 200 })
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200, x: 0, y: 0, toJSON: () => ({}) } as DOMRect)
    return field
  }

  // Spec §5: the frame loop moves the drops and the catcher itself; React renders only on events.
  it('does not re-render React on animation frames: only a score, a combo, a phase, or a best changes it', () => {
    const commits = vi.fn()
    render(
      <Profiler id="gate-game" onRender={commits}>
        <GateGame reducedMotion={false} />
      </Profiler>,
    )
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    sizeField()
    act(() => {
      vi.advanceTimersByTime(32)
    })
    commits.mockClear()
    const slots = () => [...document.querySelectorAll<HTMLElement>('.gate-game-drop')]
    const before = slots().map((slot) => slot.style.transform)
    // About 1.5 s of frames: the first drops fall, none reaches the catcher or the floor yet, and the
    // clock ticks past a whole second.
    for (let frame = 0; frame < 90; frame++) {
      act(() => {
        vi.advanceTimersByTime(16)
      })
    }
    expect(commits).not.toHaveBeenCalled()
    // The drops did move: the first slot holds a falling drop, lower than before.
    expect(slots()[0]!.dataset.kind).not.toBe('')
    expect(slots()[0]!.style.transform).not.toBe(before[0])
    expect(screen.getByText(gateGameCopy.seconds(tuning.gateGame.durationMs / 1000 - 1))).toBeInTheDocument()
  })

  it('has a drop slot for every drop that can fall at once', () => {
    const { fallPerS, spawnEveryMs } = tuning.gateGame
    // A drop falls the whole field in 1 / fallPerS seconds; one spawns every spawnEveryMs.
    const most = Math.ceil(1000 / fallPerS / spawnEveryMs) + 1
    expect(tuning.gateScreen.dropSlots).toBeGreaterThanOrEqual(most)
    render(<GateGame reducedMotion={false} />)
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(document.querySelectorAll('.gate-game-drop')).toHaveLength(tuning.gateScreen.dropSlots)
  })

  it('moves the catcher from the pointer without a React render', () => {
    const commits = vi.fn()
    render(
      <Profiler id="gate-game" onRender={commits}>
        <GateGame reducedMotion={false} />
      </Profiler>,
    )
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    const field = sizeField()
    act(() => {
      vi.advanceTimersByTime(32)
    })
    commits.mockClear()
    const catcher = document.querySelector('.gate-game-catcher') as HTMLElement
    const before = catcher.style.transform
    fireEvent.pointerMove(field, { clientX: 30, clientY: 100 })
    for (let frame = 0; frame < 10; frame++) {
      act(() => {
        vi.advanceTimersByTime(16)
      })
    }
    expect(commits).not.toHaveBeenCalled()
    // It eases from the middle (150 px) toward 30 px.
    const x = (transform: string) => Number(/translate3d\(([\d.]+)px/.exec(transform)![1])
    expect(x(before)).toBe(150)
    expect(x(catcher.style.transform)).toBeLessThan(60)
  })

  it('paints the panel above the roaming cats and their Saludar pills (z-index)', () => {
    render(<GateGame reducedMotion={false} />)
    const panel = document.querySelector('.gate-game') as HTMLElement
```

- [ ] **Step 3: Run them to see them fail.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/components/GateGame.test.tsx
```

Expected: FAIL, `3 failed | 3 passed (6)`: "does not re-render React on animation frames…" (`expected "vi.fn()" to not be called at all, but actually been called 90 times`), "has a drop slot for every drop that can fall at once", and "moves the catcher from the pointer without a React render".

- [ ] **Step 4: Tune the drop slots.**

In `src/tuning.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
export interface GateScreenConfig {
  // How far one arrow-key press nudges the catcher, as a share of the play field's width.
  catcherStep: number
  // Luz, the catcher, and the falling drops, in px at the room size.
  catcherSize: number
  dropSize: number
  // Mimo and Susto's little reactions beside the field, in px.
  sideCatSize: number
  // The HUD's combo readout pulses for this long when the combo grows.
  pulseMs: number
  // Mimo cheers once the combo reaches this.
  cheerCombo: number
  cheerMs: number
  startleMs: number
  // How long the catcher takes to slide to a new x (a CSS transition, not the game's own tick).
  catcherTransitionMs: number
  // The panel (start button, HUD, field, result panel) paints above every roaming gate cat and its
  // Saludar pill (`.gate-spot`'s z-index is 2; `.saludar`'s is 4 — see src/index.css), whatever
```

Replace with:

```ts
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
```

2. Find:

```ts
    catcherStep: 0.06,
    catcherSize: 72,
    dropSize: 30,
    sideCatSize: 48,
    pulseMs: 420,
    cheerCombo: 3,
```

Replace with:

```ts
    catcherStep: 0.06,
    catcherSize: 72,
    dropSize: 30,
    dropSlots: 6,
    sideCatSize: 48,
    pulseMs: 420,
    cheerCombo: 3,
```

- [ ] **Step 5: Move the drops and the catcher from the frame loop.**

Replace the whole of `src/components/GateGame.tsx` with:

```tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { copy, gateGameCopy } from '../content'
import { useGateBest } from '../hooks/useGateBest'
import { moveCatcher, newGame, startGame, tick, type GateGame as GameState } from '../logic/gateGame'
import { tuning } from '../tuning'
import { CatSprite } from './art/CatSprite'
import { HeartToy, YarnToy } from './Toys'

interface Props {
  reducedMotion: boolean
  // The gate's roaming, greetable Mishona steps aside while she's the catcher (called on every phase
  // change; not called at all with reduced motion, since the game never mounts).
  onPlayingChange?: (playing: boolean) => void
}

type PlayProps = Pick<Props, 'onPlayingChange'>

// What React draws (spec §5): it changes only on a score, a combo, a phase, or a best event. The
// clock, the drops, and the catcher are written by the frame loop itself.
interface Shown {
  phase: GameState['phase']
  score: number
  combo: number
  best: number
  newRecord: boolean
}

const shownOf = (g: GameState): Shown => ({ phase: g.phase, score: g.score, combo: g.combo, best: g.best, newRecord: g.newRecord })
const sameShown = (a: Shown, b: Shown) =>
  a.phase === b.phase && a.score === b.score && a.combo === b.combo && a.best === b.best && a.newRecord === b.newRecord

// The gate arcade game (design §8): 30 seconds, Mishona moving to catch yarn and hearts. Choni
// cheers on a big combo; Chavela startles on a miss. The score/time show but only the game-over
// result is announced, once, to a screen reader.
function GateGamePlay({ onPlayingChange }: PlayProps) {
  const { best, saveBest } = useGateBest()
  const [shown, setShown] = useState<Shown>(() => shownOf(newGame(best)))
  const gameRef = useRef<GameState | null>(null)
  // What React last drew, so the loop only asks for a render when it changes.
  const shownRef = useRef<Shown | null>(null)
  const [cheering, setCheering] = useState(false)
  const [startled, setStartled] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const cheerTimer = useRef<number | undefined>(undefined)
  const startleTimer = useRef<number | undefined>(undefined)
  const pulseTimer = useRef<number | undefined>(undefined)
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const catcherRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef<HTMLParagraphElement | null>(null)
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([])

  const triggerCheer = useCallback(() => {
    setCheering(true)
    window.clearTimeout(cheerTimer.current)
    cheerTimer.current = window.setTimeout(() => setCheering(false), tuning.gateScreen.cheerMs)
  }, [])

  const triggerStartle = useCallback(() => {
    setStartled(true)
    window.clearTimeout(startleTimer.current)
    startleTimer.current = window.setTimeout(() => setStartled(false), tuning.gateScreen.startleMs)
  }, [])

  const triggerPulse = useCallback(() => {
    setPulsing(true)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setPulsing(false), tuning.gateScreen.pulseMs)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(cheerTimer.current)
      window.clearTimeout(startleTimer.current)
      window.clearTimeout(pulseTimer.current)
    },
    [],
  )

  useEffect(() => {
    onPlayingChange?.(shown.phase === 'playing')
  }, [shown.phase, onPlayingChange])

  // The game loop: a requestAnimationFrame tick over the pure logic in gateGame.ts. Each frame it
  // writes the clock's text, the drops' and the catcher's transforms straight to the page, and asks
  // React to render only when the score, the combo, or the phase changes. It pauses while the tab is
  // hidden, and stops scheduling once the round is over.
  useEffect(() => {
    if (shown.phase !== 'playing') return
    let raf = 0
    let last = performance.now()
    let drawnX = gameRef.current?.catcherX ?? 0.5
    let second = -1
    const { catchY } = tuning.gateGame
    const { catcherTransitionMs } = tuning.gateScreen
    const draw = (g: GameState, dt: number) => {
      const field = fieldRef.current
      if (!field) return
      const width = field.clientWidth
      const height = field.clientHeight
      // The catcher eases toward where the guest points, over about catcherTransitionMs.
      drawnX += (g.catcherX - drawnX) * (1 - Math.exp(-dt / catcherTransitionMs))
      if (catcherRef.current) {
        catcherRef.current.style.transform = `translate3d(${drawnX * width}px, ${catchY * height}px, 0) translate(-50%, -50%)`
      }
      slotRefs.current.forEach((slot, i) => {
        if (!slot) return
        const drop = g.drops[i]
        const kind = drop?.kind ?? ''
        if (slot.dataset.kind !== kind) slot.dataset.kind = kind
        if (drop) slot.style.transform = `translate3d(${drop.x * width}px, ${drop.y * height}px, 0) translate(-50%, -50%)`
      })
      const s = Math.ceil(g.timeLeftMs / 1000)
      if (s !== second && timeRef.current) {
        second = s
        timeRef.current.textContent = gateGameCopy.seconds(s)
      }
    }
    const step = (now: number) => {
      if (document.hidden) {
        last = now
        raf = requestAnimationFrame(step)
        return
      }
      const prev = gameRef.current
      if (!prev) return
      const dt = now - last
      last = now
      const next = tick(prev, dt)
      gameRef.current = next
      if (next.phase === 'playing') {
        const spawned = next.nextId - prev.nextId
        const removed = prev.drops.length + spawned - next.drops.length
        const scoreGain = next.score - prev.score
        if (removed > 0 && scoreGain === 0) triggerStartle()
        if (scoreGain > 0 && next.combo >= tuning.gateScreen.cheerCombo) triggerCheer()
        if (next.combo > prev.combo) triggerPulse()
        draw(next, dt)
      }
      const nextShown = shownOf(next)
      if (!shownRef.current || !sameShown(shownRef.current, nextShown)) {
        shownRef.current = nextShown
        setShown(nextShown)
      }
      if (next.phase === 'over') {
        saveBest(next.score)
        return
      }
      raf = requestAnimationFrame(step)
    }
    if (gameRef.current) draw(gameRef.current, catcherTransitionMs * 10)
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [shown.phase, saveBest, triggerCheer, triggerPulse, triggerStartle])

  const begin = (game: GameState) => {
    gameRef.current = game
    shownRef.current = shownOf(game)
    setShown(shownRef.current)
  }
  const start = () => begin(startGame(gameRef.current ?? newGame(best)))
  const restart = () => begin(startGame(newGame(best)))

  const moveTo = (x: number) => {
    const game = gameRef.current
    if (!game || game.phase !== 'playing') return
    gameRef.current = moveCatcher(game, x)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    moveTo((e.clientX - rect.left) / rect.width)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { catcherStep } = tuning.gateScreen
    const x = gameRef.current?.catcherX ?? 0.5
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveTo(x - catcherStep)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveTo(x + catcherStep)
    }
  }

  const style = {
    '--pulse-ms': `${tuning.gateScreen.pulseMs}ms`,
    '--cheer-ms': `${tuning.gateScreen.cheerMs}ms`,
    '--startle-ms': `${tuning.gateScreen.startleMs}ms`,
    '--panel-z': tuning.gateScreen.panelZIndex,
  } as CSSProperties

  const overText =
    shown.phase === 'over'
      ? `${gateGameCopy.over} ${gateGameCopy.score(shown.score)}. ${shown.newRecord ? gateGameCopy.record : gateGameCopy.best(shown.best)}`
      : ''

  return (
    <div className={`gate-game phase-${shown.phase}`} style={style}>
      {shown.phase === 'ready' && (
        <button type="button" className="button gate-game-start" onClick={start}>
          {gateGameCopy.start}
        </button>
      )}

      {shown.phase === 'playing' && (
        <>
          <div className="gate-game-hud">
            <p className="gate-game-score">{gateGameCopy.score(shown.score)}</p>
            <p className={`gate-game-combo${pulsing ? ' is-pulsing' : ''}`}>{gateGameCopy.combo(shown.combo)}</p>
            {/* The frame loop rewrites this as the seconds go by. */}
            <p ref={timeRef} className="gate-game-time">
              {gateGameCopy.seconds(tuning.gateGame.durationMs / 1000)}
            </p>
          </div>

          <div ref={fieldRef} className="gate-game-field" tabIndex={0} onPointerMove={onPointerMove} onKeyDown={onKeyDown}>
            {/* A fixed set of drop slots: the loop fills, moves, and empties them (data-kind). */}
            {Array.from({ length: tuning.gateScreen.dropSlots }, (_, i) => (
              <span
                key={i}
                ref={(el) => {
                  slotRefs.current[i] = el
                }}
                className="gate-game-drop"
                data-kind=""
                aria-hidden="true"
              >
                <YarnToy size={tuning.gateScreen.dropSize} className="gate-game-drop-yarn" />
                <HeartToy size={tuning.gateScreen.dropSize} className="gate-game-drop-heart" />
              </span>
            ))}
            <div ref={catcherRef} className="gate-game-catcher">
              <CatSprite id="luz" stage="luz" size={tuning.gateScreen.catcherSize} />
            </div>
            <div className={`gate-game-side gate-game-mimo${cheering ? ' is-cheering' : ''}`}>
              <CatSprite id="mimo" stage="luz" size={tuning.gateScreen.sideCatSize} />
            </div>
            <div className={`gate-game-side gate-game-susto${startled ? ' is-startled' : ''}`}>
              <CatSprite id="susto" stage="luz" size={tuning.gateScreen.sideCatSize} />
            </div>
          </div>
        </>
      )}

      {shown.phase === 'over' && (
        <div className="gate-game-over">
          <p className="gate-game-over-title">{gateGameCopy.over}</p>
          <p className="gate-game-over-score">{gateGameCopy.score(shown.score)}</p>
          <p className="gate-game-over-best">{shown.newRecord ? gateGameCopy.record : gateGameCopy.best(shown.best)}</p>
          <button type="button" className="button gate-game-again" onClick={restart}>
            {copy.playAgain}
          </button>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {overText}
      </p>
    </div>
  )
}

// §3/§8 Reduced motion: no falling objects at all, and no way to start the game.
export function GateGame({ reducedMotion, onPlayingChange }: Props) {
  return reducedMotion ? null : <GateGamePlay onPlayingChange={onPlayingChange} />
}
```

In `src/styles/game.css`, make this replacement (each block to find appears exactly once):

Find:

```css
  touch-action: none;
}

.gate-game-drop {
  position: absolute;
  transform: translate(-50%, -50%);
  filter: url(#ink-boil);
  line-height: 0;
}

.gate-game-catcher {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: left var(--catcher-ms) linear;
}

.gate-game-side {
```

Replace with:

```css
  touch-action: none;
}

/* Spec §5: the frame loop writes each drop slot's and the catcher's transform itself (no layout, no
   React render per frame). A slot shows the toy its data-kind names, or nothing. The moving drops
   keep no ink boil: a filter on a moving element repaints every frame. */
.gate-game-drop {
  position: absolute;
  left: 0;
  top: 0;
  line-height: 0;
  will-change: transform;
}

.gate-game-drop[data-kind=''],
.gate-game-drop[data-kind='yarn'] .gate-game-drop-heart,
.gate-game-drop[data-kind='heart'] .gate-game-drop-yarn {
  display: none;
}

.gate-game-catcher {
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
}

.gate-game-side {
```

In `src/components/art/CatSprite.tsx`, make this replacement (each block to find appears exactly once):

Find:

```tsx
// rig's parts are named groups
// (.cat-body, .cat-head, .cat-ear-l, .cat-ear-r, .cat-lid, .cat-tail) that CSS moves on springs:
// breathing, blinking, ear twitches, and a tail sway whose tip follows through.
// Memoized: the gate game's catcher and its reactions re-render every animation frame, but a
// cat's own drawing only ever changes with its props.
export const CatSprite = memo(function CatSprite({
  id,
  stage,
```

Replace with:

```tsx
// rig's parts are named groups
// (.cat-body, .cat-head, .cat-ear-l, .cat-ear-r, .cat-lid, .cat-tail) that CSS moves on springs:
// breathing, blinking, ear twitches, and a tail sway whose tip follows through.
// Memoized: a cat's own drawing only ever changes with its props, so the rooms and the gate game
// can re-render around it (on a greeting, a score, a combo) without redrawing it.
export const CatSprite = memo(function CatSprite({
  id,
  stage,
```

- [ ] **Step 6: Run the tests to see them pass.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/components/GateGame.test.tsx src/logic/gateGame.test.ts src/components/App.test.tsx src/cssVariables.test.ts
```

Expected: PASS, every file (the seeded logic's tests and the App's gate rounds still pass unchanged).

- [ ] **Step 7: Lint, type-check, and run the full suite.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx eslint . && npx tsc -b && npx vitest run --maxWorkers=2
```

Expected: no ESLint or tsc output; `Test Files  55 passed (55)`, `Tests  521 passed (521)`.

- [ ] **Step 8: Measure frame times before and after.** Build this task's game and serve both builds, each in its own background shell:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vite build --outDir /tmp/mia-gate-after --emptyOutDir
```
```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vite preview --outDir /tmp/mia-gate-before --port 4175 --strictPort
```
```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vite preview --outDir /tmp/mia-gate-after --port 4176 --strictPort
```

Expected: `Local:   http://localhost:4175/` and `Local:   http://localhost:4176/`. (Production builds, because the dev server's React adds its own per-render cost.) Then run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const browser = page.context().browser()
  // Frame times while the gate is idle, then while a round plays, on a phone-sized page with the CPU
  // slowed 4× (headless Chromium draws in software, so compare runs, not absolute numbers).
  const measure = (p, ms) =>
    p.evaluate(
      (ms) =>
        new Promise((resolve) => {
          const times = []
          let last = performance.now()
          const end = last + ms
          const frame = (now) => {
            times.push(now - last)
            last = now
            if (now < end) return requestAnimationFrame(frame)
            times.sort((a, b) => a - b)
            const avg = times.reduce((a, b) => a + b, 0) / times.length
            resolve({ avgMs: +avg.toFixed(1), p95Ms: +times[Math.floor(times.length * 0.95)].toFixed(1), over20: +(times.filter((t) => t > 20).length / times.length).toFixed(2) })
          }
          requestAnimationFrame(frame)
        }),
      ms,
    )
  const out = []
  for (let round = 0; round < 3; round++) {
    for (const [name, port] of [['before', 4175], ['after', 4176]]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
      const p = await context.newPage()
      const cdp = await context.newCDPSession(p)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      await p.goto(`http://localhost:${port}/`)
      await p.waitForTimeout(2500)
      const idle = await measure(p, 3000)
      await p.getByRole('button', { name: 'Toca para jugar' }).click()
      await p.waitForTimeout(300)
      const playing = await measure(p, 6000)
      out.push({ round, name, idle, playing })
      await context.close()
    }
  }
  return out
}
```

Expected: six entries. In at least two of the three rounds, `after.playing.avgMs` is lower than `before.playing.avgMs`, and the gap between playing and idle is narrower after than before. For reference, the throwaway run of this plan measured, at 4× CPU in headless Chromium: before, playing 67–72 ms per frame against an idle 38–47 ms; after, playing 55–67 ms against an idle 40–44 ms. Headless Chromium draws in software and the idle gate (the roaming cats' animated ink filters) dominates, so the absolute numbers say nothing about a phone; the real check is the phone on the pre-send checklist (Task 7), and the no-render-per-frame test above. Record the six entries in the task report.

Then look at a round on your dev server (`npm run dev -- --port 5174 --strictPort`), with `mcp__playwright__browser_run_code_unsafe`:

```js
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const p = await context.newPage()
  await p.goto('http://localhost:5174/')
  await p.waitForTimeout(1500)
  await p.getByRole('button', { name: 'Toca para jugar' }).click()
  const field = await p.locator('.gate-game-field').boundingBox()
  await p.mouse.move(field.x + field.width * 0.2, field.y + field.height / 2)
  await p.waitForTimeout(1200)
  await p.screenshot({ path: '<worktree>/.playwright-mcp/t5-playing.png' })
  await context.close()
}
```

Read `.playwright-mcp/t5-playing.png`: the HUD (`Puntos`, `Combo ×1`, the seconds), yarn and hearts falling at their places, Mishona low in the field toward the pointer's side, Choni and Chavela in the top corners. Stop the three servers and delete the builds:

```bash
rm -rf /tmp/mia-gate-before /tmp/mia-gate-after
```

- [ ] **Step 9: Commit.**

```bash
git add src/components/GateGame.tsx src/components/GateGame.test.tsx src/styles/game.css src/tuning.ts src/components/art/CatSprite.tsx
git commit -m "$(cat <<'EOF'
Move the gate game's drops and catcher from the frame loop, and render React only on its events

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Dad's guitar

**Files:**
- Create: `src/world/props/guitar.ts`
- Modify: `src/world/props/types.ts` (`PropMaterialKey`), `src/tuning.ts` (`PropName`, `tuning.world.props.placements.guitar`, `tuning.world.props.guitar`, `tuning.world.budget.materials`), `src/world/props/shapes.ts` (`splitGroups`), `src/world/props/factories.ts` (export `parts` and `Pieces`), `src/world/props/build.ts`, `src/world/Props.tsx`
- Test: `src/world/props/props.test.ts`, `src/world/props/placement.test.ts`

**Interfaces:**
- **Consumes:** `block`, `rod`, `placed`, `tilt`, `merge` from `src/world/props/shapes.ts`; `PropModel`, `PropPart` from `src/world/props/types.ts`; `colorFrom` from `src/world/palette.ts`; `buildProps`, `propFactories`, `propDrawCalls` from `src/world/props/build.ts` (the guitar joins through `propFactories`, so the merge, the ink edges, the boxes, the budget test, and the placement test all see it); `Props` already mounts inside `DeferredDetail` in `World` and `Backdrop`, so the guitar compiles after the first frame.
- **Produces:**
  - `type PropName` gains `'guitar'`; `type PropMaterialKey` gains `'gold' | 'rosewood' | 'pickup'`.
  - `tuning.world.props.placements.guitar = { at: [12.4, -9.35], turn: -0.2, scale: 1.7 }`; `tuning.world.props.guitar = { depth, bevel, curveSegments, neckFrom, nut, neckWidth, headTop, headWidth, pickupsAt, knobsAt, lean, colors: { gold, rosewood, pickup } }`; `tuning.world.budget.materials` is `17`.
  - `mockingbirdOutline(): THREE.Shape` and `guitar(): PropModel` (`src/world/props/guitar.ts`).
  - `splitGroups(geometry: THREE.BufferGeometry): THREE.BufferGeometry[]` (`shapes.ts`); `parts(pieces: Pieces): PropPart[]` and `type Pieces` are exported from `factories.ts`.

- [ ] **Step 1: Write the failing tests.** The guitar brings at most three new materials, draws the Mockingbird's two horns (the treble one longer) and deep cutaways, stands on the floor leaning back, and leans in the corner by the Familia door; the budget and placement tests name it.

In `src/world/props/props.test.ts`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```ts
import { buildProps, disposeBuiltProps, propDrawCalls, propFactories, totalCalls } from './build'
import { buildMoodProps, disposeMoodBuild, moodDrawCalls, moodMaterials, skyAndMotesCalls } from './moodProps'
import { familyDrawCalls } from '../familyWalk'

describe('the lived-in attic (spec §5)', () => {
  it('builds every prop from a pure factory: the same shapes on every call', () => {
```

Replace with:

```ts
import { buildProps, disposeBuiltProps, propDrawCalls, propFactories, totalCalls } from './build'
import { buildMoodProps, disposeMoodBuild, moodDrawCalls, moodMaterials, skyAndMotesCalls } from './moodProps'
import { familyDrawCalls } from '../familyWalk'
import { mockingbirdOutline } from './guitar'

describe('the lived-in attic (spec §5)', () => {
  it('builds every prop from a pure factory: the same shapes on every call', () => {
```

2. Find:

```ts
  })
})

describe('the draw-call budget (spec §8)', () => {
  const built = buildProps()
  afterAll(() => disposeBuiltProps(built))
```

Replace with:

```ts
  })
})

// This work's spec §6: dad's B.C. Rich Mockingbird Contour in gold top.
describe("dad's guitar (spec §6)", () => {
  const others = (Object.keys(propFactories) as PropName[]).filter((name) => name !== 'guitar')

  it('brings at most three new materials: its gold, its rosewood, and its black pickups', () => {
    const model = propFactories.guitar()
    const mine = model.parts.map((part) => part.material)
    const before = new Set(others.flatMap((name) => propFactories[name]().parts.map((part) => part.material)))
    const added = mine.filter((material) => !before.has(material)).sort()
    expect(added).toEqual(['gold', 'pickup', 'rosewood'])
    expect(added.length).toBeLessThanOrEqual(3)
    // The bone inlays share the props' paper.
    expect(mine).toContain('paper')
    for (const part of model.parts) part.geometry.dispose()
  })

  it('draws the Mockingbird: two horns, the treble one longer, above the neck joint', () => {
    const points = mockingbirdOutline().getPoints(20)
    const bass = points.filter((p) => p.x < -0.05)
    const treble = points.filter((p) => p.x > 0.05)
    const top = (list: typeof points) => Math.max(...list.map((p) => p.y))
    const joint = 0.27
    expect(top(bass)).toBeGreaterThan(joint)
    expect(top(treble)).toBeGreaterThan(top(bass))
    // The deep cutaways: each side comes back in toward the neck below its horn.
    const widest = (list: typeof points) => Math.max(...list.map((p) => Math.abs(p.x)))
    expect(widest(bass.filter((p) => p.y > 0.22 && p.y < 0.28))).toBeLessThan(widest(bass))
  })

  it('stands on the floor, as tall as a guitar, leaning back against the wall', () => {
    const model = propFactories.guitar()
    const box = new THREE.Box3()
    for (const part of model.parts) {
      part.geometry.computeBoundingBox()
      box.union(part.geometry.boundingBox!)
    }
    const g = tuning.world.props.guitar
    expect(box.min.y).toBeGreaterThanOrEqual(-1e-6)
    expect(box.max.y).toBeGreaterThan(g.headTop * 0.95)
    // The headstock leans back, behind the body's foot.
    expect(box.min.z).toBeLessThan(-g.headTop * Math.sin(THREE.MathUtils.degToRad(g.lean)) * 0.7)
    for (const part of model.parts) part.geometry.dispose()
  })

  it('leans in the corner by the Familia door: past the last station, against the back wall, under the roof', () => {
    const built = buildProps()
    const box = built.boxes.find((b) => b.name === 'guitar')!.box
    const { halfWidth, wallZ, ridge, eave } = tuning.world.attic
    const familiaX = tuning.world.path.length / 2
    expect(box.min.x).toBeGreaterThan(familiaX)
    expect(box.max.x).toBeLessThan(halfWidth)
    expect(box.min.z).toBeGreaterThan(wallZ)
    expect(box.max.z).toBeLessThan(wallZ + 1.5)
    const roof = eave + (ridge - eave) * (1 - box.max.x / halfWidth)
    expect(box.max.y).toBeLessThan(roof)
    disposeBuiltProps(built)
  })
})

describe('the draw-call budget (spec §8)', () => {
  const built = buildProps()
  afterAll(() => disposeBuiltProps(built))
```

3. Find:

```ts
    expect(bookAtRest + calls + familyDrawCalls).toBeLessThanOrEqual(book)
    expect(attic + calls).toBeLessThanOrEqual(backdrop)
    expect(propDrawCalls(built).materials + moodMaterials[mood].length).toBeLessThanOrEqual(materials)
    // A low device draws fewer stars and fireflies, never more (the calls stay the same: one each).
    expect(tierCount(tuning.world.stars.count, tier)).toBeLessThanOrEqual(tuning.world.stars.count)
    expect(tierCount(tuning.world.mood.fireflies.count, tier)).toBeLessThanOrEqual(tuning.world.mood.fireflies.count)
```

Replace with:

```ts
    expect(bookAtRest + calls + familyDrawCalls).toBeLessThanOrEqual(book)
    expect(attic + calls).toBeLessThanOrEqual(backdrop)
    expect(propDrawCalls(built).materials + moodMaterials[mood].length).toBeLessThanOrEqual(materials)
    // Dad's guitar is in the count (spec §6): its gold, rosewood, and pickups are merged meshes.
    expect(built.merged.map((m) => m.material)).toEqual(expect.arrayContaining(['gold', 'rosewood', 'pickup']))
    // A low device draws fewer stars and fireflies, never more (the calls stay the same: one each).
    expect(tierCount(tuning.world.stars.count, tier)).toBeLessThanOrEqual(tuning.world.stars.count)
    expect(tierCount(tuning.world.mood.fireflies.count, tier)).toBeLessThanOrEqual(tuning.world.mood.fireflies.count)
```

In `src/world/props/placement.test.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
    expect(layouts.map(([, ids]) => ids.length)).toEqual([7, 4])
  })

  const cases = layouts.flatMap(([when, ids]) => screens.map(([width, height]) => [when, width, height, ids] as const))

  it.each(cases)('stay out of the camera corridor at every station and along every glide %s at %i×%i', (_when, width, height, ids) => {
```

Replace with:

```ts
    expect(layouts.map(([, ids]) => ids.length)).toEqual([7, 4])
  })

  it("checks dad's guitar with the other props (spec §6)", () => {
    expect(boxes.map(({ name }) => name)).toContain('guitar')
  })

  const cases = layouts.flatMap(([when, ids]) => screens.map(([width, height]) => [when, width, height, ids] as const))

  it.each(cases)('stay out of the camera corridor at every station and along every glide %s at %i×%i', (_when, width, height, ids) => {
```

- [ ] **Step 2: Run them to see them fail.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/world/props/props.test.ts src/world/props/placement.test.ts
```

Expected: FAIL. `props.test.ts` does not load (`Failed to resolve import "./guitar"`), and `placement.test.ts` fails "checks dad's guitar with the other props (spec §6)" (`expected [ 'crib', 'bookshelf', …(35) ] to include 'guitar'`).

- [ ] **Step 3: Name the guitar, its three materials, its place, and its shape's numbers.** The gold is the candle token a little deeper; the rosewood is a new hex with its comment.

In `src/world/props/types.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
import type * as THREE from 'three'

// The materials the attic's props share (spec §8: shared, Lambert or unlit). The props are merged
// into one geometry per material, so each key is one draw call.
export type PropMaterialKey = 'wood' | 'woodDark' | 'cloth' | 'paper' | 'lamp' | 'tinted'

export interface PropPart {
  material: PropMaterialKey
```

Replace with:

```ts
import type * as THREE from 'three'

// The materials the attic's props share (spec §8: shared, Lambert or unlit). The props are merged
// into one geometry per material, so each key is one draw call. Dad's guitar brings three of its own
// (this work's spec §6): its gold top and hardware, its rosewood, and its black pickups.
export type PropMaterialKey = 'wood' | 'woodDark' | 'cloth' | 'paper' | 'lamp' | 'tinted' | 'gold' | 'rosewood' | 'pickup'

export interface PropPart {
  material: PropMaterialKey
```

In `src/tuning.ts`, make these 3 replacements (each block to find appears exactly once):

1. Find:

```ts
  | 'catBed'
  | 'scratchingPost'
  | 'curtains'

// Where a prop stands: [x, z] on the attic floor, turned `turn` radians about y, at `scale` times
// the size its factory draws.
```

Replace with:

```ts
  | 'catBed'
  | 'scratchingPost'
  | 'curtains'
  | 'guitar'

// Where a prop stands: [x, z] on the attic floor, turned `turn` radians about y, at `scale` times
// the size its factory draws.
```

2. Find:

```ts
        catBed: { at: [9.2, -8.5], turn: 0.25, scale: 1.3 },
        scratchingPost: { at: [11.6, -7.6], turn: 0, scale: 1.3 },
        curtains: { at: [0, -9.85], turn: 0, scale: 1 },
      } satisfies Record<PropName, PropPlacement>,
      books: 16,
      yarnBalls: 5,
      bookColors: [tokens.rose, tokens.deepRose, tokens.plum, tokens.candle, tokens.bone, feelingColors.misha, feelingColors.nana],
```

Replace with:

```ts
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
      // knobs at `knobsAt`. It leans back `lean` degrees against the wall.
      guitar: {
        depth: 0.045,
        bevel: 0.008,
        curveSegments: 10,
        neckFrom: 0.24,
        nut: 0.86,
        neckWidth: 0.05,
        headTop: 1.02,
        headWidth: 0.09,
        pickupsAt: [0.215, 0.14],
        knobsAt: [
          [0.1, 0.075],
          [0.135, 0.1],
          [0.13, 0.05],
          [0.165, 0.075],
        ],
        lean: 12,
        colors: {
          // The gold top and the gold hardware: the candle token, a little deeper (the host's photo).
          gold: [tokens.candle, tokens.shadow, 0.14],
          // Dark rosewood for the neck, the headstock, and the body's sides (the host's photo).
          rosewood: '#4A2A1E',
          // The black humbuckers.
          pickup: tokens.ink,
        },
      },
      books: 16,
      yarnBalls: 5,
      bookColors: [tokens.rose, tokens.deepRose, tokens.plum, tokens.candle, tokens.bone, feelingColors.misha, feelingColors.nana],
```

3. Find:

```ts
    // the book drew at rest in luz before this work (the attic, the book, its stations in view, and
    // the dust); `attic` is the attic's own meshes and its window (sky, halo, moon or sun). The new
    // props must fit in what is left.
    budget: { book: 100, backdrop: 60, bookAtRest: 47, attic: 27, materials: 14 },
    // Spec §3: each mood's own props, in world units, with speeds in radians per second.
    mood: {
      // Saturday: a star-and-crescent mobile turning slowly over the crib, its string rising `hang`
```

Replace with:

```ts
    // the book drew at rest in luz before this work (the attic, the book, its stations in view, and
    // the dust); `attic` is the attic's own meshes and its window (sky, halo, moon or sun). The new
    // props must fit in what is left.
    // `materials` grew by three for dad's guitar (this work's spec §6: at most three new materials).
    budget: { book: 100, backdrop: 60, bookAtRest: 47, attic: 27, materials: 17 },
    // Spec §3: each mood's own props, in world units, with speeds in radians per second.
    mood: {
      // Saturday: a star-and-crescent mobile turning slowly over the crib, its string rising `hang`
```

- [ ] **Step 4: Split an extrusion into its caps and sides, and share the factories' merge helper.**

In `src/world/props/shapes.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
  if (!merged) throw new Error('The attic props could not be merged')
  return merged
}
```

Replace with:

```ts
  if (!merged) throw new Error('The attic props could not be merged')
  return merged
}

// A geometry's draw groups, each as a geometry of its own (an extrusion's caps, then its sides),
// ready to merge. Disposes the original.
export function splitGroups(geometry: THREE.BufferGeometry): THREE.BufferGeometry[] {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry
  const pieces = flat.groups.map(({ start, count }) => {
    const piece = new THREE.BufferGeometry()
    for (const [name, attribute] of Object.entries(flat.attributes)) {
      const size = attribute.itemSize
      piece.setAttribute(name, new THREE.BufferAttribute(attribute.array.slice(start * size, (start + count) * size), size))
    }
    return piece
  })
  if (flat !== geometry) flat.dispose()
  geometry.dispose()
  return pieces
}
```

In `src/world/props/factories.ts`, make this replacement (each block to find appears exactly once):

Find:

```ts
// Spec §5: the props shared by both moods, in the pink-noir paper style: flat shapes, slightly
// crooked. Each factory is pure: the same call draws the same prop, in its own space, feet on y = 0.

type Pieces = Partial<Record<PropMaterialKey, THREE.BufferGeometry[]>>

// Each material's pieces merged into one geometry.
function parts(pieces: Pieces): PropPart[] {
  return (Object.entries(pieces) as [PropMaterialKey, THREE.BufferGeometry[]][])
    .filter(([, list]) => list.length > 0)
    .map(([material, list]) => ({ material, geometry: merge(list) }))
```

Replace with:

```ts
// Spec §5: the props shared by both moods, in the pink-noir paper style: flat shapes, slightly
// crooked. Each factory is pure: the same call draws the same prop, in its own space, feet on y = 0.

export type Pieces = Partial<Record<PropMaterialKey, THREE.BufferGeometry[]>>

// Each material's pieces merged into one geometry.
export function parts(pieces: Pieces): PropPart[] {
  return (Object.entries(pieces) as [PropMaterialKey, THREE.BufferGeometry[]][])
    .filter(([, list]) => list.length > 0)
    .map(([material, list]) => ({ material, geometry: merge(list) }))
```

- [ ] **Step 5: Build the Mockingbird.** The body outline is twelve cubic curves in the guitar's own units (about a metre long); the body is extruded thin with a bevel, its caps gold and its sides rosewood; the neck and headstock are rosewood with bone inlays and a bone nut; six gold tuner pegs; two black humbuckers in gold bezels, a gold bridge, tailpiece, and four knobs; then the whole guitar leans back and is set down on the floor.

Create `src/world/props/guitar.ts`:

```ts
import * as THREE from 'three'
import { tuning } from '../../tuning'
import { parts, type Pieces } from './factories'
import { block, placed, rod, splitGroups, tilt } from './shapes'
import type { PropModel } from './types'

// The Mockingbird's hooked, asymmetric body (spec §6), seen from the front with the neck up: from
// the neck joint on the bass side, up the short horn to its hooked tip, down the deep cutaway and the
// bass bout, along the sloping bottom, up the treble bout and waist to the long horn's tip, and back
// to the neck. In the guitar's own units, the bottom at y = 0.
export function mockingbirdOutline(): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(-0.035, 0.27)
  shape.bezierCurveTo(-0.07, 0.3, -0.12, 0.33, -0.15, 0.4)
  shape.bezierCurveTo(-0.175, 0.39, -0.19, 0.37, -0.185, 0.34)
  shape.bezierCurveTo(-0.15, 0.31, -0.13, 0.27, -0.14, 0.24)
  shape.bezierCurveTo(-0.21, 0.21, -0.23, 0.14, -0.205, 0.09)
  shape.bezierCurveTo(-0.19, 0.04, -0.16, 0, -0.1, 0)
  shape.bezierCurveTo(0, 0, 0.1, 0.01, 0.16, 0.03)
  shape.bezierCurveTo(0.21, 0.05, 0.215, 0.11, 0.18, 0.15)
  shape.bezierCurveTo(0.13, 0.19, 0.12, 0.25, 0.16, 0.31)
  shape.bezierCurveTo(0.18, 0.35, 0.19, 0.38, 0.2, 0.42)
  shape.bezierCurveTo(0.17, 0.42, 0.14, 0.39, 0.12, 0.35)
  shape.bezierCurveTo(0.09, 0.31, 0.06, 0.28, 0.035, 0.27)
  shape.closePath()
  return shape
}

// Where a fret's inlay sits on the neck, between the nut and the body (a guitar's frets close up
// toward the body, twelve to an octave).
function fretY(fret: number, nut: number, end: number, lastFret: number): number {
  const along = (1 - 2 ** (-fret / 12)) / (1 - 2 ** (-lastFret / 12))
  return nut - (nut - end) * along
}

// Spec §6: dad's B.C. Rich Mockingbird Contour in gold top. The body extruded thin, its top gold and
// its sides dark; a rosewood neck and headstock with bone inlays; 3+3 tuner pegs; two black
// humbuckers in gold bezels, a bridge and tailpiece, and knobs. It leans back against the wall by
// `lean` degrees, its bottom on the floor. Pure: the same call draws the same guitar.
export function guitar(): PropModel {
  const g = tuning.world.props.guitar
  const { depth, bevel } = g
  // The front of the body, where the neck and the hardware sit.
  const front = depth + bevel
  const pieces: Required<Pick<Pieces, 'gold' | 'rosewood' | 'pickup' | 'paper'>> = { gold: [], rosewood: [], pickup: [], paper: [] }

  const body = new THREE.ExtrudeGeometry(mockingbirdOutline(), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: g.curveSegments,
  })
  const [caps, sides] = splitGroups(body)
  pieces.gold.push(placed(caps!))
  pieces.rosewood.push(placed(sides!))

  // The neck from the body to the nut, the fretboard's inlays, and the headstock.
  const { neckFrom, nut, headTop, neckWidth } = g
  pieces.rosewood.push(block(neckWidth, nut - neckFrom, 0.026, { at: [0, neckFrom, front] }))
  pieces.rosewood.push(block(g.headWidth, headTop - nut, 0.018, { at: [0, nut, front - 0.004] }))
  for (const fret of [3, 5, 7, 9, 12, 15, 17]) {
    const y = fretY(fret, nut, neckFrom + 0.04, 20)
    pieces.paper.push(block(fret === 12 ? neckWidth * 0.75 : neckWidth * 0.45, 0.012, 0.004, { at: [0, y, front + 0.013] }))
  }
  pieces.paper.push(block(neckWidth, 0.008, 0.006, { at: [0, nut - 0.008, front + 0.013] }))

  // 3+3 tuner pegs, gold, each a post and a button.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = nut + 0.04 + i * 0.045
      const x = side * (g.headWidth / 2 - 0.004)
      pieces.gold.push(rod(0.005, 0.022, { at: [x, y, front - 0.004], rotate: [0, 0, -side * (Math.PI / 2)] }, 6))
      pieces.gold.push(rod(0.01, 0.008, { at: [x + side * 0.022, y, front - 0.004], rotate: [0, 0, -side * (Math.PI / 2)] }, 8))
    }
  }

  // Two black humbuckers in gold bezels, the bridge, the tailpiece, and the knobs.
  for (const y of g.pickupsAt) {
    pieces.gold.push(block(0.09, 0.046, 0.008, { at: [0, y - 0.023, front - 0.002] }))
    pieces.pickup.push(block(0.076, 0.034, 0.014, { at: [0, y - 0.017, front + 0.001] }))
  }
  pieces.gold.push(block(0.085, 0.012, 0.012, { at: [0, 0.085, front + 0.002] }))
  pieces.gold.push(block(0.09, 0.014, 0.01, { at: [0, 0.05, front + 0.001] }))
  for (const [x, y] of g.knobsAt) pieces.gold.push(rod(0.012, 0.014, { at: [x, y, front - 0.002], rotate: [Math.PI / 2, 0, 0] }, 10))

  // Leaning back against the wall, then set down so its lowest corner touches the floor.
  const all = Object.values(pieces).flat()
  const lean = new THREE.Matrix4().makeRotationX(-tilt(g.lean))
  const box = new THREE.Box3()
  for (const piece of all) {
    piece.applyMatrix4(lean)
    piece.computeBoundingBox()
    box.union(piece.boundingBox!)
  }
  for (const piece of all) piece.translate(0, -box.min.y, 0)
  return { parts: parts(pieces), instances: [], shadow: 0 }
}
```

- [ ] **Step 6: Put the guitar in the attic, with its colors.**

In `src/world/props/build.ts`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```ts
import * as THREE from 'three'
import { tuning, type PropName } from '../../tuning'
import { bookshelf, catBed, crib, crookedLamp, curtains, rockingChair, scratchingPost, trunks, yarnBasket } from './factories'
import { merge } from './shapes'
import type { PropInstances, PropMaterialKey, PropModel } from './types'
```

Replace with:

```ts
import * as THREE from 'three'
import { tuning, type PropName } from '../../tuning'
import { bookshelf, catBed, crib, crookedLamp, curtains, rockingChair, scratchingPost, trunks, yarnBasket } from './factories'
import { guitar } from './guitar'
import { merge } from './shapes'
import type { PropInstances, PropMaterialKey, PropModel } from './types'
```

2. Find:

```ts
  catBed,
  scratchingPost,
  curtains,
}

export interface BuiltProps {
```

Replace with:

```ts
  catBed,
  scratchingPost,
  curtains,
  guitar,
}

export interface BuiltProps {
```

In `src/world/Props.tsx`, make these 2 replacements (each block to find appears exactly once):

1. Find:

```tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import type { WorldPalette } from './palette'
import { glowTexture } from './paperTextures'
import { buildProps, disposeBuiltProps } from './props/build'
import type { PropMaterialKey } from './props/types'
```

Replace with:

```tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import { colorFrom, type WorldPalette } from './palette'
import { glowTexture } from './paperTextures'
import { buildProps, disposeBuiltProps } from './props/build'
import type { PropMaterialKey } from './props/types'
```

2. Find:

```tsx
    tinted: new THREE.MeshLambertMaterial({ flatShading: true }),
    // The crooked lamp glows by its own color only (spec §5).
    lamp: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
  }
  return {
    byKey,
    ink: new THREE.LineBasicMaterial({ color: tokens.ink, transparent: true, opacity: tuning.world.props.inkOpacity }),
```

Replace with:

```tsx
    tinted: new THREE.MeshLambertMaterial({ flatShading: true }),
    // The crooked lamp glows by its own color only (spec §5).
    lamp: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    // Dad's guitar keeps its own colors in every look; the look's light falls on them.
    gold: lit(),
    rosewood: lit(),
    pickup: lit(),
  }
  const { colors } = tuning.world.props.guitar
  byKey.gold.color.copy(colorFrom(colors.gold))
  byKey.rosewood.color.copy(colorFrom(colors.rosewood))
  byKey.pickup.color.copy(colorFrom(colors.pickup))
  return {
    byKey,
    ink: new THREE.LineBasicMaterial({ color: tokens.ink, transparent: true, opacity: tuning.world.props.inkOpacity }),
```

- [ ] **Step 7: Run the tests to see them pass.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run src/world
```

Expected: PASS, every file (the budget test runs every mood, theme, and tier with the guitar's three meshes in; the placement test checks it at every station and glide, before and after the party, on five screens).

- [ ] **Step 8: Lint, type-check, run the full suite, and build.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx eslint . && npx tsc -b && npx vitest run --maxWorkers=2 && npm run build && grep -l "WebGLRenderer" dist/assets/*.js
```

Expected: no ESLint or tsc output; `Test Files  55 passed (55)`, `Tests  526 passed (526)`; the build succeeds and the grep prints only the `World-*.js` chunk.

- [ ] **Step 9: Look at the guitar at Familia, on both days.** Start the dev server (`npm run dev -- --port 5174 --strictPort`). Run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const shots = '<worktree>/.playwright-mcp'
  const browser = page.context().browser()
  const out = []
  for (const [code, theme] of [['n4vk', 'dark'], ['q8lm', 'light']]) {
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 })
      const p = await context.newPage()
      await p.goto(`http://localhost:5174/?e=${code}`)
      await p.evaluate((t) => localStorage.setItem('mia-theme', t), theme)
      await p.reload()
      await p.waitForSelector('.world-canvas canvas', { timeout: 20000 })
      await p.waitForTimeout(1500)
      await p.keyboard.press('ArrowRight')
      await p.waitForTimeout(600)
      await p.getByRole('button', { name: 'La familia' }).click()
      // Let every page settle, so the candle's shadow stops redrawing, then read the dev draw-call readout.
      await p.waitForTimeout(7000)
      await p.screenshot({ path: `${shots}/t6-${code}-${theme}-${width}.png` })
      out.push(`${code} ${width}: ${await p.locator('.draw-calls').textContent()}`)
      await context.close()
    }
  }
  // Level 2: a phone held sideways gets the flat room over the live attic.
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 })
  const p = await context.newPage()
  await p.goto('http://localhost:5174/?e=q8lm')
  await p.waitForSelector('.room-backdrop.is-ready', { timeout: 20000 })
  await p.waitForTimeout(1500)
  await p.getByRole('button', { name: 'La familia' }).click()
  await p.waitForTimeout(3000)
  await p.screenshot({ path: `${shots}/t6-level2-844.png` })
  out.push(`level 2: ${await p.locator('.draw-calls').textContent()}`)
  await context.close()
  return out
}
```

Expected: the book's readouts settle at about `book · normal: 46 calls` (390) and `book · normal: 69`–`72 calls` (1440), three more than before this task, all at or below 100; level 2 about `attic · normal: 41 calls`, at or below 60. (A reading taken while a page is still folding can be higher, because the candle's shadow is drawn a second time; wait and read again.) Read the five screenshots and judge:

- At 1440 × 900 the whole guitar leans against the back wall to the right of the family's doorway, beside the scratching post: the Mockingbird's short hooked horn and long horn, a gold top with darker edges, the dark neck with pale inlays, the headstock with its pegs, the two black pickups, and ink edges.
- At 390 × 844 its neck and headstock show beside the doorway, above the Familia card; the body may sit behind the card. It never covers the card, the doorway, the family, or the HUD.
- Both days and both themes: it takes the look's light (cool moonlight on Saturday, warm dusk on Sunday) and still reads gold. At level 2 (sideways) it is in the attic's right corner.

A placement or size change is a tuning change (`tuning.world.props.placements.guitar`), and the placement test keeps it out of the camera's corridor. Stop the dev server afterwards.

- [ ] **Step 10: Commit.**

```bash
git add src/world/props/guitar.ts src/world/props/types.ts src/world/props/shapes.ts src/world/props/factories.ts src/world/props/build.ts src/world/props/props.test.ts src/world/props/placement.test.ts src/world/Props.tsx src/tuning.ts
git commit -m "$(cat <<'EOF'
Lean dad's gold-top Mockingbird in the attic's corner by the family door

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Preview image, docs, and full verification

**Files:**
- Modify: `public/og-image.jpg` (regenerated), `docs/requirements.md`, `README.md`, `docs/publishing.md`, `docs/stack-and-resources.md`
- Throwaway (deleted in this task): `.superpowers/og-preview.html`, `.superpowers/og-preview.tsx`

**Interfaces:**
- **Consumes:** everything above: `CatSprite` and `catIds` (the ten cats in their coats), `InkDefs`, `copy.share`, the theme variables.
- **Produces:** docs that match the code: the cats table, the rarity mix and counts out of ten, the §6 copy, *The gift QR* (payload, the two renderings, the download, the expiry), the icons, the music, the guitar, US-12's family line, and the pre-send checks.

- [ ] **Step 1: Regenerate the share preview with the ten cats in their coats.** Create the throwaway page:

Create `.superpowers/og-preview.html` (throwaway, git-ignored):

```html
<!doctype html>
<html lang="es" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <!--head-tags-->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./og-preview.tsx"></script>
  </body>
</html>
```

Create `.superpowers/og-preview.tsx` (throwaway, git-ignored):

```tsx
// A throwaway page for public/og-image.jpg (plan Task 7): 1200×630, the title, the share line, and
// the ten cats in their coats. No date and no place. Not committed; deleted after the screenshot.
import '@fontsource/mystery-quest/latin-400.css'
import '@fontsource/alegreya/latin-400.css'
import { createRoot } from 'react-dom/client'
import '../src/index.css'
import { CatSprite } from '../src/components/art/CatSprite'
import { InkDefs } from '../src/components/art/InkDefs'
import { catIds, copy } from '../src/content'

// The preview is always the dark look, whatever the machine prefers.
document.documentElement.setAttribute('data-theme', 'dark')

function Preview() {
  return (
    <div
      className="og"
      style={{
        position: 'fixed',
        inset: 0,
        width: 1200,
        height: 630,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 38%, color-mix(in oklab, var(--plum) 90%, transparent), var(--field) 72%)',
      }}
    >
      <InkDefs still />
      <div style={{ position: 'absolute', inset: 22, border: '2px solid var(--rose)', borderRadius: 14 }} />
      <div style={{ position: 'absolute', inset: 30, border: '1px solid color-mix(in oklab, var(--rose) 70%, transparent)', borderRadius: 10 }} />
      <div
        style={{
          position: 'absolute',
          right: 92,
          top: 62,
          width: 74,
          height: 74,
          borderRadius: '50%',
          background: 'var(--bone)',
          boxShadow: '0 0 40px color-mix(in oklab, var(--bone) 55%, transparent)',
        }}
      />
      <p
        style={{
          position: 'absolute',
          top: 118,
          width: '100%',
          margin: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: 104,
          lineHeight: 1,
          color: 'var(--rose)',
          textShadow: '0 0 24px color-mix(in oklab, var(--rose) 45%, transparent)',
        }}
      >
        {copy.share.title}
      </p>
      <p
        style={{
          position: 'absolute',
          top: 278,
          width: '100%',
          margin: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-read)',
          fontSize: 27,
          color: 'var(--bone)',
        }}
      >
        {copy.share.description}
      </p>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 360,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {catIds.map((id) => (
          <CatSprite key={id} id={id} stage="luz" size={104} />
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Preview />)
```

Start the dev server (`npm run dev -- --port 5174 --strictPort`) and run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 1200, height: 630 } })
  const p = await context.newPage()
  await p.goto('http://localhost:5174/.superpowers/og-preview.html')
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(1500)
  await p.screenshot({ path: '<worktree>/public/og-image.jpg', type: 'jpeg', quality: 86 })
  await context.close()
}
```

Then check it and delete the page:

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; file public/og-image.jpg && ls -l public/og-image.jpg && rm .superpowers/og-preview.html .superpowers/og-preview.tsx
```

Expected: `JPEG image data, … 1200x630`, and a size under `307200` bytes (the throwaway run gave about 72 KB). Read `public/og-image.jpg`: the rose title `Baby shower de Mia` in Mystery Quest, `Una invitación para invitados especiales.` under it, the moon at the top right, the double rose border, and the ten cats in a row in their coats (Mishona, Choni, Chavela, Kiri kiri, Delilah, Chona, Chori, Minina, Misha, Kira), each with its feeling-color glow, on the dark plum field. No date and no place anywhere. The `og:` tags in `src/headMeta.ts` are untouched.

- [ ] **Step 2: Update `docs/requirements.md`** (spec §7: the cats table, the rarity mix and counts, §6 copy, *The gift QR*, the icons, the music, the guitar, and US-12's family line; and every story, rule, and table that named the old cats, counted seven, or said the site does not draw a QR).

In `docs/requirements.md`, make these 61 replacements, in order (each block to find appears exactly once when you reach it):

1. Find:

```markdown
- `Toca para jugar` starts a 30-second round. Yarn balls and hearts fall, and the guest moves Luz left and right to catch them:
```

Replace with:

```markdown
- `Toca para jugar` starts a 30-second round. Yarn balls and hearts fall, and the guest moves Mishona left and right to catch them:
```

2. Find:

```markdown
Mimo cheers when the combo reaches ×3, and Susto startles when a drop is missed.
```

Replace with:

```markdown
Choni cheers when the combo reaches ×3, and Chavela startles when a drop is missed.
```

3. Find:

```markdown
- The round pauses while the page is hidden. A long gap between frames, such as after sleep, never ends the round at once.
```

Replace with:

```markdown
- The round pauses while the page is hidden. A long gap between frames, such as after sleep, never ends the round at once.
- It runs smoothly: each frame moves the drops and the catcher directly, and the page is redrawn only when the score, the combo, or the phase changes. Target: a steady 60 frames per second on a mid-range phone.
```

4. Find:

```markdown
- Luz, Mimo, and Susto rest below the game, play with the yarn, the box, and a heart, and can be greeted here. While a round plays, the roaming Luz steps aside, because she is the catcher; she is back when the round ends.
```

Replace with:

```markdown
- Mishona, Choni, and Chavela rest below the game, play with the yarn, the box, and a heart, and can be greeted here. While a round plays, the roaming Mishona steps aside, because she is the catcher; she is back when the round ends.
```

5. Find:

```markdown
6. **Presente** — presence first, then a gift box whose ribbon unties and whose lid lifts to reveal the shared QR on its plate, with `Guardar QR` below. Only until the party is over.
```

Replace with:

```markdown
6. **Presente** — one line, presence first, then a gift box whose ribbon unties and whose lid lifts to reveal the gift QR drawn in the invitation's style, with `Guardar QR` below as a cat button and its hint. Only until the party is over. See *The gift QR*.
```

6. Find:

```markdown
A theme control, the music control, and `Tus gatos` stay fixed on screen on the gate and on both invitations. On an invitation the quest log also stays on screen (see *The game layer*). The theme offers **Oscuro** and **Claro**.
```

Replace with:

```markdown
A theme control, the music control, and `Tus gatos` stay fixed on screen on the gate and on both invitations. On an invitation the quest log also stays on screen (see *The game layer*). The theme offers **Oscuro** and **Claro** as a moon and a sun drawn in the ink style; their names stay for screen readers as visually hidden text, the active one is pressed, and each is a touch target of at least 44 px. `Tus gatos` is a cat's head with a small badge `{n}/10`, the cats met out of all of them; its name stays `Tus gatos` and the count is read with it.
```

7. Find:

```markdown
a cat bed; a scratching post; and curtains at the window. Soft painted shadows lie under the crib, the chair, and the trunks.
```

Replace with:

```markdown
a cat bed; a scratching post; curtains at the window; and, leaning against the back wall in the corner by the Familia door, dad's guitar: a B.C. Rich Mockingbird Contour in gold top, its hooked body extruded thin with darker sides, a rosewood neck with bone inlays, a 3+3 headstock, two black humbuckers in gold bezels, a bridge, and knobs, with ink edges. It is there on both days, in every look, in the live attic too. Soft painted shadows lie under the crib, the chair, and the trunks.
```

8. Find:

```markdown
- The landmarks left are Llegada, Palabra, Cuándo, and Familia. The cats and the door remain.
```

Replace with:

```markdown
- The landmarks left are Llegada, Palabra, Cuándo, and Familia. The cats and the door remain: all ten cats move onto those four pages (see *The cats*).
```

9. Find:

```markdown
Seven cats. Each one has a feeling, a rarity, a way of moving, and a sentence you learn only after they stay. The feelings follow the idea of Inside Out: a person is many moods, and you can tell them apart. The drawings are original. They are not those characters.

| Id | Name | Feeling | Rarity | Where they appear | What they do | Line once they stay |
| --- | --- | --- | --- | --- | --- | --- |
| `luz` | Luz | Alegría | Común | Gate and invitation | Bats the countdown so a number wobbles, chases the heart, pounces | Siempre encuentra algo que perseguir. |
| `mimo` | Mimo | Ternura | Común | Gate and invitation | Sleeps on the corner of a card, slow blink, comes if you wait | Le gusta que te quedes un rato. |
| `susto` | Susto | Temor | Poco común | Gate and invitation | Startles at nothing beside a button, then peeks back | Se asoma cuando el mundo está en calma. |
| `bram` | Bram | Ímpetu | Poco común | Invitation | Scratches the edge of the countdown, throws the guitar pick, then flops | Hace ruido y después se queda. |
| `nana` | Nana | Delicadeza | Poco común | Invitation | Sits on the QR frame, sniffs it, steps off the code | Elige un solo lugar, y ese es el suyo. |
| `misha` | Misha | Calma | Legendario | Invitation, at the family door | One slow scratch on the door frame, tail up. Notices you sooner if the music is on | Está en calma, y está en casa. |
| `kira` | Kira | Asombro | Legendario | Invitation, at the family door | Bats a star off the door, watches it fall, then comes closer | Mira la puerta, y se queda cerca. |

While motion is allowed, each cat also has a loop of its own on its page (design §4): Luz pounces, Mimo curls up and slow-blinks, Susto hides and peeks, Bram struts and flicks the pick, Nana grooms on her throne, and Misha and Kira glow by the door.
```

Replace with:

```markdown
Ten cats: the family's own. Each one has a feeling, a rarity, a way of moving, and a sentence you learn only after they stay. The feelings follow the idea of Inside Out: a person is many moods, and you can tell them apart. Misha and Kira are drawn as the real cats (from the host's photo, never committed); the others are their family, drawn in the same style. The ids stay as they were, so a guest's saved `mia-cats` still loads.

| Id | Name | Feeling | Rarity | Page (party current → over) | What they do | Line once they stay |
| --- | --- | --- | --- | --- | --- | --- |
| `luz` | Mishona | Coquetería | Común | Cuándo and the gate → Cuándo | Bats the countdown so a number wobbles, chases the heart, pounces. The gate game's catcher | Se arregla los bigotes antes de saludarte. |
| `mimo` | Choni | Cariño | Común | Palabra and the gate → Palabra | Sleeps on the corner of a card, slow blink, comes if you wait | Se acurruca a tu lado y ronronea bajito. |
| `susto` | Chavela | Temor | Poco común | Confirmar and the gate → Llegada | Startles at nothing beside a button, then peeks back | Se asoma cuando el mundo está en calma. |
| `bram` | Kiri kiri | Juego | Poco común | Cuándo → Cuándo | Scratches the edge of the countdown, throws the guitar pick, then flops | Tira la púa, la persigue y vuelve por más. |
| `nana` | Delilah | Curiosidad | Poco común | Presente, on the gift box → Palabra | Sits on the QR frame, sniffs it, steps off the code | Todo lo huele primero, hasta el QR. |
| `chona` | Chona | Energía | Poco común | Llegada → Llegada | Races in a short arc, skids, looks back | Llega corriendo y no se queda quieta. |
| `chori` | Chori | Apapacho | Poco común | Dónde, on the treasure map → Palabra | Rolls over slowly, paws in the air | Redondita, tranquila y siempre con hambre. |
| `minina` | Minina | Travesura | Poco común | Confirmar, batting the wax seal → Llegada | Bats at the seal's ribbon, pounces | Pequeñita, blanca y lista para jugar. |
| `misha` | Misha | Calma | Legendario | Familia, at the family door | One slow scratch on the door frame, tail up. Notices you sooner if the music is on | Está en calma, y está en casa. |
| `kira` | Kira | Asombro | Legendario | Familia, at the family door | Bats a star off the door, watches it fall, then comes closer | Mira la puerta, y se queda cerca. |

The mix is 2 Común, 6 Poco común, and 2 Legendario. Every count and total (the quest log, **Tus gatos**, `Todos los gatos`) comes from this list: ten, not a fixed number.

While motion is allowed, each cat also has a loop of its own on its page (design §4): Mishona pounces, Choni curls up and slow-blinks, Chavela hides and peeks, Kiri kiri struts and flicks the pick, Delilah grooms on the gift box, Chona dashes and looks back, Chori rolls on her back, Minina bats at the seal, and Misha and Kira glow by the door.
```

10. Find:

```markdown
- **Scare at nothing.** Susto freezes and jumps at an empty spot, then peeks back. Nothing is there. No monster.
```

Replace with:

```markdown
- **Scare at nothing.** Chavela freezes and jumps at an empty spot, then peeks back. Nothing is there. No monster.
```

11. Find:

```markdown
| Invitation countdown | Luz | Bat a number. Bram may also scratch the frame. |
| Verse card | Mimo | Lift her head from the corner. |
| QR | Nana | Sit on the frame, then step off. The code may tilt and then lies flat. |
| An empty spot near a button | Susto | Startle, then peek back. |
```

Replace with:

```markdown
| Invitation countdown | Mishona | Bat a number. Kiri kiri may also scratch the frame. |
| Verse card | Choni | Lift her head from the corner. |
| QR | Delilah | Sit on the frame, then step off. The code may tilt and then lies flat. |
| An empty spot near a button | Chavela | Startle, then peek back. A tap on a cat (Minina by the seal) is not an empty spot, and the confirm link never starts anything. |
```

12. Find:

```markdown
- A phone cannot scan a code that is already on its own screen. Under the image, `Guardar QR` shares the file when the browser can share files, and otherwise downloads it. The guest can then open it in their bank app or show it on another screen. The site does not invent a bank deep link: the hosts supplied an image, not a payment URI, and the bank is unknown. The control is absent while the image is missing. Tapping `Guardar QR` does not play Nana's tilt.
- The QR sits on a white plate in both themes. It stays an ordinary image, so a long press can still save it where share and download are not available, such as some in-app browsers. The drag surface does not capture a press that starts on the QR.
```

Replace with:

```markdown
- A phone cannot scan a code that is already on its own screen. `Guardar QR` saves a plain copy (see *The gift QR*): it shares the PNG when the browser can share files, and otherwise downloads it. The guest can then open it in their bank app or show it on another screen. The site opens no bank deep link. The control is absent while the payload is empty. Tapping `Guardar QR` does not play Delilah's tilt.
- The QR is drawn on bone paper in both themes. The drag surface does not capture a press that starts on the QR.

### The gift QR

- **Payload.** The Banco Ganadero transfer QR, decoded locally (no online service) from the host's image: a version-13 code at error correction L holding 369 characters of base64-like text, with no readable name or account number. The payload is stored verbatim in the content module as a fact, next to the address and the WhatsApp number. The host's images, and the name and account number printed around the QR, never enter the repo. The bank's QR expires on **27 September 2027**.
- **Two renderings of the same payload**, built at runtime by a small MIT-licensed encoder (`qrcode-generator`):
  - **On screen:** error correction H (version 20), drawn as SVG in the palette: ink modules in rounded runs on bone paper, rounded finder eyes, a quiet zone of at least 4 modules, and a small cat emblem in the centre, where the bank's `$` was. The emblem covers at most 10% of the code and never a finder or alignment pattern. The plate keeps the minimum QR size (220 CSS px; 245 px in the book).
  - **Download:** error correction M (version 15), no emblem, black on white, 1024 px square with a white quiet zone of at least 4 modules, saved as `qr-regalo-mia.png`.
- **The cat button.** `Guardar QR` is a small drawn cat face with a download arrow beside the text, with `Toca el gatito para guardar el QR en tu celular.` under it. It shares the file where the browser can share files, and otherwise downloads it. The `QR guardado` badge still counts.
- **Proof.** Tests rasterize both matrices and decode them with `jsqr` (the screen one with its emblem's modules forced light); each must equal the stored payload exactly. Before the links go out, the host scans the page and the downloaded PNG with the Banco Ganadero app.
- If the payload were ever empty, the box would show `El QR estará aquí pronto.` and no `Guardar QR`.
```

13. Find:

```markdown
- Susto: if the camera moves faster than 600 px per second while he is inside the middle area, his `Saludar` hides and his wait starts again.
```

Replace with:

```markdown
- Chavela: if the camera moves faster than 600 px per second while she is inside the middle area, her `Saludar` hides and her wait starts again.
- The three new cats have their own waits: Chona needs a little patience (2 s), Chori comes if you wait (3.2 s), and Minina notices you after a short stay on Confirmar (0.9 s).
```

14. Find:

```markdown
It shows `{n} de 7`, the number of cats in the current round.
```

Replace with:

```markdown
It shows `{n} de 10`, the number of cats in the current round out of all ten.
```

15. Find:

```markdown
- Cats already met stay in **Tus gatos** with their lines. Nothing is forgotten. The count starts again at `0 de 7`.
```

Replace with:

```markdown
- Cats already met stay in **Tus gatos** with their lines. Nothing is forgotten. The count starts again at `0 de 10`.
```

16. Find:

```markdown
`{n} XP`, `Páginas {n}/{total}`, and `Gatos {n}/7`.
```

Replace with:

```markdown
`{n} XP`, `Páginas {n}/{total}`, and `Gatos {n}/10`.
```

17. Find:

```markdown
| Todos los gatos | All seven cats met | 150 |
```

Replace with:

```markdown
| Todos los gatos | All ten cats met | 150 |
```

18. Find:

```markdown
The line under the door is `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`
```

Replace with:

```markdown
The line under the door is `La familia se hace más grande, y nos encantaría que nos acompañes.`
```

19. Find:

```markdown
- Taking or recording payments. The site only displays a QR image.
```

Replace with:

```markdown
- Taking or recording payments. The site only shows the bank's QR and saves a copy of it.
```

20. Find:

```markdown
- Generating a QR from a payment string.
```

Replace with nothing (delete the line).

21. Find:

```markdown
One track, provided later by the hosts, loops quietly under the gate and under the room.
```

Replace with:

```markdown
One track, the host's own (`src/assets/audio/ambience.mp3`, 2 min 23 s at 256 kbps, 4.6 MB), loops quietly under the gate and under the room. It loads only when the guest turns music on (`preload="none"`).
```

22. Find:

```markdown
Each cat is recognizable at a glance: a different silhouette, a different feeling color, and one loop that belongs only to them. Luz is never still. Mimo is round and low. Susto is small and half-hidden. Bram is the one with the pick. Nana sits on the QR frame. Misha is long and calm, close to the door. Kira sits by that same door and watches the family come in.
```

Replace with:

```markdown
Each cat is recognizable at a glance: a different silhouette, a different coat or trait, a different feeling color, and one loop that belongs only to them. Mishona has a bow and lashes. Choni is curled and round. Chavela is small, black, and half-hidden. Kiri kiri is the tabby with the pick. Delilah is black, nose forward, on the QR frame. Chona is mid-leap. Chori is round and belly-up. Minina is small and pure white. Misha is long and calm, close to the door. Kira sits by that same door and watches the family come in.
```

23. Find:

```markdown
- One family style for all seven: scratchy double ink outlines, big and slightly mismatched eyes, spindly legs and spiral tails, a few stitch marks, and ink-black bodies, as in `ideas/IMG-20260926-WA0000.jpg` and `ideas/IMG-20260913-WA0018(1).jpg`. Mimo is the one exception: a blush body.
```

Replace with:

```markdown
- One family style for all ten: scratchy double ink outlines, big and slightly mismatched eyes, spindly legs and spiral tails, and a few stitch marks. Each cat wears its family's coat: the Misha family (Misha, Mishona, Choni, Chona, Chori) white with silver-gray patches, each variant shifting the patches a little; the Kira family (Kira, Kiri kiri) a brown-gray tabby with tiger stripes and white paws; Delilah and Chavela black; Minina pure white. Misha has green eyes and Kira and Kiri kiri amber-green ones; every other cat's eyes are its feeling color. Light coats keep their edge on the bone paper with the ink outline and a soft shade along their lower edge.
```

24. Find:

```markdown
- No skulls, spikes, vests, or weapons. Bows stay light: Mimo alone wears a small bow.
```

Replace with:

```markdown
- No skulls, spikes, vests, or weapons. Bows stay light: Mishona alone wears a small bow.
```

25. Find:

```markdown
| Luz | Alegría | `#F5C542` sunny gold | 11.7:1 | Round head, high tail | Pounces and chases. Bats a countdown digit. Almost never sits. |
| Mimo | Ternura | `#F28DB2` rose | 8.4:1 | Low and round, blush body, a small bow | Curls up and slow-blinks on the corner of a card. If the guest waits, the head lifts. |
| Susto | Temor | `#A98BEA` violet | 6.9:1 | Small, ears back | Hides and peeks. Jumps at nothing, then peeks back. |
| Bram | Ímpetu | `#F2784B` ember | 6.9:1 | Stocky, lightning tail tip, a guitar pick | Struts, flicks the pick, scratches the countdown frame, flops. |
| Nana | Delicadeza | `#7FD9B0` mint | 11.3:1 | Upright, crown-shaped ears | Grooms on her throne, the QR frame. Sniffs the code and steps off it. |
```

Replace with:

```markdown
| Mishona | Coquetería | `#F5C542` sunny gold | 11.7:1 | Misha's coat, round head, high swishy tail, a bow and lashes | Pounces and chases. Bats a countdown digit. Almost never sits. |
| Choni | Cariño | `#F28DB2` rose | 8.4:1 | Misha's coat, low and round, curled with a heart | Curls up and slow-blinks on the corner of a card. If the guest waits, the head lifts. |
| Chavela | Temor | `#A98BEA` violet | 6.9:1 | Black, small, ears back | Hides and peeks. Jumps at nothing, then peeks back. |
| Kiri kiri | Juego | `#F2784B` ember | 6.9:1 | Kira's tabby coat, stocky, white paws, a guitar pick | Struts, flicks the pick, scratches the countdown frame, flops. |
| Delilah | Curiosidad | `#7FD9B0` mint | 11.3:1 | Black, upright, nose forward | Grooms on the gift box, the QR frame. Sniffs the code and steps off it. |
| Chona | Energía | `#B8E05A` chartreuse | 12.4:1 | Misha's coat, mid-leap | Races in a short arc, skids, looks back. |
| Chori | Apapacho | `#F6B48C` apricot | 11.1:1 | Misha's coat, round, belly-up, paws in the air | Rolls over slowly. |
| Minina | Travesura | `#E48FE0` orchid | 8.6:1 | Small, pure white, pink nose | Bats at the wax seal's ribbon, pounces. |
```

26. Find:

```markdown
| Misha | Calma | `#8EB8F0` moon blue | 9.3:1 | Long, calm | Glows by the door.
```

Replace with:

```markdown
| Misha | Calma | `#8EB8F0` moon blue | 9.3:1 | White with silver-gray patches, long, calm | Glows by the door.
```

27. Find:

```markdown
| Kira | Asombro | `#5FD4D0` star teal | 10.7:1 | Slim, tall | Glows by the door.
```

Replace with:

```markdown
| Kira | Asombro | `#5FD4D0` star teal | 10.7:1 | Long-furred brown-gray tabby, white chin, chest, and paws, slim, tall | Glows by the door.
```

28. Find:

```markdown
Bows stay light: Mimo's small bow, and none on the family silhouettes.
```

Replace with:

```markdown
Bows stay light: Mishona's small bow, and none on the family silhouettes.
```

29. Find:

```markdown
- Gift lead: `Lo más importante es que vengas.`
- Gift offer: `Si quieres tener un detalle, puedes transferir con este QR. El monto lo eliges tú.`
```

Replace with:

```markdown
- Gift line: `El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.`
```

30. Find:

```markdown
- QR save: `Guardar QR`
```

Replace with:

```markdown
- QR save: `Guardar QR`
- QR save hint: `Toca el gatito para guardar el QR en tu celular.`
```

31. Find:

```markdown
- Collection: `Tus gatos`
```

Replace with:

```markdown
- Collection: `Tus gatos`, with its badge `{n}/{total}`
```

32. Find:

```markdown
- Round count: `{n} de 7`
```

Replace with:

```markdown
- Round count: `{n} de {total}`
```

33. Find:

```markdown
- Door line: `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`
```

Replace with:

```markdown
- Door line: `La familia se hace más grande, y nos encantaría que nos acompañes.`
```

34. Find:

```markdown
- Theme names: `Oscuro` and `Claro`
```

Replace with:

```markdown
- Theme names: `Oscuro` and `Claro` (the moon's and the sun's hidden names)
```

35. Find:

```markdown
- Quest log: `Páginas {n}/{total}`, `Gatos {n}/7`, `Nivel {n}`, `{n} XP`
```

Replace with:

```markdown
- Quest log: `Páginas {n}/{total}`, `Gatos {n}/{total}`, `Nivel {n}`, `{n} XP`
```

36. Find:

```markdown
**Independent test:** Render Presente with a fixture image and with no image.

**Acceptance scenarios:**

1. **Given** the QR image is present, **When** the guest can see Presente, **Then** that image is visible on a white plate, at least the minimum QR size from the tuning module (220 CSS pixels) on screen, with the alternative text from section 6. In the book it is drawn larger, so a page at its smallest scale still shows it at that size.
2. **Given** the QR file is missing, **When** Presente renders, **Then** it shows `El QR estará aquí pronto.` and no broken image and no generated code.
3. **Given** Presente, **When** it renders, **Then** it shows the gift lead and offer, and it does not name an amount, a bank, or an account.
4. **Given** the QR image is present, **When** the guest activates `Guardar QR`, **Then** the browser shares that image file if it can, and otherwise downloads it. No bank URI is opened.
```

Replace with:

```markdown
**Independent test:** Render Presente with the stored payload and with an empty one; decode both renderings of the payload with `jsqr`.

**Acceptance scenarios:**

1. **Given** the payload, **When** the guest can see Presente, **Then** the QR is drawn as SVG on bone paper, at least the minimum QR size from the tuning module (220 CSS pixels) on screen, with the alternative text from section 6, three rounded finder eyes, and the cat emblem. In the book it is drawn larger, so a page at its smallest scale still shows it at that size.
2. **Given** an empty payload, **When** Presente renders, **Then** it shows `El QR estará aquí pronto.` and no QR and no `Guardar QR`.
3. **Given** Presente, **When** it renders, **Then** it shows the gift line, and it does not name an amount, a bank, or an account.
4. **Given** the payload, **When** the guest activates `Guardar QR`, **Then** the browser shares `qr-regalo-mia.png` (1024 px, black on white) if it can, and otherwise downloads it. No bank URI is opened.
5. **Given** the screen and download matrices, **When** they are rasterized and decoded (the screen one with its emblem forced light), **Then** each decodes to the stored payload exactly.
```

37. Find:

```markdown
1. **Given** an empty state, **When** the guest greets Luz, **Then** the stored state is `{ caught: ["luz"], round: ["luz"], rounds: 1 }` and the page shows `Se quedó contigo: Luz.`, `Común`, and `Siempre encuentra algo que perseguir.`
2. **Given** Luz is already in the current round, **When** the guest greets Luz again, **Then** the state is unchanged.
```

Replace with:

```markdown
1. **Given** an empty state, **When** the guest greets Mishona, **Then** the stored state is `{ caught: ["luz"], round: ["luz"], rounds: 1 }` and the page shows `Se quedó contigo: Mishona.`, `Común`, and `Se arregla los bigotes antes de saludarte.`
2. **Given** Mishona is already in the current round, **When** the guest greets Mishona again, **Then** the state is unchanged.
```

38. Find:

```markdown
7. **Given** the gate, **When** the guest greets Mimo, **Then** `mimo` is stored, and Bram is not on the gate.
```

Replace with:

```markdown
7. **Given** the gate, **When** the guest greets Choni, **Then** `mimo` is stored, and Kiri kiri is not on the gate.
```

39. Find:

```markdown
10. **Given** Susto noticing, **When** the camera moves faster than 600 px per second while he is inside the middle area, **Then** he is not noticing and his wait starts again.
```

Replace with:

```markdown
10. **Given** Chavela noticing, **When** the camera moves faster than 600 px per second while she is inside the middle area, **Then** she is not noticing and her wait starts again.
```

40. Find:

```markdown
12. **Given** stored data with an unknown id, a duplicate, or unreadable JSON, **When** the page loads, **Then** those entries are dropped and the page renders.
```

Replace with:

```markdown
12. **Given** stored data with an unknown id, a duplicate, or unreadable JSON, **When** the page loads, **Then** those entries are dropped and the page renders.
13. **Given** a `mia-cats` saved before the cats were renamed (the ids `luz`, `mimo`, `susto`, `bram`, `nana`, `misha`, `kira`), **When** the page loads, **Then** those cats are kept, shown under their new names, and the three new cats show as not yet met.
```

41. Find:

```markdown
1. **Given** the gate and motion allowed, **When** it is showing, **Then** both sentences, `Toca para jugar`, and Luz are visible.
2. **Given** the guest activates `Toca para jugar`, **When** the round plays, **Then** the seconds left start at `30 s` and both sentences stay visible. The roaming Luz steps aside while she is the catcher; Mimo and Susto stay.
3. **Given** a round, **When** its time runs out, **Then** `¡Se acabó el tiempo!` and `Jugar otra vez` show, a best score is stored under `mia-gate-best`, both sentences are still visible, and Luz is back.
```

Replace with:

```markdown
1. **Given** the gate and motion allowed, **When** it is showing, **Then** both sentences, `Toca para jugar`, and Mishona are visible.
2. **Given** the guest activates `Toca para jugar`, **When** the round plays, **Then** the seconds left start at `30 s` and both sentences stay visible. The roaming Mishona steps aside while she is the catcher; Choni and Chavela stay.
3. **Given** a round, **When** its time runs out, **Then** `¡Se acabó el tiempo!` and `Jugar otra vez` show, a best score is stored under `mia-gate-best`, both sentences are still visible, and Mishona is back.
```

42. Find:

```markdown
1. **Given** no track file, **When** the gate or an invitation renders, **Then** there is no music control and no audio element.
```

Replace with:

```markdown
1. **Given** no track file, **When** the gate or an invitation renders, **Then** there is no music control and no audio element. (The host's track is in the project, so the control shows.)
```

43. Find:

```markdown
1. **Given** the gate and motion allowed, **When** it renders, **Then** Luz, Mimo, and Susto are present, and so are the yarn, the box, and a heart.
2. **Given** an invitation and motion allowed, **When** it renders, **Then** Luz, Mimo, Susto, Bram, Nana, Misha, and Kira are present, and the family door shows the faceless paper family (dad with a fuller afro, Miguelito and Mia with smaller curly outlines, mom with straight hair), both legendary cats beside them, and the line `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`
```

Replace with:

```markdown
1. **Given** the gate and motion allowed, **When** it renders, **Then** Mishona, Choni, and Chavela are present, and so are the yarn, the box, and a heart.
2. **Given** an invitation and motion allowed, **When** it renders, **Then** all ten cats are present on their pages, and the family door shows the faceless paper family (dad with a fuller afro, Miguelito and Mia with smaller curly outlines, mom with straight hair), both legendary cats beside them, and the line `La familia se hace más grande, y nos encantaría que nos acompañes.`
```

44. Find:

```markdown
4. **Given** the QR, **When** Nana is on its frame or the guest taps it, **Then** the code may tilt and then lies flat and uncovered.
5. **Given** Susto, **When** the moment plays, **Then** Susto startles at an empty spot and comes back. No other creature appears.
```

Replace with:

```markdown
4. **Given** the QR, **When** Delilah is on its frame or the guest taps it, **Then** the code may tilt and then lies flat and uncovered.
5. **Given** Chavela, **When** the moment plays, **Then** Chavela startles at an empty spot and comes back. No other creature appears.
8. **Given** the party is over, **When** either invitation renders, **Then** the four pages left hold all ten cats: Chavela, Chona, and Minina on Llegada; Choni, Delilah, and Chori on Palabra; Mishona and Kiri kiri on Cuándo; Misha and Kira at the door.
```

45. Find:

```markdown
and **Tus gatos** shows `0 de 7` and `Vuelta 2`.
```

Replace with:

```markdown
and **Tus gatos** shows `0 de 10` and `Vuelta 2`.
```

46. Find:

```markdown
(`rarity-comun` for Luz)
```

Replace with:

```markdown
(`rarity-comun` for Mishona)
```

47. Find:

```markdown
`Páginas 0/6`, and `Gatos 0/7`.
```

Replace with:

```markdown
`Páginas 0/6`, and `Gatos 0/10`.
```

48. Find:

```markdown
`Gatos 1/7` shows,
```

Replace with:

```markdown
`Gatos 1/10` shows,
```

49. Find:

```markdown
the seventh cat earns `Todos los gatos`.
```

Replace with:

```markdown
the tenth cat earns `Todos los gatos`.
```

50. Find:

```markdown
- **BR-5.** The payment QR is one static image for both days. The site does not create a QR and does not send the guest to a payment processor.
- **BR-6.** Presente leads with presence, then the QR, then the line that the guest chooses the amount.
```

Replace with:

```markdown
- **BR-5.** The payment QR is one bank payload for both days, stored in the content module and drawn by the site: styled on screen, plain in the download. The site does not send the guest to a payment processor.
- **BR-6.** Presente leads with presence, then the QR, in one line.
```

51. Find:

```markdown
Ids come only from the seven in section 3.
```

Replace with:

```markdown
Ids come only from the ten in section 3; the ids of the renamed cats did not change.
```

52. Find:

```markdown
- The QR image file is still to be added. Until then the pending sentence is shown.
- The ambience track is still to be added. Until then the music control is hidden.
```

Replace with:

```markdown
- The gift QR is the bank's payload, stored in the content module; it expires on 27 September 2027. The pending sentence shows only if the payload is empty.
- The ambience track is the host's own, in the repo.
```

53. Find:

```markdown
- **BR-18.** The cast is the seven cats plus
```

Replace with:

```markdown
- **BR-18.** The cast is the ten cats plus
```

54. Find:

```markdown
The book places the same seven drawings on its pages as HTML, not a second cast.
```

Replace with:

```markdown
The book places the same ten drawings on its pages as HTML, not a second cast.
```

55. Find:

```markdown
- At most the seven cats and the invitation toys in section 3 are on an invitation. The gate shows three cats.
```

Replace with:

```markdown
- At most the ten cats and the invitation toys in section 3 are on an invitation. The gate shows three cats.
```

56. Find:

```markdown
| QR image | `src/assets/qr.png`, detected at build time. Absent until the hosts add the file. |
| Ambience track | `src/assets/audio/ambience.mp3`, detected at build time. Absent until the hosts add the file. |
```

Replace with:

```markdown
| Gift QR payload | `shared.giftQr`: the Banco Ganadero payload, verbatim (see *The gift QR*). Empty would show the pending sentence. |
| Ambience track | `src/assets/audio/ambience.mp3`, the host's track, detected at build time. |
```

57. Find:

```markdown
One accepted exception: on desktop, the frames that redraw the candle shadow while a page folds reach about `105`; phones stay at or below about `85` |
```

Replace with:

```markdown
One accepted exception: on desktop, the frames that redraw the candle shadow while a page folds reach about `108` with dad's guitar (it adds three calls); phones stay at or below about `88` |
```

58. Find:

```markdown
| Noticing | Susto's rush speed | `600 px/s` |
```

Replace with:

```markdown
| Noticing | Chavela's rush speed | `600 px/s` |
| Noticing | Chona's, Chori's, and Minina's own waits | `2000ms`, `3200ms`, `900ms` |
```

59. Find:

```markdown
| Gate game | Mimo cheers from | combo `×3` |
```

Replace with:

```markdown
| Gate game | Choni cheers from | combo `×3` |
```

60. Find:

```markdown
the catcher Luz steps aside while playing; no game with reduced motion; Luz, Mimo, and Susto are present; Bram is absent |
```

Replace with:

```markdown
the catcher Mishona steps aside while playing; no game with reduced motion; Mishona, Choni, and Chavela are present; Kiri kiri is absent; no React render per animation frame |
```

61. Find:

```markdown
It shows the title in Mystery Quest and the seven cats on the ink field, in their feeling colors, with no date and no place.
```

Replace with:

```markdown
It shows the title in Mystery Quest and the ten cats in their coats on the ink field, each with its feeling-color glow, with no date and no place.
```

- [ ] **Step 3: Update `README.md`.**

In `README.md`, make these 11 replacements, in order (each block to find appears exactly once when you reach it):

1. Find:

```markdown
Along the way they meet seven hand-drawn cats 🐱, collect their cards, and play with the two legendary ones.
```

Replace with:

```markdown
Along the way they meet ten hand-drawn cats 🐱, the family's own, collect their cards, and play with the two legendary ones.
```

2. Find:

```markdown
- 🏠 **A lived-in attic.** A crib under the round window, a bookshelf, a yarn basket, a rocking chair, old trunks, a crooked lamp, a cat bed, a scratching post, and curtains, all in paper and ink.
```

Replace with:

```markdown
- 🏠 **A lived-in attic.** A crib under the round window, a bookshelf, a yarn basket, a rocking chair, old trunks, a crooked lamp, a cat bed, a scratching post, curtains, and dad's gold-top B.C. Rich Mockingbird 🎸 leaning in the corner by the family door, all in paper and ink.
```

3. Find:

```markdown
- 🎁 **Open a gift box** to see the QR, and save it with `Guardar QR`: it shares the image, or downloads it if sharing isn't available.
```

Replace with:

```markdown
- 🎁 **Open a gift box** to see the bank's QR, drawn in the invitation's style with a cat in the middle, and tap the cat button `Guardar QR` to save a plain black-on-white copy (`qr-regalo-mia.png`) for any bank app: it shares the file, or downloads it if sharing isn't available.
```

4. Find:

```markdown
- 🐱 **Meet seven cats.** Original Burton-style paper cats with rigs and a hand-drawn "line boil". Each has a feeling color, a rarity, and a line you only learn after greeting them.
```

Replace with:

```markdown
- 🐱 **Meet ten cats.** Burton-style paper cats with rigs and a hand-drawn "line boil": Misha and Kira drawn as the real cats, and their family in their coats (white with silver-gray patches, brown-gray tabby, black, and pure white). Each has a feeling color, a rarity, and a line you only learn after greeting them.
```

5. Find:

```markdown
- 🕹️ **Gate game.** On the gate, catch yarn and hearts with Luz for 30 seconds, build a combo, and beat your best score.
```

Replace with:

```markdown
- 🕹️ **Gate game.** On the gate, catch yarn and hearts with Mishona for 30 seconds, build a combo, and beat your best score. It runs smoothly: the frame loop moves the drops itself.
```

6. Find:

```markdown
- 🎵 **Turn on music**, once the hosts add a track.
```

Replace with:

```markdown
- 🎵 **Turn on music**: the host's track, loaded only when asked.
- 🌗 **Icons.** A moon and a sun switch Oscuro and Claro; a cat's head with a `n/10` badge opens **Tus gatos**.
```

7. Find:

```markdown
| ☀️ Luz | Alegría | sunny gold | Común |
| 🌸 Mimo | Ternura | rose | Común |
| 👀 Susto | Temor | violet | Poco común |
| ⚡ Bram | Ímpetu | ember | Poco común |
| 👑 Nana | Delicadeza | mint | Poco común |
| 🌙 Misha | Calma | moon blue | Legendario |
| ⭐ Kira | Asombro | star teal | Legendario |
```

Replace with:

```markdown
| 🎀 Mishona | Coquetería | sunny gold | Común |
| 💗 Choni | Cariño | rose | Común |
| 👀 Chavela | Temor | violet | Poco común |
| 🎸 Kiri kiri | Juego | ember | Poco común |
| 👃 Delilah | Curiosidad | mint | Poco común |
| ⚡ Chona | Energía | chartreuse | Poco común |
| 🐟 Chori | Apapacho | apricot | Poco común |
| 🧶 Minina | Travesura | orchid | Poco común |
| 🌙 Misha | Calma | moon blue | Legendario |
| ⭐ Kira | Asombro | star teal | Legendario |
```

8. Find:

```markdown
| File | Where it goes | Until it exists |
| --- | --- | --- |
| 🎁 Gift QR (PNG) | `src/assets/qr.png` | The page shows "El QR estará aquí pronto." |
| 🎵 Ambience track (MP3, mastered quiet) | `src/assets/audio/ambience.mp3` | The music control is hidden |

Both are detected at build time. Add the file, commit, and push.

🏦 **Making the QR:** create it in your bank app **without a fixed amount**, **reusable**, and **expiring after 18 October 2026** (or never).
```

Replace with:

```markdown
| File | Where it is | Notes |
| --- | --- | --- |
| 🎵 Ambience track (MP3) | `src/assets/audio/ambience.mp3` | The host's track, in the repo. Detected at build time; without it the music control is hidden. |

🏦 **The gift QR** is not a file: its payload (the Banco Ganadero QR, decoded locally) is `shared.giftQr` in `src/content.ts`, and the site draws it. The bank's QR expires on **27 September 2027**. Scan the page and the saved `qr-regalo-mia.png` with the bank app before sending the links.
```

9. Find:

```markdown
  assets.ts         🖼️ detects the QR and music files
```

Replace with:

```markdown
  assets.ts         🖼️ detects the music file
```

10. Find:

```markdown
    art/            🐈‍⬛ CatSprite (the seven rigged cats), InkDefs (line boil, paper edge), cats/ (one drawing per cat), family.ts (the four paper figures)
```

Replace with:

```markdown
    art/            🐈‍⬛ CatSprite (the ten rigged cats in their coats), InkDefs (line boil, paper edge), cats/ (one drawing per cat), family.ts (the four paper figures)
```

11. Find:

```markdown
🧊 Three.js + React Three Fiber + drei (a lazy chunk behind the cover) · ✅ Vitest + Testing Library
```

Replace with:

```markdown
🧊 Three.js + React Three Fiber + drei (a lazy chunk behind the cover) · 🔳 qrcode-generator (the gift QR) · ✅ Vitest + Testing Library (and jsqr, to decode the QR in tests)
```

- [ ] **Step 4: Update `docs/publishing.md`** (drop "add `src/assets/qr.png`"; add the Banco Ganadero scan of the page's QR and of the saved `qr-regalo-mia.png`; add checks for the ten cats, the icons, the guitar, and the music).

In `docs/publishing.md`, make these 8 replacements, in order (each block to find appears exactly once when you reach it):

1. Find:

```markdown
How to put the site online on GitHub Pages, check it before sending the links, add the host files later, and take the address down after the parties.
```

Replace with:

```markdown
How to put the site online on GitHub Pages, check it before sending the links, and take the address down after the parties.
```

2. Find:

```markdown
- [ ] **Gate game:** `Toca para jugar` starts 30 seconds of catching yarn and hearts with Luz.
```

Replace with:

```markdown
- [ ] **Gate game:** `Toca para jugar` starts 30 seconds of catching yarn and hearts with Mishona. On the mid-range Android it moves smoothly, with no stutter.
```

3. Find:

```markdown
- [ ] `El regalo`: the QR on its plate and `Guardar QR`, which shares or saves the image. The QR image is yours to add at `src/assets/qr.png` (section 7). Until then guests see `El QR estará aquí pronto.` instead.
```

Replace with:

```markdown
- [ ] `El regalo`: the one gift line, the QR drawn on bone paper with a cat in the middle, the cat button `Guardar QR`, and `Toca el gatito para guardar el QR en tu celular.` under it.
```

4. Find:

```markdown
- [ ] **A cat and its card:** wait near a cat until `Saludar` appears, and tap it. Her card flips in, and she is in **Tus gatos**. Reload: she is still there.
```

Replace with:

```markdown
- [ ] **A cat and its card:** wait near a cat until `Saludar` appears, and tap it. Her card flips in, and she is in **Tus gatos**. Reload: she is still there.
- [ ] **The ten cats:** Chona on `Inicio`, Choni on `La palabra`, Mishona and Kiri kiri on `La fecha`, Chori on the map, Chavela and Minina on the letter, Delilah on the gift box, and Misha (white with gray patches) and Kira (the tabby) at the door. Their cards read well on the bone card in both themes, the white cats too. After the party (set the clock past midnight, or wait), the four pages left hold all ten. **Tus gatos** and the quest log count out of 10.
- [ ] **The icons:** a moon and a sun switch Oscuro and Claro, the pressed one is marked, and each is easy to tap. The cat's head opens **Tus gatos** and its badge counts the cats you have met (`0/10` on a first visit). With VoiceOver or TalkBack they read `Oscuro`, `Claro`, and `Tus gatos` with the count.
- [ ] **Dad's guitar:** at `La familia`, the gold Mockingbird leans in the corner by the door, on both links.
```

5. Find:

```markdown
All four read well, in the book and on the gate. **Music** (only once `src/assets/audio/ambience.mp3` is added) starts and stops.
```

Replace with:

```markdown
All four read well, in the book and on the gate.
- [ ] **Music:** the music control shows `Activar música`. Tapping it starts the host's track (it downloads only then) and the control reads `Silenciar música`; tapping again stops it. It loops.
```

6. Find:

```markdown
- [ ] **Scan the QR** from a second phone, straight off the screen. Also save it with `Guardar QR` and open it from your bank app's "scan from gallery".
```

Replace with:

```markdown
- [ ] **Scan the gift QR with the Banco Ganadero app**, before sending any link:
  1. On a second phone, open the Banco Ganadero app's QR scanner and scan the QR straight off the invitation's screen (`El regalo`). It must open the transfer to the right account, with no fixed amount.
  2. On the phone with the invitation, tap the cat button `Guardar QR`, save `qr-regalo-mia.png`, then open it from the Banco Ganadero app's "scan from gallery" (or upload the image). It must open the same transfer.
  3. If either fails, do not send the links; tell Claude which one failed and on which phone.
  The bank's QR expires on **27 September 2027**, long after the parties.
```

7. Find:

````markdown
## 7. 🖼️ Adding the QR and the music later

The links never change, so guests see updates on their next visit. Until the QR is added, `El regalo` shows `El QR estará aquí pronto.` and no `Guardar QR`; without the music file there is no music control.

| What | Put it at | Notes |
| --- | --- | --- |
| 🎁 Gift QR | `src/assets/qr.png` | Made in the bank app **without a fixed amount**, **reusable**, **expiring after 18 Oct 2026** (or never). |
| 🎵 Ambience track | `src/assets/audio/ambience.mp3` | One loop, mastered **quiet** (iPhones ignore volume set by a page). |

```bash
mkdir -p src/assets/audio
cp ~/Downloads/qr.png src/assets/qr.png           # your file
npm run dev                                        # check it at http://localhost:5173/?e=n4vk
git add src/assets && git commit -m "Add the gift QR" && git push
```

Before pushing, scan the QR from a second phone. Also save it with `Guardar QR` and open it from your bank app's "scan from gallery".
````

Replace with:

```markdown
## 7. 🖼️ The QR and the music

Both are already in the site; nothing needs adding.

| What | Where | Notes |
| --- | --- | --- |
| 🎁 Gift QR | `shared.giftQr` in `src/content.ts` | The Banco Ganadero payload, decoded locally from the host's QR. The site draws it on screen and `Guardar QR` saves a plain PNG. It expires on **27 September 2027**. If the bank ever issues a new QR, replace the payload (decode it locally, never with an online service), run `npm test` (the decode tests must pass), and scan both again with the bank app. |
| 🎵 Ambience track | `src/assets/audio/ambience.mp3` | The host's track, 2 min 23 s at 256 kbps (4.6 MB), loaded only when a guest turns music on. |
```

8. Find:

```markdown
| The QR still says "pronto" | The file must be exactly `src/assets/qr.png`, and the site rebuilt. |
```

Replace with:

```markdown
| The QR says "pronto" | The payload in `src/content.ts` (`shared.giftQr`) is empty. Put the bank payload back and rebuild. |
```

- [ ] **Step 5: Record the two libraries in `docs/stack-and-resources.md`.**

In `docs/stack-and-resources.md`, make these 3 replacements, in order (each block to find appears exactly once when you reach it):

1. Find:

```markdown
| @react-three/drei | 10.7.8 | `Html`, to place the pages in 3D. Peers: React 19, Fiber 9, `three >= 0.159`. |
```

Replace with:

```markdown
| @react-three/drei | 10.7.8 | `Html`, to place the pages in 3D. Peers: React 19, Fiber 9, `three >= 0.159`. |
| qrcode-generator | 2.0.4 | The gift QR: builds the module matrix from the bank payload at runtime, in the entry chunk (error correction H on screen, M for the download). MIT, no dependencies, ships its own types. |
```

2. Find:

```markdown
| @testing-library/user-event | 14.6.7 | Taps, keys, and drags in component tests. |
```

Replace with:

```markdown
| @testing-library/user-event | 14.6.7 | Taps, keys, and drags in component tests. |
| jsqr | 1.4.0 | Decodes the gift QR's rendered matrices in tests, to prove they carry the exact bank payload. Apache-2.0. Tests only. |
```

3. Find:

```markdown
| Payment QR image | Hosts add the file | `src/assets/qr.png`, detected at build time with `import.meta.glob`. PNG, not blurred. Made without a fixed amount, reusable, and expiring after 18 October 2026 or never. |
| Ambience track | Hosts add the file | `src/assets/audio/ambience.mp3`, detected at build time. One file, looped, mastered quiet. The control stays hidden until the file exists. |
```

Replace with:

```markdown
| Gift QR payload | In the repo | `shared.giftQr` in `src/content.ts`: the Banco Ganadero payload, decoded locally. Drawn on screen with `qrcode-generator`; saved as a 1024 px PNG. Expires 27 September 2027. |
| Ambience track | In the repo | `src/assets/audio/ambience.mp3`, the host's track, detected at build time. One file, looped. |
```

Then confirm nothing stale is left in the four docs:

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; grep -n "qr\.png\|giftLead\|Gatos {n}/7\|{n} de 7\|seven cats\|Papá, mamá, Miguelito" docs/requirements.md README.md docs/publishing.md docs/stack-and-resources.md; echo "stale-exit=$?"
```

Expected: exactly one line, the release-plan history in `docs/requirements.md` ("The first build, already on `main`, covers R1 and more: … the seven cats, **Tus gatos**, …"), which describes the first build and stays as it is; nothing else (so the last line is `stale-exit=0`, from that one match).

- [ ] **Step 6: Full verification.**

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; npx vitest run --maxWorkers=2 && npx eslint . && npx tsc -b && npm run build && ls dist/assets/*.js dist/assets/*.mp3 && grep -l "WebGLRenderer" dist/assets/*.js && grep -l "getModuleCount" dist/assets/*.js
```

Expected: `Test Files  55 passed (55)`, `Tests  526 passed (526)`; no ESLint or tsc output; the build succeeds; `ls` lists `index-*.js`, `World-*.js`, and `ambience-*.mp3`; the `WebGLRenderer` grep prints only `World-*.js`; the `getModuleCount` grep prints only `index-*.js`.

- [ ] **Step 7: Check the site under the Pages subpath.** Copy the build under `/mia-babyshower/` and serve its parent (in a background shell):

Run (from the worktree root):

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 26.9.0 >/dev/null; rm -rf /tmp/mia-subpath && mkdir -p /tmp/mia-subpath && cp -R dist /tmp/mia-subpath/mia-babyshower && npx vite preview --outDir /tmp/mia-subpath --port 4174 --strictPort
```

Expected: `Local:   http://localhost:4174/`. Run `mcp__playwright__browser_run_code_unsafe` with:

```js
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const p = await context.newPage()
  const failed = []
  const media = []
  p.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`) })
  p.on('request', (r) => { if (r.resourceType() === 'media') media.push(r.url()) })
  await p.goto('http://localhost:4174/mia-babyshower/?e=n4vk')
  await p.waitForTimeout(2000)
  await p.getByRole('button', { name: 'El regalo' }).click()
  await p.waitForTimeout(800)
  const qr = await p.getByRole('img', { name: 'Código QR para transferir un regalo a Mia' }).count()
  const audio = await p.evaluate(() => new URL(document.querySelector('audio').src).pathname)
  await p.screenshot({ path: '<worktree>/.playwright-mcp/t7-subpath.png' })
  await context.close()
  return { failed, media, qr, audio }
}
```

Expected: `failed` is `[]`; `media` is `[]` (the track is not fetched until asked); `qr` is `1`; `audio` starts with `/mia-babyshower/assets/ambience-`. Stop the preview server. Then confirm the working tree:

```bash
git status --short
```

Expected: only the five files of this task (`public/og-image.jpg` and the four docs). Nothing under `ideas/`, `.superpowers/`, or `.playwright-mcp/`.

- [ ] **Step 8: Commit.**

```bash
git add public/og-image.jpg docs/requirements.md README.md docs/publishing.md docs/stack-and-resources.md
git commit -m "$(cat <<'EOF'
Show the ten cats in the share preview, and document the real QR, the family's cats, the icons, the music, and the guitar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

## Plan notes

These refine the controller's task boundaries or record decisions the spec leaves open; none changes what the spec asks for, except where noted as a conflict.

1. **The new cats' feeling colors and rig timings land in Task 1, not Task 2.** `feelingColors`, `blinkMs`, `blinkDelayMs`, `earMs`, and `behaviorMs` are typed `Record<CatId, …>`, so the moment Task 1 adds the three ids, TypeScript requires their entries, and the contact sheet needs the colors to draw the cats at all. Task 2 keeps the records (names, feelings, lines, rarity), the perches, the loops, the noticing rules, and the counts.
2. **Conflict: the bank's QR is level L, not M.** Reading its format bits locally from `ideas/QR-code-cutoff.png` gives version 13, error correction **L**, mask 2 (at M, 369 bytes do not fit in version 13). The spec says the download uses M, "the same level as the bank's version 13". The plan keeps the explicit decision, M, which is more robust than the bank's own: the download is version 15 (77 modules, 12 px each at 1024 px). The bank's code also carries a UTF-8 ECI marker; `qrcode-generator` writes plain byte mode, and since the payload is ASCII, the decoded text is identical (the tests prove it). The Banco Ganadero scans on the pre-send checklist settle whether the bank app accepts it.
3. **The screen code is version 20.** At H the payload needs 97 modules: about 2.1 CSS px per module at the 220 px minimum, about 6 device pixels on a 3× phone. Task 3 decodes the whole page, screenshotted at 3×, in both themes; a 1× screenshot can fail to decode. If a phone struggles on the pre-send scan, raise `tuning.qr.minPx`.
4. **The emblem is 21 modules square (4.7 % of the code)**, well under the 10 % ceiling, because version 20's alignment patterns are centred on rows and columns 34 and 62 and the square must sit between them. `emblemRect` shrinks the square until it clears every finder and alignment pattern; on a code whose centre is itself an alignment pattern (version 13, for example) it draws no emblem.
5. **The modules are filled pills, not stroked lines.** Filled shapes keep exactly the module's size and edge at every scale the page is drawn, like the finder eyes; with fills, the page decoded in the book in both themes.
6. **`qrUrl` becomes `qrPayload`.** With `src/assets/qr.png` gone (spec §2 *Replaced*), the prop that carried the image's URL through `App`, both rooms, and `Pages` carries the payload instead, and an empty payload is the one case that shows `El QR estará aquí pronto.`
7. **`saveQr` takes the PNG itself.** The PNG is drawn synchronously on the first tap (canvas, `toDataURL`, bytes) and kept, so the share still runs inside the tap as iOS requires; the download uses an object URL that is let go after `tuning.qr.revokeUrlMs`.
8. **A tap on a cat is not the empty spot.** `Confirmation` now ignores taps inside `[data-cat-id]`, so a tap on Minina by the seal never startles Chavela. A tap on Chavela herself no longer startles her either; only the empty space does, and the link never does.
9. **Chona and Minina sit inside Inicio's width.** Inicio is the first page, where neither room can pan further left; at the card's left edge they could never be noticed on a 390 px phone. Observed, not changed: in the book at 390 × 844, most edge perches measured at rest (Mishona and Kiri kiri on Cuándo, Chori on Dónde, Chavela on Confirmar, Kira at the door) sit outside the middle 60 % of the screen at rest, so they notice the guest only while the guest pans. That predates this work.
10. **Spec §5's "lives" has no counterpart:** the gate game has no lives. React state changes on score, combo, phase, and best, and on the cheer, startle, and pulse flags those events raise; the loop writes the clock's text itself. The moving drops lose their animated ink-boil filter and the catcher its boil (a filter on a moving element repaints every frame); the roaming gate cats keep theirs. If the phone check is not smooth, the next step is to pause the roaming cats' boil during a round.
11. **Frame times are measured on production previews (ports 4175 and 4176), not on the dev server**, because the development build of React adds its own cost to every render. Both builds go to `/tmp`, so ESLint never reads a bundle.
12. **`budget.materials` rises from 14 to 17.** It was a plan-level cap from the richer-3D work, not a spec number, and spec §6 allows the guitar three new materials. The draw-call budget itself is unchanged (≤ 100 and ≤ 60, in the static test with the guitar's three meshes). The documented desktop exception for frames that redraw the candle's shadow goes from about 105 to about 108; that exception predates this work (it was already about 103 in the throwaway run).
13. **The guitar's corner** is x = 12.4 on the back wall (the Familia station is at x = 9.6): the 1440 × 900 view shows all of it, and a 390 × 844 phone shows its neck and headstock beside the doorway, its body behind the Familia card. Further right, a phone would lose it entirely.
14. **Eyes:** Misha's irises are green and Kira's and Kiri kiri's amber-green (`tuning.cats.eyes`), as spec §3 describes the real cats; every other cat keeps its feeling color in its eyes, so the feeling color still shows.
15. **The cards in screenshots:** Task 1's contact sheet draws all ten cats at the card's size (176 px) on the card's bone, in both themes, and Task 2 flips in a real card (Chona's) in both themes and shows all ten met in **Tus gatos**. A card for every cat would need a greeting (and two battles) per cat per theme; the card component itself is unchanged.
16. **Docs:** BR-5 ("the site does not create a QR") and the out-of-scope line "Generating a QR from a payment string" contradict the spec, so Task 7 rewrites BR-5 and removes that line.

## What could not be grounded in the code

- **Whether the Banco Ganadero app accepts the re-encoded codes** (the styled screen code at H and the plain download at M, both without the bank's ECI marker). The tests prove the exact payload decodes; only a real scan with the bank app proves the rest. It is on the pre-send checklist, and the links wait for it.
- **60 fps on a mid-range phone.** Headless Chromium draws in software; the plan pins "no React render per frame" in a test and compares before and after, but the absolute target is the phone check.
- **`ideas/QR-code.jpg`** was not opened, as instructed; the payload comes only from `ideas/QR-code-cutoff.png`. The spec states both decode to the same payload.
- **The art is judged by eye.** The coats, patches, poses, the emblem, the icons, and the guitar's outline are starting values; the screenshot steps say what to check, and changes are data or tuning edits.
