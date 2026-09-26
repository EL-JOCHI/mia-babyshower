# Review — Mia's Baby Shower spec

**Reviewed:** 2026-09-26  
**Updated:** 2026-09-26, with the hosts' answers. See *Update — host decisions* right below.  
**Documents:** `docs/requirements.md` (Draft, updated 2026-09-26) and `docs/stack-and-resources.md` (checked 2026-09-26)  
**Scope:** feasibility, clarity for implementation, gaps, tool fit, and engagement. This is a read-only review. Nothing was implemented or changed in the spec.

---

## Update — host decisions (26 Sep 2026)

The hosts answered the open questions. This section records the answers, what they change, and what is still open. The original review below is unchanged, except for a status column in the summary table and the answered questions at the end.

**Verdict after the decisions: still BLOCKED on paper.** Two blockers are decided (B1, B3). The rest close as soon as the release cut and the proposed defaults below are accepted and written into `requirements.md`.

**Later the same day:** the hosts accepted the defaults, and they are now applied to the spec. The verdict is **NEEDS-WORK, and nothing blocks building R1**. See *Applied to the spec* at the end of this section.

### Decisions

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Release | The site goes live **tomorrow, 27 Sep 2026**. Today and tomorrow are the build time. |
| 2 | Links | They go out **tomorrow night**, 27 Sep. |
| 3 | Reduced motion | The same room, without depth. |
| 4 | Street | **Calle 12 de Abril** is correct. |
| 5 | Public repo | The repo will be public. Images the site doesn't need, including portraits, will be removed. The address may stay public for the whole event. A later commit will delete it. |
| 6 | After the party | No QR and no confirm button. The room can still be played, framed as "the party is over, relive the moment". |
| 7 | Bows (moños) | Allowed, but lightly. |

### Effect on the findings

- **Resolved by decision:** B1 (deadline), B3 (reduced motion), M15 (street name). Only the missing accent in "Prolongación" remains.
- **Changed:** M8, M9, M10. See N2 to N5 below.
- **Still open, with a proposed default below:** B2, B4, M1, M3, M5.
- **Can wait until after launch:** everything else. None of it changes the links or the facts.

### New findings from the decisions

#### N1 — [BLOCKER] Feasibility — The full spec can't be built by tomorrow night

- About 1.5 days are left. The whole spec (7 animated original cats, three art styles, a 3D scene, depth layers, the gate loop, the family door, music) is several days of careful work.
- The saving grace: the links never change. The site can keep improving after they go out, up to the party on 17 Oct.
- The catch: most guests open the link once, the night they get it. Whatever is live tomorrow night is what most people see.
- **Recommendation:** adopt the release plan below and write it into `requirements.md`.

#### N2 — [MAJOR] Standards — The WhatsApp preview is frozen when the message is sent

- WhatsApp builds the link preview on the sender's phone at send time. Fixing the preview later doesn't change messages already sent.
- So the preview tags and image (M9) must be live **before** the links go out.
- That needs the final URL, so the repo name has to be chosen today.

#### N3 — [MAJOR] Truth — "Delete the address later" needs more than one commit

- The midnight cutoff only hides the address on screen. The address stays in the site's downloaded JavaScript until it is removed from the content module.
- A later commit takes it off the live site, but not out of git history. Anyone can still open the old commit.
- To purge it fully, either:
  - recreate the repo with the same name from a clean history (the Pages URL stays the same), or
  - rewrite history, for example with `git filter-repo`, and force-push.
- Copies someone already cloned or forked can't be recalled.
- The address is also in `docs/requirements.md` and in this review, so it goes public with them.

#### N4 — [MAJOR] Truth — Images must be excluded before the first commit, not deleted after

- This folder isn't a git repository yet, so now is the right moment.
- Add `ideas/` to `.gitignore` before the first commit. The images stay on disk for whoever implements the site, and never enter history.
- Deleting them in a later commit would leave them in history.

#### N5 — [MAJOR] Clarity — The after-party mode needs rules and copy

- Decision 6 creates a new mode that the spec doesn't describe yet.
- The spec forbids the implementer from inventing copy, so the hosts must approve the lines.
- Proposed below.

### Proposed defaults — confirm or change

These are proposals. Accept them as they are, or change the numbers or words.

**After-party mode (N5).** Starts at that day's existing cutoff: midnight after the party, Bolivia time.
- **Removed:** Dónde, Confirmar, Presente (QR and gift copy), their signposts, and the countdown.
- **Kept:** Llegada, Palabra, Cuándo (date and `16:00`, as a memory), Familia, all cats, **Tus gatos**.
- **Proposed copy:**
  - Hero line: `Gracias por celebrar con nosotros la llegada de Mia.`
  - Relive line: `La fiesta ya pasó, pero los gatos siguen aquí. Revive el momento.`
  - Play-again control in **Tus gatos**: `Jugar otra vez`. It clears the list so the guest can meet the cats again. It exists only after the party.

**Reduced motion (decision 3).**
- The same room and camera. All layers move together, with no depth. No roaming, no canvas, no gate count.
- Signposts jump instantly instead of gliding.
- The art style still follows the camera position. The 3D third shows the color style, because there is no canvas.
- Delete the single-column version at L260 of `requirements.md`.

