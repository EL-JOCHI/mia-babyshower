# 🐾 Baby shower de Mia

An interactive web invitation for Mia's baby shower 👶💖. It is a **pop-up storybook in a cat's attic** 📖🌙: a 3D book whose pages pop up as guests travel through it. Saturday's link opens it under the moon and Sunday's in a golden dusk, and its pages go from pencil sketch to ink to candlelight. Guests find the date, the place, the RSVP, and the gift QR on its pages. Along the way they meet seven hand-drawn cats 🐱, collect their cards, and play with the two legendary ones. At the end, the family, as paper pop-ups, folds up and walks in through a lit door. 🚪✨

> **Source of truth:** [`docs/requirements.md`](docs/requirements.md). Every behavior, string, and rule comes from there.

---

## 🔗 The links

The shower is split across two days. Each group of guests receives its own link:

| Link | Opens |
| --- | --- |
| 🗓️ `https://el-jochi.github.io/mia-babyshower/?e=n4vk` | Saturday 17 October 2026, 16:00 |
| 🗓️ `https://el-jochi.github.io/mia-babyshower/?e=q8lm` | Sunday 18 October 2026, 16:00 |
| 🚧 Anything else (including the bare address) | The guest gate |

The **guest gate** says the invitation is for special guests and must be opened with the link they were sent, with a 30-second arcade game under it 🕹️. It never shows the date, the place, WhatsApp, or the QR. The gate is a courtesy, not a secret: the site is public.

---

## ✨ What guests can do

- 📖 **Travel through a 3D pop-up book.** The cover opens on the first move. Drag, use the wheel or the arrow keys, or tap a signpost (`Inicio`, `La fecha`, `El lugar`, `Confirmar`, `El regalo`, `La familia`). Each page folds up out of the book as the camera arrives.
- 🌙🌅 **A mood per day.** Saturday is a moonlit night, Sunday a golden dusk, each in a lighter (`Claro`) and a darker (`Oscuro`) look, lit from the first page. Saturday has a turning star mobile, a paper star garland, and a moonbeam; Sunday has swaying paper lanterns, fireflies at dusk, and a golden beam.
- ✏️ **Sketch → ink → light.** The book's pop-up paper and the cats start as a pencil sketch (boceto), gain ink (tinta), and end lit by candles (luz) near the family door.
- 🏠 **A lived-in attic.** A crib under the round window, a bookshelf, a yarn basket, a rocking chair, old trunks, a crooked lamp, a cat bed, a scratching post, and curtains, all in paper and ink.
- 📱 **3D for almost everyone.** Short or sideways screens and slow loads get the readable flat room over the live 3D attic; no WebGL gets it over a layered paper diorama of the attic.
- ⏳ **Watch the countdown** on a melting candle with flip-card digits.
- 📍 **Unroll a treasure map** and 💬 **confirm on WhatsApp** with a wax seal, with a message that names their day.
- 🎁 **Open a gift box** to see the QR, and save it with `Guardar QR`: it shares the image, or downloads it if sharing isn't available.
- 🐱 **Meet seven cats.** Original Burton-style paper cats with rigs and a hand-drawn "line boil". Each has a feeling color, a rarity, and a line you only learn after greeting them. Wait near a cat and `Saludar` appears. Every greeting flips in a **collectible card**. Greeted cats are kept in **Tus gatos** on that browser.
- ⚔️ **Play with the legends.** Misha and Kira answer with `¡A jugar!`: a playful Pokémon-style battle with yarn, cuddles, and purrs. Nobody can lose.
- 🏅 **Quest log, badges, and XP.** Pages found, cats met, levels from `Visitante curioso` to `Leyenda de la casa`, and eleven badges, each earned once.
- 🕹️ **Gate game.** On the gate, catch yarn and hearts with Luz for 30 seconds, build a combo, and beat your best score.
- 🐾 **Play.** Tap the countdown, the verse, the QR, the door, or a toy and a cat reacts.
- 🎵 **Turn on music**, once the hosts add a track.

