# 🚀 Publishing the invitation

How to put the site online on GitHub Pages, check it before sending the links, and take the address down after the parties.

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
- [ ] **Gate game:** `Toca para jugar` starts 30 seconds of catching yarn and hearts with Mishona. On the mid-range Android it moves smoothly, with no stutter; the cats below hold still until the round ends. At the end: the score, `Tu mejor puntaje`, and `Jugar otra vez`. The two sentences stay on screen.
- [ ] **Saturday link:** the book's cover shows at once (the title, the hero line, `Muévete para explorar`). A drag or a signpost swings it open and the camera swoops down into the book.
- [ ] **Sunday link:** the same, dated `domingo 18 de octubre de 2026`, and nowhere "17 de octubre".

**The facts, without playing** (use only the signposts)

- [ ] `La fecha`: `sábado 17 de octubre de 2026` (Sunday: `domingo 18 de octubre de 2026`), `16:00`, and the countdown.
- [ ] `El lugar`: the address, and `Ver en el mapa` opens the right pin.
- [ ] `Confirmar`: `Confirmar por WhatsApp` opens a chat with **+591 76632451** and the message for that day.
- [ ] `El regalo`: the one gift line, the QR drawn on bone paper with a cat in the middle, the cat button `Guardar QR`, and `Toca el gatito para guardar el QR en tu celular.` under it.
- [ ] Every page reads without pinching, and its buttons are easy to tap.

**Playing**

- [ ] **Moving:** a drag moves through the book and comes to rest on the nearest page, a signpost glides to its page, and pinch still zooms. `La familia` glides to the lit door: the paper family folds up and walks in once, then rests there.
- [ ] **The family on a real phone:** on the phone (not only on a computer), the figures wait until the camera reaches `La familia`, then each folds up and they walk into the doorway one after another, above the card. Check that the fold and the walk are seen whole and read well at the phone's speed.
- [ ] **The 3D door:** in the book, tap the lit doorway above the `La familia` card. Misha does her scratch.
- [ ] **A cat and its card:** wait near a cat until `Saludar` appears, and tap it. Her card flips in, and she is in **Tus gatos**. Reload: she is still there.
- [ ] **The ten cats:** Chona on `Inicio`, Choni on the verse (the page after `Inicio`), Mishona and Kiri kiri on `La fecha`, Chori on the map, Chavela and Minina on the letter, Delilah on the gift box, and Misha (white with gray patches) and Kira (the tabby) at the door. Their names, and their cards, read well on the bone card in both themes, the white cats too. After the party (set the clock past midnight, or wait), the four pages left hold all ten. **Tus gatos** and the quest log count out of 10.
- [ ] **The icons:** a moon and a sun switch Oscuro and Claro, the pressed one is marked, and each is easy to tap. The cat's head opens **Tus gatos** and its badge counts the cats you have met (`0/10` on a first visit). With VoiceOver or TalkBack they read `Oscuro`, `Claro`, and `Tus gatos` with the count. The music button is still text.
- [ ] **Dad's guitar:** at `La familia`, the gold Mockingbird leans in the corner by the door, on both links.
- [ ] **The battle:** at the door, Misha or Kira offers `¡A jugar!`. The moves work. `Huir` leaves with `Te fuiste sin hacer ruido.` and the cat offers `¡A jugar!` again. Winning adds the cat.
- [ ] **Quest log and badges:** resting on a new page stamps `¡Página encontrada!` and raises `Páginas`; badge toasts show one at a time with their XP, and the XP bar fills. A page you only glide past counts nothing, and neither does a tap made while the cover is still closed.
- [ ] **Both moods in both themes:** the Saturday link is a moonlit attic (Claro: blue hour with a rising moon; Oscuro: full night with stars) and the Sunday link a golden dusk (Claro: golden afternoon; Oscuro: late dusk, lanterns lit, fireflies). All four read well, in the book and on the gate.
- [ ] **Music:** the music control shows `Activar música`. Tapping it starts the host's track (it downloads only then) and the control reads `Silenciar música`; tapping again stops it. It loops.
- [ ] **Music volume, on a phone:** play the music with the phone at a normal volume. It should sit quietly under the page, never over it (the site sets no volume, and iPhones ignore a page's volume anyway, so the file's own loudness is what guests hear). If it is loud, supply a quieter master of the track at `src/assets/audio/ambience.mp3`.

**Fallbacks and real conditions**

