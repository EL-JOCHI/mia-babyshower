# Redesign: a moonlit pop-up book

**Date:** 2026-09-26
**Status:** Design approved in conversation. This document is for host review.
**Changes:** `docs/requirements.md`. Once this document is approved, the plan updates the requirements to match. Everything not listed here stays as the requirements say.

## Why

The hosts reviewed the first build. The facts were all present, but the look, the cats, the gate, the motion, and the missing 3D felt flat and unengaging. The redesign keeps every fact, rule, and link, and changes how they are experienced: a 3D storybook, hand-drawn cats, and game feel in every action.

## Decisions taken with the hosts

| Topic | Decision |
| --- | --- |
| 3D | A 3D world with hand-drawn paper cats. The whole invitation is a Three.js diorama. |
| Palette | Burton pink noir. |
| Legendary encounter | A playful battle with HP bars and moves, including lines like «¡Misha se ha dormido!» and «¡Kira se ha echado al suelo!». Nobody can lose. |
| Gate | A 30-second arcade mini-game instead of the looping count. |
| Facts | Pop-up story pages and themed objects, **plus** full achievements: XP, levels, and badges. |
| Cats | Original art in a Don't Starve / Tim Burton / Inside Out spirit. No suitable free set exists (see [Research](#research)). |

---

## 1. Concept

The invitation is a **pop-up storybook in a cat's attic at night**. The guest travels through the book. Each fact pops up out of the page when the guest reaches it. Cats wander the pages. At the end, the family walks in through a lit door.

**Evolution.** The book starts as a **pencil sketch** (boceto), becomes **ink** (tinta), and ends in **light** (luz). As the guest travels:

- the paper pieces unfold from flat to standing,
- line art gains ink and then color,
- lighting grows from cold moonlight to warm candlelight near the door.

These three stages replace pixel → color → 3D.

## 2. Architecture

**Hybrid 3D.** This is option C from the conversation.

- **World (WebGL).** React Three Fiber draws the attic, the book, the pop-up paper pieces, moonlight and candles, fog, drifting dust, and particles.
- **Content (HTML in the world).** Every card, cat, button, and piece of text is real HTML, placed in 3D with `@react-three/drei` `Html` (`transform`). Text stays sharp, screen readers and keyboards reach everything, and the existing tests keep working against the DOM.
- **New dependency:** `@react-three/drei` 10.7.8. Its peers were checked: React 19, Fiber 9, `three >= 0.159`.
- **Camera path.** The camera follows a smooth curve through the book (a Catmull-Rom spline over one point per station). Progress along the path runs from `0` to `1`.
  - Drag (left/right *or* up/down), the wheel, and the arrow keys move progress.
  - Signposts glide to a station.
  - Keyboard focus brings the focused control's station into view.
  - A small pointer tilt adds depth. It is off with reduced motion.
- **Stages** (boceto / tinta / luz) follow progress, using the existing tunable thresholds.
- **Flat fallback.** With `prefers-reduced-motion: reduce`, or when WebGL cannot start, the guest gets the flat room from the first build, restyled in the new look. Everything is reachable, nothing moves on its own, and there is no canvas.
- **Loading.** The first paint is the book cover in HTML: title and hero line, readable at once. The 3D world streams in behind it. Target: first view under 2 s on a mid-range phone over 4G. The Three.js code stays in its own chunk.

## 3. Look

### Palette: Burton pink noir

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#140E14` | Night, outlines, dark field |
| Bone | `#F1E7D6` | Parchment cards; text on dark |
| Rose | `#E08AAB` | Main accent, glows, hearts, buttons |
| Deep rose | `#BB3267` | Rose *text* in the light theme |
| Plum | `#3C1F3D` | Shadows, fog, depth |
| Candle | `#F2B84B` | Light sources, legendary gold |

Checked contrast:

