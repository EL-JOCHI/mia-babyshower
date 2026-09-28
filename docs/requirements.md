# Mia's Baby Shower — Requirements

**Status:** Draft  
**Created:** 2026-09-23  
**Updated:** 2026-09-27  
**Kind:** Product specification (spec-driven development)  
**Release:** R1 goes live on 2026-09-27. The links go out that night. The parties are on 17 and 18 October 2026. Section 16 has the release plan.  
**Reviewed:** 2026-09-26 in `docs/requirements-review.md`. The host decisions from that review are applied here.  
**Redesign:** 2026-09-26 in `docs/superpowers/specs/2026-09-26-invitation-redesign-design.md`, a moonlit pop-up book. Its changes are applied here: the 3D book, the new look and cats, the legendary battle, the game layer, and the gate game.

This file is the source of truth for what the site is. Later documentation, tests, and code have to match it. A requirement that is not written here is not in scope. A test that does not trace to a requirement here does not belong in the suite. Code that does not serve a requirement here does not get added.

## 1. Purpose

Build two public web invitations for **Mia's baby shower**, from one codebase. The shower is split across two days, one group of guests each day. Each group receives its own link. A guest who opens a real link sees only that day.

Someone who opens the site without one of those two codes does not see a party. They see a guest gate: a screen that says the invitation is for special guests and must be opened with the link they were sent. Cats still live on that screen. They play, a few of them can be met, and the guest can play a 30-second arcade game. The date, the place, WhatsApp, and the QR stay off it.

The invitation is a **pop-up storybook in a cat's attic**, under the moon on Saturday and in a golden dusk on Sunday: a 3D book, larger than the phone. The guest travels through it with a finger, a mouse, the wheel, or the arrow keys. Pages pop up out of the book as the guest reaches them and hold the verse, the date, the place, WhatsApp, and the QR, in that order along the book, so the facts are easy to find. Cats live on the pages, play with things, and can be greeted. A greeted cat stays in **Tus gatos** on that browser. Where the 3D book cannot run, the same pages sit in a flat room the guest moves through up, down, left, and right, in front of the live 3D attic or a paper diorama of it.

The book starts as a pencil sketch (**boceto**), becomes ink (**tinta**), and ends in light (**luz**) as the guest travels toward the family door, in the spirit of Evoland and of Pokémon from Red through Legends: Arceus. Greeting a cat is the Pokémon feeling: you notice who they are, they are not all the same, and some are harder to meet. Every greeting flips in a collectible card. The two legendary cats answer with a playful battle that nobody can lose. There is no ball. A quest log counts the pages found and the cats met, with XP, levels, and badges.

Mom and dad love cats. That is the world. Rock is a detail: a pick, a note, a pink spotlight. Mia is the princess they are waiting for.

At the end of the book, the family comes through a door as faceless paper silhouettes: dad, mom, Miguelito, and Mia. Misha and Kira, the two cats who already belong to that family, are beside them and happy. The scene is presence. It is not a farewell.

After a day's party is over, that page no longer shows the address, the map, the countdown, the confirm button, or the gift QR. The book, the cats, and the door stay. The page thanks the guest, who can relive the moment and meet the cats again.

## 2. Audience

- Guests who open a link they were sent, mostly on a phone.
- The same people coming back to meet a cat they missed.
- Family opening the link years later.
- Hosts who edit one content module without redesigning the page.

No login. No guest list on the site. No per-guest page.

## 3. What to build

One Vite site. One React page.

### Who gets in

| What the guest opened | What they see |
| --- | --- |
| `/?e=n4vk` | Saturday 17 October 2026, 16:00, the full book |
| `/?e=q8lm` | Sunday 18 October 2026, 16:00, the full book |
| `/`, a missing `e`, or any other `e` | The guest gate. Cats, the gate game, and **Tus gatos**. No date, no place, no WhatsApp, no QR. |

The calendar does not choose a day. A bare GitHub Pages address is the gate, on every date, including years later.

The code is the first `e` in the query string. Spaces around it are ignored, and upper or lower case both work: `N4VK` opens Saturday. Other query parameters are ignored.

### The guest gate

One screen, with no camera to move, and a small arcade game under the two sentences. None of the fighting.

- The sentences in section 6 stay on screen the whole time, in every phase of the game.
- `Toca para jugar` starts a 30-second round. Yarn balls and hearts fall, and the guest moves Luz left and right to catch them: by pointer or finger over the play field, or with the arrow keys once the field has focus.
- Yarn is worth 10 points and a heart 20, times the combo. Each catch raises the combo by one, up to ×5. A drop that reaches the bottom resets the combo to ×1. There is no losing, only the timer.
- The screen shows `Puntos {n}`, `Combo ×{n}`, and the seconds left. Mimo cheers when the combo reaches ×3, and Susto startles when a drop is missed. Neither score nor combo is announced by screen readers while playing.
- When the time runs out: `¡Se acabó el tiempo!`, the score, and `Tu mejor puntaje: {n}`, or `¡Nuevo récord!` when the score beats the best. `Jugar otra vez` starts a new round at once. The best score is kept on the browser (BR-16). Screen readers hear the end once, in a polite live region.
- The round pauses while the page is hidden. A long gap between frames, such as after sleep, never ends the round at once.
- There is no button that enters a party. Nothing about the party shows, in any phase.
- Luz, Mimo, and Susto rest below the game, play with the yarn, the box, and a heart, and can be greeted here. While a round plays, the roaming Luz steps aside, because she is the catcher; she is back when the round ends.
- Reduced motion shows the two sentences and still cats. There is no game and nothing falls. Greeting still works.

### The room: the book

On a real invitation the first thing on screen is the book's cover, in HTML: the title, the hero line (after the party, the post-party lines), and `Muévete para explorar`. Behind it the 3D book loads. The camera then starts at **Llegada**. The landmarks are the book's pages, in this order along it, each a pop-up page with its own object (design §5):

1. **Llegada** — the book cover: the title, the hero line, and `Muévete para explorar`.
2. **Palabra** — Salmo 127:3, the same verse as the example invitation, on an illuminated manuscript page with a candle flickering beside it.
3. **Cuándo** — that day's date and `16:00`, pinned to the page, with a melting candle, an hourglass, and the countdown as flip-card digits. The candle is whole 30 days before the party and burns down toward a stub at the start.
4. **Dónde** — a treasure map that unrolls, a pin that drops, the address, and `Ver en el mapa`. Only until the party is over.
5. **Confirmar** — the invitation letter and `Confirmar por WhatsApp`, with a message that names this day. Tapping it presses a wax seal onto the letter while WhatsApp opens at once. Only until the party is over.
6. **Presente** — presence first, then a gift box whose ribbon unties and whose lid lifts to reveal the shared QR on its plate, with `Guardar QR` below. Only until the party is over.
7. **Familia** — the lit doorway. The family, four faceless paper figures, folds up from the page and walks in. Misha and Kira are with them. Once every page that counts has been found (the badge `Cuento completo`), the door glows brighter.

The objects open as soon as their page stands up or comes into view, found or not, and stay open: a fact is never held behind an arrival, a tap, or a badge. With reduced motion every object is already open and still.

Landmark names are internal names for this spec and the code. They are not shown on the page. The signposts carry the visible labels.

Section 4 says how the book is laid out and how the flat room lays out the same pages. Cats and toys sit on and around the pages. A passing heart or star may cross a card for a moment. Nothing stays on a landmark's words.

Signposts stay on screen: `Inicio`, `La fecha`, `El lugar`, `Confirmar`, `El regalo`, `La familia`. `Inicio` leads to Llegada. Activating one glides the camera to that page. A signpost is absent when its landmark is absent. The guest never has to hunt for the invitation or for the door.

A theme control, the music control, and `Tus gatos` stay fixed on screen on the gate and on both invitations. On an invitation the quest log also stays on screen (see *The game layer*). The theme offers **Oscuro** and **Claro**. `Confirmar por WhatsApp` and `Ver en el mapa` live inside their pages and move with them.

### The moods

The invite link picks the mood, and the theme picks its lighter (Claro) or darker (Oscuro) version, so there are four looks. The clock never picks a mood; after the party it stays the same.

| | Claro | Oscuro |
| --- | --- | --- |
| **Saturday (`?e=n4vk`): Noche de luna** | Blue hour: a deep blue sky with a rising moon; the attic reads clearly. | Full night: a big moon with a halo, twinkling stars, and cool moonlight tinted toward Misha's blue. |
| **Sunday (`?e=q8lm`): Atardecer dorado** | Golden afternoon: a warm sun in the window, and candle-gold light on the floor. | Late dusk: the sun on the horizon, a sky going from candle and rose to plum, the lanterns lit, and fireflies out. |

Each look sets the sky behind the round window, the moon or sun and its halo, the window's light, the ambient light, the fog, and the tints of the wood, the floor, and the beams. Every color is a mix of the palette tokens and the feeling colors (section 16).

- **Saturday's own props:** a star-and-crescent mobile turning slowly over the crib, a paper star garland of 14 stars along the rafters, hanging below the roof, a soft moonbeam from the window, and stars twinkling outside it.
- **Sunday's own props:** a string of ribbed paper lanterns with dark collars, swaying gently and glowing, fireflies drifting in the air at dusk, and a golden beam from the window.
- **The Oscuro looks** keep the attic readable: the floor and the furniture read plum on Saturday and wine on Sunday, never black.
- **Motion:** at most two ambient motions at once: the mobile or the lanterns, plus the dust or the fireflies. The family's walk-in is the one orchestrated moment.
- **Lit from the start:** the attic, its sky, and its light follow the mood on every page. Only the book's pop-up paper and pieces, and the cats, go from pencil (boceto) to ink (tinta) to light (luz); the candles still light up in luz.

### The lived-in attic

Both moods share one attic, furnished in the pink-noir paper style (flat shapes, ink edges, slightly crooked): a crib under the round window, where the mood's mobile hangs; a bookshelf with colored books; a yarn basket; a rocking chair; three stacked old trunks; a crooked floor lamp, lit by its own glow in the Claro looks only; a cat bed; a scratching post; and curtains at the window. Soft painted shadows lie under the crib, the chair, and the trunks. No cobwebs, graves, or anything sad.

The props stand along the walls, behind and around the book. None stands between the camera and a page, at a page or while gliding between pages, and none covers a page or the HUD. Behind the flat room's cards (level 2) they frame the view.

### When the party is over

A day's party is over at midnight at the end of its calendar day, Bolivia time. The address stays up through the evening of the party.

| Page | Party is current | Party is over |
| --- | --- | --- |
| Saturday | Until `2026-10-18T00:00:00-04:00` | From that instant on |
| Sunday | Until `2026-10-19T00:00:00-04:00` | From that instant on |

When the party is over:

- Dónde, Confirmar, and Presente are omitted, with their signposts. The address, the map, the confirm button, the gift copy, the QR, and `Guardar QR` are gone.
- Cuándo keeps the date line and `16:00` as a memory. The countdown is gone.
- Llegada shows the post-party hero line and the relive line from section 6 in place of the hero line.
- **Tus gatos** offers `Jugar otra vez`. See *Playing again*.
- The landmarks left are Llegada, Palabra, Cuándo, and Familia. The cats and the door remain.
- The quest log counts 3 pages: Palabra, Cuándo, and Familia.
- Nothing says the address was removed.

Between `16:00` and midnight on the party day, the countdown reads zero.

The page checks the clock every second. If the page is open at the cutoff, the party-over state applies without a reload.

### The cats

Seven cats. Each one has a feeling, a rarity, a way of moving, and a sentence you learn only after they stay. The feelings follow the idea of Inside Out: a person is many moods, and you can tell them apart. The drawings are original. They are not those characters.

| Id | Name | Feeling | Rarity | Where they appear | What they do | Line once they stay |
| --- | --- | --- | --- | --- | --- | --- |
| `luz` | Luz | Alegría | Común | Gate and invitation | Bats the countdown so a number wobbles, chases the heart, pounces | Siempre encuentra algo que perseguir. |
| `mimo` | Mimo | Ternura | Común | Gate and invitation | Sleeps on the corner of a card, slow blink, comes if you wait | Le gusta que te quedes un rato. |
| `susto` | Susto | Temor | Poco común | Gate and invitation | Startles at nothing beside a button, then peeks back | Se asoma cuando el mundo está en calma. |
| `bram` | Bram | Ímpetu | Poco común | Invitation | Scratches the edge of the countdown, throws the guitar pick, then flops | Hace ruido y después se queda. |
| `nana` | Nana | Delicadeza | Poco común | Invitation | Sits on the QR frame, sniffs it, steps off the code | Elige un solo lugar, y ese es el suyo. |
| `misha` | Misha | Calma | Legendario | Invitation, at the family door | One slow scratch on the door frame, tail up. Notices you sooner if the music is on | Está en calma, y está en casa. |
| `kira` | Kira | Asombro | Legendario | Invitation, at the family door | Bats a star off the door, watches it fall, then comes closer | Mira la puerta, y se queda cerca. |

While motion is allowed, each cat also has a loop of its own on its page (design §4): Luz pounces, Mimo curls up and slow-blinks, Susto hides and peeks, Bram struts and flicks the pick, Nana grooms on her throne, and Misha and Kira glow by the door. Under the loops, every cat breathes, blinks, twitches an ear, and sways its tail, each on its own clock, so the family never moves in unison.

### Playing with what is on screen

The cats play with the things the guest can already see. On the invitation those things are the countdown, the verse card, the QR, the buttons, the door, and the invitation toys: the heart, the guitar pick, and the star on the door. On the gate they are the two sentences and the gate toys: the yarn, the box, and the heart.

Typical cat acts, and no others:

- **Scratch.** Claws on the edge of a card, the countdown frame, or the door. The marks fade. They never cut through letters.
- **Throw.** A paw knocks the heart, the star, or the guitar pick a short way. The QR can tilt. The object comes back to its place.
- **Scare at nothing.** Susto freezes and jumps at an empty spot, then peeks back. Nothing is there. No monster.

The guest can start a reaction by tapping the countdown, the QR, or the verse card. The cat assigned to that object does the act. If that cat is not on the page, nothing plays. Another cat does not take the act.

