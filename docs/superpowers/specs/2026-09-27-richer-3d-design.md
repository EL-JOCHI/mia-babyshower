# Richer 3D: per-day moods, a lived-in attic, a paper family, and 3D for (almost) everyone

**Date:** 2026-09-27
**Status:** approved in conversation, pending written-spec review
**Builds on:** `docs/superpowers/specs/2026-09-26-invitation-redesign-design.md` (the pop-up book redesign, now on `main`) and `docs/requirements.md` (the source of truth for what ships)
**Timing:** the links are held until this ships ("before sending").

## 1. Why

The host prefers the 3D book to the flat room ("plain"), and wants the 3D to carry more of the invitation. What they saw as "Sunday's 3D background differs from Saturday's" came from two things:

- **The flat room.** Saturday and Sunday draw the same 3D book. One tab fell back to the flat room, because the machine was heavily loaded (the 6 s load limit) or the window was shorter than 640 px.
- **The gray start.** The early pages look like gray pencil (boceto), and the book only turns warm and golden near the family door.

The family portrait at the door (four solid blob silhouettes in a pink arch) does not match the scratchy-ink cat style.

## 2. Decisions (from the host)

| Topic | Decision |
| --- | --- |
| Goals | All four: a 3D look per day, 3D more often, a 3D-looking fallback, richer attic details. And the family is reimagined as 3D. |
| Timing | Before sending: the links wait for this. |
| Per-day look | **Two moods, one attic.** Saturday is a moonlit night. Sunday is a golden dusk. Claro and Oscuro give each a lighter and a darker version. |
| Family | **Paper pop-up figures:** faceless, drawn in the cats' scratchy ink line. They fold up from the page and walk into the lit doorway once. |
| How to get more 3D | **Approach A, three levels:** the full book, cards over the live 3D attic, and the paper diorama. |
| The gray start | Removed. The attic, sky and mood are lit and colored from the first moment. Only the book's pop-up pieces and the cats keep the boceto → tinta → luz progression. |

## 3. The two moods

The mood comes from the invite link: Saturday (`?e=n4vk`) or Sunday (`?e=q8lm`). The theme (Claro or Oscuro) picks its lighter or darker version, so there are four looks. The mood never depends on the clock; after the party it stays the same.

| | Claro | Oscuro |
| --- | --- | --- |
| **Saturday: Noche de luna** | Blue hour: a deep blue sky with a rising moon; the attic reads clearly. | Full night: a big moon with a halo, twinkling stars, and cool moonlight tinted toward Misha's blue. |
| **Sunday: Atardecer dorado** | Golden afternoon: a warm sun in the window, and candle-gold light on the floor. | Late dusk: the sun on the horizon, a sky going candle → rose → plum, the lanterns lit, and fireflies out. |

Each look defines:
- the sky (a gradient behind the round window);
- the moon or sun and its halo;
- the key light color and intensity;
- the ambient sky and ground colors;
- the fog color;
- the wood, floor and beam tints;
- the dust or firefly color.

These values extend today's `WorldLook` in `tuning.ts`. `tuning.world.night` and `tuning.world.day` become the four looks: `saturday.dark`, `saturday.light`, `sunday.dark`, `sunday.light`.

Colors are mixes of the six palette tokens and the seven feeling colors, written in the existing `ColorMix` form. A new hex value is allowed only in `tuning.ts`, with a comment saying why.

**Signature props per mood:**
- **Saturday:**
  - a star-and-crescent mobile turning slowly over the crib;
  - a paper star garland along the rafters;
  - a soft moonbeam from the round window: an additive, transparent, unlit plane;
  - stars outside the window that twinkle.
- **Sunday:**
  - a string of paper lanterns along the rafters, swaying gently, with emissive glow;
  - fireflies drifting in the air;
  - a golden light beam from the window.

**Motion rule:** at most one or two ambient motions are visible at once: the mobile or the lanterns, plus the dust or fireflies. The family's walk-in is the one orchestrated moment.

## 4. Lit from the start

- The attic's lighting follows the mood only. The stage no longer dims it: ambient and key light stay at the mood's values on every page.
- The boceto → tinta → luz progression (design §1 of the redesign) applies only to the book's pop-up pieces and paper, and to the cats: gray pencil, then ink, then full color and glow.
- The candles still light up in luz. The single shadow-casting light stays the candle light it is today.
- The flat room's `data-era` stage styling is unchanged, but the room's background becomes the paper diorama (§7).

## 5. A lived-in attic

These props are shared by both moods, in the pink-noir paper style: flat-shaded shapes with ink edges and slightly crooked proportions.

