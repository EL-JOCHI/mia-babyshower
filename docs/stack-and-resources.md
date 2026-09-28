# Stack and resources

**Checked:** 2026-09-26, updated 2026-09-27 for the pop-up book redesign and 2026-09-28 for the family cats and the real QR  
**Purpose:** The technical stack, and where the assets live.  
**Requirements:** `docs/requirements.md` is the behavior, including section 16, which is the build order. This file is the versions and the asset list.

Everything below is installed and pinned in `package.json`. The redesign (`docs/superpowers/specs/2026-09-26-invitation-redesign-design.md`) added `@react-three/drei` and the three storybook fonts, and removed Press Start 2P and Source Sans 3. The family-cats work (`docs/superpowers/specs/2026-09-28-family-cats-qr-design.md`) added `qrcode-generator` and, for tests only, `jsqr`, `pngjs`, and `@types/pngjs`.

## 1. What has to give way

Two "latest" packages do not fit the rest of the stack. The requirements table now uses the newest versions that do fit.

| Package | Newest on npm | Use instead | Why |
| --- | --- | --- | --- |
| react, react-dom | 19.3.0 | **19.2.8** | `@react-three/fiber` 9.7.0 declares `react` and `react-dom` as `>=19 <19.3`. |
| typescript | 7.0.2 | **6.0.3** | `typescript-eslint` 8.70.0 declares `typescript` as `>=4.8.4 <6.1.0`. 6.0.3 is inside that range. 7.0.2 is not. |

`@react-three/drei` 10.7.8 accepts React 19, including 19.3.0. It is not the blocker. Fiber is. The redesign added drei for one helper, `Html`, which places the pages' real HTML in the 3D book.

## 2. Versions to install

Checked with `npm view` on 2026-09-26. Peers below are from those releases.

### Runtime

| Package | Version | Role |
| --- | --- | --- |
| react | 19.2.8 | UI |
| react-dom | 19.2.8 | UI |
| three | 0.186.0 | The 3D book only, in its own lazy chunk |
| @react-three/fiber | 9.7.0 | React renderer for Three.js. Peer: `three >= 0.156`, React as above. |
| @react-three/drei | 10.7.8 | `Html`, to place the pages in 3D. Peers: React 19, Fiber 9, `three >= 0.159`. |
| qrcode-generator | 2.0.4 | The gift QR on the page: builds the module matrix from the bank payload at runtime (error correction Q, version 18), in the entry chunk. MIT, no dependencies, ships its own types. The download does not use it: `Guardar QR` saves the bank's own image. |

### Build

| Package | Version | Role |
| --- | --- | --- |
| vite | 8.3.0 | Dev server and static build. Engines: Node `^20.19.0 \|\| >=22.12.0`. |
| @vitejs/plugin-react | 6.1.1 | React refresh through Oxc. This is the Vite 8 React template's plugin. |
| typescript | 6.0.3 | Strict TypeScript. |
| @types/react | 19.2.8 | A 19.2.x release, matching the React line. |
| @types/react-dom | 19.2.7 | The newest 19.2.x. There is no 19.2.8, so `npm install` fails if it is pinned. |
| @types/three | 0.186.0 | Types for three, which ships none. Strict TypeScript needs them. |
| tailwindcss | 4.3.3 | Styling. |
| @tailwindcss/vite | 4.3.3 | Tailwind 4 is wired as a Vite plugin. No separate PostCSS config and no `tailwind.config.js`. |

### Tests

| Package | Version | Role |
| --- | --- | --- |
| vitest | 5.0.1 | Test runner. Engines: Node `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`. Peer: Vite 6, 7, or 8. |
| jsdom | 30.1.0 | DOM for component tests. |
| @testing-library/react | 16.3.3 | Render and queries. Peer: React 18 or 19. |
| @testing-library/dom | 10.4.2 | Required by the React testing library. |
| @testing-library/jest-dom | 7.0.1 | DOM matchers such as `toBeInTheDocument`. |
| @testing-library/user-event | 14.6.7 | Taps, keys, and drags in component tests. |
| jsqr | 1.4.0 | Decodes the gift QR in tests: the page's drawing, rasterized at 220 px, and the committed bank image. Apache-2.0. Tests only. |
| pngjs | 7.0.0 | Reads the committed bank image (`src/assets/qr-bank.png`) into pixels for `jsqr`. MIT. Tests only. |
| @types/pngjs | 6.0.5 | Types for pngjs. They bring in Node's types, so the tests type-check in their own `tsconfig.test.json`, with `node` in its `types`. The app's `tsconfig.app.json` leaves the tests out and has no Node types, so the shipped code cannot use a Node API. |

### Lint