**Room size (B4).**
- Room width = `max(300vw, N × min(100vw, 420px))`, where N is the number of landmarks on that page: 7 before the party, 4 after.
- A 360px phone gets a 2520px room. A 1440px desktop stays at 4320px.
- Landmark centres are evenly spaced, with alternating vertical offsets of ±10dvh.
- The QR is at least 220 CSS px wide, on a white plate.

**Art-style position (M1).**
- Position = camera x / (room width − viewport width), from 0 to 1 over the whole room.
- Pixel below 0.33, color below 0.66, 3D from 0.66.
- The family door is in the 3D third.

**Noticing (B2).**
- A cat can notice the guest when its centre is inside the middle 60% of the screen and the camera is still.
- Wait before `Saludar` appears:

| Rarity | Wait |
| --- | --- |
| Común | 0.5 s |
| Poco común | 1.5 s |
| Legendario | 2.5 s (Misha: 1.2 s while music plays) |

- Susto: moving faster than 600 px/s while he is in view resets his wait.
- `Saludar` stays while the cat is in view, and leaves 1 s after the cat leaves view.
- The button's accessible name is `Saludar a {name}`. That copy needs approval.

**Perched cats (M3).** Cats that sit on a card, or act on it, move with the cards. Only passing hearts and stars use the faster near layer.

**Contrast (M5).** Add a light-theme text pink, `#E20064` (4.52:1 on paper). Put button labels in `#141414` on hot pink.

**Bows (decision 7).**
- A small pink bow on the stroller (3D era) and on one corner of the gift card.
- At most one cat wears a small bow: Mimo.
- The family shadows stay bow-free.
- The spec's no-bow lines (L242, L298, L327) change to match.

### Release plan

**R1 — must be live before the links go out tomorrow night**
1. Repo created, Pages switched to GitHub Actions, final URL known. `.gitignore` with `ideas/` before the first commit (N4).
2. Content module and pure functions with tests: invite code, place cutoff, countdown, art style.
3. Guest gate: the two sentences and the 9-to-0 count. A simple finale is fine.
4. Room:
   - camera by drag, wheel, and arrow keys;
   - landmarks as HTML cards;
   - signposts;
   - theme;
   - reduced motion without depth.
5. Facts: date, `16:00`, countdown, address and map, WhatsApp confirm, the QR or the pending sentence, `Guardar QR`.
6. Preview tags, preview image, favicon, and `noindex` (N2).
7. A check on real phones: iPhone Safari, Android Chrome, and a link opened from inside WhatsApp.

**R1 stretch — tomorrow, if time remains**

First-time visitors will see this, so it's the best use of any spare hours:
- the family door, with the four shadows and Misha and Kira;
- two or three cats as simple SVGs, with greeting and **Tus gatos**.

**R2 — before the party (17 Oct)**
- All seven cats with their acts.
- Pixel-to-color styling and the depth layers.
- After-party mode with `Jugar otra vez`. It must be live before 18 Oct, 00:00 Bolivia time.
- The bow accents.

**R3 — optional, before the party:** the 3D era, and music once the track arrives.

**After the party:** the commit that removes the address, and the history purge if wanted (N3).

**For the hosts:**
- Create the gift QR without a fixed amount, reusable, and expiring after 18 Oct or never.
- Add it before tomorrow night if possible. If not, the pending sentence covers it.

### Follow-up answers

1. **Repo name:** `mia-babyshower`.
2. **`Jugar otra vez`:** the count keeps going, and the cats can be met again. As written into the spec: **Tus gatos** keeps every cat ever met, with its line. `Jugar otra vez` starts a new round: the round count restarts at `0 de 7`, `Vuelta {n}` goes up, and every cat offers `Saludar` again.
3. **Proposed Spanish lines:** approved.
4. **Proposed numbers:** use best judgment. The hosts will tune them after the first build, so every number and color lives in one tuning module that can be changed without touching components.

### Applied to the spec (26 Sep 2026)

The decisions and defaults are now written into `docs/requirements.md` and `docs/stack-and-resources.md`. Backups of both files from before the edits are in `/tmp/mia-spec-backup-2026-09-26/`.

| Finding | Where it landed |
| --- | --- |
| B1, N1 | Header; §16 *Release plan* (R1, R1 stretch, R2, R3); release tags on every user story |
| B2 | §3 *Noticing*; US-9 AC9–11; tuning module |
| B3 | §4 *When motion or WebGL is unavailable* (same room, no depth); BR-13; US-7 AC3 |
| B4 | §4 room size and layout; US-1 AC6; tuning module |
| M1 | §4 *Three eras* (one formula over the whole room) |
| M2 | §4 depth and eras; §10 technical and performance (cats stay SVG; lazy-loaded scene; mount once, then pause) |
| M3 | §4 depth table (cats on the mid layer) |
| M4 | §4 *Music*; US-11 AC4, AC6, AC7; BR-19 |
| M5 | §5 palette; §16 tokens (`#E20064`); US-2 AC4 contrast test |
| M6 | §5 accent table (7 starting accents); Mimo's blush body; Nana and Kira lines fixed |
| M7 | §4 `touch-action: pinch-zoom` and focus follows the camera; §6 accessible names; §10; FR-11; traceability |
| M8, N3, N4 | §10 *Product* (public repo, `.gitignore`, removing the address later); stack §8 |
| M9, N2 | §6 share preview copy; BR-23; FR-22; §16 image spec; content module site URL |
| M10, N5 | §3 *When the party is over* and *Playing again*; §6 copy; US-5; US-13; BR-11; BR-22 |
| M11 | §4 *Coming back*; §10 *Product* |
| M12 | §12 manual checks on real phones; US-1 AC6 as a layout-function test |
| M14 | Stack doc: `@types/react-dom` 19.2.7, `@types/three`, lint and test packages, scripts, lockfile, drei and Node wording |
| M15 | "Prolongación" accent fixed |
| m1 | Code parsing (US-8 AC6), `Inicio` signpost, fixed controls vs in-card links, camera margin and arrow step, one-screen gate, landmark names internal, toy lists, live cutoff, QR plate and long-press, build-time asset detection, "short link" wording |