| What was tapped | Cat | Act |
| --- | --- | --- |
| Invitation countdown | Luz | Bat a number. Bram may also scratch the frame. |
| Verse card | Mimo | Lift her head from the corner. |
| QR | Nana | Sit on the frame, then step off. The code may tilt and then lies flat. |
| An empty spot near a button | Susto | Startle, then peek back. |
| Door frame | Misha | One scratch. |
| Star on the door | Kira | Bat it, watch it drop. |

After every act the invitation is readable again:

- Countdown numbers return upright and still show the real time.
- The QR settles flat, uncovered, and scannable. A cat may sit on the frame, not on the code.
- A phone cannot scan a code that is already on its own screen. Under the image, `Guardar QR` shares the file when the browser can share files, and otherwise downloads it. The guest can then open it in their bank app or show it on another screen. The site does not invent a bank deep link: the hosts supplied an image, not a payment URI, and the bank is unknown. The control is absent while the image is missing. Tapping `Guardar QR` does not play Nana's tilt.
- The QR sits on a white plate in both themes. It stays an ordinary image, so a long press can still save it where share and download are not available, such as some in-app browsers. The drag surface does not capture a press that starts on the QR.
- Buttons stay easy to tap. A cat does not hold one down.
- The verse, the date, and the address are never left hidden.

Greeting:

- When a cat is noticing the guest, `Saludar` appears on that cat. *Noticing* below says when. On Misha and Kira it reads `¡A jugar!` instead, and starts *The legendary battle* below; winning it greets the cat exactly as `Saludar` does.
- Activating it adds that id to the current round and, the first time ever, to **Tus gatos**. A live region says `Se quedó contigo: {name}.`, the rarity, and their line.
- A collectible card flips in at the same time: the cat's art, its feeling color, its name and line, and the rarity shown big. Común has a silver shimmer, Poco común a rose burst, and Legendario is gold with stars. The card is for the eye; screen readers hear the live region. It leaves after the greeting time, or at once on a tap.
- A cat already in the current round does not offer `Saludar` or `¡A jugar!`. The list never holds a second copy.
- Misha and Kira are not locked behind other cats. Like every cat, they wait for their rarity's pause.
- Cats greeted in the current round keep roaming. A small heart marks them so the guest can tell.
- The celebration is visual. It is not a sound.

Noticing (every number here is a starting value in the tuning module, section 11):

- The camera counts as still while it moves slower than 40 px per second.
- A cat notices the guest once its centre has been inside the middle 60% of the viewport, with the camera still, for its rarity's wait.

| Rarity | Wait |
| --- | --- |
| Común | 0.5 s |
| Poco común | 1.5 s |
| Legendario | 2.5 s |

- While the music is playing, Misha waits 1.2 s.
- Susto: if the camera moves faster than 600 px per second while he is inside the middle area, his `Saludar` hides and his wait starts again.
- `Saludar` stays while the cat is inside the middle area. It leaves 1 s after the cat leaves it.
- Reduced motion uses the same rules. The camera still moves.
- `Saludar` does not take focus when it appears. Its accessible name is `Saludar a {name}`.
- A pure function decides noticing from the cat, whether it is inside the middle area, how long the camera has been still, the camera speed, and whether music is playing.
- On the gate, whose camera never moves, the middle area is 94% of the screen: the gate cats rest in a band below the game.

**Tus gatos** opens over the book (or the room) without leaving it. It is a dialog: focus moves into it, `Escape` closes it, and focus returns to the `Tus gatos` control. It shows `{n} de 7`, the number of cats in the current round. Cats ever greeted show name, rarity, and line, with a heart when they are in the current round. The others show a silhouette, the rarity, and `Aún no se acerca`. Misha and Kira are marked `Legendario`. From the second round on, it also shows `Vuelta {n}`.

Playing again:

- `Jugar otra vez` exists only after the party is over, inside **Tus gatos**. The gate does not have it.
- Activating it starts a new round. The current round empties, the round number goes up by one, and every cat can be greeted again.
- Cats already met stay in **Tus gatos** with their lines. Nothing is forgotten. The count starts again at `0 de 7`.
- It resets the cat round only. XP, levels, badges, and the pages found stay. A cat met before earns no XP when it is greeted again.

The cat state is stored in `localStorage` under one key, shared by the gate and both invitations:

`{ caught: string[], round: string[], rounds: number }`

- `caught` holds every cat ever greeted, in the order they were first greeted. It never shrinks.
- `round` holds the cats greeted in the current round.
- `rounds` is the current round number, starting at 1.

Before the party is over there is only one round, so `round` holds the same ids as `caught`. There is no server and no account.

What this loop is: cats you can tell apart, a greeting that answers immediately, and a list that is still there tomorrow.

What this loop is not: notifications, streaks that punish a missed day, random prizes, a battle anyone can lose, a capture that can fail and reset, or anything that asks the guest to fight with weapons, shoot, or lose.

### The legendary battle

Misha and Kira answer a noticing guest with `¡A jugar!` instead of `Saludar` (design §7). It opens a playful battle, in the spirit of Pokémon Red, that always ends with the cat joining or the guest leaving. **Nobody loses.**

- **Opening.** A spiral wipe covers the page and the battle screen appears full screen. With reduced motion there is no wipe and every line shows at once. The battle is a dialog named `¡{name} quiere jugar!`; focus moves to the first move, and the page behind it is inert. Only one dialog is open at a time: **Tus gatos** does not open during a battle, and no battle starts while **Tus gatos** is open.
- **The screen.** The cat's name with a gold plate `★★★ Legendario` and its bar `Energía de juego`, the cat itself on a spotlight of its feeling color, and the guest's side, `Tú`, with the bar `Paciencia`. Both bars start full. A battle box types each line out; a tap on the box finishes the line. Every line also reaches a polite live region, once.
- **Turns.** The prompt is `¿Qué vas a hacer?`. The moves are `Lanzar ovillo`, `Mimos`, `Ronroneo`, and `Huir`; they wait while a line is still typing. The cat answers each move with its next move, in a fixed order, never at random, and the guest's paciencia dips (`Tu paciencia baja un poco.`).
- **Numbers** (starting values in the tuning module). The cat has 100 energy, the guest 100 paciencia. `Lanzar ovillo` takes 35, `Mimos` 25, and `Ronroneo` 20 and makes the next move 1.5 times as strong. A hit of 35 or more adds `¡Es muy efectivo!`. The cat's four moves take 12, 15, 10, and 18 paciencia, in that order, then repeat. A battle lasts three or four moves.
- **Nobody loses.** Paciencia never goes below 1. When it would, the cat head-bumps the guest (`{name} te da un cabezazo cariñoso. ¡Recuperas paciencia!`) and 30 comes back.
- **Win.** When the cat's energy reaches zero, its finisher plays (`¡Misha se ha dormido!` or `¡Kira se ha echado al suelo!`), a gold burst goes off, and one button remains: `Se quedó contigo: {name}.`, with focus on it. Activating it closes the battle and greets the cat exactly as `Saludar` does, with its `Legendario` card. Escape at that point also keeps the cat.
- **Huir.** `Huir`, or Escape before the win, says `Te fuiste sin hacer ruido.` and returns to the book. Nothing is saved. The cat stays at the door and offers `¡A jugar!` again.

### The game layer

A light layer of play over the facts (design §6). It never gates a fact: every page can be reached at any time, by moving, by signpost, or by keyboard.

- **The quest log** is on screen on an invitation, compact, top left (a badge toast takes its place for a moment): `Nivel {n}` with the level's title, an XP bar that fills from the level's floor toward the next level, `{n} XP`, `Páginas {n}/{total}`, and `Gatos {n}/7`. `total` is 6 while the party is current (every page but Llegada) and 3 after it. `Gatos` counts the cats ever met. The gate has no quest log.
- **Pages found.** A page counts as found once the camera comes to rest on it (the cover never counts), and in the book only once the cover has opened; gliding past a page does not count. The first time, the paper gives a little "fwip" and a stamp presses in: `¡Página encontrada!`. A page found on an earlier visit keeps its stamp.
- **Levels**, from the XP so far:

| XP from | Level | Title |
| --- | --- | --- |
| 0 | 1 | Visitante curioso |
| 60 | 2 | Amigo de los gatos |
| 180 | 3 | Guardián del cuento |
| 360 | 4 | Invitado de honor |
| 600 | 5 | Leyenda de la casa |

- **Badges**, each earned once, with its XP:

| Badge | When | XP |
| --- | --- | --- |
| Abriste el cuento | The guest's first move: a drag, the wheel, or an arrow key. Other keys and the signposts open the cover but do not count, and neither does a move made while the book is still loading behind its cover. | 10 |
| La palabra | Palabra found | 20 |
| Guardaste la fecha | Cuándo found | 30 |
| Encontraste el lugar | Dónde found | 30 |
| Invitación sellada | Tapping `Confirmar por WhatsApp` | 50 |
| Encontraste el regalo | Presente found | 20 |
| QR guardado | Tapping `Guardar QR` | 20 |
| Llegaste a la puerta | Familia found | 30 |
| Tu primer gato | The first cat ever met | 20 |
| Cuento completo | Every page that counts found | 100 |
| Todos los gatos | All seven cats met | 150 |

- **Cats.** Each cat met for the first time also earns XP by rarity: Común 20, Poco común 40, Legendario 100. Confirmar found is stored as a page but has no badge of its own; its badge comes from the tap.
- **Toasts.** Each award shows as a toast in the quest log's corner, taking the quest log's place while it shows, one at a time, for a few seconds each: the badge's name and `+{n} XP` (only `+{n} XP` for a cat), and `¡Subiste a nivel {n}!` when that award raised the level. Toasts wait while a card is showing. Screen readers hear each toast once, in a polite live region.
- XP and levels are deterministic. There are no streaks and nothing random. Progress is stored per browser (BR-16), and `Jugar otra vez` does not reset it.

### The family door

**Familia** is the last landmark, past the gift. It is on both invitations. It is not on the gate.

A lit doorway. The family stands in it as four paper pop-up figures drawn in the cats' scratchy double ink line: faceless, with no clothes detail and no inner lines except the hair's outline, each made of paper layers (the body, the hair, and a rim of backlight). They are told apart by height and hair, far enough apart that the hair reads:

| Figure | Who | Outline |
| --- | --- | --- |
| Tallest curly | Dad | A fuller afro than `ideas/dad.jpg`. That photo is about six months old and shows a shorter rounded cap. The figure uses the hair now: higher and wider, a soft round afro of curls. Not straight, and not the short cap in the photo. |
| Tall straight | Mom | Straight hair, no curls |
| Child | Miguelito | Shorter than the parents, curly hair |
| Smallest | Mia | The smallest figure, curly hair |

Misha and Kira are beside the group, not inside a figure. They read as cats, close, tails up, happy. They are the same two legendary cats the guest can greet. The people stay silhouettes. No faces, no costumes, no bows on the people.

The first time the door is in view on a visit, the figures fold up from the page and walk into the doorway, one after another, and rest. With reduced motion they simply stand. In the 3D book they are thin paper cutouts standing a little up the 3D doorway, just above the Familia card, backlit by its glow; they wait until the camera reaches Familia, then each folds up on its own spring and they walk in. The card keeps its line and the two cats, and tapping the 3D door starts Misha's scratch. In the flat room they are layered paper in the card's own door, and tapping the door frame starts Misha's scratch.

The line under the door is `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`

Once every page that counts has been found, the doorway glows brighter.

Nothing on the door says they are gone. The builders' note is this: Misha and Kira are the cats mom and dad had, and they died a couple of years ago. On the page they are here, with the family, glad. No grave, no dates, no ghost, no fading away.

Dad’s silhouette is the curl type in `ideas/dad.jpg`, grown out. The photo is about six months old, so the outline is fuller and tends toward an afro: taller and wider than that picture. The face is not drawn. `ideas/IMG-20260926-WA0000.jpg` is a black cat with a pink bow, and `ideas/IMG-20260913-WA0018(1).jpg` is a cat with a stroller. Those two are cat references, not the family.

### Reference