| Package | Version | Role |
| --- | --- | --- |
| eslint | 10.11.0 | Flat config. |
| typescript-eslint | 8.70.0 | Parser and rules. Accepts ESLint 8.57, 9, or 10, and TypeScript below 6.1. |
| @eslint/js | 10.0.1 | ESLint's recommended rules. |
| eslint-plugin-react-hooks | 7.1.1 | Rules of hooks. Accepts ESLint 10. |
| globals | 17.12.0 | Browser globals for the flat config. |

### Scripts

| Script | Command |
| --- | --- |
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |
| `test` | `vitest run` |
| `lint` | `eslint .` |

Commit `package-lock.json`. `npm ci` and the workflow's npm cache need it.

### Fonts

Self-hosted, SIL Open Font License, no Google Fonts request.

| Package | Version | Role |
| --- | --- | --- |
| @fontsource/mystery-quest | 5.3.0 | Titles: the book's title, the page stamp, the cats' names on their cards, badge names. Latin and latin-ext, weight 400. |
| @fontsource/alegreya | 5.3.0 | All reading text: the verse, the date, the address, the cat lines, buttons. Latin and latin-ext, weights 400, 500, and 700. Spanish accents are covered. |
| @fontsource/pixelify-sans | 5.3.0 | Game screens only: the battle, scores, XP, the quest log, the gate game. Latin, weights 400 and 600. |

The fallbacks are the plain generic families (`serif`, `monospace`), not the system UI faces: those load lazily on Apple devices and held back the first paint on a phone-speed CPU. No glyph outside the fonts' ranges sits in the first paint (the move hint's arrow is drawn, not typed).

### Node

Install **Node.js 26.9.0** with nvm before the first `npm install`. Node 26.10.0 came out on 2026-09-21. The pin stays at 26.9.0 unless it is changed on scaffold day. Put `26.9.0` in `.nvmrc` and `"node": ">=26.9.0"` in `engines`. npm is the one that ships with that Node.

`@types/node` is **26.6.2**. Only the tests see Node's types (`tsconfig.test.json`); the app does not (`tsconfig.app.json`).

Vite 8 accepts Node `^20.19.0 || >=22.12.0`. Vitest 5 accepts `^22.12.0 || ^24.0.0 || >=26.0.0`. Node 26.9.0 satisfies both. The project does not target an older line.

Do not add a router, an animation library, a component kit, a state library, a React QR component such as `qrcode.react`, or a game engine. The QR on the page is plain SVG drawn from `qrcode-generator`'s matrix; the download is the bank's own image. Theme, cats, music, progress, and the best gate score are `localStorage` plus React state.

## 2.1 Why this stack still fits

Scratching a card, batting the countdown, tilting the QR, and startling at nothing are short reactions on HTML, not a physics world. React owns those elements, so the words stay readable, the QR stays scannable, and a screen reader can reach the buttons. A cat is a small state: playing, noticing, or staying. The camera is one position updated by drag, touch, wheel, and keys.

Three.js draws the 3D book, through React Three Fiber and drei, and only when motion is allowed and WebGL starts. It loads as a separate chunk behind the HTML cover. It renders on demand behind the closed cover — its first frame, then only when something changes — and runs continuously once the cover opens. The pages, the cats, and every control stay HTML and SVG, placed in 3D with drei's `Html`, so the words stay sharp and reachable. Where the book cannot run (reduced motion, no WebGL, a failure, or a load timeout), the flat room shows the same pages with no canvas. In the flat room, parallax is the same camera position applied to two or three CSS layers at different speeds. It is not a scroll library. Reduced motion sets every layer to the same speed. The room height uses `dvh`. The drag surface uses `touch-action: pinch-zoom`, so one finger moves the camera and two fingers still zoom. The document uses `overscroll-behavior: none`. Zoom stays enabled. Cats and shadows are SVG or CSS drawn in the app. `Guardar QR` shares or downloads the bank's own QR image. It does not open a bank deep link.

A 2D game framework such as Phaser, or a physics library, would draw the invitation into a canvas. The date, the verse, and the QR would then have to be rebuilt as HTML on top, which is a second UI. That cost shows up only if the cats need real collision, dozens of objects, or free-roam simulation. This invitation does not. The reactions return the countdown and the QR to rest. They do not need a solver.

## 3. How the pieces meet the requirements