**Verdict after applying: NEEDS-WORK, and nothing blocks building R1.** This is based on a consistency pass over both files, not a full second review. What remains:

- **M13 (duplication):** some facts are still repeated. For example, dad's hair is described in four places. Consolidating is safe to do later.
- **Small gaps, fine to leave for R2:** the visual beat when the art style changes at 0.33 and 0.66; when the family walks in (first time in view on each visit is a reasonable default); whether the feelings (Alegría…) are ever shown. Today they are not.
- **GitHub username:** `EL-JOCHI`, confirmed. The site URL, the links, and the share preview are now filled in as `https://el-jochi.github.io/mia-babyshower/`. That account's Pages host already serves the Miguelito invitation (HTTP 200). The new repo still needs Pages set to GitHub Actions once.

---

## Verdict: BLOCKED

The idea is buildable, but four decisions are missing or contradict each other:

1. What ships by when.
2. How cats get greeted.
3. Which reduced-motion design to build.
4. How seven landmarks fit on a phone.

Each one would force whoever implements the spec to invent the answer. The party is **21 days away**: Saturday 17 October 2026, confirmed. Most fixes are one decision plus a few lines of spec.

*Verdict rule: any Blocker gives BLOCKED; otherwise any Major gives NEEDS-WORK; otherwise READY.*

## Summary of findings

| # | Severity | Area | Finding | Status after decisions |
| --- | --- | --- | --- | --- |
| B1 | Blocker | Feasibility | No delivery date or minimum release for a fixed-date event | Decided (tomorrow). Replaced by N1. |
| B2 | Blocker | Clarity | The greeting ("noticing") mechanic has no rules | Open. Default proposed. |
| B3 | Blocker | Truth | Reduced motion is specified as two different products | Decided: same room, no depth |
| B4 | Blocker | Feasibility | Seven landmarks don't fit left to right in a room 3 screens wide on a phone | Open. Default proposed. |
| M1 | Major | Truth | The position that picks the art style contradicts itself, and Familia is undefined | Open. Default proposed. |
| M2 | Major | Truth | The 3D era's cast, mounting, and loading are unclear | Can wait (R3) |
| M3 | Major | Truth | Cats that sit on cards would slide off them | Open. Default proposed. |
| M4 | Major | Feasibility | Music can't resume by itself, and iPhone ignores volume set in code | Can wait (R3) |
| M5 | Major | Standards | The light theme fails the spec's own contrast requirement | Open. Default proposed. |
| M6 | Major | Clarity | The cat art rules can't all be true at once | Can wait (R2) |
| M7 | Major | Standards | Gaps against the WCAG 2.2 AA claim | Zoom and focus rules in R1; the rest later |
| M8 | Major | Truth | The guest gate is not private, and a public repo would publish family data | Accepted as public. See N3 and N4. |
| M9 | Major | Standards | The WhatsApp link preview is unspecified | Must ship in R1. See N2. |
| M10 | Major | Clarity | What happens after the party is incomplete | Decided. See N5. |
| M11 | Major | Truth | "The only reset" is not true | Open (wording only) |
| M12 | Major | Standards | Several acceptance scenarios can't be tested with the chosen tools | Can wait |
| M13 | Major | Clarity | Many rules have no IDs, and key facts are repeated up to five times | Can wait |
| M14 | Major | Truth | Errors in the package list | Fix before the first install |
| M15 | Major | Truth | The street name may not match the map pin | Resolved: 12 de Abril. The accent remains. |
| m1 | Minor | Clarity | Several smaller gaps | Can wait |
| N1 | Blocker | Feasibility | The full spec can't be built by tomorrow night | New. Release plan proposed. |
| N2 | Major | Standards | The WhatsApp preview is frozen when the message is sent | New. Must ship in R1. |
| N3 | Major | Truth | "Delete the address later" needs more than one commit | New |
| N4 | Major | Truth | Images must be excluded before the first commit | New. Do it before `git init`. |
| N5 | Major | Clarity | The after-party mode needs rules and copy | New. Copy proposed. |

Line references (`L123`) point to `docs/requirements.md` unless marked `stack`.

---

## Strengths