- **A crib** near the back wall, under the round window. It is the centerpiece, since this is a baby shower. The mood's mobile hangs over it.
- **A bookshelf** on a knee wall, its books drawn as one instanced group with per-instance color from the palette.
- **A yarn basket** with yarn balls, instanced.
- **A rocking chair** and **two or three stacked old trunks**.
- **A crooked Burton floor lamp**, unlit in the dark looks and softly lit in the light looks. It glows by its own color only.
- **A cat bed** and **a scratching post**.
- **Curtains** at the round window.

Out: cobwebs, graves, anything sad. Bows stay light, as the redesign's style rules require.

**Placement:**
- No prop stands between the camera and a page at any station, or during a glide between stations.
- Props stay outside the camera's corridor along the path.
- Pages and the HUD are never covered.
- In the full book, props sit around the book's edges and along the walls. Behind the cards (§7) they frame the view.

## 6. The family as paper pop-ups

**The drawing** is shared by every level:
- four faceless figures, told apart by height and hair, in the cats' scratchy double ink outline:
  - dad: tallest, with a fuller afro;
  - mom: straight hair;
  - Miguelito: shorter, curly;
  - Mia: smallest, curly;
- no faces, no clothes detail, no interior lines except the hair outline;
- each figure is two or three paper layers (body, hair, a rim of backlight) with a thin paper edge;
- the drawings are SVG paths in one module, used both as the 3D cutouts' texture source and as the CSS version.

**In the full book (WebGL):**
- The figures are thin paper cutouts: textured planes with alpha, with a slight thickness at the edge. They stand in the 3D doorway at the Familia station, backlit by the door's glow.
- When the Familia page first stands up on a visit, the figures fold up from the page like the pop-up pieces, using the existing pop-up spring. They then walk once into the doorway, one after another, and rest.
- After `Cuento completo` the door glows brighter, as today.
- The Familia card keeps its line (`Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`) and the two cats. Its flat SVG door is replaced by the 3D doorway and figures, framed above the card.
- Tapping the door frame still starts Misha's scratch.

**Behind the cards and in the paper diorama (CSS 3D):**
- The card's door shows the same figures as layered CSS 3D paper: layers at different depths, with perspective. They fold up (`rotateX` from flat to upright) the first time the door is in view, and walk in once.
- With reduced motion they are simply standing: no fold, no walk.
- The door-frame tap is unchanged.

**Misha and Kira** stay as the cats they are, beside the family, with their loops.

## 7. Three levels

| Level | When | What the guest sees |
| --- | --- | --- |
| **1. Full book** | A day link, motion allowed, WebGL available, the screen at least `minHeightPx` tall, and the World ready within `loadTimeoutMs`. | The 3D pop-up book in the mood's attic, as today, with §3–§6 added. |
| **2. Cards over the live attic** | Motion allowed and WebGL available, but the screen is shorter than `minHeightPx` (short or landscape phones), or the book did not get ready in time, or the book switched away on resize. | The flat room's readable cards and signposts in front of a live 3D attic: mood, props, sky, and no book. |
| **3. Paper diorama** | No WebGL, the WebGL context was lost, reduced motion, or level 2's scene has not arrived yet. | The flat room's cards in front of layered CSS paper cutouts of the mood's attic. |

**Level 2 details:**
- **Layering:** the canvas sits behind the flat room's viewport, with `pointer-events: none` and `aria-hidden`.
- **Camera:**
  - It frames the attic from the front, toward the window and crib.
  - The flat room's horizontal camera position (0 to 1) drives a small sideways drift and yaw, so the attic moves with parallax as the guest pans.
  - Vertical panning does not move it.
- **Rendering:**
  - It renders at a lower pixel ratio (`backdropMaxDpr`, starting at 1.25).
  - It draws while the flat camera moves and while ambient props animate, capped at the display rate.
  - It pauses when the tab is hidden or when a full-screen dialog (the battle, Tus gatos) covers it.
- **Readability:** the cards stay opaque paper, and no text is drawn over the 3D.
- **Arrival:** when the scene becomes ready, the canvas fades in over `backdropFadeMs` (about 600 ms) and the paper diorama under it stops animating. Nothing on the cards moves or re-lays out.

**Transitions:**
- **Load timeout:** the flat room opens on the aimed page (as today) over the paper diorama. The World chunk keeps loading; when it arrives, level 2 fades in behind the cards. The guest stays in the flat room for the rest of the visit.
- **Short screen at start:** level 2 directly. The World is preloaded at page start for these guests too (`shouldPreloadWorld` covers level 2).
- **Resize below `minHeightPx` during the book:** the flat room opens on the current page, then level 2.
- **Context loss at level 1 or 2:** level 3 on the current page, with no retry for the rest of the visit.
- **An error starting or running the 3D** (renderer creation, `WorldBoundary`, or a failed chunk): level 3 on the current page, with no retry.
- **Reduced motion:** level 3, static: no parallax, no canvas. This keeps the host's rule that reduced motion means the same room without depth motion.

