# The real gift QR, the family's cats, clearer controls, music, and dad's guitar

**Date:** 2026-09-28
**Status:** approved in conversation, pending written-spec review
**Builds on:**
- `docs/superpowers/specs/2026-09-27-richer-3d-design.md` (now on `main`)
- `docs/requirements.md` (the source of truth for what ships)

**Timing:** the invitation links are held until this ships.

## 1. Decisions (from the host)

| # | Topic | Decision |
| --- | --- | --- |
| 1 | QR | Use the real Banco Ganadero QR. Decode it and redraw the same code in the invitation's style for the screen. The downloaded image is a plain black-on-white version. |
| 2 | Cats | Rename five cats, add three new Poco común cats, 10 in total. Misha and Kira are redrawn to look like the real cats (reference `ideas/kira-y-misha.jpg`, never committed). The renamed cats are redrawn as their family: Misha variants and a Kira variant. |
| 3 | Controls | Icons instead of the words Claro and Oscuro. A clearer icon for Tus gatos. |
| 4 | Music | The host's track (`ideas/soundgrand.mp3`) becomes the ambience. |
| 5 | Family line | "La familia se hace más grande, y nos encantaría que nos acompañes." |
| 6 | Download | The QR is downloadable for any bank app. A cat invites the tap. |
| 7 | Gift text | One text replaces both current lines. |
| 8 | Gate game | It must feel smooth. |
| 9 | Guitar | Dad's B.C. Rich Mockingbird Contour in gold top, in 3D, leaning in the corner by the family door on both days. |

## 2. The gift QR

**Source.** `ideas/QR-code-cutoff.png` and `ideas/QR-code.jpg` decode to the same payload: a version-13 QR holding 369 characters of base64-like text. The payload contains no readable name or account number. The printed card around the QR in `QR-code.jpg` does show the account holder's name and account number, so that image and its text are never used and never enter the repo. Only the payload does. `ideas/` stays out of git.

**Payload.**
- The payload is stored verbatim in `src/content.ts` as a fact, next to the address and the WhatsApp number.
- It is decoded locally, with no online service.
- The decode tool is a dev dependency (`jsqr`), used only in tests.

**Encoder.**
- A small, zero-dependency, MIT-licensed QR encoder (`qrcode-generator`) builds the module matrix from the payload at runtime, in the entry chunk.
- The same payload yields two matrices:
  - **On screen:** error correction H, with a small cat emblem in the centre where the bank's `$` was. The emblem covers at most 10% of the code's area.
  - **Download:** error correction M, the same level as the bank's version 13, with no emblem.