- **Well-defined logic.** The rules for which link opens which day, when the address disappears, which art style shows where, and adding a greeted cat are all pure functions. The clock is passed in. The instants carry the `-04:00` offset. There are tests at 23:59 and at 00:00 (US-5). This is very good spec-driven work.
- **Missing assets are handled up front.** The QR shows a pending sentence until the file exists. The music control is hidden until there is a track. The out-of-scope list is explicit.
- **The stack reasoning is sound, and it was actually checked.** Keeping the text as HTML and not using a game engine like Phaser is the right call. The two version limits are real. React must stay below 19.3 because of React Three Fiber 9.7.0. TypeScript must stay below 6.1 because of typescript-eslint 8.70.0. Both were confirmed on npm.
- **The emotional design is strong.** An arcade-style "continue" screen replaces an error page. Misha and Kira are handled with care. Nothing punishes the guest.

---

## Blockers

### B1 — Feasibility — No delivery date or minimum release for a fixed-date event

- **Location:** §7 priorities (L460, L483, L522), §16 build order.
- **Problem:** Invitations usually go out about two weeks before the event, which leaves roughly one week to build. The priority labels don't help cut scope: the 3D era (US-7), cat greeting (US-9), and cat play (US-12) are all P1.
- **Evidence:** `cal 10 2026` shows 17 October is a Saturday and 18 October is a Sunday. Today is 26 September.
- **Recommendation:** Add dated release cuts. The links never change, so later pushes upgrade the same URLs.
  - **R1 — ready to send:** guest gate, both invitation pages, all facts, WhatsApp, map, QR, theme, signposts, reduced motion.
  - **R2:** cats, greeting, **Tus gatos**.
  - **R3:** 3D era and music.

### B2 — Clarity — The greeting ("noticing") mechanic has no rules

- **Location:** §3 Greeting (L132–140), L256, L299, US-9.
- **Problem:** This is the core of the fun, and it is described only in words like "sooner", "a moment", "rushing", and "harder to meet".
  - Nothing says what makes a cat notice the guest, how long each rarity takes, or how long `Saludar` stays.
  - There is a contradiction. Misha can be greeted "as soon as the guest reaches the door" (L138), but it "takes longer" without music (L256).
  - In reduced-motion mode there is no camera, so "the camera has been still" can't apply.
  - US-9 tests only the list function, not when greeting becomes possible.
- **Evidence:** A search of the spec finds no numbers for any of these.
- **Recommendation:** Add a noticing table per cat, and specify it as a pure `isNoticing(...)` function with acceptance scenarios. The table should cover:
  - the trigger, for example the cat within X% of the screen centre;
  - the wait time by rarity (Común, Poco común, Legendario);
  - the camera speed that counts as "rushing" Susto;
  - how much sooner Misha notices when music is on;
  - how long `Saludar` stays visible;
  - the reduced-motion rule, for example always offer `Saludar` on a visible cat not yet greeted;
  - the keyboard and screen-reader rule.

### B3 — Truth — Reduced motion is specified as two different products

- **Location:** L232 vs L260. Reduced motion is described in five places in total.
- **Problem:** The two versions produce different builds.
  - L232: the same room, still movable, without layers moving at different speeds.
  - L260: "one column, on a normal page", with no camera and no signposts.
- **Evidence:** Internal contradiction.
- **Recommendation:** Pick one and delete the other. The single column is recommended: it is the simplest and most accessible. Also state which art style (pixel or color) that mode uses.

### B4 — Feasibility — Seven landmarks don't fit left to right in a room 3 screens wide on a phone

- **Location:** L205, L739, FR-10 (320px), landmark list L62–70.
- **Problem:** On a 360px phone the room is 1080px wide. Seven readable cards at about 300px each need about 2100px. Presente also needs a scannable QR, text, and a button. No landmark coordinates are given, so the layout gets invented during the build.
- **Evidence:** Arithmetic from the spec's own numbers.
- **Recommendation:** Size the room per landmark, for example `max(3 × vw, 7 × 340px)`, or about one screen width per landmark. Add a coordinate table (x, y offset for each landmark) and a minimum QR size.

---

## Majors

### M1 — Truth — The position that picks the art style contradicts itself, and Familia is undefined

- **Location:** L236 vs L244.
- **Problem:** Position runs "0 at Llegada, 1 at Presente", but L244 says "the eras still span the whole width". Familia sits past Presente, so its position (greater than 1) and its art style are undefined.
- **Evidence:** Internal contradiction.
- **Recommendation:** Define one formula for the whole room, for example `x = cameraX / (roomWidth − viewportWidth)`, clamped to 0–1. State which art style the door area uses.

### M2 — Truth — The 3D era's cast, mounting, and loading are unclear

- **Location:** L242 vs L230; stack L85.
- **Problem:**
  - The eras table puts "the cats" inside the Three.js scene. L230 and stack §2.1 say the 3D scene is only the far background.
  - SC-8 requires greeting cats without WebGL, so cats must exist outside the 3D scene anyway.
  - Nothing says to load the 3D code only when it is needed, so three and React Three Fiber could end up in the first download on a phone.
  - Mounting and unmounting the scene each time the guest crosses 0.66 repeatedly creates and destroys WebGL contexts.
- **Evidence:** Internal contradiction. A search finds no mention of lazy loading, code splitting, or bundle size.
- **Recommendation:** Keep the cats as SVG in every era, and use the 3D scene for background props only. Load the 3D code on demand. Mount it once, on first entry into the 3D era, then pause it when out of view. Add a size budget for the first page load.

### M3 — Truth — Cats that sit on cards would slide off them

