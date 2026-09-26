# Stack and resources

**Checked:** 2026-09-26  
**Purpose:** The technical stack to implement, and the assets still missing.  
**Requirements:** `docs/requirements.md` is the behavior, including section 16, which is the build order. This file is the versions and the asset list.

Nothing here is installed yet. The app is not scaffolded.

## 1. What has to give way

Two "latest" packages do not fit the rest of the stack. The requirements table now uses the newest versions that do fit.

| Package | Newest on npm | Use instead | Why |
| --- | --- | --- | --- |
| react, react-dom | 19.3.0 | **19.2.8** | `@react-three/fiber` 9.7.0 declares `react` and `react-dom` as `>=19 <19.3`. |
| typescript | 7.0.2 | **6.0.3** | `typescript-eslint` 8.70.0 declares `typescript` as `>=4.8.4 <6.1.0`. 6.0.3 is inside that range. 7.0.2 is not. |

`@react-three/drei` 10.7.8 accepts React 19, including 19.3.0. It is not the blocker. Fiber is. Drei is not part of the stack. Add it only if a scene later needs one helper, and note it here. The 3D era is Fiber and Three.js alone.

## 2. Versions to install

Checked with `npm view` on 2026-09-26. Peers below are from those releases.

### Runtime

| Package | Version | Role |
| --- | --- | --- |
| react | 19.2.8 | UI |
| react-dom | 19.2.8 | UI |
| three | 0.186.0 | 3D era only |
| @react-three/fiber | 9.7.0 | React renderer for Three.js. Peer: `three >= 0.156`, React as above. |

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
| @fontsource/press-start-2p | 5.3.0 | Short titles and the gate count only. Too wide for the address or the verse. |
| @fontsource/source-sans-3 | 5.3.0 | Verse, address, cat lines, buttons. Spanish accents are covered. |

### Node

Install **Node.js 26.9.0** with nvm before the first `npm install`. Node 26.10.0 came out on 2026-09-21. The pin stays at 26.9.0 unless it is changed on scaffold day. Put `26.9.0` in `.nvmrc` and `"node": ">=26.9.0"` in `engines`. npm is the one that ships with that Node.

`@types/node` is **26.6.2**.

Vite 8 accepts Node `^20.19.0 || >=22.12.0`. Vitest 5 accepts `^22.12.0 || ^24.0.0 || >=26.0.0`. Node 26.9.0 satisfies both. The project does not target an older line.

Do not add a router, an animation library, a component kit, a state library, `qrcode.react`, or a game engine. The QR is an image. Theme, cats, and music are `localStorage` plus React state.

## 2.1 Why this stack still fits

Scratching a card, batting the countdown, tilting the QR, and startling at nothing are short reactions on HTML, not a physics world. React owns those elements, so the words stay readable, the QR stays scannable, and a screen reader can reach the buttons. A cat is a small state: playing, noticing, or staying. The camera is one position updated by drag, touch, wheel, and keys.

Three.js is only the far layer of the 3D third of the room, through React Three Fiber, and only when motion is allowed. It loads as a separate chunk when the camera nears that third, mounts the first time the camera enters it, and pauses outside it. Cats stay SVG or CSS in every era. Parallax is the same camera position applied to two or three CSS layers at different speeds. It is not a scroll library. Reduced motion sets every layer to the same speed. The room height uses `dvh`. The drag surface uses `touch-action: pinch-zoom`, so one finger moves the camera and two fingers still zoom. The document uses `overscroll-behavior: none`. Zoom stays enabled. Cats and shadows are SVG or CSS drawn in the app. `Guardar QR` shares or downloads the image file. It does not open a bank deep link.

A 2D game framework such as Phaser, or a physics library, would draw the invitation into a canvas. The date, the verse, and the QR would then have to be rebuilt as HTML on top, which is a second UI. That cost shows up only if the cats need real collision, dozens of objects, or free-roam simulation. This invitation does not. The reactions return the countdown and the QR to rest. They do not need a solver.