| Cat | Feeling | Color | Rarity |
| --- | --- | --- | --- |
| ☀️ Luz | Alegría | sunny gold | Común |
| 🌸 Mimo | Ternura | rose | Común |
| 👀 Susto | Temor | violet | Poco común |
| ⚡ Bram | Ímpetu | ember | Poco común |
| 👑 Nana | Delicadeza | mint | Poco común |
| 🌙 Misha | Calma | moon blue | Legendario |
| ⭐ Kira | Asombro | star teal | Legendario |

### 🌙 After the party

At midnight after each party (Bolivia time), that page changes. The address, the map, the confirm button, the QR, and the countdown go away. The page thanks the guest, and `Jugar otra vez` lets them meet the cats again (XP and badges stay). The book, the cats, and the door stay.

### ♿ Accessibility

- Keyboard and screen-reader friendly. Every word is real HTML, even inside the 3D book. Focusing a control brings it into view.
- Pinch zoom always works.
- Text meets WCAG 2.2 AA contrast in both themes.
- With **reduced motion**, guests get the **flat room** over a still paper diorama of the attic: the same pages with no canvas, no roaming cats, no line boil, no battle wipe, no gate game, and the family simply standing. The flat room also takes over when the book can't run: over the live 3D attic when WebGL works (a screen under 640 px tall, such as a phone held sideways, or a book that doesn't load in time), and over the paper diorama when it doesn't (no WebGL, or the browser drops the WebGL context, for example on the way back from WhatsApp). It opens on the page the guest was on.
- Large screens: the HUD, dialogs, and cards grow with the screen up to 2560 px wide.

### ⚡ Performance

- The first paint is the book's cover, in `index.html` itself: readable before any script runs.
- The 3D book (Three.js, React Three Fiber, drei) is its own lazy chunk, loaded behind the cover. Guests who will get it start fetching it as soon as the page's script runs.
- The book renders on demand behind the closed cover — its first frame, then only when something changes — and runs continuously once the cover opens. The pixel ratio is capped at 1.75, one candle casts shadows, and its shadow map is redrawn only while paper moves.
- The book is ready after a first frame that compiles only the shaders the book had before the moods (the attic, the book, its pages, the lights, the dust). The furniture, the mood's props, the window's stars, the fireflies, and the family mount right after, compile in the background (`gl.compileAsync`), and then show, so a first visit, with no shader cache, is as fast as before.
- The live attic behind the flat room renders at a lower pixel ratio. Both 3D views pause while the tab is hidden or a full-screen dialog (the battle, **Tus gatos**) is open; a card flipping in does not pause them. A low-end device gets no shadow map and fewer particles. The budget is 100 draw calls per frame in the book and 60 behind the cards (a dev-only readout shows the count).

---

## 🚀 Run it locally

