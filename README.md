# 🐾 Baby shower de Mia

An interactive web invitation for Mia's baby shower 👶💖. It is a small room full of cats: it starts as pixels, turns to color, and ends as a simple 3D world. Guests explore the room to find the date, the place, the RSVP, and the gift QR. Along the way they meet seven cats 🐱. At the far end, the family walks in through a lit door. 🚪✨

> **Source of truth:** [`docs/requirements.md`](docs/requirements.md). Every behavior, string, and rule comes from there.

---

## 🔗 The links

The shower is split across two days. Each group of guests receives its own link:

| Link | Opens |
| --- | --- |
| 🗓️ `https://el-jochi.github.io/mia-babyshower/?e=n4vk` | Saturday 17 October 2026, 16:00 |
| 🗓️ `https://el-jochi.github.io/mia-babyshower/?e=q8lm` | Sunday 18 October 2026, 16:00 |
| 🚧 Anything else (including the bare address) | The guest gate |

The **guest gate** is an arcade-style continue screen. It says the invitation is for special guests and must be opened with the link they were sent. It never shows the date, the place, WhatsApp, or the QR. The gate is a courtesy, not a secret: the site is public.

---

## ✨ What guests can do

- 🧭 **Explore the room.** Drag with a finger or mouse, use the wheel or arrow keys, or tap a signpost (`Inicio`, `La fecha`, `El lugar`, `Confirmar`, `El regalo`, `La familia`).
- 🕹️ **Travel through three eras.** Pixels → color → a simple Three.js 3D scene with a stroller, a crown, hearts, stars, and a guitar pick 🎸.
- ⏳ **Watch the countdown** to the party.
- 📍 **Open the map** and 💬 **confirm on WhatsApp**, with a message that names their day.
- 🎁 **See the gift QR** and save it with `Guardar QR`: it shares the image, or downloads it if sharing isn't available.
- 🐱 **Meet seven cats.** Each has a feeling, a rarity, and a line you only learn after greeting them. Wait near a cat and `Saludar` appears. Greeted cats are kept in **Tus gatos** on that browser.
- 🐾 **Play.** Tap the countdown, the verse, the QR, the door, or a toy and a cat reacts.
- 🌗 **Choose a theme**: `Oscuro` or `Claro`.
- 🎵 **Turn on music**, once the hosts add a track.

| Cat | Feeling | Rarity |
| --- | --- | --- |
| 🩷 Luz | Alegría | Común |
| 🌸 Mimo | Ternura | Común |
| 👀 Susto | Temor | Poco común |
| ⚡ Bram | Ímpetu | Poco común |
| 👑 Nana | Delicadeza | Poco común |
| 💜 Misha | Calma | Legendario |
| ⭐ Kira | Asombro | Legendario |

### 🌙 After the party

At midnight after each party (Bolivia time), that page changes. The address, the map, the confirm button, the QR, and the countdown go away. The page thanks the guest, and `Jugar otra vez` lets them meet the cats again. The room, the cats, and the door stay.

### ♿ Accessibility

- Keyboard and screen-reader friendly. Focusing a control brings it into view.
- Pinch zoom always works.
- Text meets WCAG 2.2 AA contrast in both themes.
- With **reduced motion**, the room stays but depth, roaming cats, the 3D canvas, and the gate count are switched off.

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

- 🎚️ **`src/tuning.ts`**: every number and color. Room and card sizes, camera glide time, parallax speeds, era thresholds (pixel → color → 3D), how long each cat takes to notice you, gate count timing, QR size, theme colors, and each cat's accent color.
- 📝 **`src/content.ts`**: every guest-facing string (Spanish), the dates and times, the address, the map link, the WhatsApp number and messages, and the cats' names, feelings, rarities, and lines. Keep it in sync with §6 of the spec.

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
  headMeta.ts       🔗 share preview, theme variables, pre-paint theme (injected into index.html)
  assets.ts         🖼️ detects the QR and music files
  logic/            🧠 pure functions + tests: invite code, party over, countdown, layout, camera, era, noticing, cats
  hooks/            🪝 clock, theme, camera, noticing, acts, music, cat state
  components/       🧩 Gate, Room, Landmark, Countdown, Location, Confirmation, Gift, Collection, Cat, FamilyDoor, …
  scene/Scene3D.tsx 🧊 the lazy Three.js far layer
public/
  og-image.jpg      📣 WhatsApp preview (1200×630)
  favicon.svg       🐱
docs/
  requirements.md         📜 the spec (source of truth)
  stack-and-resources.md  🧱 versions and assets
  publishing.md           🚀 how to put it online
  requirements-review.md  🔍 spec review and host decisions
```

---

## 🧱 Tech stack

⚛️ React 19 · ⚡ Vite 8 · 🟦 TypeScript 6 (strict) · 🎨 Tailwind CSS 4 · 🧊 Three.js + React Three Fiber (loaded only near the 3D era) · ✅ Vitest + Testing Library · 🔤 Press Start 2P + Source Sans 3 (self-hosted, OFL).

No router, no state library, no animation library, no game engine, no analytics. The only storage is three `localStorage` keys on the guest's own browser: `mia-cats`, `mia-theme`, and `mia-music`.

---

## 🌐 Publishing

The site deploys to GitHub Pages through `.github/workflows/pages.yml` on every push to `main`.

➡️ Step-by-step instructions: **[`docs/publishing.md`](docs/publishing.md)**

---

Made with 💖 for Mia 🐾