- **Location:** L228 and L739 (near layer at 1.15) vs the cats that sit on things at L96, L99, and L101.
- **Problem:** Several cats sit on page objects: Mimo on a card corner, Nana on the QR frame, Bram on the countdown frame, Misha and Kira at the door. They are on the near layer, which moves faster than the cards. They drift about 15% of the camera's travel away from their spot. Separately, L72 says cats "do not cover a landmark's words", while L230 allows it "for a moment".
- **Evidence:** Internal contradiction.
- **Recommendation:** Cats that are sitting on something or doing an act move with the cards (mid layer, 1:1). Only passing decorations go on the near layer. Reconcile L72 with L230.

### M4 — Feasibility — Music can't resume by itself, and iPhone ignores volume set in code

- **Location:** US-11 AC4 (L519), BR-19 (L555).
- **Problem:**
  - Browsers block `play()` without a tap. The test "playback is requested" would pass while the guest hears nothing and the control reads `Silenciar música`.
  - "A modest volume" can't be set from JavaScript on iOS.
- **Evidence:** Apple's HTML5 audio guide says: *"The `volume` property is not settable in JavaScript. Reading the `volume` property always returns 1."* It also says `play()` is *"inactive until the user initiates playback, unless the `play()` or `load()` method is triggered by user action."*
- **Recommendation:**
  - On a later visit, start the music on the guest's first tap or drag, which counts as a gesture.
  - If `play()` is refused, show `Activar música`.
  - Make the file itself quiet, or use Web Audio for volume.
  - Pause when the page is hidden, for example when the guest leaves for WhatsApp.
  - Use `preload="none"` so the file isn't downloaded until needed.

### M5 — Standards — The light theme fails the spec's own contrast requirement (US-2 AC4)

- **Location:** palette L322 ("the same pink, as ink and glow"), tokens L745–749.
- **Evidence:** Contrast ratios computed with the WCAG formula from the spec's hex values:

| Pair | Ratio | Normal text (4.5:1) | Large text / UI (3:1) |
| --- | --- | --- | --- |
| `#FF2D8A` pink on `#0A0A0A` dark field | 5.65:1 | Pass | Pass |
| `#FF2D8A` pink on `#FFF7FB` paper | **3.33:1** | **Fail** | Pass |
| `#FFF7FB` paper text on `#FF2D8A` pink button | **3.33:1** | **Fail** | Pass |
| `#141414` ink on `#FF2D8A` pink button | 5.26:1 | Pass | Pass |
| `#FF2D8A` pink on `#F7C5D8` blush panel | **2.32:1** | **Fail** | **Fail** |
| `#141414` ink on `#F7C5D8` blush panel | 12.22:1 | Pass | Pass |
| `#F7C5D8` blush on `#0A0A0A` dark | 13.14:1 | Pass | Pass |
| `#141414` ink on `#FFF7FB` paper | 17.50:1 | Pass | Pass |

- **Recommendation:**
  - Add a separate light-theme pink for text. For example, `#E20064` reaches 4.52:1 on paper.
  - Put button labels in dark ink on pink (5.26:1).
  - Never put pink text on blush.
  - Add a contrast test over the token pairs. It is cheap, and it runs in jsdom.

### M6 — Clarity — The cat art rules can't all be true at once

- **Location:** L282, L294–296, L304, L185.
- **Problem:**
  - The rules require a different main color per cat, one accent from the palette with no extra colors, and a black or near-black body. The palette has only 3 non-black tones (hot pink, blush, paper) for 7 cats.
  - Mimo has a "blush body", which breaks the black-body rule.
  - Nana is "on the cushion" (L282) but sits on the QR frame everywhere else.
  - Kira "watches from above" (L185) but sits by the door everywhere else.
- **Evidence:** Internal contradiction.
- **Recommendation:** Either add a table with one hex accent per cat, allowing 7 accents, or say the cats are told apart by silhouette and movement, not colour. Fix the cushion and "from above" lines.

### M7 — Standards — Gaps against the WCAG 2.2 AA claim

- **Location:** L207, FR-11 (L570), §12.
- **Problems:**
  1. **Zoom.** `touch-action: none` on a full-screen drag surface turns off pinch-zoom. That contradicts "the viewport meta does not disable zoom".
  2. **Focus.** Nothing says the camera follows keyboard focus. A Tab to a control off camera leaves the focused control invisible, which fails WCAG 2.4.11 (Focus Not Obscured, an AA rule in 2.2). The affected controls are `Confirmar por WhatsApp`, `Ver en el mapa`, `Guardar QR`, and `Saludar`. The browser's own focus scrolling can also shift the hidden container and put it out of step with the camera.
  3. **Accessible names.** There is no Spanish copy for the cats, the family door art, the toys, the room region, or the theme control group. §16 forbids inventing copy, so the implementer is stuck.
  4. **Countdown.** Nothing says the countdown stays silent for screen readers. If it is announced, it would be read aloud every second.
  5. **Tests.** FR-11 has no row in the traceability table.
- **Evidence:** MDN browser data: `touch-action: none` disables panning and zooming. `touch-action: pinch-zoom` is supported in Chrome 56, Firefox 85, and Safari 13, iOS included.
- **Recommendation:** Use `touch-action: pinch-zoom` on the drag surface. Add a rule that focus moves the camera to the focused control. Add the missing Spanish accessible names to §6. Keep the countdown silent for screen readers. Add FR-11 to traceability.