| Pair | Ratio |
| --- | --- |
| Bone on ink | 15.6:1 |
| Rose on ink | 7.6:1 |
| Ink on rose (buttons) | 7.6:1 |
| Candle on ink | 10.6:1 |
| Bone on plum | 11.8:1 |
| Ink on bone (light theme) | 15.6:1 |
| Deep rose on bone (light theme) | 4.55:1 |

Rose is never used as text on bone.

- **Oscuro** is the moonlit attic.
- **Claro** is the same book by day: bone parchment, ink lines, deep rose accents.

### Feeling colors (Inside Out touch, original art only)

| Cat | Feeling | Color | On ink |
| --- | --- | --- | --- |
| Luz | Alegría | Sunny gold `#F5C542` | 11.7:1 |
| Mimo | Ternura | Rose `#F28DB2` | 8.4:1 |
| Susto | Temor | Violet `#A98BEA` | 6.9:1 |
| Bram | Ímpetu | Ember `#F2784B` | 6.9:1 |
| Nana | Delicadeza | Mint `#7FD9B0` | 11.3:1 |
| Misha | Calma | Moon blue `#8EB8F0` | 9.3:1 |
| Kira | Asombro | Star teal `#5FD4D0` | 10.7:1 |

Each cat's feeling color shows in its eyes, glow, collar charm, collectible card, and battle screen.

### Texture

- Paper grain on every surface.
- Hand-drawn wobbly borders on cards, from an SVG displacement filter.
- A faint vignette.
- No flat rounded "SaaS cards". Cards are torn, folded, or pinned paper.

### Type

All three faces are open-licensed, self-hosted, and cover every Spanish character.

- **Mystery Quest** for titles and page names: whimsical, spooky storybook lettering.
- **Alegreya** for all reading text: the verse, the date, the address, the cat lines, buttons.
- **Pixelify Sans** only on game screens: battle boxes, scores, XP, the gate game. It nods to Pokémon Red.
- Press Start 2P and Source Sans 3 are removed.
- Scale: 16 px minimum body, 1.5 line height, titles 32–56 px depending on the screen.

## 4. Cats

### Art

Seven original drawings in one family style, as SVG, drawn for this site:

- scratchy double ink outlines,
- big, slightly mismatched eyes,
- spindly legs and spiral tails,
- a few stitch marks,
- ink-black bodies, with Mimo's blush body kept.

Each cat keeps the silhouette cue from the requirements:

| Cat | Cue |
| --- | --- |
| Luz | Round head, high tail |
| Mimo | Low and round |
| Susto | Small, ears back |
| Bram | Stocky, lightning tail tip, a guitar pick |
| Nana | Upright, crown-shaped ears |
| Misha | Long, calm |
| Kira | Slim, tall |

### Line boil

The outlines jitter a few times a second, like hand-drawn animation. This is Don't Starve's signature, done with an animated SVG turbulence filter. It is off with reduced motion.

### Rig and motion

- Each cat is split into parts: body, head, ears, eyes (with blinking lids), and tail.
- Parts move on springs: breathing, blinking, ear twitches, a tail sway with follow-through, a head turn toward the camera when noticing.
- Behaviors:

| Cat | Behavior |
| --- | --- |
| Luz | Pounces and chases |
| Mimo | Curls up and slow-blinks |
| Susto | Hides and peeks |
| Bram | Struts, flops, flicks the pick |
| Nana | Grooms on her throne |
| Misha and Kira | Glow by the door |

- Cats walk short routes on their page with squash-and-stretch and a soft shadow on the paper.
- The rules for noticing, rarity waits, and acts stay as in the requirements.

## 5. The pages (facts)

Each fact is a pop-up page with its own object. Arriving at a page unfolds it, with a paper "fwip" motion and a stamp: **¡Página encontrada!**