**On screen.**
- The code is drawn as SVG inside the gift box, in the palette: ink modules on bone paper, rounded modules, and rounded finder eyes, with a quiet zone of at least 4 modules.
- The finder patterns stay dark on light, for scanning.
- The QR plate keeps its current size rules (`tuning.qr.minPx`, and the 3D book's `bookQrPx`).

**Download.**
- `Guardar QR` produces a PNG rendered on a canvas at 1024 px: black modules on white, a 4-module quiet zone, file name `qr-regalo-mia.png`.
- It uses the current rule: share the file where the browser can share files, otherwise download it.
- The `QR guardado` badge still counts.

**The cat button.**
- `Guardar QR` becomes a cat button: a small drawn cat face with a download arrow, next to the text `Guardar QR`.
- Under it is a hint line, `Toca el gatito para guardar el QR en tu celular.`
- Delilah (see §3) still perches on the gift box.

**Proof.** Tests rasterize both matrices to pixel buffers and decode them with `jsqr`. For the on-screen matrix, the emblem's modules are forced light first. Each decode must equal the stored payload exactly. The host must still test-scan the page and the downloaded image with the Banco Ganadero app before sending the links; that step goes on the pre-send checklist.

**Replaced.** The `src/assets/qr.png` host-file path and the "El QR estará aquí pronto." state are no longer needed. The QR now comes from the payload. If the payload were empty, the pending line would still show.

**Expiry.** The bank QR expires on 27 September 2027. Record this in the docs.

## 3. The cats

Internal IDs stay the same for the renamed cats, so returning guests keep their `mia-cats` collection and the gate game keeps its catcher. The three new cats get new IDs: `chona`, `chori` and `minina`.

| ID | Name | Rarity | Look (redrawn in the cats' style) | Page (party current → over) | Loop |
| --- | --- | --- | --- | --- | --- |
| `luz` | **Mishona** | Común | Misha's white-and-silver coat and build, with a small bow, lashes, and a swishy tail. The flirty Misha. | Cuándo and the gate → Cuándo | Today's Luz loop: bats the countdown, chases the heart, pounces. Still the gate-game catcher. |
| `mimo` | **Choni** | Común | Cuddly Misha, curled up with a little heart, in Misha's white-and-silver coat. Mimo's blush coat is gone. | Palabra and the gate → Palabra | Today's Mimo loop: sleeps on a card corner, slow blink. |
| `susto` | **Chavela** | Poco común | Keeps Susto's shy, peeking look, with a black coat. | Confirmar and the gate → Llegada | Today's Susto loop. |
| `bram` | **Kiri kiri** | Poco común | Playful Kira: Kira's tabby coat, white paws and amber-green eyes, with a guitar pick. | Cuándo → Cuándo | Today's Bram loop: scratches the countdown, throws the pick. |
| `nana` | **Delilah** | Poco común | A curious black cat, nose forward, as the real Delilah was. | Presente, on the gift box → Palabra | Today's Nana loop: sits on the QR frame, sniffs it. |
| `chona` | **Chona** (new) | Poco común | Energetic Misha, mid-leap, in Misha's white-and-silver coat. | Llegada → Llegada | Races in a short arc, skids, looks back. |
| `chori` | **Chori** (new) | Poco común | Round, chubby Misha, sprawled belly-up, in Misha's white-and-silver coat. | Dónde, on the treasure map → Palabra | Rolls over slowly, paws in the air. |
| `minina` | **Minina** (new) | Poco común | A small, pure-white playful cat with a pink nose. Pure white with no patches, so she reads apart from the Misha family. | Confirmar, batting the wax seal → Llegada | Bats at the seal's ribbon, pounces. |
| `misha` | Misha | Legendario | Redrawn as the real Misha: white with silver-gray patches (a gray cap over the ears and crown, gray patches on the back and flank), a pink nose, green eyes, short fur. | Familia | Unchanged. |
| `kira` | Kira | Legendario | Redrawn as the real Kira: a long-furred brown-gray tabby with tiger stripes, a white chin, chest and paws, amber-green eyes, and a fuller ruff. | Familia | Unchanged. |

- **Rarity mix:** 2 Común, 6 Poco común, 2 Legendario.
- **Unchanged:** the battle, still only for Misha and Kira; the card reveal; and rarity visibility.
- **Counts:** the quest log counts `Gatos {n}/10`, and so does Tus gatos. Every count and total comes from the cats list, not a literal 7.
- **Noticing:** each new cat has a noticing rule in the same family as today's. Chona needs a little patience, Chori comes if you wait, and Minina notices you after a short stay on Confirmar. A tap on the empty space near the seal stays Chavela's startle, and nothing ever fires from the confirm link itself. Each rule is tuned in `tuning.ts`.
- **Feeling colors:** the new cats get distinct colors in `tuning.ts`, judged in screenshots. A new hex value is allowed there with a comment. The renamed cats keep their current feeling colors.
- **The gate:** it keeps three cats, `luz`, `mimo` and `susto`, which are now Mishona, Choni and Chavela.

**Coats.** The cats keep one hand-drawn style: the scratchy double ink outline, big slightly mismatched eyes, spindly legs, spiral tails, and a few stitch marks. The old rule that every body is ink-black, with Mimo the one exception, is replaced by coats per cat:

- **Misha family:** Misha, Mishona, Choni, Chona and Chori. White with silver-gray patches; each variant shifts the patches a little and adds its trait.
- **Kira family:** Kira and Kiri kiri. Brown-gray tabby with tiger stripes and white paws.
- **Black:** Delilah and Chavela.
- **Pure white:** Minina.

White and light coats must still read on the bone paper cards and in both themes. The ink outline and a soft shade give them their edge. Judge this in screenshots.

**Preview image.** Regenerate `public/og-image.jpg` with the new coats: 1200×630, JPEG under 300 KB, no date or place, the `og:` tags unchanged.

**Card lines** (Spanish; the host may edit them at spec review):

| Name | Feeling | Line |
| --- | --- | --- |
| Mishona | Coquetería | Se arregla los bigotes antes de saludarte. |
| Choni | Cariño | Se acurruca a tu lado y ronronea bajito. |
| Chavela | Temor | Se asoma cuando el mundo está en calma. |
| Kiri kiri | Juego | Tira la púa, la persigue y vuelve por más. |
| Delilah | Curiosidad | Todo lo huele primero, hasta el QR. |
| Chona | Energía | Llega corriendo y no se queda quieta. |
| Chori | Apapacho | Redondita, tranquila y siempre con hambre. |
| Minina | Travesura | Pequeñita, blanca y lista para jugar. |
| Misha | Calma | Está en calma, y está en casa. (unchanged) |
| Kira | Asombro | Mira la puerta, y se queda cerca. (unchanged) |

## 4. Controls, music, and copy

**Theme control.** A sun icon for Claro and a moon icon for Oscuro, drawn in the ink style.
- It keeps the same toggle behavior and `aria-pressed`.
- The accessible names stay `Claro` and `Oscuro`, as visually hidden text.
- Touch targets are at least 44 px.

**Tus gatos.** A cat-head icon with a small badge `n/10`, meaning cats met out of the total.
- The accessible name stays `Tus gatos`, and the count is announced with it.
- The dialog it opens is unchanged.

**Music.** Copy `ideas/soundgrand.mp3` to `src/assets/audio/ambience.mp3`, where the app already looks.
- It is 2 min 23 s at 256 kbps, 4.6 MB. `preload="none"` means only guests who turn music on download it.
- It still loops, and the music control appears.

**Copy changes** in `src/content.ts`:
- `doorLine`: `La familia se hace más grande, y nos encantaría que nos acompañes.`
- The gift page's two lines are replaced by one: `El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.`
- New: `Toca el gatito para guardar el QR en tu celular.`
- The cat names, feelings and lines above.

## 5. A smooth gate game

Today the game re-renders React on every frame, for the HUD and the drops. The fix:
- Drops and the catcher move by writing transforms directly in the animation loop, through refs.
- React state changes only on score, lives, phase and best-score events.
- The seeded game logic (`src/logic/gateGame.ts`) and its rules are unchanged.

Target: a steady 60 fps on a mid-range phone, measured with frame times in Playwright before and after.

## 6. Dad's guitar

A 3D B.C. Rich Mockingbird Contour in gold top, built from the reference photo (`ideas/guitar.jpeg`, never committed).

**Shape.**
- The Mockingbird's hooked, asymmetric body outline is extruded thin, with a gold top and darker sides.
- A dark rosewood neck and fretboard carry bone inlays.
- A 3+3 headstock has small tuner pegs.
- Two black humbuckers have gold bezels, plus a bridge and knobs.
- It has ink edges, like the other props.

**Placement.**
- It leans in the corner by the Familia door, on both days and in every look, including level 2's live attic.
- It sits in the warm light and never covers a page or the HUD: the placement test covers it at every station and glide, before and after the party.

**Budget.**
- It is merged by material, with at most three new materials, and counts in the draw-call budget test.
- It is part of the deferred detail, so it compiles after the first frame.

## 7. Documentation

- **`docs/requirements.md`:**
  - the cats table, the rarity mix and the counts;
  - §6 copy (the family line, the gift text, the hint);
  - the QR section: payload, two renderings, download, expiry;
  - the icons;
  - the music;
  - the guitar in the attic;
  - US-12's family line.
- **`README.md`:** features.
- **`docs/publishing.md`:**
  - drop "add `src/assets/qr.png`";
  - add a pre-send check: scan the page's QR and the downloaded `qr-regalo-mia.png` with the Banco Ganadero app and confirm it opens the transfer to the right account;
  - add checks for the ten cats, the icons, and the music.

## 8. Testing

**QR:**
- Both matrices decode back to the exact payload (the emblem area is forced light for the screen one).
- The SVG has no emblem over the finder patterns.
- The PNG download path and share path still work.

**Cats:**
- 10 cats, with the rarity mix above.
- Every cat has art, a line, a page, and a noticing rule.
- A `mia-cats` value saved with the old IDs still loads.
- The quest log and Tus gatos show `/10`.
- The post-party perches hold all 10 cats on the four remaining pages.
- The faceless family rules are unchanged.

**Controls:** the icons render with their accessible names, and the badge counts cats met.

**Copy:** each new string is verbatim from this spec.

**Gate game:**
- The frame loop does not re-render React per frame, checked with a render counter across ticks.
- The existing game tests stay green.

**Guitar:** the placement and budget tests include it.

**Screenshots** of the gift page (screen QR and cat button) and of all ten cats' cards and loops, at 390×844 in both themes, with the guitar at Familia on both days; a gate-game frame-time check; and the full suite, lint, type check, build and chunk check.

## 9. Out of scope

- Changes to the battle.
- New pages.
- New sounds.
- A redesign of the human family.
- Compressing the music file.