### M8 — Truth — The guest gate is not private, and a public repo would publish family data

- **Location:** L14, L584; stack L100, L151.
- **Problem:**
  - Anyone can read the codes `n4vk` and `q8lm`, and the facts they unlock, in the site's downloaded JavaScript.
  - GitHub Pages on the Free plan needs a public repository. That repository would also publish `docs/requirements.md` and `ideas/dad.jpg`. The requirements hold the address, dates, codes, and family story. `dad.jpg` is a face photo the spec deliberately keeps off the site. "Keep `ideas/dad.jpg` out of `public/`" protects only the site, not the repository.
- **Evidence:** GitHub Docs: Pages is available "in public repositories with GitHub Free", and "GitHub Pages sites are publicly available on the internet, even if the repository for the site is private".
- **Recommendation:**
  - State the threat model: the gate is a courtesy, not security.
  - Add `ideas/` to `.gitignore`, and consider keeping personal notes out of the pushed docs. Or use a private repository on a paid plan; the site itself stays public either way.
  - Add `<meta name="robots" content="noindex">` so search engines skip the site.

### M9 — Standards — The WhatsApp link preview is unspecified

- **Location:** none. A search finds no `og:` tags, favicon, or preview image. Also stack L92 and L144.
- **Problem:**
  - The preview card is the first thing guests see.
  - The site is static, so one card serves both days and the gate. It must not show a date.
  - The stack doc says the repository name doesn't need to be known, but WhatsApp needs an absolute image URL. The build therefore has to know the final site URL.
- **Evidence:** Meta's docs: `og:image` must be an absolute URL, under 600KB, at least 300px wide, with an aspect ratio of 4:1 or less. The usual size is 1200×630. Several sources report that WhatsApp is stricter in practice, at about 300KB.
- **Recommendation:** Add a share-preview section:
  - `og:title` Baby shower de Mia;
  - a generic `og:description` with no date;
  - `og:image` as a 1200×630 JPEG under 300KB;
  - `og:locale` `es`;
  - a favicon and a `theme-color` meta tag.

  Decide the final URL now (repository name or custom domain), or set it at build time through an environment variable.

### M10 — Clarity — What happens after the party is incomplete

- **Location:** L87, L128, L457.
- **Problem:**
  - After midnight, only the address disappears.
  - `Confirmar por WhatsApp` stays forever. Someone in 2029 could send "quiero confirmar mi asistencia… 17 de octubre".
  - The QR stays forever. Bolivian bank QRs have expiry options. A QR created with a fixed amount would make "El monto lo eliges tú" false.
  - The countdown stays at zero forever.
  - There is no RSVP-by date.
- **Evidence:** Banco Central de Bolivia: a QR can be created weekly, monthly, annual, or single-use, and it can include an amount.
- **Recommendation:**
  - Decide the after-party state of each landmark.
  - Add a checklist for generating the QR: no fixed amount, reusable, expiry after the event or none.
  - Consider a short after-party line, or a "¡Hoy!" state on the day.

### M11 — Truth — "The only reset" is not true

- **Location:** L591 ("Clearing site data clears the cat list. That is the only reset."), L266.
- **Problem:** The cat list can also disappear without the guest clearing anything:
  - Safari on iOS and macOS deletes local storage after 7 days of browser use without an interaction on the site.
  - Private tabs don't keep it.
  - In-app browsers, such as the ones inside WhatsApp or Instagram, can keep storage separate from the main browser.

  L266 says "Years later… the cats are still there". It is unclear whether that means the cats in the room or the saved list.
- **Evidence:** WebKit's tracking-prevention docs describe the 7-day cap on script-writable storage, local storage included. It has applied since iOS 13.4 and Safari 13.1.
- **Recommendation:** Call the saved list "best effort". Clarify that "years later" means the cats in the room, not the saved list. Clean up bad saved data on load: invalid JSON, unknown ids, duplicates.

### M12 — Standards — Several acceptance scenarios can't be tested with the chosen tools