| Page | Object |
| --- | --- |
| Llegada (cover) | The book cover. The title in Mystery Quest, the hero line, and `Muévete para explorar`. The cover opens on the first move. |
| Palabra | An illuminated manuscript page, with a candle flickering beside the verse. |
| Cuándo | A melting candle and an hourglass. The countdown digits are flip cards. The date and `16:00` are pinned to the page. |
| Dónde | A treasure map unrolls, a pin drops on the spot, and `Ver en el mapa` appears. |
| Confirmar | The invitation letter. Tapping `Confirmar por WhatsApp` presses a wax seal, then opens WhatsApp. |
| Presente | A gift box. Its ribbon unties and the lid lifts to reveal the QR plate. `Guardar QR` sits below. |
| Familia | The lit door, the family's entrance, and Misha and Kira. Finding every page lights the door brighter. |

Facts are never locked. Every page is reachable at any time: by moving, by signpost, or by keyboard.

## 6. Game layer

### Quest log (always on screen, compact)

- `Páginas {n}/{total}`: `total` is 6 while the party is current, 3 after it (Palabra, Cuándo, Familia).
- `Gatos {n}/7`.
- An XP bar with `Nivel {n}` and a level title.

### Levels

| XP from | Level | Title |
| --- | --- | --- |
| 0 | 1 | Visitante curioso |
| 60 | 2 | Amigo de los gatos |
| 180 | 3 | Guardián del cuento |
| 360 | 4 | Invitado de honor |
| 600 | 5 | Leyenda de la casa |

### Badges (each earned once, shown as a toast)

| Badge | When | XP |
| --- | --- | --- |
| Abriste el cuento | First move from the cover | 10 |
| La palabra | Reaching Palabra | 20 |
| Guardaste la fecha | Reaching Cuándo | 30 |
| Encontraste el lugar | Reaching Dónde | 30 |
| Invitación sellada | Tapping `Confirmar por WhatsApp` | 50 |
| Encontraste el regalo | Reaching Presente | 20 |
| QR guardado | Tapping `Guardar QR` | 20 |
| Llegaste a la puerta | Reaching Familia | 30 |
| Tu primer gato | First greeting | 20 |
| Cuento completo | Every page found | 100 |
| Todos los gatos | All seven cats met | 150 |

Each cat met also gives XP: Común 20, Poco común 40, Legendario 100.

- XP and levels are deterministic. There are no streaks and nothing random.
- Stored per browser. `Jugar otra vez` (after the party) resets the cat round only, not XP or badges.

### Collectible card (every greeting)

- A card flips in with the cat's art, its feeling color, its line, and the rarity shown big:
  - Común: silver shimmer.
  - Poco común: rose burst.
  - Legendario: gold with stars. This comes at the end of the battle.
- The celebration is visual. No sound.

## 7. Legendary battle (Misha and Kira)

**Trigger.** When Misha or Kira notices the guest, their `Saludar` becomes `¡A jugar!`. Activating it starts the battle.

**Flow.**

1. A battle-screen spiral wipe.
2. Intro line and a gold name plate: `★★★ Legendario`.
3. **Bars:** the cat's `Energía de juego` starts full. The guest's `Paciencia` starts full.
4. **Turns.** The guest picks a move. The cat answers with one of its moves. Messages type out in the battle box.
5. **Win.** When the cat's energy reaches zero, its finisher line plays, then a gold capture celebration and the legendary card. The cat is added to Tus gatos exactly as a normal greeting.
6. **Huir.** Returns to the room. The cat stays at the door and can be challenged again. Nothing is saved.

**Nobody loses.** The guest's `Paciencia` never goes below 1. When it would, the cat head-bumps the guest and restores some. The battle always ends in the cat joining or the guest leaving.

**Numbers** (tunable):

- The cat has 100 energy.
- Lanzar ovillo: −35.
- Mimos: −25.
- Ronroneo: −20, and raises the next move's effect.
- The cat's moves come in a fixed order, not at random. Each lowers the guest's paciencia by 10–20.
- A battle lasts 3–5 turns.