- [ ] **Reduced motion** (iPhone: Settings → Accessibility → Motion → Reduce Motion; Android: Settings → Accessibility → Remove animations): the link opens the flat room over the still paper diorama of that day's mood, with every page, no 3D, and the family simply standing in the door. The gate shows no game.
- [ ] **Mid-range Android over mobile data:** the cover shows at once, and the book opens within about 6 seconds. If it doesn't, the flat room takes over by itself on the page you were heading to, over the paper diorama, and the live attic fades in behind the cards when it arrives.
- [ ] **WhatsApp's in-app browser**, on iPhone and on Android: open both links from a WhatsApp chat. Every page reads without pinching.
- [ ] **Landscape:** turn the phone sideways on `El lugar`. The flat room takes over on the same page, over the live 3D attic of that day's mood, with the address and `Ver en el mapa` at full size; panning sideways drifts the attic. It stays for the rest of the visit. Opening a link with the phone already sideways goes straight to the same view.
- [ ] **Back from WhatsApp:** tap `Confirmar por WhatsApp`, then come back to the invitation. It is still on `Confirmar`, either in the book or, if the phone dropped the 3D view while you were away, in the flat room over the paper diorama. Everything still works. (If the phone reloaded the page instead, it starts again at the cover; cats and badges are kept.)
- [ ] **Optional, the device tier (Android only):** the draw-call readout in the bottom-left corner (for example `book · normal: 43 calls`) exists only on the dev server, never on the published site. Don't check the tier over the Wi-Fi `Network` address of `npm run dev -- --host`: that is plain `http://`, and there the browser hides the phone's memory, so every phone shows `normal` and the check tells you nothing. The phone has to open the dev server as `localhost`: plug the Android phone into your computer by USB with USB debugging on, open `chrome://inspect/#devices` in Chrome on the computer, turn on **Port forwarding** for `5173` to `localhost:5173`, run `npm run dev`, and open `http://localhost:5173/?e=n4vk` in Chrome on the phone. An Android with 2 GB of memory or less, or 2 cores or fewer, shows `low` (no candle shadow, fewer stars and dust motes); others show `normal`. An iPhone always gets `normal` (Safari reports no memory), so there is nothing to check on it.
- [ ] **The preview card** in WhatsApp (below).
- [ ] **Scan the gift QR with the Banco Ganadero app**, before sending any link:
  1. On a second phone, open the Banco Ganadero app's QR scanner and scan the QR straight off the invitation's screen (`El regalo`). It must open the transfer to the right account, with no fixed amount.
  2. On the iPhone and on the Android, open the invitation link from a WhatsApp chat (WhatsApp's in-app browser, as guests will). On `El regalo`, tap the cat button `Guardar QR` and save `qr-regalo-mia.png`; then also try a long press on the QR and save the image it offers. On each phone at least one of the two must save an image (in some in-app browsers only the long press can). Import each saved image from the gallery in the Banco Ganadero app ("scan from gallery", or upload the image). Each must open the same transfer to the same account. Both ways save the bank's own QR image, so it should open just like the bank's original.
  3. If either fails, do not send the links; tell Claude which one failed and on which phone.
  The bank's QR expires on **27 September 2027**, long after the parties.

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

## 7. 🖼️ The QR and the music

Both are already in the site; nothing needs adding.

| What | Where | Notes |
| --- | --- | --- |
| 🎁 Gift QR on the page | `shared.giftQr` in `src/content.ts` | The Banco Ganadero payload, decoded locally from the host's QR. The site draws it on the page, with a cat in the middle. |
| 🏦 Gift QR download | `src/assets/qr-bank.png` | The bank's own QR image, padded with a white quiet zone. `Guardar QR` shares or downloads it as `qr-regalo-mia.png`. |
| 🎵 Ambience track | `src/assets/audio/ambience.mp3` | The host's track, 2 min 23 s at 256 kbps (4.6 MB), loaded only when a guest turns music on. |

The bank's QR expires on **27 September 2027**. If the bank ever issues a new one, ask Claude to swap both: decode the new QR locally (never with an online service) into `shared.giftQr`, replace `src/assets/qr-bank.png` with the new crop padded with a white quiet zone, pin the new file's SHA-256 in `src/components/Gift.test.tsx`, run `npm test` (the decode tests must pass), and scan both again with the bank app (section 5).

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
| The QR says "pronto" | The payload in `src/content.ts` (`shared.giftQr`) is empty. Put the bank payload back and rebuild. |