- **Location:** L613 ("Vitest and React Testing Library cover the acceptance scenarios. No end-to-end suite"), US-1 AC3, US-4 AC1, US-7 AC2, US-12 AC2, §12.
- **Problem:**
  - jsdom has no layout and no WebGL. It can't check that text is readable or that buttons are tappable. It can't check "no sideways scroll" (FR-10), "large enough to scan", "Three.js canvas mounted" (React Three Fiber can't create a WebGL context in jsdom), or "dad with a fuller afro".
  - Traceability skips FR-11, BR-16 (the page still renders when storage fails), BR-17, BR-18, and BR-20.
- **Evidence:** Vitest 5.0.1 lists `@vitest/browser-playwright@5.0.1` as an optional peer, so Vitest's real-browser mode is available without a separate end-to-end suite.
- **Recommendation:**
  - Run the layout scenarios in Vitest's browser mode, or move them to a written manual review checklist.
  - Mock the canvas in jsdom tests.
  - Define "large enough to scan", for example at least 220 CSS px with a 4-module quiet zone.
  - Fill in the missing traceability rows.

### M13 — Clarity — Many rules have no IDs, and key facts are repeated up to five times

- **Location:**
  - Dad's hair: L152, L163, L275, L711.
  - Storage: L165, L550, L552.
  - Cat behaviour: three tables in §3 and §5.
  - Reduced motion: five places.
- **Problem:**
  - Many binding rules live only in prose, with no ID a test can trace to. Examples: "`Guardar QR` does not play Nana's tilt", the 400ms glide, the camera bounds, the signposts, the arrow keys, the **Tus gatos** overlay.
  - The spec says "A test that does not trace to a requirement here does not belong in the suite", so these rules end up untestable.
  - The storage rule and "What this loop is / is not" sit inside the *Family door* section.
  - Repeated facts will drift apart as the doc is edited.
- **Evidence:** Read of the document.
- **Recommendation:** Split the doc into three parts: story and intent, numbered rules, and content. Keep one canonical place per concept, and have every other mention point to it.

### M14 — Truth — Errors in the package list

- **Location:** stack L40–41, L18, L73; requirements L597–607.
- **Problems:**

| Item | Finding |
| --- | --- |
| `@types/react-dom@19.2.8` | **Does not exist.** The newest 19.2.x is 19.2.7, so `npm install` fails with ETARGET. |
| `@types/three` | Missing. `three@0.186.0` ships no type definitions; `@types/three@0.186.0` exists. Strict TypeScript needs it. |
| drei note (stack §1) | Says the requirements allow drei "for a small helper". The requirements never mention drei. |
| Node "26.9.0 is the current line" | Node 26.10.0 was released on 2026-09-21. The exact pin still works; the wording is stale. |
| Missing dev dependencies | `@testing-library/user-event` (drag and keyboard tests), `eslint-plugin-react-hooks`, `@eslint/js`, `globals`. |
| npm scripts | Not defined. Suggested: `test: vitest run`, `build: tsc -b && vite build`, `lint: eslint .`. |
| CI | The workflow never runs lint. `npm ci` and the npm cache step need a committed `package-lock.json`. |

- **Evidence:** `npm view` for every package, and nodejs.org's `dist/index.json`.
- **Recommendation:** Correct the table, add the missing packages, define the scripts, and commit the lockfile.

### M15 — Truth — The street name may not match the map pin

- **Location:** L351, L643.
- **Problem:** The address says "Calle 12 de Abril S/N". OpenStreetMap names a different street at the pin. "Prolongacion" is also missing its accent ("Prolongación").
- **Evidence (partial — OpenStreetMap can be wrong):**
  - The nearest named street to the pin is **Calle 17 de Abril**, about 160m away.
  - The only "Calle 12 de Abril" in Santa Cruz on OpenStreetMap is in Nuevo Palmar, about 13km south.
  - The pin itself is consistent with the rest of the address. It is about 380m from "Prolongación Avenida Beni", between the Sexto and Séptimo Anillo.
- **Recommendation:** Confirm the street name with the hosts and fix the accent.

---

## Minor

### m1 — Clarity — Several smaller gaps

- **Signposts.** There is none for Llegada or Palabra, so there is no signpost back to the start. SC-1 relies on the verse being reachable.
- **"Stay put" wording (L216).** It says `Confirmar por WhatsApp` and `Ver en el mapa` "stay put while the room moves". That reads as fixed on-screen buttons, but both live inside landmark cards. It is probably just wording, but fix it.
- **Camera details.** The edge margin ("a small margin"), the arrow-key step, drag momentum, and the starting height are unset.
- **Gate.** It is unclear whether the gate can be panned like a room, and whether it shows the title.
- **Visible text.** Are the landmark names (Llegada, Cuándo, Dónde…) and the feelings (Alegría, Ternura…) shown to guests? Neither is in §6.
- **Toys.** There is no toy list for the invitation pages. BR-18 points to "the toys in section 3", but §3 has no list. The "things the guest can already see" list (L105) leaves out the heart, pick, and star that Luz, Bram, and Kira play with.
- **Invite code parsing.** Undefined for `N4VK` (upper case), trailing punctuation or spaces, a repeated `e`, or extra parameters.
- **Changes while the page is open.** Unset: what happens at midnight while the page is open, the transition and back-and-forth behaviour at 0.33 and 0.66, and when the family walks in (first time in view on each visit?).
- **QR practicalities.**
  - The QR needs a white background in the dark theme.
  - The QR `<img>` must keep the phone's native long-press to save, so the drag surface must not capture it.
  - Android in-app browsers (WebView) have no Web Share, and downloads may fail there. Long-press is the real fallback.
- **Asset detection.** There are two sources of truth for whether the QR and music exist: an empty content field (§11) and "until the file exists" (stack §5). Also, with `base: './'`, paths under `public/` must be relative. Detecting the files at build time with `import.meta.glob` from `src/assets` gives one rule.
- **"Short link" (L12).** Undefined. The GitHub Pages URL is long, and a URL shortener would add tracking.

---

## Verification trail

| Claim | Source checked | Result |
| --- | --- | --- |
| 17 Oct 2026 is a Saturday, 18 Oct a Sunday | `cal 10 2026` | Verified |
| WhatsApp number `59176632451` | Reference repo `src/App.tsx` (`+59176632451`) | Verified |
| Verse wording and citation | Reference repo `invite-section.tsx` | Verified, identical |
| Map pin between 6th and 7th ring, near Prolongación Beni | OpenStreetMap lookups (Nominatim and Overpass) | Verified |
| Street "Calle 12 de Abril" | OpenStreetMap | Partial: the nearest street is "17 de Abril" |
| React Three Fiber 9.7.0 requires React `>=19 <19.3` | `npm view @react-three/fiber@9.7.0 peerDependencies` | Verified |
| typescript-eslint 8.70.0 requires TypeScript `<6.1.0` | `npm view typescript-eslint@8.70.0 peerDependencies` | Verified |
| All pinned packages exist | `npm view` for each | `@types/react-dom@19.2.8` is missing |
| Node 26.9.0 exists and is current | nodejs.org `dist/index.json` | Exists; 26.10.0 is newer |
| iOS audio volume and autoplay | Apple HTML5 audio guide | Verified |
| Safari 7-day storage cap | WebKit tracking-prevention docs | Verified |
| `touch-action` pinch-zoom support, Web Share in WebView | MDN browser-compat-data | Verified |
| WhatsApp preview requirements | Meta developer docs | Verified |
| Bolivian QR expiry options | Banco Central de Bolivia | Verified |
| Contrast ratios | Computed from the spec's hex tokens | Verified |
| GitHub Pages plan and privacy | GitHub Docs | Verified |
| Reference images match their descriptions | Viewed 4 of the 5 images; `dad.jpg` not opened | Verified |
| Pages workflow behaviour described in the stack doc | `.github/workflows/pages.yml` | Verified |

## Looked wrong, not flagged

- **The verse isn't the standard Reina-Valera wording.** Intentional: it matches the reference site exactly, which takes it from jw.org.
- **The WhatsApp link has no `+`.** Correct format for `wa.me`. The reference site used `+591…`.
- **No bows, even though the party décor is full of them.** An explicit decision, repeated in the spec. See question 6.
- **`dvh` heights.** The page never scrolls, so the phone's address bar never collapses. Harmless.
- **A query string on GitHub Pages.** It works without any single-page-app redirect.
- **Fixed `-04:00` offsets.** Bolivia has no daylight saving.
- **Greeting the same cat twice is tested even though the UI never offers it.** Fine: the pure function should be idempotent.

---

## Engagement and fun

The story is the best part: the family door with Misha and Kira, rarity without random luck, and no way to lose. Five gaps are worth closing:

1. **Teach the greeting.** Guests won't know cats can be greeted. Make Luz notice almost instantly at Llegada, so the first greeting teaches the mechanic without any instructions.
2. **Show progress.** A `3/7` badge on **Tus gatos**, and a hint for each missing cat (for example "Cerca de la puerta"), give people a reason to explore.
3. **Reward finishing.** Collecting all seven cats gives nothing today. A fixed, non-random moment fits the spec's rules, for example all seven gather at the door, or the door line gains a sentence.
4. **Make the style changes a moment.** The fun of the Evoland idea is the transformation itself. Specify a short beat at 0.33 and at 0.66, such as a flash or scanlines.
5. **The preview card is the biggest lever** (see M9). A "¡Hoy!" state when the countdown reaches zero is another cheap win.

Also note: most guests will visit once, for a minute or two. The signposts, which reach the facts in seconds, are the right call. Keep them.

## Tool fit

The tools are appropriate: React, Vite, TypeScript, Tailwind, HTML text, and no game engine. Two adjustments:

- Add Vitest's real-browser mode for the layout tests (see M12).
- Load the 3D code only when needed (see M2).

An option to consider: for "simple 3D", CSS 3D transforms could replace Three.js and React Three Fiber. That would remove a dependency, the WebGL fallback path, and the React version cap, at the cost of a less real 3D feel. Keep React Three Fiber if a real 3D scene matters to you.

---

## Questions only the hosts can answer — answered 26 Sep 2026

1. **When do the links go out, and what is the minimum that must work by then?** The site ships tomorrow, 27 Sep. Links go out tomorrow night. The minimum is proposed in the release plan at the top.
2. **Reduced motion: a single-column page, or the same room without depth?** The same room, without depth.
3. **Calle 12 or 17 de Abril?** Calle 12 de Abril.
4. **Will the repository be public?** Yes. Unneeded images and portraits will be removed, and the address will be deleted after the event. See N3 and N4.
5. **After the party, should the QR and the confirm button go away?** Yes. The room stays playable, framed as reliving the moment. See N5.
6. **Is mom happy with no bows?** Bows are fine, lightly. The proposed placement is at the top.

The follow-up questions are listed under *Still to decide* at the top.

---

## Sources

- [Apple — Device-specific considerations for HTML5 audio and video](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)
- [WebKit — Tracking Prevention](https://webkit.org/tracking-prevention/)
- [WebKit — Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [Meta — WhatsApp link previews](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews)
- [MDN — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data)
- [Banco Central de Bolivia — Pagos QR](https://www.bcb.gob.bo/?q=pagos_qr_bcb_bolivia)
- [Banco Nacional de Bolivia — QR digital](https://bancadigital.bnb.com.bo/SolicitudQRSimple/qr-digital/)
- [GitHub Docs — What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Reference repo — EL-JOCHI/miguelito-baby-shower](https://github.com/EL-JOCHI/miguelito-baby-shower)
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)
- [Node.js release index](https://nodejs.org/dist/index.json)