**Accessibility.**

- The battle is a dialog; focus moves into it.
- Moves are buttons. Messages go to a live region.
- Escape is the same as Huir.
- With reduced motion there is no wipe; the screen simply appears.

## 8. Gate game

- **Keeps:** both gate sentences stay visible the whole time. Nothing about the party shows. There is no way into a party.
- **Start:** `Toca para jugar`.
- **Play (30 s):**
  - Yarn balls and hearts fall.
  - The guest moves Luz left and right (drag, touch, or arrow keys) to catch them.
  - Yarn is 10 points, hearts 20.
  - Each catch in a row raises the combo multiplier, up to ×5.
  - A miss resets the combo. There is no losing, only the timer.
- Mimo cheers on big combos. Susto startles when something drops.
- **End:** `¡Se acabó el tiempo!`, the score, `Tu mejor puntaje: {n}` (or `¡Nuevo récord!`), and `Jugar otra vez`.
- **Reduced motion:** no falling objects. The gate shows the sentences and the still cats, which can still be greeted.
- The gate cats (Luz, Mimo, Susto) can still be met there.

## 9. Large screens

- The camera's field of view and framing adapt to the aspect ratio, so wide screens show more of the book instead of stretching.
- Cards and HUD have maximum sizes and scale with the viewport between 390 px and 2560 px.
- Checked by screenshot at 390, 768, 1440, 1920, and 2560 px.

## 10. What stays exactly as it is

- The links and codes.
- The dates, `16:00`, the countdown instants, and the midnight cutoff with its after-party mode (post-party lines, `Jugar otra vez`).
- The WhatsApp link and message, the map link, the QR behavior, and `Guardar QR`.
- Theme choice (Oscuro and Claro), the first visit following the operating system.
- Accessibility: keyboard, screen reader, pinch zoom, focus into view, AA contrast.
- The facts are never gated. There are no analytics.
- The content module and tuning module pattern. Every new number and color goes in `src/tuning.ts`, every new string in `src/content.ts`.

## 11. Changes to `docs/requirements.md`