[miguelito-baby-shower](https://github.com/EL-JOCHI/miguelito-baby-shower) supplies the verse and the shape of the facts (date, map, WhatsApp, gift). It is not the room.

Verse, same wording as that site: “Los hijos son una herencia de parte de Jehová.” (Salmo 127:3).

WhatsApp number, same as that site: **+591 76632451**, written in the link as `59176632451`.

Leave behind: its stacked cards, its palette, its fonts, its bow-and-pastel art, its English title, its generated QR payload, and the second WhatsApp button about clothing sizes.

The room takes its behavior from films and games, and copies neither art nor text:

- **Evoland.** Moving through the book changes the medium, from a pencil sketch to ink to light.
- **Pokémon**, from Red, Blue, and Yellow, through Gold, Silver, and Crystal, to Legends: Arceus. You move through a place, you meet creatures who are not copies of each other, and the rare ones take longer. The list is a tiny dex. The legendary encounter is a playful battle with HP bars and moves, and nobody can lose it.
- **Inside Out.** Each cat is one feeling you can recognize from how they move. Joy rushes. Tenderness waits. Fear peeks. The picky one chooses a throne. The calm one barely stirs. Wonder watches closely.
- **An arcade game**, for the gate only: thirty seconds of catching yarn and hearts, with a score, a combo, and a best score. No bout and no weapons.
- **Don't Starve and Tim Burton**, for the look: scratchy ink, paper cut-outs, and outlines that boil like hand-drawn animation. The art is original.

Host photos in `ideas/` set the black, pink, cat, and stroller. An `images/` folder was named as further inspiration and is not in the project yet. When those files arrive, silhouettes can follow them. Names, feelings, rarities, and rules stay as written here unless the hosts change them.

### Out of scope

- Accounts, an RSVP database, forms that save answers, email delivery, and any progress stored off the device.
- Taking or recording payments. The site only displays a QR image.
- A gift registry, a suggested amount, a bank name, or an account number.
- A day picker, combat that can be lost, weapons, guns, an inventory of items, a blog, a photo gallery, or a playlist. The legendary battle is play, and nobody loses it. One ambience track is in scope. A library of songs is not.
- Skulls, spikes, leather vests, chains, and other stock metal costume pieces.
- Nintendo, Capcom, or Pixar characters, tiles, names, or sounds.
- Generating a QR from a payment string.
- Creating the GitHub repository. The hosts create it as `mia-babyshower`, public. The Pages workflow is already in `.github/workflows/pages.yml`. Turning on Pages in the repository settings happens when that repository exists. The steps are in `docs/stack-and-resources.md`.

## 4. How the book moves

The page itself does not grow a sideways scrollbar. One viewport holds the book, or the flat room. The camera moves inside it.

The viewport height is `100dvh`, so the collapsing mobile address bar does not jump the view. `100vh` is only a fallback where `dvh` is missing.

### The 3D book

The invitation is a Three.js diorama drawn with React Three Fiber (design §2): the attic, the open book, the pop-up paper pieces, the mood's window light (moonlight or a dusk sun) and candles, fog, and drifting dust or fireflies. Every card, cat, button, and piece of text is real HTML placed on the pages in 3D, so text stays sharp and keyboards and screen readers reach everything.

- **The cover first.** The first paint is the book's cover in HTML, in `index.html` itself, before any script has loaded: the title, the hero line (or, after the party, the post-party lines), and `Muévete para explorar`. On the gate the first paint is the two gate sentences instead. The 3D book streams in behind the cover, as its own chunk. A guest who will get the book or the live attic (a day link, motion allowed, WebGL) starts fetching that chunk as soon as the page's script runs, before the first render; the gate, reduced motion, and browsers without WebGL never fetch it.
- **The first frame.** The book is ready once it has drawn its first frame, and that frame draws only what the book had before the moods: the attic, the window's sky with its moon or sun, the book, its pages and paper pieces, the lights, and the dust. A first visit has no shader cache, so every other material would be one more shader to compile before the book is ready. The rest of the attic (the furniture, the mood's props, the window's stars, the fireflies, and the family) mounts right after, hidden, compiles its shaders in the background, and then shows shortly after. The compile leaves the page free only where the browser compiles shaders in parallel (`KHR_parallel_shader_compile`); elsewhere it can hold the page briefly. No compile starts while the book is paused; one already under way finishes. If the guest reaches Familia before the family shows, the fold-up and walk wait for it.
- **Opening.** The cover swings open like a book once the book is ready and the guest moves: a drag, the wheel, an arrow key, any other key, or a signpost. Until then the camera waits on a wide view of the whole book and the pages lie flat, and nothing counts: no page is found or stands, and a move earns nothing. A signpost tapped while the book is still loading still sets where the camera is heading. The book renders on demand behind the closed cover — its first frame, then only when something changes — and runs continuously once the cover opens. Once open, the camera swoops down to the first page.
- **The path.** The camera follows a smooth curve through the book, one point per page, evenly spaced. Progress along it runs from `0` (Llegada) to `1` (Familia).
- **Moving.** A drag in either direction moves along the path (a left or up drag moves forward; one screen of drag is half the book). The wheel moves too. When a drag is released, or shortly after the wheel stops, the camera glides to the nearest page if it is within half the spacing between pages. The arrow keys glide to the next page (right or down) or the previous one (left or up). A signpost glides to its page. Keyboard focus inside a page glides the camera to that page.
- **Pop-up.** As the camera arrives, a page and its paper pieces fold up out of the book with a springy overshoot, and they lie flat again once it moves on. A page lying flat far away fades out, but stays in the document and focusable: focus brings the camera, and the page rises again.
- **Depth.** A small pointer tilt adds depth.
- **Framing.** The camera's field of view and distance adapt to the screen's shape, so a page always fits, and a wide screen shows more of the book instead of stretching it. The camera never backs off so far that a page at rest is drawn below 90% of its design size: on a short screen the pop-up pieces around the page crop instead. The camera looks level at the page, from the height that centres the tallest page (Presente) between the HUD and the signposts of a phone. In the book the QR is drawn at 245 px, so a page at its smallest still shows it at 220 px.
- **Short screens.** A screen shorter than 640 px (a phone held sideways, the smallest phones with their browser toolbars) cannot show the tallest page whole at that size, so it gets the flat room's cards over the live attic (level 2, see *Three levels*). The height is checked when the page loads and whenever the screen is resized: a book that turns too short hands over to the flat room, on the page the guest was on, for the rest of the visit.
- **Moods.** The attic takes the day's mood and the theme's look (see *The moods*), lit from the first page. Switching the theme swaps the look in place.
- **Facts are never gated.** If the book cannot start, fails, has not drawn its first frame after 6 seconds, or loses its WebGL context, the flat room takes over (see *Three levels*).
- **Pausing.** The book and the live attic stop drawing while the tab is hidden or a full-screen dialog (the battle, **Tus gatos**) is open, and resume afterwards. A paused book cannot draw its first frame, so the 6-second load timeout does not run while it is paused; it starts over, whole, once the book runs again.

### The flat room

The flat room holds the same pages, laid out in a room larger than the screen, for reduced motion and for browsers where the book cannot run. Its size and layout (starting values in the tuning module):

- A landmark slot is `min(85vw, 420px)` wide. A landmark card is `min(80vw, 380px)` wide. On a large screen the two caps grow (see *Large screens*).
- The room is `max(300vw, N × slot)` wide, where N is the number of landmarks on that page: 7 while the party is current, 4 after. A 360px phone gets a room of about 2140px. A 1440px desktop gets 4320px.
- The room is `150dvh` tall.
- Landmark centres are spaced evenly across the room width, in the order of section 3. Llegada sits on the middle line. After it, landmarks alternate 10dvh above and 10dvh below that line.
- On a phone, the edge of the next card is already in view from Llegada.
- The camera cannot travel more than 24px past the room's edges.

The drag surface of the room uses `touch-action: pinch-zoom`, so one finger moves the camera instead of scrolling the page, and two fingers can still zoom. `html` and `body` use `overscroll-behavior: none`, so the document does not pull to refresh or chain a scroll. Buttons, links, and `Guardar QR` use `touch-action: manipulation` so they still receive taps. The viewport meta does not disable zoom. A system back-swipe from the screen edge is outside what CSS can turn off.

### What the guest does in the flat room

- Drag with the mouse, or with one finger, to move in any direction.
- Use the wheel or a trackpad to move vertically, and shift-wheel or a horizontal swipe to move sideways.
- Use the arrow keys to move as well. Each press moves the camera 120px.
- When a drag is released, or shortly after the wheel stops, the camera glides to the nearest page if it is within half the spacing between pages. With reduced motion it jumps there. The arrow keys are not snapped.
- Tap a signpost to glide to that landmark.
- Tap or drag a toy. Tap `Saludar` when a cat offers it.
- The theme control, the music control, `Tus gatos`, and the quest log stay fixed on screen while the room moves. `Confirmar por WhatsApp` and `Ver en el mapa` are ordinary links inside their landmarks.
- When a control inside the room receives keyboard focus, the camera glides so that control is in view.

Llegada shows `Muévete para explorar`. The next landmark is already in view at the edge, so the direction of the party is obvious.

### Depth while moving (flat room)

Moving the camera moves several layers at different speeds, so the room feels deep. No extra library. The same camera position drives the layers.

| Layer | What is on it | How it moves |
| --- | --- | --- |
| Far | A few stars or pixels, in front of the paper diorama or the live attic (see *Three levels*) | Slowest. About a quarter of the camera travel. |
| Mid | Landmark cards, the countdown, the QR, the door, and the cats and toys that sit on them or play with them | With the camera, one to one. This is the page the guest reads. |
| Near | A heart, a star, or a pixel passing close. Decoration only. | Slightly faster than the camera, so they slip across the cards. |

Cats stay on the mid layer, so a cat sitting on a card stays on that card while the camera moves. The near layer never covers the words or the QR code for more than a moment, and the rules in **Playing with what is on screen** still put them back. The flat room's own layers have no canvas; at level 2 the live 3D attic is drawn behind them (see *Three levels*).

`prefers-reduced-motion: reduce` turns the speed difference off. Every layer moves with the camera at the same speed. The guest can still move the camera.

### Three stages

The book starts as a pencil sketch, becomes ink, and ends in light (design §1). In the book the stage follows progress along the path. In the flat room it follows the horizontal camera position: the camera's left edge divided by (room width − viewport width), from `0` at the left end of the room to `1` at the right end, where Familia is; vertical movement does not change it. The thresholds `0.33` and `0.66` are starting values in the tuning module.

| Position | Stage | What it looks like |
| --- | --- | --- |
| `0` to `0.33` | Boceto | A pencil sketch: gray paper and graphite lines, in the attic's mood light. The cats are drawn in pencil gray. |
| `0.33` to `0.66` | Tinta | Ink: the paper gains ink outlines. The cats are inked, with their feeling colors muted. |
| `0.66` to `1` | Luz | Light: the candles are lit (one casts shadows), and the paper warms toward the family door. The cats show their full feeling colors, with a glow. |

When landmarks are omitted, the book is shorter and the stages still span all of it. The stage changes the rendering, never the words: every landmark's text is HTML in every stage.

The attic itself is lit from the start (see *The moods*): the stages change the book's pop-up paper and pieces and the cats, never the attic's light.

### Large screens

Design §9. In the book, the camera frames the pages for any screen. Around it, the quest log, the HUD, the signposts, the toasts, the dialogs (**Tus gatos**, the card, the battle), and the gate grow with the screen's width: their phone size up to 390 px wide, growing in a straight line to 1.4 times that size at 2560 px, and no larger after it. In the flat room the card and slot caps grow by the same amount, and each card's content is drawn at that scale, so a wider card is not a sparser one. The pages themselves keep their page size, because the camera or the card's scale already sizes them. These are starting values in the tuning module.

### Music

One track, provided later by the hosts, loops quietly under the gate and under the room. It is the room, not a prize. Quiet means the file itself is mastered quiet: iPhones ignore volume set by the page.

- Until the file is in the project, the music control is absent. No broken player.
- The first visit does not start the sound by itself.
- The guest turns it on with `Activar música`. The same control then reads `Silenciar música`. The choice is stored in `localStorage` and shared by the gate and both invitations.
- On a later visit with the choice stored as on, the loop starts on the guest's first tap, drag, or key press, because browsers block sound before a gesture. Until it actually plays, the control reads `Activar música`.
- Turning it on starts the loop from the beginning of the file. Silencing pauses it. Moving the camera does not restart it.
- While the page is hidden, for example while the guest is in WhatsApp, the music pauses. It resumes when the page is visible again, if the choice is on.
- There is no seek bar, no track list, and no title on the page.
- Reduced motion does not turn the music off. The control still works.
- While the music is playing, Misha's wait is shorter. See *Noticing*.

### Three levels

| Level | When | What the guest sees |
| --- | --- | --- |
| **1. The book** | A day link, motion allowed, WebGL, a screen at least 640 px tall, and the book ready within 6 seconds. | The 3D pop-up book in the mood's attic. |
| **2. Cards over the live attic** | Motion allowed and WebGL, but the screen is shorter than 640 px, the book was not ready in time, or the screen turned too short during the book. | The flat room's cards and signposts in front of the live 3D attic of the mood: its props and sky, and no book. |
| **3. The paper diorama** | Reduced motion, no WebGL, a lost WebGL context, an error starting or running the 3D, or level 2's scene not arrived yet. | The flat room's cards in front of layered paper cut-outs of the mood's attic. |

- **The load timeout:** the flat room opens on the page the guest was heading to, over the paper diorama. The 3D keeps loading; when it arrives, the live attic fades in behind the cards over about 600 ms, and once it has, the paper diorama under it is hidden (it shows again at once if the live attic is lost). Nothing on the cards moves, and focus stays where it was. The guest stays in the flat room for the rest of the visit.
- **A short screen at start:** level 2 directly. The 3D starts loading at page start for these guests too.
- **A lost context or an error** at level 1 or 2: level 3 on the current page, with no retry for the rest of the visit.
- **Level 2:** the live attic sits behind the cards, takes no taps, and is hidden from screen readers. It renders at a lower pixel ratio. Its first frame, the one that fades in, draws the attic, the window's sky, and the lights; the props, the mood's props, and the dust or fireflies follow in the same way as in the book. The flat room's sideways position drifts and turns it gently, so it moves with a little parallax; vertical moves do not. The cards stay opaque paper, and no text sits on the 3D.
- **Level 3:** the back wall with the round window and the mood's moon or sun, the rafters, the star garland or the lantern string, the shelf, crib, chair, and lamp in silhouette, and the floor slide at different rates as the flat camera moves sideways; nothing else in it moves. The rafters, the garland, and the props each cast a still paper shadow on the layers behind. Its colors follow the mood and theme. Plain HTML and SVG, with no canvas.
- **Low-end devices:** a device with 2 GB of memory or less, or with 2 cores or fewer, gets no real shadow map, a lower pixel ratio, about half the stars, fireflies, and dust, and slower ambient motion. Everything else is the same. Only browsers that report their memory (Chrome and other Chromium browsers) can count as low, and there the cores count too; Safari and Firefox report no memory, so they always get the normal device (an iPhone never drops to low on its core count alone).

`prefers-reduced-motion: reduce` gives level 3, still: no parallax and no canvas. Every layer moves at the camera's speed, so there is no depth. Cats are still pictures, with no line boil. They do not roam, scratch in a loop, or throw things on their own. A tap on the countdown or the QR may play one small settle, then stop. `Saludar` still works, with the same noticing rules, and so does the battle, with no wipe. Signposts jump to their landmark instead of gliding. Every page's object is already open. The stage still follows the camera position. The family simply stands in the door. The gate shows no game.

Whenever the flat room takes over from the book, it opens on the page the guest was on, or was heading to (the page nearest the camera's target), not on Llegada, and it stays for the rest of the visit, with every landmark that belongs at that clock. An open dialog (**Tus gatos**, a card, the battle) stays open through the change. With motion allowed, the flat room keeps its depth layers and its roaming cats.

### Coming back

The next visit loads **Tus gatos**, the game layer's progress (pages found, badges, XP), and the best gate score from `localStorage`. Cats greeted in the current round still show their heart, and found pages keep their stamp. Years later the place is gone, and the book and its cats are still there to meet.

The saved list is best effort. A browser may clear it on its own: Safari does so after 7 days of use without a visit, and private windows and in-app browsers may not keep it.

## 5. Visual identity

Color and character come from:

- `ideas/IMG-20260913-WA0012.jpg` — black field, magenta light, blush pink, cat and stroller.
- `ideas/IMG-20260913-WA0017(1).jpg` — the round badge. Reference only.
- `ideas/IMG-20260913-WA0018(1).jpg` — a black cat and a stroller, drawn as a pink line.
- `ideas/dad.jpg` — dad, about six months ago. Short, dense curls. The silhouette is that curl type grown toward an afro, fuller than the photo.
- `ideas/IMG-20260926-WA0000.jpg` — a seated black cat with a pink bow. A cat drawing, not a portrait of dad.

The words "Mia's Baby Shower" are not on the site. The title is **Baby shower de Mia**.

The world is cats. Rock is the pick, the note, and the spotlight, not a costume. Safe and recognizable beside the cats: heart, star, thunder, crown, music note, guitar pick. A guest cannot see a skull, a spike, a vest, a weapon, or a fight.

Each cat is recognizable at a glance: a different silhouette, a different feeling color, and one loop that belongs only to them. Luz is never still. Mimo is round and low. Susto is small and half-hidden. Bram is the one with the pick. Nana sits on the QR frame. Misha is long and calm, close to the door. Kira sits by that same door and watches the family come in.

The whole look is **a moonlit pop-up storybook in a cat's attic** (design §1, §3): Tim Burton and Don't Starve for the ink and the paper, Inside Out for the feeling colors, all original.

### Generated look and behavior

Cats, toys, and the family silhouettes are made for this site. A picture that does not match this section does not ship. The implementer draws them. There is no separate art delivery.

Each cat is one inline SVG drawing, rigged in parts: body, head, ears, eyes with blinking lids, and tail. Parts move on springs: breathing, blinking, ear twitches, a tail sway whose tip follows through, and a head turn when noticing. The playing, noticing, and staying states are the same drawing with a small change (pose, heart). Scratch, throw, and startle reuse that playing drawing. Exported PNGs are allowed only when they already match this section. They are not required.

**Line boil** (design §4): the ink outlines jitter a few times a second, like hand-drawn animation, through an animated SVG turbulence filter. It is off with reduced motion. Each cat is a paper cut-out, with a rough paper margin and a soft shadow on the page. The family's paper figures share that paper edge and the double ink line, but their line does not boil.

The family silhouettes are drawn as SVG paths. They are not a photograph run through `brightness(0)` or a similar filter. Filtering `ideas/dad.jpg` would keep a face, and the door has no faces. The photo is only the curl reference.

Shared cat look:

- One family style for all seven: scratchy double ink outlines, big and slightly mismatched eyes, spindly legs and spiral tails, a few stitch marks, and ink-black bodies, as in `ideas/IMG-20260926-WA0000.jpg` and `ideas/IMG-20260913-WA0018(1).jpg`. Mimo is the one exception: a blush body.
- Readable as a silhouette at about 64 pixels. No tiny patterns that disappear on a phone.
- One feeling color per cat, from the table below. It shows in the eyes, the glow, the collar charm, the collectible card, and the battle screen. The colors are starting values in the tuning module.
- The stage draws the cat: pencil gray in boceto, ink with its feeling color muted in tinta, and full color with a glow in luz.
- No text in the image. No photo texture. No copied game or film character.
- No skulls, spikes, vests, or weapons. Bows stay light: Mimo alone wears a small bow.
- Three states, same cat in each: playing, noticing the guest, and staying (a small heart). The noticing state is when `Saludar` (or `¡A jugar!`) may appear.

| Cat | Feeling | Feeling color | On ink | Silhouette cue | Loop |
| --- | --- | --- | --- | --- | --- |
| Luz | Alegría | `#F5C542` sunny gold | 11.7:1 | Round head, high tail | Pounces and chases. Bats a countdown digit. Almost never sits. |
| Mimo | Ternura | `#F28DB2` rose | 8.4:1 | Low and round, blush body, a small bow | Curls up and slow-blinks on the corner of a card. If the guest waits, the head lifts. |
| Susto | Temor | `#A98BEA` violet | 6.9:1 | Small, ears back | Hides and peeks. Jumps at nothing, then peeks back. |
| Bram | Ímpetu | `#F2784B` ember | 6.9:1 | Stocky, lightning tail tip, a guitar pick | Struts, flicks the pick, scratches the countdown frame, flops. |
| Nana | Delicadeza | `#7FD9B0` mint | 11.3:1 | Upright, crown-shaped ears | Grooms on her throne, the QR frame. Sniffs the code and steps off it. |
| Misha | Calma | `#8EB8F0` moon blue | 9.3:1 | Long, calm | Glows by the door. One scratch on the door frame. Turns the head sooner when music is playing. |
| Kira | Asombro | `#5FD4D0` star teal | 10.7:1 | Slim, tall | Glows by the door. Bats the star off the door, watches it drop. |

Toys and page objects share the palette: yarn, box, heart, star, guitar pick, the countdown, the QR frame, the door. A thrown object travels a short arc and returns. Scratch marks fade. Nothing stays on top of the words or the QR code.

The family figures are solid near-black paper silhouettes with no faces, no clothes detail, no interior lines except the hair outline in the door table. An outline may take the shape of an A-line dress (mom) or a smock (Mia), with nothing drawn inside it. They fold up and move once, into the lit doorway, then rest. Misha and Kira stand beside them as full cats, not as silhouettes.

Files, if exported: transparent PNG, one cat state per file, named `{id}-playing.png`, `{id}-noticing.png`, `{id}-staying.png`, under `src/assets/cats/`. Toys under `src/assets/toys/`. The four family figures are SVG paths in one module (`src/components/art/family.ts`), shared by the CSS family and the 3D cutouts. `ideas/` is not copied into the site.

Palette, **Burton pink noir** (design §3; the tokens are in section 16):

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#140E14` | Night, outlines, the dark field |
| Bone | `#F1E7D6` | Parchment cards; text on dark |
| Rose | `#E08AAB` | The main accent: glows, hearts, buttons |
| Deep rose | `#BB3267` | Rose *text* in the light theme |
| Plum | `#3C1F3D` | Shadows, fog, depth, dark panels |
| Candle | `#F2B84B` | Light sources, legendary gold |

| Role | Oscuro (dark) | Claro (light) |
| --- | --- | --- |
| Field | Ink | Bone |
| Text | Bone | Ink |
| Accent | Rose | Rose as glow; accent text in deep rose |
| Panels | Plum | A lighter parchment |
| Pages | Bone parchment with ink text and deeper rose accent text | The same parchment |

Checked contrast: bone on ink 15.6:1, rose on ink 7.6:1, ink on rose (buttons) 7.6:1, candle on ink 10.6:1, bone on plum 11.8:1, ink on bone 15.6:1, deep rose on bone 4.55:1. Rose is never used as text on bone. The pages' accent text is a deeper rose that keeps 4.6:1 or more on the darkest tint of their aged paper.

Texture (design §3):

- Paper grain on every surface.
- Hand-drawn, wobbly borders on the cards, from an SVG displacement filter.
- A faint vignette: the pages' edges age toward a darker tint.
- No flat rounded "SaaS cards". Cards are torn, folded, or pinned paper.

Bows stay light: Mimo's small bow, and none on the family silhouettes. Floral garlands and sweet script stay out.

Typography (design §3): three open-licensed, self-hosted faces that cover every Spanish character.

- **Mystery Quest** for titles: the book's title, the page stamp, the cats' names on their cards, and the badge names. Whimsical, spooky storybook lettering.
- **Alegreya** for all reading text: the verse, the date, the address, the cat lines, and the buttons.
- **Pixelify Sans** only on game screens: the battle, scores, XP and the quest log, and the gate game. It nods to Pokémon Red.
- Reading text is set at 17 px with a 1.5 line height; the cover title runs from 32 to 56 px with the screen. Small labels (the HUD, the quest log, captions) are smaller, and they grow on large screens. No unlicensed font files. No Nintendo, Capcom, or Pixar type.

Theme: **Oscuro** and **Claro** pick the darker and the lighter look of the day's mood (see *The moods*): Saturday's moonlit night, Sunday's golden dusk. The pages stay bone parchment with ink lines and deep rose accents. The stage changes the rendering, not which theme is active.

## 6. Guest-facing copy

All visible strings are Spanish. Code, tests, and this spec stay in English.

Gate:

- `Esta invitación es solo para invitados especiales.`
- `Ábrela con el enlace que te enviaron.`

Room:

- Title: `Baby shower de Mia`
- Hero line: `Mia ya es nuestra princesa. Nos haría muy feliz celebrar su llegada contigo.`
- Music on: `Activar música`
- Music off: `Silenciar música`
- Move hint: `Muévete para explorar`
- Verse: `Los hijos son una herencia de parte de Jehová.`
- Verse citation: `Salmo 127:3`
- Place line: `Av. Prolongación Beni (Entre 6to y 7mo anillo). Calle 12 de Abril S/N`
- City line: `Santa Cruz de la Sierra, Bolivia`
- Gift lead: `Lo más importante es que vengas.`
- Gift offer: `Si quieres tener un detalle, puedes transferir con este QR. El monto lo eliges tú.`
- QR alternative text: `Código QR para transferir un regalo a Mia`
- QR pending: `El QR estará aquí pronto.`
- QR save: `Guardar QR`
- Confirm control: `Confirmar por WhatsApp`
- Map control: `Ver en el mapa`
- Signposts: `Inicio`, `La fecha`, `El lugar`, `Confirmar`, `El regalo`, `La familia`
- Collection: `Tus gatos`
- Close the collection: `Cerrar`
- Greet: `Saludar`
- Caught: `Se quedó contigo: {name}.`
- Not yet: `Aún no se acerca`
- Round count: `{n} de 7`
- Round number: `Vuelta {n}`
- Play again: `Jugar otra vez`
- Post-party hero line: `Gracias por celebrar con nosotros la llegada de Mia.`
- Relive line: `La fiesta ya pasó, pero los gatos siguen aquí. Revive el momento.`
- Door line: `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`
- Theme names: `Oscuro` and `Claro`
- Countdown labels: `Días`, `Horas`, `Minutos`, `Segundos`
- Rarities: `Común`, `Poco común`, `Legendario`
- Cat names and lines: the table in section 3

Pages and the game layer (design §13):

- Page found: `¡Página encontrada!`
- Quest log: `Páginas {n}/{total}`, `Gatos {n}/7`, `Nivel {n}`, `{n} XP`
- Level titles, for levels 1 to 5: `Visitante curioso`, `Amigo de los gatos`, `Guardián del cuento`, `Invitado de honor`, `Leyenda de la casa`
- Level up: `¡Subiste a nivel {n}!`
- Badges: `Abriste el cuento`, `La palabra`, `Guardaste la fecha`, `Encontraste el lugar`, `Invitación sellada`, `Encontraste el regalo`, `QR guardado`, `Llegaste a la puerta`, `Tu primer gato`, `Cuento completo`, `Todos los gatos`
- Badge XP: `+{n} XP`

Battle (design §13):

- Start button on Misha and Kira: `¡A jugar!`
- Intro: `¡{name} quiere jugar!`
- Bars: `Energía de juego` (the cat) and `Paciencia` (the guest)
- The guest: `Tú`
- Prompt: `¿Qué vas a hacer?`
- Moves: `Lanzar ovillo`, `Mimos`, `Ronroneo`, `Huir`
- Your moves:
  - `¡Lanzaste el ovillo! {name} corre tras él.`
  - `Le diste mimos a {name}. ¡Ronronea feliz!`
  - `Imitaste un ronroneo. {name} se relaja…`
- Strong hit: `¡Es muy efectivo!`
- Huir: `Te fuiste sin hacer ruido.`
- Misha's moves, in order: `Misha bosteza…`, `Misha te mira con calma.`, `Misha se estira despacio.`, `Misha amasa una cobija.`
- Kira's moves, in order: `Kira persigue su cola.`, `Kira hace ojitos.`, `Kira mira una estrella fugaz.`, `Kira salta hacia la puerta.`
- Effect on you: `Tu paciencia baja un poco.`
- Safety net: `{name} te da un cabezazo cariñoso. ¡Recuperas paciencia!`
- Finishers: `¡Misha se ha dormido!`, `¡Kira se ha echado al suelo!`
- Win button: the caught line, `Se quedó contigo: {name}.`
- Plate beside the cat's name: `Legendario`, after three decorative stars

Gate game (design §13):

- Start: `Toca para jugar`
- While playing: `Puntos {n}`, `Combo ×{n}`, `{s} s` (the seconds left, rounded up)
- End: `¡Se acabó el tiempo!`, then `Tu mejor puntaje: {n}` or `¡Nuevo récord!`
- Play again: `Jugar otra vez`

Saturday confirm message:

`¡Hola! Quiero confirmar mi asistencia al baby shower de Mia el sábado 17 de octubre a las 16:00.`

Sunday confirm message:

`¡Hola! Quiero confirmar mi asistencia al baby shower de Mia el domingo 18 de octubre a las 16:00.`

Date lines:

- `sábado 17 de octubre de 2026`
- `domingo 18 de octubre de 2026`

Time line on both invitations: `16:00`

Accessible names (read by screen readers, not shown):

- Greet button: `Saludar a {name}`
- Each cat picture: `{name}`
- The room: `Invitación`
- The signpost group: `Ir a`
- The theme control group: `Tema`
- The **Tus gatos** dialog: `Tus gatos`
- The battle dialog: `¡{name} quiere jugar!`. Its moves are a group named `¿Qué vas a hacer?`, and its two bars are meters named `Energía de juego` and `Paciencia`.
- Each `¡A jugar!` button is described by its cat's name, so the two at the door can be told apart.
- The quest log's XP bar: a meter named `Nivel {n}, {title}`, read as `{n} XP`.
- Toys, far-layer decoration, the collectible card, and the family's silhouettes at the door are decorative and hidden from screen readers; the greeting's live region carries the card's words. The 3D book's canvas carries no text: every word is in the HTML pages. The door line is the visible text for the door.

Share preview (the same on every page):

- `og:title`: `Baby shower de Mia`
- `og:description`: `Una invitación para invitados especiales.`

## 7. User stories

Stories are ordered by priority. Each heading names its release from section 16. Rendering tests pass a resolved day and a clock instant. They do not read the system clock. Cat tests pass a stored state. They do not depend on a real browser profile. Tests read numbers from the tuning module, so tuning a value does not break the suite.

### US-1 — Read my invitation by moving through the room (P1, R1)

A guest with a real link can reach the verse, their date, 16:00, and, while the party is current, the place, without greeting a cat.

**Independent test:** Render each invitation before its midnight cutoff. Assert the landmarks, that day's date, the verse, and the address. Assert the other day's date is absent. Assert each signpost points at the matching landmark.

**Acceptance scenarios:**

1. **Given** Saturday and a clock before `2026-10-18T00:00:00-04:00`, **When** the room renders, **Then** Llegada, Palabra, Cuándo, Dónde, Confirmar, and Presente are all present, including the hero line, `Salmo 127:3`, `sábado 17 de octubre de 2026`, `16:00`, and the Prolongación Beni address.
2. **Given** Sunday and a clock before `2026-10-19T00:00:00-04:00`, **When** the room renders, **Then** the guest sees `domingo 18 de octubre de 2026` and does not see `17 de octubre`.
3. **Given** a phone, tablet, and desktop width, **When** either room renders, **Then** landmark text is readable, actions are tappable, and the page itself does not scroll sideways.
4. **Given** the signpost `La fecha`, **When** the guest activates it, **Then** the camera target is Cuándo.
5. **Given** a keyboard, **When** focus moves to `Confirmar por WhatsApp`, **Then** the camera target brings the Confirmar landmark into view.
6. **Given** a 360px-wide viewport and 7 landmarks, **When** the layout is computed, **Then** no two landmark cards overlap.

### US-2 — Choose a theme (P1, R1)

A guest can switch between dark and light, and the browser remembers.

**Independent test:** Activate each option, reload storage, and assert the theme.

**Acceptance scenarios:**

1. **Given** a first visit with no saved choice, **When** a page loads, **Then** the theme follows the operating-system scheme. If the scheme cannot be read, the theme is dark.
2. **Given** the page, **When** the guest chooses Claro or Oscuro, **Then** colors switch immediately and the control shows which one is active.
3. **Given** a saved theme, **When** the guest opens the other invitation or the gate later, **Then** the same theme is active.
4. **Given** either theme, **When** text is shown, **Then** body text and control labels meet WCAG 2.2 AA contrast (4.5:1 for normal text, 3:1 for large text and meaningful boundaries). A unit test computes the contrast of every text and background token pair in use.

### US-3 — Confirm the correct day on WhatsApp (P1, R1)

**Independent test:** Activate confirm on each day and assert the `wa.me` URL. No network call.

**Acceptance scenarios:**

1. **Given** Saturday, **When** the guest activates `Confirmar por WhatsApp`, **Then** the destination is `https://wa.me/59176632451?text={encoded message}` and the decoded message is the Saturday message in section 6.
2. **Given** Sunday, **When** the guest activates confirm, **Then** the decoded message is the Sunday message and does not contain `17 de octubre`.
3. **Given** the gate, **When** it renders, **Then** there is no confirm control.
4. **Given** either invitation, **When** the guest only opens it, **Then** the site has stored nothing. Activating confirm stores only the badge `Invitación sellada` in `mia-progress`, never a yes, a name, or a headcount (BR-4).

### US-4 — See the gift QR (P1, R1)

**Independent test:** Render Presente with a fixture image and with no image.

**Acceptance scenarios:**

1. **Given** the QR image is present, **When** the guest can see Presente, **Then** that image is visible on a white plate, at least the minimum QR size from the tuning module (220 CSS pixels) on screen, with the alternative text from section 6. In the book it is drawn larger, so a page at its smallest scale still shows it at that size.
2. **Given** the QR file is missing, **When** Presente renders, **Then** it shows `El QR estará aquí pronto.` and no broken image and no generated code.
3. **Given** Presente, **When** it renders, **Then** it shows the gift lead and offer, and it does not name an amount, a bank, or an account.
4. **Given** the QR image is present, **When** the guest activates `Guardar QR`, **Then** the browser shares that image file if it can, and otherwise downloads it. No bank URI is opened.

### US-5 — Find the place, then see the party end (P1, R1)

**Independent test:** A pure function decides from the clock and the day's cutoff whether the party is over.

**Acceptance scenarios:**

1. **Given** a current invitation, **When** the guest activates `Ver en el mapa`, **Then** the destination is `https://www.google.com/maps/search/?api=1&query=-17.73170923809386,-63.15786528996242`.
2. **Given** Saturday at `2026-10-17T23:59:00-04:00`, **When** it renders, **Then** the address, the map control, the confirm control, and Presente are present.
3. **Given** Saturday at `2026-10-18T00:00:00-04:00`, **When** it renders, **Then** the address, the city, the map control, the confirm control, the gift copy, the QR, `Guardar QR`, the countdown, and the `El lugar`, `Confirmar`, and `El regalo` signposts are absent, and the other landmarks on the page are present.
4. **Given** Sunday at `2026-10-19T00:00:00-04:00`, **When** it renders, **Then** the same things are absent, and the other landmarks on the page are present.
5. **Given** a Saturday page open at `2026-10-17T23:59:59-04:00`, **When** the clock reaches the cutoff, **Then** the party-over state applies without a reload.

### US-6 — Watch the countdown (P2, R1)

**Independent test:** Freeze time against each start instant.

**Acceptance scenarios:**

1. **Given** a clock before that day's start, **When** the countdown renders, **Then** it shows non-negative days, hours, minutes, and seconds that match the difference.
2. **Given** a clock at or after that start and before that day's cutoff, **When** the countdown renders, **Then** every unit is zero.
3. **Given** Saturday, **When** it renders, **Then** the countdown targets `2026-10-17T16:00:00-04:00`.
4. **Given** Sunday, **When** it renders, **Then** the countdown targets `2026-10-18T16:00:00-04:00`.
5. **Given** a clock at or after that day's cutoff, **When** Cuándo renders, **Then** there is no countdown, and the date line and `16:00` are present.

### US-7 — Move from sketch to light (P1; stage mapping R1, the 3D book with the redesign)

The book starts as a sketch, becomes ink, and ends in light. It is a 3D book where it can be, and the flat room where it cannot.

**Independent test:** Map position samples to stages. Render the book with a stand-in world that gets ready, fails, or stalls. Render with reduced motion and assert the landmarks without a canvas.

**Acceptance scenarios:**

1. **Given** the default thresholds and position `0`, `0.32`, `0.33`, `0.65`, `0.66`, and `1`, **When** the stage is resolved, **Then** the results are boceto, boceto, tinta, tinta, luz, and luz.
2. **Given** WebGL and motion allowed, **When** an invitation loads, **Then** the cover shows the title and the hero line at once, and the book loads behind it.
3. **Given** the book is ready and the cover closed, **When** nothing has moved yet, **Then** the world renders only on demand behind the cover; **When** the guest drags, uses the wheel, or presses any key, **Then** the cover opens and the world runs continuously. Only a drag, the wheel, or an arrow key counts as the first move.
4. **Given** the book fails to start, has not drawn its first frame within the load timeout, or loses its WebGL context, **When** that happens, **Then** the flat room takes over, with every landmark that belongs at that clock and no cover, on the page the guest was on or heading to: over the paper diorama after a failure or a lost context, and, after the timeout, over the paper diorama until the live attic fades in behind the cards.
5. **Given** the book is still loading behind its cover, **When** the guest taps a signpost or moves, **Then** no page is found and nothing is earned; if the book then fails, the flat room opens on that signpost's page.
6. **Given** a screen shorter than 640 px, **When** an invitation loads, **Then** the flat room shows, over the paper diorama until the live attic arrives and fades in behind the cards (the 3D chunk is fetched for the live attic, and no book is drawn); **Given** the book on a taller screen, **When** the screen turns shorter than 640 px, **Then** the flat room takes over on the current page. On a screen tall enough, a page at rest is drawn at 90% of its design size or more.
7. **Given** reduced motion, or no WebGL, **When** an invitation loads, **Then** no canvas is mounted and every landmark that belongs at that clock is present as text. With reduced motion every layer moves at the camera's speed.
8. **Given** the opening view, **When** it paints, **Then** `Muévete para explorar` is visible.
9. **Given** the book, **When** the guest switches between Oscuro and Claro, **Then** the book takes the new theme without a reload.

### US-8 — Enter only with the link I was sent (P1, R1)

**Independent test:** A pure function takes a code and returns Saturday, Sunday, or the gate. The clock is not an input.

**Acceptance scenarios:**

1. **Given** `n4vk`, **When** the app resolves it, **Then** the result is Saturday, at any clock time.
2. **Given** `q8lm`, **When** the app resolves it, **Then** the result is Sunday, at any clock time.
3. **Given** a missing code, an empty code, `1`, or `17-octubre`, **When** the app resolves it, **Then** the result is the gate, including on 16 October, on 17 October, and years later.
4. **Given** the gate, **When** it renders, **Then** it shows both gate sentences, and it does not show a date, the address, a WhatsApp link, or the QR.
5. **Given** either invitation, **When** it renders, **Then** the other day's date line is not in the document.
6. **Given** `N4VK`, ` n4vk ` with spaces, or `?x=1&e=q8lm`, **When** the app resolves it, **Then** the results are Saturday, Saturday, and Sunday.

### US-9 — Meet the cats and keep them (P1, R1 stretch)

**Independent test:** A pure function takes the stored cat state and a greet, and returns the next state. A second pure function decides noticing.

**Acceptance scenarios:**

1. **Given** an empty state, **When** the guest greets Luz, **Then** the stored state is `{ caught: ["luz"], round: ["luz"], rounds: 1 }` and the page shows `Se quedó contigo: Luz.`, `Común`, and `Siempre encuentra algo que perseguir.`
2. **Given** Luz is already in the current round, **When** the guest greets Luz again, **Then** the state is unchanged.
3. **Given** the invitation, **When** the guest wins the battle with Misha (US-14), **Then** `misha` is stored and the page shows `Legendario` and `Está en calma, y está en casa.`
4. **Given** the invitation, **When** the guest wins the battle with Kira, **Then** `kira` is stored and the page shows `Legendario` and `Mira la puerta, y se queda cerca.`
5. **Given** the gate, **When** it renders, **Then** Misha and Kira are not there, and neither is the family door.
6. **Given** two cats already stored, **When** the guest opens either invitation, **Then** those two show their lines and no third id is added until a new greet.
7. **Given** the gate, **When** the guest greets Mimo, **Then** `mimo` is stored, and Bram is not on the gate.
8. **Given** **Tus gatos** for a cat not yet greeted, **When** it renders, **Then** the guest sees the rarity and `Aún no se acerca`, and does not see that cat's line.
9. **Given** the default waits and a Común cat inside the middle area, **When** the camera has been still for 0.5 s, **Then** the cat is noticing. At 0.4 s it is not.
10. **Given** Susto noticing, **When** the camera moves faster than 600 px per second while he is inside the middle area, **Then** he is not noticing and his wait starts again.
11. **Given** Misha inside the middle area, **When** music is playing, **Then** he notices after 1.2 s. Without music, after 2.5 s.
12. **Given** stored data with an unknown id, a duplicate, or unreadable JSON, **When** the page loads, **Then** those entries are dropped and the page renders.

### US-10 — Play at the gate (P2, redesign)

The gate is a screen with cats and a small arcade game. The game's rules are US-16.

**Independent test:** Render the gate with motion allowed and with reduced motion, and play a round with fake timers.

**Acceptance scenarios:**

1. **Given** the gate and motion allowed, **When** it is showing, **Then** both sentences, `Toca para jugar`, and Luz are visible.
2. **Given** the guest activates `Toca para jugar`, **When** the round plays, **Then** the seconds left start at `30 s` and both sentences stay visible. The roaming Luz steps aside while she is the catcher; Mimo and Susto stay.
3. **Given** a round, **When** its time runs out, **Then** `¡Se acabó el tiempo!` and `Jugar otra vez` show, a best score is stored under `mia-gate-best`, both sentences are still visible, and Luz is back.
4. **Given** reduced motion, **When** the gate renders, **Then** both sentences are visible, the cats are still, and there is no game to start.

### US-11 — Hear the room when I ask (P2, R3)

One ambience track, off until the guest turns it on, then remembered.

**Independent test:** Render with and without a configured file. Toggle the control and assert the saved preference and whether playback was requested.

**Acceptance scenarios:**

1. **Given** no track file, **When** the gate or an invitation renders, **Then** there is no music control and no audio element.
2. **Given** a track file and no saved choice, **When** the page renders, **Then** the control reads `Activar música` and the audio is paused.
3. **Given** a track file, **When** the guest activates `Activar música`, **Then** the audio source is that file, playback is requested, and the control reads `Silenciar música`.
4. **Given** sound was turned on, **When** the guest opens the other link or the gate later, **Then** playback is requested on the guest's first tap, drag, or key press, and the control reads `Silenciar música` only once playback has started.
5. **Given** sound is playing, **When** the guest activates `Silenciar música`, **Then** playback pauses and the next visit stays silent until they turn it on again.
6. **Given** the browser refuses playback, **When** the page renders, **Then** the control reads `Activar música`.
7. **Given** sound is playing, **When** the page becomes hidden, **Then** playback pauses, and it resumes when the page is visible again.

### US-12 — Watch the cats play (P1, R2; the family door is R1 stretch)

**Independent test:** Render the gate and an invitation with motion allowed. Assert the cats and toys that belong on each page.

**Acceptance scenarios:**

1. **Given** the gate and motion allowed, **When** it renders, **Then** Luz, Mimo, and Susto are present, and so are the yarn, the box, and a heart.
2. **Given** an invitation and motion allowed, **When** it renders, **Then** Luz, Mimo, Susto, Bram, Nana, Misha, and Kira are present, and the family door shows the faceless paper family (dad with a fuller afro, Miguelito and Mia with smaller curly outlines, mom with straight hair), both legendary cats beside them, and the line `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`
3. **Given** the invitation countdown, **When** the guest taps it, **Then** a cat bats or scratches it, the numbers wobble, and they settle back to the real time, still readable.
4. **Given** the QR, **When** Nana is on its frame or the guest taps it, **Then** the code may tilt and then lies flat and uncovered.
5. **Given** Susto, **When** the moment plays, **Then** Susto startles at an empty spot and comes back. No other creature appears.
6. **Given** reduced motion, **When** either page renders, **Then** the cats that belong there are visible and they do not roam, scratch in a loop, or throw things on their own.
7. **Given** the family door comes into view for the first time on a visit with motion allowed, **When** it shows, **Then** the paper figures fold up from the page and walk into the doorway once; with reduced motion they are simply standing, and tapping the door frame still starts Misha's scratch.

### US-13 — Relive the party (P2, R2, live before `2026-10-18T00:00:00-04:00`)

After the party, the page thanks the guest, and the cats can be met again.

**Independent test:** A pure function takes the cat state and returns the state after `Jugar otra vez`. Render each invitation after its cutoff.

**Acceptance scenarios:**

1. **Given** Saturday at or after its cutoff, **When** the room renders, **Then** Llegada shows the post-party hero line and the relive line, and does not show the invitation hero line.
2. **Given** the party is over and the state `{ caught: ["luz", "mimo", "nana"], round: ["luz", "mimo", "nana"], rounds: 1 }`, **When** the guest activates `Jugar otra vez`, **Then** the state is `{ caught: ["luz", "mimo", "nana"], round: [], rounds: 2 }`, and **Tus gatos** shows `0 de 7` and `Vuelta 2`.
3. **Given** a new round, **When** a cat met before notices the guest, **Then** `Saludar` is offered again. Greeting adds it to `round` and does not add a second copy to `caught`.
4. **Given** a clock before the cutoff, **When** **Tus gatos** opens, **Then** there is no `Jugar otra vez`.
5. **Given** the gate, **When** **Tus gatos** opens, **Then** there is no `Jugar otra vez`.

### US-14 — Play with the legendary cats (P2, redesign)

Misha and Kira join through a playful battle that nobody can lose (section 3, *The legendary battle*). Every greeting flips in a collectible card.

**Independent test:** A pure function takes the battle state and a move, and returns the next state. Render the battle dialog, and play it inside the invitation with fake timers.

**Acceptance scenarios:**

1. **Given** Misha or Kira noticing the guest, **When** the cat is shown, **Then** it offers `¡A jugar!` instead of `Saludar`, and activating it opens the battle rather than greeting.
2. **Given** the battle opens, **When** it renders, **Then** it is a dialog named `¡{name} quiere jugar!`, with `Energía de juego`, `Paciencia`, and the four moves, and focus on the first move. With motion allowed the wipe plays first, each line types out, and the moves wait until the line is done.
3. **Given** a move, **When** it is chosen, **Then** the cat's energy falls by the move's value, the cat answers with its next move in a fixed order, and the guest's paciencia dips. A hit of 35 or more adds `¡Es muy efectivo!`, and `Ronroneo` makes the next move 1.5 times as strong.
4. **Given** any sequence of moves, **When** paciencia would fall below 1, **Then** the safety line plays and paciencia comes back; it is never below 1.
5. **Given** the cat's energy reaches zero, **When** the finisher line has played (it is in the live region), **Then** focus moves to the one button, labeled `Se quedó contigo: {name}.`; activating it closes the dialog, stores the cat in `mia-cats` exactly as a greeting does, and shows `Legendario` in the live region and on a `Legendario` card.
6. **Given** a battle, **When** the guest activates `Huir` or presses Escape before the win, **Then** the dialog closes after `Te fuiste sin hacer ruido.`, nothing is stored, and the cat offers `¡A jugar!` again.
7. **Given** a battle, **When** it is open, **Then** the page behind is inert and **Tus gatos** does not open. **Given** **Tus gatos** open, **When** `¡A jugar!` is activated, **Then** no battle starts.
8. **Given** a normal greeting, **When** it happens, **Then** the card shows the cat's name and rarity (`rarity-comun` for Luz); a tap sends it away, and it also leaves on its own after the greeting time. The card is hidden from screen readers.

### US-15 — Find pages, earn badges, and level up (P2, redesign)

The game layer in section 3. It never gates a fact.

**Independent test:** Pure functions apply a progress event (moved, page reached, confirmed, QR saved, cat met) and map XP to levels; a sanitizer reads stored progress. Render the invitation with fake timers.

**Acceptance scenarios:**

1. **Given** an invitation, **When** it renders, **Then** the quest log shows `Nivel 1`, `Páginas 0/6`, and `Gatos 0/7`. **Given** the gate, **Then** there is no quest log.
2. **Given** the camera glides to Cuándo from `La fecha` and rests there, **When** it has rested, **Then** the quest log reads `Páginas 1/6`, a toast shows `Guardaste la fecha` and `+30 XP`, the page is stamped `¡Página encontrada!`, and `mia-progress` is `{ pages: ["cuando"], badges: ["fecha"], xp: 30 }`. A page the camera only passes is not counted.
3. **Given** a clock at or after the cutoff, **When** the guest reaches Familia, **Then** the quest log counts out of 3 and the toast shows `Llegaste a la puerta`.
4. **Given** an invitation, **When** the guest activates `Confirmar por WhatsApp`, **Then** WhatsApp still opens at once, the wax seal presses, and `Invitación sellada` (`+50 XP`) is earned. **When** the guest activates `Guardar QR`, **Then** `QR guardado` (`+20 XP`) is earned.
5. **Given** an invitation, **When** the guest presses Tab, **Then** nothing is earned; **When** the guest presses an arrow key, drags, or uses the wheel once the book is ready, **Then** `Abriste el cuento` (`+10 XP`) is earned once. A signpost earns nothing, and so does a move while the book is still loading.
6. **Given** several awards at once, **When** they show, **Then** one toast shows at a time, each for the toast time, and the award that raised the level adds `¡Subiste a nivel {n}!`.
7. **Given** a first greeting, **When** the card shows, **Then** the cat's XP and `Tu primer gato` are stored, `Gatos 1/7` shows, and the toasts wait until the card has gone. A cat met before, greeted again in a new round, adds no XP.
8. **Given** progress, **When** a badge's event happens again, **Then** it is not earned twice. Every page that counts found earns `Cuento completo`; the seventh cat earns `Todos los gatos`.
9. **Given** junk, unknown values, or a broken shape under `mia-progress`, **When** the page loads, **Then** the bad data is dropped and the page renders.
10. **Given** the map and the gift box, **When** their pages come into view, before they are found, **Then** they are open, with the address and the QR visible. With reduced motion every object is already open.

### US-16 — Catch yarn and hearts (P2, redesign)

The gate game's rules (section 3, *The guest gate*).

**Independent test:** A pure reducer takes the game, a time step, and the catcher's place, with a seeded random source. A hook reads and keeps the best score.

**Acceptance scenarios:**

1. **Given** a new game, **When** time passes before the start, **Then** it waits; once started it plays for 30 s, and at 0 it is over.
2. **Given** a drop reaching the catch line under the catcher, **When** the game steps, **Then** the score grows by its points (yarn 10, heart 20) times the combo, and the combo grows by one.
3. **Given** a drop that falls past the bottom, **When** the game steps, **Then** the combo is back to 1. The combo never goes above ×5.
4. **Given** a large time step, such as after a hidden tab or sleep, **When** the game steps, **Then** it advances at most 100 ms, so the round does not end at once.
5. **Given** a round ends with a score above the best, **When** it is over, **Then** the best becomes that score and the game flags `¡Nuevo récord!`; the next round's end does not, unless it beats it again.
6. **Given** the same seed, **When** two games step the same way, **Then** their drops match. Drops start inside the side margins, and the catcher stays inside the play field.
7. **Given** nothing, junk, or a negative number stored under `mia-gate-best`, **When** the gate loads, **Then** the best reads 0; a decimal is floored; a smaller or equal score never replaces the best.
8. **Given** reduced motion, **When** the game would render, **Then** there is nothing to start and nothing falls.

## 8. Business rules

- **BR-1.** Two invitations share one room, one place, one clock time, one phone number, one QR, and one cat list on the browser. They do not share a calendar day or a WhatsApp message.
- **BR-2.** Facts live in one content module: a shared block plus two day records, keyed by `n4vk` and `q8lm`. Components read that module. Numbers and colors live in the tuning module (BR-21).
- **BR-3.** The WhatsApp number in the link is `59176632451`. The message is encoded with `encodeURIComponent` and includes that day's date and `16:00`.
- **BR-4.** Confirmation is a handoff to WhatsApp. The site does not record yes, no, names, or headcount.
- **BR-5.** The payment QR is one static image for both days. The site does not create a QR and does not send the guest to a payment processor.
- **BR-6.** Presente leads with presence, then the QR, then the line that the guest chooses the amount.
- **BR-7.** Theme is `dark` or `light`, stored in `localStorage` under its own key, separate from the cats and from the music choice.
- **BR-8.** The event countdown uses that day's start instant in `America/La_Paz`. Saturday is `2026-10-17T16:00:00-04:00`. Sunday is `2026-10-18T16:00:00-04:00`.
- **BR-9.** `n4vk` is Saturday. `q8lm` is Sunday. Every other opening is the gate. The clock never selects a day.
- **BR-10.** No screen shows both dates. Nothing links to the other code. The gate shows neither date.
- **BR-11.** The place line, the city, the map, the confirm control, the gift copy, the QR, `Guardar QR`, the countdown, and the `El lugar`, `Confirmar`, and `El regalo` signposts render only while `now` is strictly before that day's cutoff. They are omitted together. From the cutoff on, the page is in the party-over state.
- **BR-12.** Progress along the book (or, in the flat room, horizontal camera position) maps to the three stages: boceto, tinta, and luz. Landmark text is HTML in every stage. It is not gated on greeting a cat, on reaching a stage, on finding a page, or on a badge; the pages' objects open as soon as their page is in view.
- **BR-13.** The 3D book, roaming, line boil, the battle's wipe, the depth layers, and the gate game yield to `prefers-reduced-motion`: the guest gets the flat room with no canvas, and the gate shows no game. The book also yields to a failed WebGL start, a failure after it starts loading, a first frame that has not come within the load timeout, a lost WebGL context, and a screen shorter than 640 px; the flat room then opens on the guest's page. The pages, the camera, the words, the greets, the battle, and the cat list do not.
- **BR-14.** The cat state is `{ caught: string[], round: string[], rounds: number }` under one `localStorage` key. An id is appended to `caught` once, in first-greet order, and to `round` once per round. Ids come only from the seven in section 3. On load, unknown ids, duplicates, and unreadable data are dropped.
- **BR-15.** `Saludar` is offered only for a cat that is present on that page, noticing the guest, and not in the current round. Loading the page does not greet anyone. Misha and Kira are present only on an invitation, at the family door.
- **BR-16.** The site collects no analytics and sets no tracking cookies. The only `localStorage` keys are:
  - `mia-cats`: the cat state in BR-14.
  - `mia-theme`: `dark` or `light`.
  - `mia-music`: `on` or `off`.
  - `mia-progress`: `{ pages: string[], badges: string[], xp: number }`, the game layer (BR-25). It is written only when something is earned or found. On load, unknown pages and badges, duplicates, and unreadable data are dropped.
  - `mia-gate-best`: a number, the best gate score. Unreadable or negative values read as 0, and only a larger score replaces it.

  If storage throws, the page still renders and the visit simply does not persist.
- **BR-17.** Both days use the pin `-17.73170923809386, -63.15786528996242` and the place wording in section 6.
- **BR-18.** The cast is the seven cats plus the gate toys and the invitation toys in section 3. Skulls, spikes, vests, weapons, guns, and fighting poses are not in the book or on the gate. The one battle is the playful legendary battle (BR-24): its moves are a yarn ball, cuddles, and a purr.
- **BR-19.** At most one audio file plays, looping, mastered quiet. It starts only after the guest turns it on, or, on a later visit if they already did, at the guest's first gesture. A greeting does not play its own sound.
- **BR-20.** The page viewport does not scroll horizontally. The camera moves inside the book (or the flat room) by drag, touch, wheel, and arrow keys. Keyboard focus inside a page brings the focused control into view.
- **BR-21.** Every number and color that tunes the feel lives in one tuning module: sizes, speeds, waits, thresholds, parallax, glide, the QR size, the theme tokens, the feeling colors, the 3D book (camera path, pop-up springs, lights, stages), the battle's numbers, the XP, levels, and badges, the gate game, and the large-screen growth. Components and tests read it. Changing a value there never requires a component change. Every guest-facing string lives in the content module (BR-2).
- **BR-22.** `Jugar otra vez` exists only in the party-over state, on an invitation. It empties `round`, adds one to `rounds`, and keeps `caught`.
- **BR-23.** Every page carries the same share preview: `og:title` and `og:description` from section 6, and an `og:image` that is a 1200×630 JPEG under 300 KB with an absolute URL. The preview names no date and no place. Every page sets `<meta name="robots" content="noindex">`.
- **BR-24.** Nobody loses the legendary battle. The guest's paciencia never goes below 1; the battle ends only with the cat joining or with `Huir`. `Huir` saves nothing. Winning greets the cat through the same pure function as `Saludar` (FR-16). The cat's moves come in a fixed order.
- **BR-25.** XP, levels, and badges are deterministic: no streaks, nothing random, nothing lost. Each badge is earned once. A cat earns its XP only the first time it is ever met. `Jugar otra vez` resets the cat round only. The game layer never gates a fact.
- **BR-26.** The gate game never enters a party and shows nothing about one. It keeps only the best score (BR-16). The two gate sentences stay visible in every phase.

## 9. Functional requirements

- **FR-1.** The system MUST render the landmarks in section 3, omitting Dónde, Confirmar, and Presente when BR-11 says so.
- **FR-2.** The system MUST show the title, the hero line, the verse, the citation, and `Muévete para explorar` on an invitation. In the party-over state, Llegada shows the post-party lines in place of the hero line.
- **FR-3.** The system MUST show the resolved day's date line and `16:00`.
- **FR-4.** The system MUST show the event countdown, following US-6.
- **FR-5.** The system MUST offer `Ver en el mapa` only while the place is visible.
- **FR-6.** The system MUST link confirmation to WhatsApp using BR-3, only on an invitation, and only while the party is current.
- **FR-7.** The system MUST show the QR image or the pending sentence, following US-4, only while the party is current.
- **FR-8.** The system MUST let the guest choose dark or light and restore that choice later, on the gate and on both invitations.
- **FR-9.** The system MUST show the 3D book with its stages, following US-7, falling back to the flat room as BR-13 says, with original cats and the toys in BR-18.
- **FR-10.** The system MUST stay usable from 320px wide through a 2560px monitor, with the HUD, dialogs, and flat-room cards growing on large screens (section 4, *Large screens*). The page does not scroll sideways. The camera moves by mouse drag, touch drag, wheel, and arrow keys, following BR-20.
- **FR-11.** The system MUST expose the theme control, the music control, the signposts, the confirm link, the map link, `Saludar`, `¡A jugar!`, the battle's moves, `Tus gatos`, `Toca para jugar`, and `Jugar otra vez` to keyboard and to a screen reader, with the accessible names in section 6, and MUST bring a focused control inside the book or the room into view.
- **FR-12.** The system MUST build to static files that open locally with `vite preview` for `/`, `/?e=n4vk`, and `/?e=q8lm`.
- **FR-13.** The system MUST keep copy and contact data in the content module from BR-2.
- **FR-14.** The system MUST resolve the opening with the pure function from US-8.
- **FR-15.** The system MUST decide whether the party is over with the pure function from US-5.
- **FR-16.** The system MUST update the cat state only through the pure functions from US-9 and US-13, then persist that result.
- **FR-17.** The system MUST show the gate and its game from US-10 and US-16 whenever US-8 returns the gate.
- **FR-18.** The system MUST offer the music control from US-11 whenever a track file is configured, on the gate and on both invitations.
- **FR-19.** The system MUST show the cats and toys from US-12 on the gate and on the invitation, and MUST let the guest greet only the cats that page is allowed to host.
- **FR-20.** The system MUST read every tunable number and color from the tuning module (BR-21).
- **FR-21.** The system MUST enter the party-over state from US-5 and US-13 at that day's cutoff, without a reload, and MUST offer `Jugar otra vez` following BR-22.
- **FR-22.** The system MUST ship the share preview in BR-23 on every page.
- **FR-23.** The system MUST offer the legendary battle from US-14 for Misha and Kira, following BR-24, and a collectible card for every greeting.
- **FR-24.** The system MUST keep the game layer from US-15 (quest log, pages found, badges, XP, and levels), updating it only through its pure functions, then persisting the result under `mia-progress`.
- **FR-25.** The system MUST paint the book's cover (or, on the gate, the two gate sentences) from `index.html` before any script runs, and MUST keep the 3D book in its own chunk, loaded behind the cover.

## 10. Constraints

### Product

- Static site only. The QR image, once added, is public.
- Guest-facing copy is Spanish, from section 6.
- Code, test names, and this spec are English.
- Timezone: `America/La_Paz` (Bolivia, UTC−4, no daylight saving).
- The spoken place is the Prolongación Beni line in section 6. The map pin remains the coordinates already confirmed.
- The QR image file is still to be added. Until then the pending sentence is shown.
- The ambience track is still to be added. Until then the music control is hidden.
- Clearing site data clears the cat state, the game layer's progress, and the best gate score. A browser may also clear them on its own (see *Coming back*). `Jugar otra vez` starts a new round and does not erase the list or the progress.
- The repository `mia-babyshower` is public. The invite codes, the address, and everything in `docs/` can be read by anyone. The gate is a courtesy, not a secret.
- `ideas/` is in `.gitignore` before the first commit, so the photos never enter git history. The folder stays on disk as a reference.
- After the parties, a commit removes the place, the city, and the map from the content module. Git history keeps them until the hosts purge it, either by recreating the repository under the same name from a clean history or by rewriting history.

### Technical

Versions below are the set chosen on 2026-09-26 after checking peer dependencies. The notes are in `docs/stack-and-resources.md`. No canary or beta. A newer stable release may replace one of these on the scaffold day only if it still satisfies the peers in that document.

| Package | Version to install |
| --- | --- |
| Node.js | 26.9.0, installed with nvm. `.nvmrc` and `engines` pin that version. |
| react / react-dom | 19.2.8. React 19.3.0 is newer and is outside the range React Three Fiber 9.7.0 declares. |
| vite | 8.3.0 |
| @vitejs/plugin-react | 6.1.1 |
| typescript | 6.0.3. TypeScript 7.0.2 is newer and is outside the range typescript-eslint 8.70.0 declares. |
| three | 0.186.0 |
| @react-three/fiber | 9.7.0 |
| @react-three/drei | 10.7.8. Its peers fit: React 19, Fiber 9, `three >= 0.159`. The book uses its `Html` to place the pages in 3D. |
| tailwindcss and @tailwindcss/vite | 4.3.3 |
| vitest | 5.0.1 |
| @fontsource/mystery-quest, @fontsource/alegreya, @fontsource/pixelify-sans | 5.3.0, self-hosted, SIL Open Font License |

- React with Vite, TypeScript in strict mode.
- Three.js through React Three Fiber and drei, for the 3D book: the attic, the book, the paper pieces, the lights, fog, and dust. No game engine. The book is a separate chunk, loaded with a dynamic import behind the HTML cover, so it is not in the first download and never delays the first paint.
- Cats are SVG in every stage and in both rooms. The book places the same seven drawings on its pages as HTML, not a second cast.
- Tailwind CSS 4. Theme tokens are CSS variables fed from the tuning module. No second styling system.
- Vitest and React Testing Library cover the acceptance scenarios that do not need real layout. The manual checks in section 12 cover the rest. No end-to-end suite in this version.
- One `index.html`.
- Vite `base` is `'./'`. One build serves local preview and GitHub Pages. `.github/workflows/pages.yml` publishes `dist` on push to `main`.
- No component kit, no animation library, no router, no state library. Theme, cats, and music are `localStorage` plus React state.

### Quality bar

- Small components: gate, gate game, the book (world, stations, camera rig, lighting), the flat room, pages and their objects, countdown, location, confirmation, gift, collection, cat, card, battle, quest log, toasts, toy, theme.
- The page receives a resolved opening, an instant, and a cat state. URL parsing, the clock, the party-over check, the layout, the stage, the camera path, noticing, greet math, the battle, progress (badges, XP, levels), and the gate game stay in pure functions.
- No magic numbers in components. Every tunable value comes from the tuning module.
- The 3D scene does not import invitation copy. Landmarks do not import Three.js.
- Lint must pass with no disabled rules hiding a problem in new code.

### Accessibility and performance

- WCAG 2.2 AA for contrast, control names, keyboard movement, and reduced motion.
- The page `lang` is `es`.
- At most the seven cats and the invitation toys in section 3 are on an invitation. The gate shows three cats.
- The first paint is the cover (or the gate sentences) from `index.html`, readable before any script runs. Target: on a throttled check (4× CPU slowdown, Fast 3G) the cover is visible in under 2 s.
- The book uses simple geometries and shared materials, at most one light casting shadows (the candle at the door), and a pixel ratio capped at 1.75. A low device gets no shadow map and a cap of 1.25 (see *Three levels*). It renders on demand behind the closed cover — its first frame, then only when something changes — and runs continuously once the cover opens. Its shadow map is redrawn only while the paper that casts it moves. Target: 60 frames per second, 30 at the least.
- The QR is sharp, on a white plate with quiet space around it, at least the minimum QR size, and is not blurred or tinted.
- Landmark text is HTML in every stage. The gate sentences stay readable in every phase of the game.
- The drag surface allows pinch zoom.
- The countdown is not announced by screen readers as it ticks.

## 11. Content module

Shared:

| Field | Value |
| --- | --- |
| Title, hero, verse, move hint | Section 6 |
| WhatsApp number | `59176632451` |
| Gift copy | Section 6 |
| Place | `Av. Prolongación Beni (Entre 6to y 7mo anillo). Calle 12 de Abril S/N` |
| City | `Santa Cruz de la Sierra, Bolivia` |
| Map URL | `https://www.google.com/maps/search/?api=1&query=-17.73170923809386,-63.15786528996242` |
| QR image | `src/assets/qr.png`, detected at build time. Absent until the hosts add the file. |
| Ambience track | `src/assets/audio/ambience.mp3`, detected at build time. Absent until the hosts add the file. |
| Site URL | `VITE_SITE_URL` in `.env`: `https://el-jochi.github.io/mia-babyshower/`. `index.html` uses it as `%VITE_SITE_URL%` for the share preview. |
| Share preview | Section 6 |
| Post-party copy | Section 6 |
| Timezone | `America/La_Paz` |
| Clock time | `16:00` |
| Cats | Section 3 |

Saturday `n4vk`:

| Field | Value |
| --- | --- |
| Link | `/?e=n4vk` |
| Start | `2026-10-17T16:00:00-04:00` |
| Party over from | `2026-10-18T00:00:00-04:00` |
| Date line | `sábado 17 de octubre de 2026` |
| WhatsApp message | Saturday message in section 6 |

Sunday `q8lm`:

| Field | Value |
| --- | --- |
| Link | `/?e=q8lm` |
| Start | `2026-10-18T16:00:00-04:00` |
| Party over from | `2026-10-19T00:00:00-04:00` |
| Date line | `domingo 18 de octubre de 2026` |
| WhatsApp message | Sunday message in section 6 |

### Tuning module

Every value below is a starting value, chosen by judgment before the first build. The hosts tune them by looking at the page. Changing one never requires a component change (BR-21). The tuning module holds more than this table (the book's art, lights, and paper pieces, the cats' rig timings, and the screens' animation timings); these are the values the rules in this document name.

| Group | Name | Starting value |
| --- | --- | --- |
| Screen | Growth of the HUD, dialogs, gate, and flat-room cards | 1× up to `390px` wide, 1.4× at `2560px` and above |
| Room | Landmark slot width | `min(85vw, 420px × screen growth)` |
| Room | Landmark card width | `min(80vw, 380px × screen growth)` |
| Room | Minimum room width | `300vw` |
| Room | Room height | `150dvh` |
| Room | Landmark vertical offset | `10dvh` |
| Camera | Edge margin | `24px` |
| Camera | Arrow key step | `120px` |
| Camera | Signpost glide | at most `400ms` |
| Depth | Far, mid, and near layer speed | `0.25`, `1`, `1.15` |
| Stages | Boceto to tinta, tinta to luz | `0.33`, `0.66` |
| Book | Drag: one screen of drag moves | `0.5` of the book |
| Book | Glide to a page (signpost, arrow key, snap) | `700ms` |
| Book | A page counts as reached within | `0.04` of the book, resting `350ms` |
| Book | Snap after a drag or the wheel | to the nearest page within half the spacing, `250ms` after the wheel stops |
| Book | Pop-up range around a page | `0.18` of the book |
| Book | Field of view: portrait, landscape | `58°`, `42°` |
| Book | Pixel ratio cap | `1.75` (`1.25` on a low device) |
| Book | Cover swing | `900ms` |
| Book | Load timeout before the flat room takes over | `6000ms` |
| Book | Smallest page scale at rest | `0.9` of the design size |
| Book | Camera height and look height above a page's foot | `1.6`, `1.6` world units |
| Book | Shortest screen for the book | `640px` tall |
| Moods | The four looks | Saturday (night) and Sunday (dusk), each in Claro and Oscuro: mixes of the tokens in section 16 |
| Level 2 | Pixel ratio cap | `1.25` (`1` on a low device) |
| Level 2 | Fade-in when the live attic arrives | `600ms` |
| Level 2 | Sideways drift and turn across the flat room | `±1.6` world units, `±0.07` rad |
| Level 3 | Parallax travel across the flat room | `160px` times each layer's rate, `0.2` (the wall) to `0.85` (the floor) |
| Device tier | A low device | `2` GB of memory or less, or `2` cores or fewer; only where the browser reports its memory |
| Device tier | On a low device | No shadow map, half the stars, fireflies, and dust, ambient motion at `0.6` |
| Performance | Draw calls per frame | At most `100` in the book, `60` at level 2. One accepted exception: on desktop, the frames that redraw the candle shadow while a page folds reach about `105`; phones stay at or below about `85` |
| Family | Fold-up, walk-in, and stagger on the card | `700ms`, `1100ms`, `200ms` |
| Family | Dad's height in the 3D doorway | `1.45` world units |
| Noticing | Middle area of the viewport | `60%` |
| Noticing | Camera counts as still below | `40 px/s` |
| Noticing | Wait: Común, Poco común, Legendario | `500ms`, `1500ms`, `2500ms` |
| Noticing | Misha's wait while music plays | `1200ms` |
| Noticing | Susto's rush speed | `600 px/s` |
| Noticing | `Saludar` stays after the cat leaves the area | `1000ms` |
| Noticing | Middle area on the gate | `94%` |
| Card | Stays after a greeting | `4500ms` |
| Battle | Energy and paciencia | `100`, `100` |
| Battle | Lanzar ovillo, Mimos, Ronroneo | `35`, `25`, `20` |
| Battle | Ronroneo's boost to the next move | `1.5×` |
| Battle | A hit counts as very effective from | `35` |
| Battle | The cat's moves, in order | `12`, `15`, `10`, `18` |
| Battle | Paciencia floor, and what the head-bump restores | `1`, `30` |
| Game layer | Level thresholds | `0`, `60`, `180`, `360`, `600` XP |
| Game layer | Badge XP | Section 3, *The game layer* |
| Game layer | Cat XP: Común, Poco común, Legendario | `20`, `40`, `100` |
| Game layer | A toast stays | `2800ms` |
| Gate game | Round length | `30000ms` |
| Gate game | A new drop every | `650ms` |
| Gate game | Yarn, heart | `10`, `20` points |
| Gate game | Share of drops that are hearts | `30%` |
| Gate game | Combo cap | `×5` |
| Gate game | Largest time step | `100ms` |
| Gate game | Mimo cheers from | combo `×3` |
| QR | Minimum size | `220px` (drawn at `245px` in the book, so a page at its smallest scale shows `220px`) |
| Colors | Theme tokens | Section 16 |
| Colors | Feeling colors | Section 5 |

## 12. Traceability

| Id | Proves | Test focus |
| --- | --- | --- |
| US-8, FR-14, FR-17, BR-9, BR-10 | Only the two codes open a party | `resolveInvite` for both codes and for missing or junk codes; gate has no date |
| US-10, US-12, FR-17, BR-26 | The gate is a screen with cats and a game | Ready, playing, and over with both sentences visible; the catcher Luz steps aside while playing; no game with reduced motion; Luz, Mimo, and Susto are present; Bram is absent |
| US-1, FR-1, FR-2, FR-3, FR-10 | The room can be read | Landmarks, verse, one date, signpost target, no overlapping cards in the layout function |
| US-1, FR-11, BR-20 | Keyboard and screen reader | Focus brings a control into view; controls have the accessible names in section 6 |
| US-2, FR-8, BR-7 | Theme choice sticks | Toggle and its own storage key; contrast of every token pair in use |
| US-3, FR-6, BR-3 | WhatsApp names the right day | Exact decoded message; absent on the gate |
| US-4, FR-7, BR-5, BR-6 | One shared QR | Image or pending sentence; no QR library |
| US-5, FR-5, FR-15, FR-21, BR-11 | Party current, then over | Map href before the cutoff; address, confirm, QR, countdown, and their signposts absent after it; switch without reload |
| US-6, FR-4, BR-8 | Countdown math | Fake timers against each start instant; no countdown after the cutoff |
| US-7, FR-9, FR-25, BR-12, BR-13 | Sketch, ink, then light, in a book that never gates the facts | Stage from position; the cover first, the world waiting behind it; the flat room when the world fails, stalls, loses its WebGL context, or the screen turns too short, on the guest's page; the flat room with no canvas with reduced motion or without WebGL, and over the live attic on a short screen; the page scale floor and the book's QR size; the preload decision; the first paint in `index.html` picks the cover, the post-party cover, or the gate sentences |
| US-9, FR-16, FR-19, BR-14, BR-15 | Cats persist and stay distinct | Greet once per round; noticing waits; bad stored data dropped; Misha and Kira are `Legendario` and absent from the gate; lines hidden until greeted |
| US-13, FR-21, BR-22 | Relive the party | Post-party lines; `Jugar otra vez` empties the round and keeps `caught`; absent before the cutoff and on the gate |
| US-11, FR-18, BR-19 | Ambience waits for a yes | No control without a file; paused until activated; starts at the first gesture on a later visit; refused playback shows `Activar música` |
| US-14, FR-23, BR-24 | A battle nobody loses | Moves, the fixed answer order, the floor at 1, the win and its card, `Huir` saves nothing, Escape, one dialog at a time, the live region |
| US-15, FR-24, BR-25 | Pages, badges, XP, and levels | A page counts once the camera rests on it, and in the book only once the cover is open; nothing counts before the book is ready; badges once; cat XP once; levels; toasts one at a time; junk progress dropped; objects open before a page is found |
| US-16, BR-26 | The gate game's rules | Catch and combo, the miss, the time-step clamp, the best score and the record, the seed, the stored best |
| BR-16 | Storage can fail, and only five keys | The page renders when `localStorage` throws; the keys are `mia-cats`, `mia-theme`, `mia-music`, `mia-progress`, and `mia-gate-best` |
| FR-20, BR-21, FR-10 | One tuning source, and large screens | Tests import values from the tuning module; the screen growth and the flat room's growing card caps; the head's growing pixel matches the tuning |
| FR-22, BR-23 | Share preview | `index.html` has the `og:` tags, an absolute image URL, no date, and `noindex` |
| FR-12, FR-13 | Static build, one content source | Preview serves `/` and both query links |

How a cat moves, how the 3D book looks, and how the pages frame on large screens are reviewed by looking at the page, with screenshots at 390, 768, 1440, 1920, and 2560 px in both themes. They are not asserted with screenshot tests.

Manual checks, on real phones, before each release:

- iPhone Safari, Android Chrome, and a link opened from inside WhatsApp.
- At 320px, 390px, tablet, desktop, and 2560px widths: landmark text is readable, actions are tappable, and the page does not scroll sideways (US-1 AC3).
- The book opens and moves smoothly on a mid-range phone, and a phone with reduced motion turned on gets the flat room.
- The QR scans from a second phone, and a saved copy opens in a bank app (US-4).
- The WhatsApp message with the link shows the preview card (BR-23).
- The door reads as dad, mom, Miguelito, and Mia, with Misha and Kira beside them (US-12 AC2).

## 13. Success criteria

- **SC-1.** A guest with a real link can say the verse, the date, 16:00, and the address after moving through the book or tapping the signposts, without greeting a cat, finding a page, or earning a badge.
- **SC-2.** That page never shows the other day's date.
- **SC-3.** `/` and any unknown `e` show the special-guest sentences, the gate game, and the gate cats, and never a party, on every date.
- **SC-4.** From the midnight after a day's party, that page has no address, no map, no confirm button, no gift QR, and no countdown. It thanks the guest, and the book can still be explored.
- **SC-5.** Confirm opens WhatsApp to `59176632451` with that day's message, in one tap.
- **SC-6.** Greeting a cat adds that cat, with a different line and a rarity, and that cat is still there after a reload and on the other link.
- **SC-7.** The end of an invitation shows dad, mom, Miguelito, and Mia as faceless paper silhouettes, told apart by curly or straight hair, with Misha and Kira happy beside them. The gate does not show that door.
- **SC-8.** With reduced motion, without WebGL, on a screen shorter than 640 px, or when the book fails, stalls, or loses its WebGL context, the flat room shows every landmark that belongs at that clock, and a greet still saves.
- **SC-9.** On a phone, a finger can move through the book (and the flat room both across and down), and a mouse can do the same on a computer.
- **SC-10.** `npm test` and `vite preview` pass on Node 26 for `/`, `/?e=n4vk`, and `/?e=q8lm` before any GitHub setup.
- **SC-11.** After the party, a guest can press `Jugar otra vez` and meet every cat again, and the cats met before stay in **Tus gatos**.
- **SC-12.** A WhatsApp message with either link shows the preview card with the title and the image, and no date.
- **SC-13.** Changing a number or color in the tuning module changes the page without touching a component.
- **SC-14.** A guest can challenge Misha or Kira, never lose, and either win the cat (with its `Legendario` card) or leave with `Huir`, saving nothing.
- **SC-15.** A guest sees `Páginas`, `Gatos`, their level, and their XP on an invitation, and earns each badge once.
- **SC-16.** On a throttled check (4× CPU slowdown, Fast 3G), the cover is readable in under 2 s, and the 3D book arrives behind it.

## 14. Assumptions

- "The param is not found" includes a missing `e` and any value other than the two codes. Junk links do not open Saturday or Sunday.
- The party-over state starts at the midnight after the party. The address stays through the evening.
- One cat state per browser, shared by the gate and both links.
- The numbers and colors in the tuning module are starting values. The hosts tune them after the first build.
- Seven cats is the whole cast. Rarity is fixed, not random. Misha and Kira are the only `Legendario` cats.
- Misha and Kira stay visible and happy at the door on every invitation visit. Greeting them adds them to **Tus gatos**. The door does not wait for other cats.
- Dad, Miguelito, and Mia are the curly silhouettes. Dad’s hair has grown since `ideas/dad.jpg` and tends toward an afro, so his outline is the tallest and fullest. Mom is the straight-haired silhouette. Miguelito and Mia are curly at a child’s height and at the smallest height. No faces are drawn.
- Greeting cannot fail. A cat who is not ready simply does not offer `Saludar` yet. The legendary battle cannot be lost.
- The celebration is visual. The only sound is the one track the hosts provide, and only after the guest turns it on.
- The map pin stays on the coordinates already confirmed. Only the words of the address changed.
- The first-visit theme follows the OS, then the guest's choice wins.
- Parent names are omitted. The hero line is the parents speaking to the guest. Both parents love cats. The rock stays in the pick, the note, and the light.
- The verse is the example's wording, including "Jehová" and the citation Salmo 127:3.
- Original art only. Inside Out and Pokémon describe feelings and the pleasure of meeting someone rare. They do not supply drawings.
- The camera-inside-a-viewport is how "scroll up, down, left, and right" works on a phone without a sideways page scrollbar. In the book, both directions move along its path.

## 15. Still open

These arrive later and do not change the rules:

1. The QR image file. The hosts create it without a fixed amount, reusable, and expiring after 18 October 2026 or never.
2. The ambience track, mastered quiet.
3. The GitHub repository `EL-JOCHI/mia-babyshower`. The account already serves Pages at `el-jochi.github.io` (the Miguelito invitation). The workflow file is already in the project. After the repo exists, set Pages to GitHub Actions, as `docs/stack-and-resources.md` describes.
4. After the parties, the commit that removes the address.

Inspiration images for the cats were expected in `images/` and are not in the project yet. When they are added, silhouettes can follow them.

The links to send are `https://el-jochi.github.io/mia-babyshower/?e=n4vk` (sábado) and `https://el-jochi.github.io/mia-babyshower/?e=q8lm` (domingo). Anything else is the guest gate.

## 16. What the implementer builds

`docs/requirements.md` is the behavior. `docs/stack-and-resources.md` is the versions and the asset list. An implementer does not invent copy, dates, codes, cat names, rarities, or the WhatsApp number.

The page `lang` is `es`. The document title is `Baby shower de Mia`.

The camera starts on Llegada. The book's camera path, room size, layout, camera margin, glide time, parallax, noticing waits, the battle's numbers, XP, and every other number are starting values in the tuning module (section 11).

Color tokens (in the tuning module), Burton pink noir (design §3):

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#140E14` | The dark field, outlines, text in the light theme |
| Bone | `#F1E7D6` | Parchment, the light field, text in the dark theme |
| Rose | `#E08AAB` | The accent: glows, hearts, buttons, accent text in the dark theme |
| Deep rose | `#BB3267` | Accent text in the light theme |
| Plum | `#3C1F3D` | Panels in the dark theme, shadows, fog |
| Candle | `#F2B84B` | Light sources, legendary gold |
| Page rose | `#A3285A` | Accent text on the parchment pages, in both themes |
| Paper white | `#FFFFFF` | Fresh paper: pinned notes, the letter, the QR plate |

The feeling colors are in section 5. Each theme maps these tokens to its field, text, accent, panels, lines, buttons, and pages; a unit test holds every text pair to AA (US-2 AC4).

The four looks (section 3, *The moods*) are mixes of these tokens and the feeling colors, in the tuning module. They add no new colors, and the paper diorama receives them as CSS variables generated into the head.

Scratch, throw, and startle reuse the cat's playing picture. No extra pose files.

Share preview: `public/og-image.jpg`, 1200×630, a JPEG under 300 KB. It shows the title in Mystery Quest and the seven cats on the ink field, in their feeling colors, with no date and no place. The implementer makes it from the site's own art. The favicon is a small cat in the same palette. `theme-color` is `#140E14`.

### Release plan

The links never change, so the site keeps improving after they go out. Every push to `main` that passes the workflow's tests updates the site behind the same two links. Most guests open the link once, the night they get it, so what is live that night is what most guests see; a guest who opens it again later sees the newest version.

**R1 — live on 27 September 2026, before the links go out that night.** The links go out that night whatever else is ready.

1. The repository `mia-babyshower`, with `ideas/` in `.gitignore` before the first commit. Pages set to GitHub Actions. The site URL in `.env`.
2. The content module, the tuning module, and the pure functions with tests: invite code, party over, countdown, layout, stage.
3. The guest gate: the two sentences and the gate cats.
4. The room: the camera by drag, wheel, and arrow keys; the landmark cards; the signposts; theme; reduced motion; focus that brings a control into view.
5. The facts: date, `16:00`, countdown, address and map, WhatsApp, the QR or its pending sentence, `Guardar QR`.
6. The share preview, the favicon, and `noindex` (BR-23). WhatsApp freezes the preview when a message is sent, so this must be live before the links go out.
7. The manual checks in section 12.

The first build, already on `main`, covers R1 and more: the room with its earlier pixel, color, and 3D eras, the gate's earlier count loop, the seven cats, **Tus gatos**, the family door, and the party-over state. The redesign below replaces those eras and the count loop.

**The redesign — the pop-up book.** The 3D book with its cover, camera path, pop-up pages, and boceto, tinta, and luz; the Burton pink noir look, fonts, and textures; the rigged cats with line boil; the collectible cards and the legendary battle; the quest log, badges, XP, and levels; the gate game; large screens; and the flat room as the fallback (US-7, US-10, US-14, US-15, US-16). It ships by pushing `main` once `npm test`, the build, and the manual checks pass: before the links go out if it is ready, and otherwise as a later push that updates the site behind the same links. Polish continues after it ships.

**R2 — before the first party, 17 October 2026.** The party-over state with the post-party lines and `Jugar otra vez` must be live before `2026-10-18T00:00:00-04:00` (built in the first build and kept by the redesign). The QR image, once the hosts add it.

**R3 — optional, before the first party.** Music, once the track arrives.

**After the parties.** The commit that removes the address (section 10).

`npm test` and `vite preview` of `/`, `/?e=n4vk`, and `/?e=q8lm` are the local finish line for each release. Pushing `main` is what publishes, once Pages is set to GitHub Actions.
