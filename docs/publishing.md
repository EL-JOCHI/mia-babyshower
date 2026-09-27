# 🚀 Publishing the invitation

How to put the site online on GitHub Pages, check it before sending the links, add the host files later, and take the address down after the parties.

**Final links:**

- 🗓️ Saturday: `https://el-jochi.github.io/mia-babyshower/?e=n4vk`
- 🗓️ Sunday: `https://el-jochi.github.io/mia-babyshower/?e=q8lm`
- 🚧 Gate: `https://el-jochi.github.io/mia-babyshower/`

---

## 1. ✅ Before you start

- [ ] You are signed in to GitHub as **EL-JOCHI**.
- [ ] The local repo is clean and the checks pass:

  ```bash
  nvm use
  npm test && npm run lint && npm run build
  git status   # should say: nothing to commit, working tree clean
  ```

- [ ] `ideas/` is **not** tracked. `git ls-files ideas` must print nothing.
- [ ] You accept that the repo is **public**. Everything in `docs/` (address, codes, the family story) and the site itself can be read by anyone.

---

## 2. 🏗️ Create the repository

### Option A: on github.com

1. Go to https://github.com/new.
2. Owner: **EL-JOCHI**. Repository name: **`mia-babyshower`**. Visibility: **Public**.
3. Do **not** add a README, `.gitignore`, or license. The repo already has them.
4. Click **Create repository**.
5. Connect your local repo (don't push yet):

   ```bash
   git remote add origin git@github.com:EL-JOCHI/mia-babyshower.git
   # or, with HTTPS: git remote add origin https://github.com/EL-JOCHI/mia-babyshower.git
   ```

### Option B: with the GitHub CLI

```bash
gh repo create EL-JOCHI/mia-babyshower --public --source=. --remote=origin
```

---

## 3. 🌐 Turn on GitHub Pages (before the first push)

The workflow's deploy step needs Pages to be switched on first. If you push before this step, the first run fails; just re-run it afterwards (see [Troubleshooting](#-troubleshooting)).

### On github.com

1. Open the repo → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### Or with the CLI

```bash
gh api -X POST repos/EL-JOCHI/mia-babyshower/pages -f build_type=workflow
```

---

## 4. 📤 Push

```bash
git push -u origin main
```

This starts the **Deploy to GitHub Pages** workflow (`.github/workflows/pages.yml`). The workflow:

1. installs Node from `.nvmrc` (26.9.0),
2. runs `npm ci`, `npm test`, and `npm run build`,
3. publishes `dist/`.

Watch it in the repo's **Actions** tab, or with:

```bash
gh run watch
```

The first deploy takes a few minutes. After that, the site is at `https://el-jochi.github.io/mia-babyshower/`.

> ⚠️ If `npm test` fails, nothing is published. The live site stays as it was, so a broken change never reaches the guests.

---

## 5. 🔍 Check before sending the links

Do this on real phones, not only on a computer: at least one iPhone and one mid-range Android, over mobile data (Wi-Fi off). Clear the site's data between runs if you want to see a first visit again.

**The links**

- [ ] **Gate** (the bare address): the two sentences, `Toca para jugar`, and the cats below. No date, no place, no WhatsApp, no QR, no quest log.
- [ ] **Gate game:** `Toca para jugar` starts 30 seconds of catching yarn and hearts with Luz. At the end: the score, `Tu mejor puntaje`, and `Jugar otra vez`. The two sentences stay on screen.
- [ ] **Saturday link:** the book's cover shows at once (the title, the hero line, `Muévete para explorar`). A drag or a signpost swings it open and the camera swoops down into the book.
- [ ] **Sunday link:** the same, dated `domingo 18 de octubre de 2026`, and nowhere "17 de octubre".

**The facts, without playing** (use only the signposts)

- [ ] `La fecha`: `sábado 17 de octubre de 2026` (Sunday: `domingo 18 de octubre de 2026`), `16:00`, and the countdown.
- [ ] `El lugar`: the address, and `Ver en el mapa` opens the right pin.
- [ ] `Confirmar`: `Confirmar por WhatsApp` opens a chat with **+591 76632451** and the message for that day.
- [ ] `El regalo`: the QR on its plate and `Guardar QR`, which shares or saves the image. The QR image is yours to add at `src/assets/qr.png` (section 7). Until then guests see `El QR estará aquí pronto.` instead.
- [ ] Every page reads without pinching, and its buttons are easy to tap.

**Playing**

- [ ] **Moving:** a drag moves through the book and comes to rest on the nearest page, a signpost glides to its page, and pinch still zooms. `La familia` glides to the lit door, and the family walks in.
- [ ] **A cat and its card:** wait near a cat until `Saludar` appears, and tap it. Her card flips in, and she is in **Tus gatos**. Reload: she is still there.
- [ ] **The battle:** at the door, Misha or Kira offers `¡A jugar!`. The moves work. `Huir` leaves with `Te fuiste sin hacer ruido.` and the cat offers `¡A jugar!` again. Winning adds the cat.
- [ ] **Quest log and badges:** resting on a new page stamps `¡Página encontrada!` and raises `Páginas`; badge toasts show one at a time with their XP, and the XP bar fills. A page you only glide past counts nothing, and neither does a tap made while the cover is still closed.
- [ ] **Claro and Oscuro** both read well, in the book and on the gate. **Music** (only once `src/assets/audio/ambience.mp3` is added) starts and stops.

**Fallbacks and real conditions**

- [ ] **Reduced motion** (iPhone: Settings → Accessibility → Motion → Reduce Motion; Android: Settings → Accessibility → Remove animations): the link opens the flat room, with every page and no 3D book. The gate shows no game.
- [ ] **Mid-range Android over mobile data:** the cover shows at once, and the book opens within about 6 seconds. If it doesn't, the flat room takes over by itself, on the page you were heading to.
- [ ] **WhatsApp's in-app browser**, on iPhone and on Android: open both links from a WhatsApp chat. Every page reads without pinching.
- [ ] **Landscape:** turn the phone sideways on `El lugar`. The flat room takes over on the same page, with the address and `Ver en el mapa` at full size, and stays for the rest of the visit.
- [ ] **Back from WhatsApp:** tap `Confirmar por WhatsApp`, then come back to the invitation. It is still on `Confirmar`, either in the book or, if the phone dropped the 3D view while you were away, in the flat room. Everything still works. (If the phone reloaded the page instead, it starts again at the cover; cats and badges are kept.)
- [ ] **The preview card** in WhatsApp (below).
- [ ] **Scan the QR** from a second phone, straight off the screen. Also save it with `Guardar QR` and open it from your bank app's "scan from gallery".

### 📣 The WhatsApp preview card

WhatsApp builds the preview **on the sender's phone, when the message is sent**. Fixing it later does not change messages already sent, so check it first:

1. Send the Saturday link to yourself (or to a test chat) and wait for the card: title **Baby shower de Mia**, the cats image, and no date.
2. If no card appears, confirm the image opens at `https://el-jochi.github.io/mia-babyshower/og-image.jpg`.
3. WhatsApp caches previews per URL. To force a fresh one while testing, add any extra parameter: `?e=n4vk&v=2` still opens Saturday, because the site only reads `e`.

Optional: Meta's [Sharing Debugger](https://developers.facebook.com/tools/debug/) shows which `og:` tags it reads from the page.

---

## 6. ✉️ Send the links

- Saturday guests: `https://el-jochi.github.io/mia-babyshower/?e=n4vk`
- Sunday guests: `https://el-jochi.github.io/mia-babyshower/?e=q8lm`

Never send the bare address, and never send one group the other group's link.

---

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

---

## 8. 🌙 After the parties

At midnight after each party, the site hides the address, map, confirm button, QR, and countdown by itself. No action is needed for that.

The address is still inside the site's code and in the repo, though. When you're ready to take it down:

1. **Remove it from the live site:** clear the place, city, and map link in `src/content.ts`. The related tests and the spec examples reference the address, so update them in the same change. It's a small task; ask Claude to do it.
2. **Remove it from the docs:** `docs/requirements.md`, `docs/requirements-review.md`, and `docs/stack-and-resources.md` mention it.
3. **Remove it from git history** (optional). A normal commit leaves the old text in history. To purge it completely:
   - Delete the repository on GitHub, create it again with the **same name**, and push a fresh single-commit history. The links stay the same because they depend only on the user and repo name. Then turn Pages on again (step 3).
   - Copies someone already cloned or forked can't be recalled.

---

## 🧯 Troubleshooting

| Problem | Fix |
| --- | --- |
| The first workflow run failed at **Setup Pages** or **Deploy** | Pages wasn't on yet. Do step 3, then re-run: **Actions** → the failed run → **Re-run all jobs**, or `gh workflow run pages.yml`. |
| The run failed at **Install, test, and build** | Run `npm test && npm run build` locally, fix what fails, commit, and push again. |
| The site shows a 404 | Wait a few minutes after the first successful deploy. Check that Pages **Source** is **GitHub Actions**. |
| Styles or scripts are missing | Open the site at `/mia-babyshower/` (with the trailing slash). The build uses relative paths on purpose. |
| No WhatsApp preview card | Check that `og-image.jpg` loads at the URL above. Test with `&v=2` to bypass the cache. |
| The music control doesn't appear | The file must be exactly `src/assets/audio/ambience.mp3`, and the site rebuilt. |
| The QR still says "pronto" | The file must be exactly `src/assets/qr.png`, and the site rebuilt. |