**You need:** [nvm](https://github.com/nvm-sh/nvm). The project pins **Node.js 26.9.0** in `.nvmrc`.

```bash
nvm install        # first time only: installs Node 26.9.0 from .nvmrc
nvm use            # every new terminal
npm install        # first time, and after package changes
npm run dev        # start the dev server
```

Then open:

- 🚧 Gate: http://localhost:5173/
- 🗓️ Saturday: http://localhost:5173/?e=n4vk
- 🗓️ Sunday: http://localhost:5173/?e=q8lm

📱 **On your phone** (same Wi-Fi): run `npm run dev -- --host` and open the "Network" URL it prints, adding `?e=n4vk`.

### 🧰 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | 🔥 Dev server with hot reload |
| `npm test` | ✅ Runs the Vitest suite once (the acceptance scenarios from the spec) |
| `npm run lint` | 🧹 ESLint |
| `npm run build` | 📦 Type-checks, then builds the static site into `dist/` |
| `npm run preview` | 👀 Serves the built `dist/` locally, like production |

---

## 🎛️ Tweak the look and feel

Two files hold everything you're likely to adjust. Components read them, so a change there never needs a component change.

- 🎚️ **`src/tuning.ts`**: every number and color. The palette and the feeling colors, the four mood looks, the 3D book (camera path, pop-up springs, lights, fog, dust, paper pieces), the attic's props and each mood's props, the paper family, the live attic and the paper diorama, the device tiers, the stage thresholds (boceto → tinta → luz), how long each cat takes to notice you, the cats' rig timings, the battle's numbers, XP and levels, the gate game, large-screen growth, room and card sizes, and the QR size.
- 📝 **`src/content.ts`**: every guest-facing string (Spanish), the dates and times, the address, the map link, the WhatsApp number and messages, the cats' names, feelings, rarities, and lines, and the game, battle, and gate-game copy. Keep it in sync with §6 of the spec.

💡 **Preview the after-party look:** temporarily set Saturday's `overFrom` in `src/content.ts` to a past date, then open `?e=n4vk`. Don't commit that change.

---

## 🖼️ Host files

| File | Where it goes | Until it exists |
| --- | --- | --- |
| 🎁 Gift QR (PNG) | `src/assets/qr.png` | The page shows "El QR estará aquí pronto." |
| 🎵 Ambience track (MP3, mastered quiet) | `src/assets/audio/ambience.mp3` | The music control is hidden |

Both are detected at build time. Add the file, commit, and push.

🏦 **Making the QR:** create it in your bank app **without a fixed amount**, **reusable**, and **expiring after 18 October 2026** (or never).

📸 `ideas/` holds the host reference photos. It is in `.gitignore` and must never be committed.

---

## 🗂️ Project map

```
src/
  content.ts        📝 copy and facts (the content module)
  tuning.ts         🎚️ numbers and colors (the tuning module)
  headMeta.ts       🔗 share preview, theme variables, pre-paint theme, and the first-paint cover (injected into index.html)
  assets.ts         🖼️ detects the QR and music files
  index.css         🎨 tokens, fonts, HUD, dialogs, battle, gate, the book's cover
  styles/           🎨 pages.css (the pop-up pages and their objects), game.css (quest log, toasts, gate game), family.css (the paper family), diorama.css (the paper diorama and the live attic's layer)
  logic/            🧠 pure functions + tests: invite code, party over, countdown, layout, screen scale, stages, path, noticing, cats, battle, progress, gate game, moods, levels, device tiers
  hooks/            🪝 clock, theme, camera, world camera, noticing, acts, music, cat state, progress, gate best, page hidden
  components/       🧩 App, WorldRoom, FlatRoom, PaperDiorama, Pages, PageCard, CandleCountdown, TreasureMap, WaxSealConfirm, GiftBox, Gate, GateGame, Battle, CardReveal, QuestLog, BadgeToasts, Collection, Cat, FamilyDoor, PaperFamily, …
    art/            🐈‍⬛ CatSprite (the seven rigged cats), InkDefs (line boil, paper edge), cats/ (one drawing per cat), family.ts (the four paper figures)
  world/            🧊 the lazy 3D chunk: World, Backdrop (the live attic), CameraRig, Station (pop-up pages), FamilyCutouts, Book, Attic, WindowSky, Props and props/ (the attic's furniture), MoodProps, Fireflies, StageLighting, MoodLights, Dust, palettes, paper textures
public/
  og-image.jpg      📣 WhatsApp preview (1200×630)
  favicon.svg       🐱
docs/
  requirements.md         📜 the spec (source of truth)
  stack-and-resources.md  🧱 versions and assets
  publishing.md           🚀 how to put it online
  requirements-review.md  🔍 spec review and host decisions
  superpowers/            🗺️ the redesign's design doc and plans
```

---

## 🧱 Tech stack

⚛️ React 19 · ⚡ Vite 8 · 🟦 TypeScript 6 (strict) · 🎨 Tailwind CSS 4 · 🧊 Three.js + React Three Fiber + drei (a lazy chunk behind the cover) · ✅ Vitest + Testing Library · 🔤 Mystery Quest, Alegreya, and Pixelify Sans (self-hosted, OFL).

No router, no state library, no animation library, no game engine, no analytics. The only storage is five `localStorage` keys on the guest's own browser: `mia-cats`, `mia-theme`, `mia-music`, `mia-progress`, and `mia-gate-best`.

---

## 🌐 Publishing

The site deploys to GitHub Pages through `.github/workflows/pages.yml` on every push to `main`.

➡️ Step-by-step instructions: **[`docs/publishing.md`](docs/publishing.md)**

---

Made with 💖 for Mia 🐾