- **§1, §3, §5, and BR-18:** a playful battle with Misha and Kira replaces "no battle"; the rule that nobody can lose stays.
- **§3 The guest gate:** the arcade mini-game replaces the count loop.
- **§4 Three eras:** boceto / tinta / luz in a 3D book replaces pixel / color / 3D. The camera moves along a path.
- **§4 reduced motion:** the flat room fallback, with no canvas.
- **§5 Visual identity:** the palette, feeling colors, textures, and typography in this document replace the neon palette and fonts.
- **§6 Copy:** add the strings in [section 13](#13-new-spanish-copy).
- **BR-16:** add two storage keys:
  - `mia-progress`: `{ pages: string[], badges: string[], xp: number }`
  - `mia-gate-best`: a number
- **User stories:**
  - Add US-14 (battle), US-15 (game layer), and US-16 (gate game).
  - Adjust US-7 and US-10.
- **§16:** new tokens, and the release plan updated.

## 12. Testing

- **Pure logic, test-first:**
  - the battle state machine (moves, turns, the floor at 1, win, flee),
  - XP and levels,
  - badges (earned once),
  - the gate game reducer (spawn, catch, combo, timer, best score),
  - the camera path progress mapping.
- **Components:**
  - the quest log, the card reveal, the battle dialog (focus, Escape, live region, lines), and the gate game states;
  - the existing acceptance tests, adapted to the new structure.
- **Visual:** Playwright screenshots at each step, at the widths in section 9, dark and light, and with reduced motion.
- **Performance:**
  - first view under 2 s on a mid-range phone (throttled check),
  - 60 fps target in the world, 30 fps floor, pixel ratio capped at 1.75,
  - no more than one light casting shadows, and shared materials.

## 13. New Spanish copy

For host approval. The existing copy in `docs/requirements.md` §6 stays.

### Pages and the game layer

- Page found: `¡Página encontrada!`
- Quest log: `Páginas {n}/{total}` · `Gatos {n}/7` · `Nivel {n}` · `{xp} XP`
- Level titles: `Visitante curioso` · `Amigo de los gatos` · `Guardián del cuento` · `Invitado de honor` · `Leyenda de la casa`
- Level up: `¡Subiste a nivel {n}!`
- Badges: `Abriste el cuento` · `La palabra` · `Guardaste la fecha` · `Encontraste el lugar` · `Invitación sellada` · `Encontraste el regalo` · `QR guardado` · `Llegaste a la puerta` · `Tu primer gato` · `Cuento completo` · `Todos los gatos`
- Badge XP: `+{xp} XP`

### Battle

- Start button on Misha and Kira: `¡A jugar!`
- Intro: `¡{name} quiere jugar!`
- Bars: `Energía de juego` · `Paciencia` · you: `Tú`
- Prompt: `¿Qué vas a hacer?`
- Moves: `Lanzar ovillo` · `Mimos` · `Ronroneo` · `Huir`
- Your moves:
  - `¡Lanzaste el ovillo! {name} corre tras él.`
  - `Le diste mimos a {name}. ¡Ronronea feliz!`
  - `Imitaste un ronroneo. {name} se relaja…`
  - Strong hit: `¡Es muy efectivo!`
  - Huir: `Te fuiste sin hacer ruido.`
- Misha's moves:
  - `Misha bosteza…`
  - `Misha te mira con calma.`
  - `Misha se estira despacio.`
  - `Misha amasa una cobija.`
- Kira's moves:
  - `Kira persigue su cola.`
  - `Kira hace ojitos.`
  - `Kira mira una estrella fugaz.`
  - `Kira salta hacia la puerta.`
- Effect on you: `Tu paciencia baja un poco.`
- Safety net: `{name} te da un cabezazo cariñoso. ¡Recuperas paciencia!`
- Finishers:
  - `¡Misha se ha dormido!`
  - `¡Kira se ha echado al suelo!`
- Win: the existing `Se quedó contigo: {name}.`, with `Legendario`.

### Gate game

- `Toca para jugar`
- `Puntos {n}` · `Combo ×{n}` · `{s} s`
- `¡Se acabó el tiempo!`
- `Tu mejor puntaje: {n}` · `¡Nuevo récord!`
- `Jugar otra vez`: already in §6.

## 14. Order of work

Each step ends with screenshots for the hosts.

1. Look, type, and textures (tokens, fonts, paper, borders). The flat fallback restyled.
2. The new cats (art, rig, line boil, behaviors).
3. The 3D book: camera path, stations, pop-up pages, boceto → tinta → luz.
4. Card rewards and the legendary battle.
5. Quest log, XP, levels, and badges.
6. The gate game.
7. Large screens, performance, and polish. Update `docs/requirements.md` and the README.

If time runs short before the links go out (2026-09-27 at night), polish continues afterwards. The links never change.

## Research

- **Free cat art.** No consistent set of seven cats in this style is free for a public site.
  - CC0 sources ([FreeSVG](https://freesvg.org/cat), [OpenClipart](https://openclipart.org/detail/214639/black-cat), [Public Domain Vectors](https://publicdomainvectors.org/en/free-cat-vector-image)) have only scattered clip art by different authors.
  - [Freepik](https://www.freepik.com/vectors/handdrawn-cats-tim-burton-style) and [Vecteezy](https://www.vecteezy.com/free-vector/hand-drawn-cat) need attribution and restrict redistributing the files.
  - Hence original art.
- **ui-ux-pro-max:** the closest style match is *Anti-Polish / Raw Aesthetic*: hand-drawn marks, paper texture, jitter.
- **frontend-design:** one memorable element (the pop-up book), distinctive type used as part of the design, and no generic card kits or default palettes.
