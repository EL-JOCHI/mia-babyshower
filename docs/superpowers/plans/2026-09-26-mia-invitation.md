# Mia invitation — Implementation Plan

> **For agentic workers:** executed natively in one session (the hosts asked to implement directly; R1 ships 2026-09-27). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the invitation described in `docs/requirements.md`, release by release (R1 → R1 stretch → R2 → R3).

**Architecture:** One Vite + React page. Pure functions in `src/logic/` decide the opening, the party-over state, the countdown, the layout, the era, noticing, and cat-state changes. `src/content.ts` holds copy and facts, and `src/tuning.ts` holds every number and color. Components read both modules. The camera is one `{ x, y }` state that moves CSS layers. The 3D scene is a lazy chunk.

**Tech Stack:** Node 26.9.0, React 19.2.8, Vite 8.3.0, TypeScript 6.0.3 strict, Tailwind 4.3.3, three 0.186.0 + @react-three/fiber 9.7.0, Vitest 5.0.1 + React Testing Library + jsdom.

**Spec:** `docs/requirements.md`, `docs/stack-and-resources.md`

## Global Constraints

- Guest-facing strings are Spanish and come only from `docs/requirements.md` §6. Code and tests are English.
- Codes: `n4vk` is Saturday, `q8lm` is Sunday. Everything else is the gate. The clock never picks a day.
- Instants: Saturday starts `2026-10-17T16:00:00-04:00` and is over from `2026-10-18T00:00:00-04:00`. Sunday starts `2026-10-18T16:00:00-04:00` and is over from `2026-10-19T00:00:00-04:00`.
- The only storage keys are `mia-cats`, `mia-theme`, and `mia-music`. No analytics.
- No router, animation library, component kit, state library, QR library, or game engine.
- `base: './'`. The site URL is `https://el-jochi.github.io/mia-babyshower/`.
- `ideas/` is never committed.

## Review Focus

- Storage throws, or holds junk → the page still renders (test in the cat-state task).
- The page is open across midnight → the party-over state applies without a reload (test in the room task).
- A pointer press that starts on a button, link, or QR → it is not captured as a camera drag (test in the camera task).
- The QR file is missing → pending sentence, no broken image, no `Guardar QR` (test in the gift task).
- A code in upper case or with spaces → it resolves (test in the invite task).

## File map

- `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.env`, `.gitignore`, `package.json`
- `src/content.ts` — copy, facts, day records, cats.
- `src/tuning.ts` — numbers, theme tokens, cat accents.
- `src/logic/*.ts` — pure functions, one file each: `invite`, `party`, `countdown`, `layout`, `era`, `whatsapp`, `catState`, `noticing`, `contrast`, `storage`, `camera`.
- `src/hooks/*.ts` — `useNow`, `useMediaQuery` (reduced motion), `useTheme`, `useCatState`, `useViewport`, `useCamera`, `useKeyboardModality`, `useNoticing`, `useActs`, `useMusic`.
- `src/components/*.tsx` — the §10 small components: `Gate`, `Room`, `Landmark`, `Countdown`, `Location`, `Confirmation`, `Gift`, `Collection`, `Cat` and `CatArt`, `Toys` and `Throwable`, `ThemeControl`, and `SceneHost` with `src/scene/Scene3D.tsx`. Also `App`, `Hud` (holds `ThemeControl`, `MusicControl`, and the Tus gatos button), `GreetingToast`, `Signposts`, and `FamilyDoor`.
- `src/headMeta.ts` — the share preview, theme tokens, and pre-paint theme script, injected into `index.html` by the Vite config.
- `src/assets.ts` — build-time detection of `src/assets/qr.png` and `src/assets/audio/ambience.mp3`.
- `src/scene/Scene3D.tsx` — the lazy Three.js far layer.
- `src/test/*` — setup and helpers. Tests live next to the code as `*.test.ts(x)`.

## Tasks

- [x] 1. Scaffold: `git init`, `.gitignore`, pinned packages, configs, theme-token plugin, smoke test, first commit.
- [x] 2. Content and tuning modules.
- [x] 3. Pure logic with tests (invite, party, countdown, layout, era, WhatsApp, cat state, noticing, contrast, storage).
- [x] 4. App shell: opening, clock, theme control and persistence, reduced motion.
- [x] 5. Gate: sentences, count loop, finale.
- [x] 6. Room: layout, camera (drag, wheel, keys, glide, focus), layers, signposts, landmarks, facts, party-over state.
- [x] 7. Share preview: `og:` tags, `og-image.jpg`, favicon, `noindex`. **R1 is done here.**
- [x] 8. Cats: SVG art, noticing, greeting, **Tus gatos**, playing again. Family door. **R1 stretch.**
- [x] 9. Era looks, depth layers, cat acts, bows. **R2.**
- [x] 10. 3D scene (lazy) and music. **R3.**
- [x] 11. Verify: test, lint, build, preview, real-browser check at phone and desktop sizes, whole-branch review.