## 3. How the pieces meet the requirements

- One `index.html`. The day is `?e=n4vk` or `?e=q8lm`. A query string works on GitHub Pages with no SPA fallback.
- Vite `base` is `'./'`, so the same `dist` works locally and as a project site. The repo name does not have to be known.
- Tailwind 4 tokens are CSS variables for Oscuro and Claro.
- Three.js mounts the first time the camera's horizontal position reaches the 3D era, and only if the guest has not asked for reduced motion.
- Every tunable number and color lives in one tuning module (requirements BR-21).
- `index.html` carries the share preview. Its absolute image URL comes from `VITE_SITE_URL` in `.env`, written as `%VITE_SITE_URL%`.
- Tests call the pure functions for the invite code, the party-over cutoff, the layout, the era, noticing, a greet, and playing again. Component tests cover the Spanish strings, the WhatsApp URL, and the gate. They do not screenshot the cats.
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

## 5. Still to be supplied

The site can be built without these. The requirements already say what to show while they are missing.

| Asset | When it arrives | Where it will live |
| --- | --- | --- |
| Payment QR image | Hosts add the file | `src/assets/qr.png`, detected at build time with `import.meta.glob`. PNG, not blurred. Made without a fixed amount, reusable, and expiring after 18 October 2026 or never. |
| Ambience track | Hosts add the file | `src/assets/audio/ambience.mp3`, detected at build time. One file, looped, mastered quiet. The control stays hidden until the file exists. |
| Share preview image | The implementer makes it in R1 | `public/og-image.jpg`, 1200×630 JPEG under 300 KB. No date, no place. |
| Portraits of mom, Miguelito, and Mia | Not required | Hair rules in the requirements are enough. Do not wait on photos. |

No account art, no Pokémon tiles, no Pixar characters, no skulls.

## 6. Browser features, no extra packages

- `localStorage` for the cat list, the theme, and the music choice. The payload is a short JSON list. It is well under the usual 5 MB quota.
- `matchMedia` for `prefers-color-scheme` and `prefers-reduced-motion`.
- Pointer and wheel events for the camera. The page itself does not scroll sideways.
- `HTMLAudioElement`. Browsers block sound until a gesture, which is why the track starts on **Activar música** and not on load.
- `Date` against the ISO instants that already include `-04:00`. Bolivia does not use daylight saving.
- WebGL only inside the 3D era. If it fails, the HTML landmarks remain.

## 7. GitHub Pages

The workflow is `.github/workflows/pages.yml`. It runs on every push to `main`, and it can also be started by hand.

Step-by-step publishing, checks before sending the links, and troubleshooting: [`docs/publishing.md`](publishing.md).

When the repository exists, once:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

The workflow installs Node from `.nvmrc` (26.9.0), runs `npm ci`, `npm test`, and `npm run build`, then publishes `dist`. Until `package.json` is in the repo, the job succeeds and does not deploy. The QR image and the music file are not required for that build. Add them when you have them. The next push picks them up.

The repository is `mia-babyshower`, public. The live links will be `https://el-jochi.github.io/mia-babyshower/?e=n4vk` and `https://el-jochi.github.io/mia-babyshower/?e=q8lm`. The bare `https://el-jochi.github.io/mia-babyshower/` is the guest gate.

The workflow does not run `npm run lint` yet. Run it locally before pushing, or add it to the workflow's test step.

## 8. Before the first install

1. Create `.gitignore` with `ideas/`, `node_modules/`, `dist/`, and `.env.local` before the first commit, so the photos never enter git history.
1. `nvm install 26.9.0` and use that version for this repo.
2. Install the tables in section 2. React stays on 19.2.8. TypeScript stays on 6.0.3.
3. Leave drei out until a Three.js helper is actually needed.
4. Keep `ideas/dad.jpg` out of `public/`.