- One `index.html`. The day is `?e=n4vk` or `?e=q8lm`. A query string works on GitHub Pages with no SPA fallback.
- Vite `base` is `'./'`, so the same `dist` works locally and as a project site. The repo name does not have to be known.
- Tailwind 4 tokens are CSS variables for Oscuro and Claro.
- The 3D book loads behind the cover, only if the guest has not asked for reduced motion and WebGL can start. The first paint is the cover from `index.html`, before any script.
- Every tunable number and color lives in one tuning module (requirements BR-21).
- `index.html` carries the share preview. Its absolute image URL comes from `VITE_SITE_URL` in `.env`, written as `%VITE_SITE_URL%`.
- Tests call the pure functions for the invite code, the party-over cutoff, the layout, the screen scale, the stage, the camera path, noticing, a greet, playing again, the battle, progress, the gate game, and the gift QR (its matrix, its emblem, and a decode of the drawing and of the bank's image). Component tests cover the Spanish strings, the WhatsApp URL, the gate and its game, the battle dialog, the card, the quest log, and the toasts, with the 3D world replaced by a stand-in. They do not screenshot the cats.
- Countdown tests use Vitest fake timers and the fixed instants in the requirements. Display strings are already Spanish, so the suite does not need a locale polyfill.

## 4. Files already in the repo

These stay references. They are not copied into the public site. `ideas/dad.jpg` is a face; the page draws a shadow from the hair only.

| File | Use |
| --- | --- |
| `ideas/dad.jpg` | Dad's curl type, then grown toward an afro. Not published. |
| `ideas/IMG-20260913-WA0012.jpg` | Black, magenta, blush, the physical set. |
| `ideas/IMG-20260913-WA0017(1).jpg` | Round badge. The English wordmark is not used. |
| `ideas/IMG-20260913-WA0018(1).jpg` | Cat and stroller line drawing. |
| `ideas/IMG-20260926-WA0000.jpg` | Seated black cat with a pink bow. A cat, not dad. |
| `docs/requirements.md` | Behavior. |
| `docs/stack-and-resources.md` | This file. |

## 5. Assets

Where each asset lives. The requirements say what shows if one is missing.

| Asset | Status | Where it lives |
| --- | --- | --- |
| Gift QR payload | In the repo | `shared.giftQr` in `src/content.ts`: the Banco Ganadero payload, decoded locally. Drawn on the page with `qrcode-generator`. Expires 27 September 2027. |
| Gift QR image | In the repo | `src/assets/qr-bank.png`: the bank's own QR (version 13, error correction L, with its ECI marker), cropped from the host's image and padded with a white quiet zone of about 4 modules. The gift page imports it; `Guardar QR` saves it as `qr-regalo-mia.png`. Its SHA-256 is pinned in `src/components/Gift.test.tsx`. |
| Ambience track | In the repo | `src/assets/audio/ambience.mp3`, the host's track, detected at build time. One file, looped, not preloaded. |
| Share preview image | In the repo | `public/og-image.jpg`, 1200×630 JPEG under 300 KB: the title and the ten cats in their coats. No date, no place. |
| Portraits of mom, Miguelito, and Mia | Not required | Hair rules in the requirements are enough. Do not wait on photos. |

No account art, no Pokémon tiles, no Pixar characters, no skulls.

## 6. Browser features, no extra packages

- `localStorage` for the cat list, the theme, the music choice, the game layer's progress, and the best gate score. Each payload is a short JSON value, well under the usual 5 MB quota.
- `matchMedia` for `prefers-color-scheme` and `prefers-reduced-motion`.
- Pointer and wheel events for the camera. The page itself does not scroll sideways.
- `HTMLAudioElement`. Browsers block sound until a gesture, which is why the track starts on **Activar música** and not on load.
- `Date` against the ISO instants that already include `-04:00`. Bolivia does not use daylight saving.
- WebGL only for the 3D book. If it fails, the flat room shows the same HTML pages.

## 7. GitHub Pages

The workflow is `.github/workflows/pages.yml`. It runs on every push to `main`, and it can also be started by hand.

Step-by-step publishing, checks before sending the links, and troubleshooting: [`docs/publishing.md`](publishing.md).

When the repository exists, once:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

The workflow installs Node from `.nvmrc` (26.9.0), runs `npm ci`, `npm test`, and `npm run build`, then publishes `dist`. Until `package.json` is in the repo, the job succeeds and does not deploy. The gift QR (its payload and the bank's image) and the music file are already in the repo.

The repository is `mia-babyshower`, public. The live links will be `https://el-jochi.github.io/mia-babyshower/?e=n4vk` and `https://el-jochi.github.io/mia-babyshower/?e=q8lm`. The bare `https://el-jochi.github.io/mia-babyshower/` is the guest gate.

The workflow does not run `npm run lint` yet. Run it locally before pushing, or add it to the workflow's test step.

## 8. Before the first install

1. Create `.gitignore` with `ideas/`, `node_modules/`, `dist/`, and `.env.local` before the first commit, so the photos never enter git history.
1. `nvm install 26.9.0` and use that version for this repo.
2. Install the tables in section 2. React stays on 19.2.8. TypeScript stays on 6.0.3.
3. `@react-three/drei` is pinned at 10.7.8 for its `Html` helper.
4. Keep `ideas/dad.jpg` out of `public/`.