**Level 3 details:** CSS layers (back wall with the round window and that mood's moon or sun, rafters, shelf and crib silhouettes, the lantern string or star garland, floor) move at different rates with the flat camera's horizontal position. Its colors follow the mood and theme through CSS variables generated from `tuning.ts`. It is pure DOM and SVG, with no canvas.

## 8. Performance

Targets on a mid-range phone:
- **Draw calls:** at most 100 per frame in the full book (today it is about 47 at rest in luz) and at most 60 at level 2. Measure with `renderer.info.render.calls` in a dev-only readout.
- **Instancing and merging:**
  - Repeated items are instanced: books, yarn balls, stars, fireflies, lanterns and garland pieces.
  - Static props that share a material are merged into one geometry per material.
  - Materials are shared, and background props use unlit or Lambert materials.
- **Lights:**
  - Still at most one shadow-casting light, the candle light. Props do not cast real shadows. Soft painted contact shadows (radial-gradient decals) sit under the crib, chair and trunks.
  - Lanterns, fireflies, stars, the lamp and the moonbeam glow by emissive or unlit color only. There are no new lights and no post-processing.
- **Animation:**
  - Every ambient animation runs in `useFrame` by mutating refs or instance matrices, scaled by frame delta, with no React state.
  - Temp vectors and matrices are allocated once.
- **Textures:**
  - Procedural canvas textures stay at 512 px or less, and 1024 px or less for the family sheet.
  - Everything created is disposed on unmount.
- **Device tiers:**
  - A pure `deviceTier()` reads `hardwareConcurrency` and `deviceMemory` and returns `low` or `normal`.
  - `low` means:
    - no real shadow map;
    - pixel ratio capped at 1.25 in the book and 1.0 at level 2;
    - about half the fireflies and stars;
    - ambient prop motion slowed.
- **Pausing:** the full book and level 2 stop drawing while the tab is hidden or a full-screen dialog is open.
- **Bundle:** the new code lives in the World chunk (lazy), except the paper diorama and the CSS family, which are small DOM components. The entry chunk must not import three.

## 9. Always on (unchanged rules)

- **Facts are never gated.** Every fact is readable at every level: address and map, date and time, Confirmar, the QR and Guardar QR, the family line.
- **Contrast:** text meets AA contrast, and cards and HUD chips stay opaque over any background.
- **Copy:** every string comes from `content.ts`, and this work adds no new guest-facing copy.
- **Numbers and colors:** every number and color comes from `tuning.ts`.
- **Storage:** storage keys are unchanged. There is no analytics.
- **Input:** pinch zoom works, and focusing a control brings it into view.
- **Gameplay:** nobody loses, and the battle, cards, quest log and gate are unchanged.
- **The gate** (no code) is unchanged.

## 10. Testing and verification

**Unit tests** (pure logic, TDD):
- `moodFor(day, theme)` returns the right look for all four combinations.
- `roomLevel(env)` returns book, backdrop or diorama for each condition in §7: reduced motion, no WebGL, short screen, timeout, context loss, and the backdrop not ready yet.
- `deviceTier(nav)` returns `low` or `normal` at its thresholds.
- The prop factories are pure. Per mood and tier, their mesh, instanced-mesh and material counts stay within the draw-call budget.
- The family drawing module exports four figures with no face elements.

**Component tests:**
- The flat room renders the paper diorama with the mood's classes.
- Level 2 fades in without moving the cards.
- Context loss leads to level 3 on the same page.
- The CSS family folds up once, and not with reduced motion.
- The door-frame tap still starts Misha's scratch.

**Screenshots** in the running app:
- Both days × Claro/Oscuro at 390×844 (book).
- 390×600 and 844×390 (level 2).
- Reduced motion (level 3).
- 1440×900 and 1920×1080.
- The Familia page in each level.

**Throttled check:**
- Fast 3G with 4× CPU slowdown: the cover is readable in under 2 s.
- The flat room with the diorama appears at the timeout, and level 2 fades in when the World arrives.
- There are no failed requests.

**Final checks:** the suite, lint, type check and build are clean, and the World chunk stays separate.

## 11. Documentation

- **`docs/requirements.md`:**
  - the moods (a new section);
  - the three levels, replacing today's "book or flat room" rules;
  - the lived-in attic;
  - the paper family, in the family door section and US-12;
  - "lit from the start";
  - the new tuning values in §16.
- **`README.md`:** features and the project map.
- **`docs/publishing.md` §5:** check both moods in both themes, level 2 on a landscape phone, level 3 with reduced motion, and the family fold-up.

## 12. Out of scope

- New copy, new gameplay, or changes to the gate.
- Audio.
- A new OG image.
- Post-processing (bloom, outlines).
- WebGPU.
