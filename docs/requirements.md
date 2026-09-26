# Mia's Baby Shower — Requirements

**Status:** Draft  
**Created:** 2026-09-23  
**Updated:** 2026-09-26  
**Kind:** Product specification (spec-driven development)  
**Release:** R1 goes live on 2026-09-27. The links go out that night. The parties are on 17 and 18 October 2026. Section 16 has the release plan.  
**Reviewed:** 2026-09-26 in `docs/requirements-review.md`. The host decisions from that review are applied here.

This file is the source of truth for what the site is. Later documentation, tests, and code have to match it. A requirement that is not written here is not in scope. A test that does not trace to a requirement here does not belong in the suite. Code that does not serve a requirement here does not get added.

## 1. Purpose

Build two public web invitations for **Mia's baby shower**, from one codebase. The shower is split across two days, one group of guests each day. Each group receives its own link. A guest who opens a real link sees only that day.

Someone who opens the site without one of those two codes does not see a party. They see a guest gate: a continue screen that says the invitation is for special guests and must be opened with the link they were sent. Cats still live on that screen. They play. A few of them can be met. The date, the place, WhatsApp, and the QR stay off it.

The invitation is a room larger than the phone. The guest moves through it up, down, left, and right, with a finger or a mouse. Landmarks hold the verse, the date, the place, WhatsApp, and the QR, in that order from left to right, so the facts are easy to find. Cats roam the same room, play with things, and can be greeted. A greeted cat stays in **Tus gatos** on that browser.

The room begins as pixels and becomes simple 3D as the guest moves toward the gift, in the spirit of Evoland and of Pokémon from Red through Legends: Arceus. Greeting a cat is the Pokémon feeling: you notice who they are, they are not all the same, and some are harder to meet. There is no battle and no ball.

Mom and dad love cats. That is the world. Rock is a detail: a pick, a note, a pink spotlight. Mia is the princess they are waiting for.

At the far end of the room, the family comes through a door as shadows: dad, mom, Miguelito, and Mia. Misha and Kira, the two cats who already belong to that family, are beside them and happy. The scene is presence. It is not a farewell.

After a day's party is over, that page no longer shows the address, the map, the countdown, the confirm button, or the gift QR. The room, the cats, and the door stay. The page thanks the guest, who can relive the moment and meet the cats again.

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
| `/?e=n4vk` | Saturday 17 October 2026, 16:00, the full room |
| `/?e=q8lm` | Sunday 18 October 2026, 16:00, the full room |
| `/`, a missing `e`, or any other `e` | The guest gate. Cats and **Tus gatos**. No date, no place, no WhatsApp, no QR. |

The calendar does not choose a day. A bare GitHub Pages address is the gate, on every date, including years later.

The code is the first `e` in the query string. Spaces around it are ignored, and upper or lower case both work: `N4VK` opens Saturday. Other query parameters are ignored.

### The guest gate

This is the continue screen, in the shape of an old arcade attract loop, with none of the fighting. It is one screen, with no camera to move.

- The sentences in section 6 stay on screen for the whole loop.
- A count runs from `9` down to `0`, about one second each.
- At `0`, a short finale plays: hearts, stars, and a thunder bolt around the cats already in the room. No impact, no opponent, no "you lost".
- The count starts again at `9`. There is no button that enters a party.
- Luz, Mimo, and Susto wander, play with the yarn, the box, and a heart, and can be greeted here.
- Reduced motion shows the two sentences and still cats. The count does not run. Greeting still works.

### The room

On a real invitation the camera starts at **Llegada**. Landmarks sit left to right:

1. **Llegada** — title, the hero line, and `Muévete para explorar`.
2. **Palabra** — Salmo 127:3, the same verse as the example invitation.
3. **Cuándo** — that day's date, `16:00`, and the countdown.
4. **Dónde** — the address and `Ver en el mapa`. Only until the party is over.
5. **Confirmar** — WhatsApp, with a message that names this day. Only until the party is over.
6. **Presente** — presence first, then the shared QR. Only until the party is over.
7. **Familia** — the doorway. Four shadows enter. Misha and Kira are with them.

Landmark names are internal names for this spec and the code. They are not shown on the page. The signposts carry the visible labels.

The room is taller and wider than the screen. Section 4 gives its size and where each landmark sits. Cats and toys occupy the space around the path. A passing heart or star may cross a card for a moment. Nothing stays on a landmark's words.

Signposts stay on screen: `Inicio`, `La fecha`, `El lugar`, `Confirmar`, `El regalo`, `La familia`. `Inicio` leads to Llegada. Activating one glides the camera to that landmark. A signpost is absent when its landmark is absent. The guest never has to hunt for the invitation or for the door.

A theme control, the music control, and `Tus gatos` stay fixed on screen on the gate and on both invitations. The theme offers **Oscuro** and **Claro**. `Confirmar por WhatsApp` and `Ver en el mapa` live inside their landmarks and move with them.

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
- Nothing says the address was removed.

Between `16:00` and midnight on the party day, the countdown reads zero.

The page checks the clock every second. If the page is open at the cutoff, the party-over state applies without a reload.

### The cats

Seven cats. Each one has a feeling, a rarity, a way of moving, and a sentence you learn only after they stay. The feelings follow the idea of Inside Out: a person is many moods, and you can tell them apart. The drawings are original. They are not those characters.

| Id | Name | Feeling | Rarity | Where they appear | What they do | Line once they stay |
| --- | --- | --- | --- | --- | --- | --- |
| `luz` | Luz | Alegría | Común | Gate and invitation | Bats the countdown so a number wobbles, chases the heart, pounces | Siempre encuentra algo que perseguir. |
| `mimo` | Mimo | Ternura | Común | Gate and invitation | Sleeps on the corner of a card, slow blink, comes if you wait | Le gusta que te quedes un rato. |
| `susto` | Susto | Temor | Poco común | Gate and invitation | Startles at nothing beside a button or the ticking count, then peeks back | Se asoma cuando el mundo está en calma. |
| `bram` | Bram | Ímpetu | Poco común | Invitation | Scratches the edge of the countdown, throws the guitar pick, then flops | Hace ruido y después se queda. |
| `nana` | Nana | Delicadeza | Poco común | Invitation | Sits on the QR frame, sniffs it, steps off the code | Elige un solo lugar, y ese es el suyo. |
| `misha` | Misha | Calma | Legendario | Invitation, at the family door | One slow scratch on the door frame, tail up. Notices you sooner if the music is on | Está en calma, y está en casa. |
| `kira` | Kira | Asombro | Legendario | Invitation, at the family door | Bats a star off the door, watches it fall, then comes closer | Mira la puerta, y se queda cerca. |

### Playing with what is on screen

The cats play with the things the guest can already see. On the invitation those things are the countdown, the verse card, the QR, the buttons, the door, and the invitation toys: the heart, the guitar pick, and the star on the door. On the gate they are the continue count, the two sentences, and the gate toys: the yarn, the box, and the heart.

Typical cat acts, and no others:

- **Scratch.** Claws on the edge of a card, the countdown frame, or the door. The marks fade. They never cut through letters.
- **Throw.** A paw knocks the heart, the star, or the guitar pick a short way. The QR can tilt. The object comes back to its place.
- **Scare at nothing.** Susto freezes and jumps at an empty spot, then peeks back. Nothing is there. No monster.

The guest can start a reaction by tapping the countdown, the QR, the verse card, or the gate count. The cat assigned to that object does the act. If that cat is not on the page, nothing plays. Another cat does not take the act.

| What was tapped | Cat | Act |
| --- | --- | --- |
| Invitation countdown, or the gate count | Luz | Bat a number. Bram, on the invitation only, may also scratch the frame. |
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

- When a cat is noticing the guest, `Saludar` appears on that cat. *Noticing* below says when.
- Activating it adds that id to the current round and, the first time ever, to **Tus gatos**. It shows `Se quedó contigo: {name}.`, the rarity, and their line.
- A cat already in the current round does not offer `Saludar`. The list never holds a second copy.
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

**Tus gatos** opens over the room without leaving it. It is a dialog: focus moves into it, `Escape` closes it, and focus returns to the `Tus gatos` control. It shows `{n} de 7`, the number of cats in the current round. Cats ever greeted show name, rarity, and line, with a heart when they are in the current round. The others show a silhouette, the rarity, and `Aún no se acerca`. Misha and Kira are marked `Legendario`. From the second round on, it also shows `Vuelta {n}`.

Playing again:

- `Jugar otra vez` exists only after the party is over, inside **Tus gatos**. The gate does not have it.
- Activating it starts a new round. The current round empties, the round number goes up by one, and every cat can be greeted again.
- Cats already met stay in **Tus gatos** with their lines. Nothing is forgotten. The count starts again at `0 de 7`.

The cat state is stored in `localStorage` under one key, shared by the gate and both invitations:

`{ caught: string[], round: string[], rounds: number }`

- `caught` holds every cat ever greeted, in the order they were first greeted. It never shrinks.
- `round` holds the cats greeted in the current round.
- `rounds` is the current round number, starting at 1.

Before the party is over there is only one round, so `round` holds the same ids as `caught`. There is no server and no account.

What this loop is: cats you can tell apart, a greeting that answers immediately, and a list that is still there tomorrow.

What this loop is not: notifications, streaks that punish a missed day, random prizes, a battle, a capture that can fail and reset, or anything that asks the guest to fight, shoot, or lose.

### The family door

**Familia** is the last landmark, past the gift. It is on both invitations. It is not on the gate.

A lit doorway. Four shadows come through it, far enough apart that the hair reads:

| Shadow | Who | Outline |
| --- | --- | --- |
| Tallest curly | Dad | A fuller afro than `ideas/dad.jpg`. That photo is about six months old and shows a shorter rounded cap. The shadow uses the hair now: higher and wider, a soft round afro of curls. Not straight, and not the short cap in the photo. |
| Tall straight | Mom | Straight hair, no curls |
| Child | Miguelito | Shorter than the parents, curly hair |
| Smallest | Mia | The smallest shadow, curly hair |

Misha and Kira are beside the group, not inside a shadow. They read as cats, close, tails up, happy. They are the same two legendary cats the guest can greet. The people stay silhouettes. No faces, no costumes, no bows on the people.

The line under the door is `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`

Nothing on the door says they are gone. The builders' note is this: Misha and Kira are the cats mom and dad had, and they died a couple of years ago. On the page they are here, with the family, glad. No grave, no dates, no ghost, no fading away.

Dad’s shadow is the curl type in `ideas/dad.jpg`, grown out. The photo is about six months old, so the outline is fuller and tends toward an afro: taller and wider than that picture. The face is not drawn. `ideas/IMG-20260926-WA0000.jpg` is a black cat with a pink bow, and `ideas/IMG-20260913-WA0018(1).jpg` is a cat with a stroller. Those two are cat references, not the family.

### Reference

[miguelito-baby-shower](https://github.com/EL-JOCHI/miguelito-baby-shower) supplies the verse and the shape of the facts (date, map, WhatsApp, gift). It is not the room.

Verse, same wording as that site: “Los hijos son una herencia de parte de Jehová.” (Salmo 127:3).

WhatsApp number, same as that site: **+591 76632451**, written in the link as `59176632451`.

Leave behind: its stacked cards, its palette, its fonts, its bow-and-pastel art, its English title, its generated QR payload, and the second WhatsApp button about clothing sizes.

The room takes its behavior from films and games, and copies neither art nor text:

- **Evoland.** Moving across the room changes the medium, from pixels to color to a simple 3D world.
- **Pokémon**, from Red, Blue, and Yellow, through Gold, Silver, and Crystal, to Legends: Arceus. You move through a place, you meet creatures who are not copies of each other, and the rare ones take longer. The list is a tiny dex. There is no battle.
- **Inside Out.** Each cat is one feeling you can recognize from how they move. Joy rushes. Tenderness waits. Fear peeks. The picky one chooses a throne. The calm one barely stirs. Wonder watches closely.
- **An arcade continue screen**, for the gate only. A visible count, then a finale, then the count again. The finale is hearts, stars, and thunder. No bout and no weapons.

Host photos in `ideas/` set the black, pink, cat, and stroller. An `images/` folder was named as further inspiration and is not in the project yet. When those files arrive, silhouettes can follow them. Names, feelings, rarities, and rules stay as written here unless the hosts change them.

### Out of scope

- Accounts, an RSVP database, forms that save answers, email delivery, and any progress stored off the device.
- Taking or recording payments. The site only displays a QR image.
- A gift registry, a suggested amount, a bank name, or an account number.
- A day picker, combat, weapons, guns, an inventory of items, a blog, a photo gallery, or a playlist. One ambience track is in scope. A library of songs is not.
- Skulls, spikes, leather vests, chains, and other stock metal costume pieces.
- Nintendo, Capcom, or Pixar characters, tiles, names, or sounds.
- Generating a QR from a payment string.
- Creating the GitHub repository. The hosts create it as `mia-babyshower`, public. The Pages workflow is already in `.github/workflows/pages.yml`. Turning on Pages in the repository settings happens when that repository exists. The steps are in `docs/stack-and-resources.md`.

## 4. How the room moves

The page itself does not grow a sideways scrollbar. One viewport holds the room. The camera moves inside it.

The viewport height is `100dvh`, so the collapsing mobile address bar does not jump the room. `100vh` is only a fallback where `dvh` is missing.

Room size and layout (starting values in the tuning module):

- A landmark slot is `min(85vw, 420px)` wide. A landmark card is `min(80vw, 380px)` wide.
- The room is `max(300vw, N × slot)` wide, where N is the number of landmarks on that page: 7 while the party is current, 4 after. A 360px phone gets a room of about 2140px. A 1440px desktop gets 4320px.
- The room is `150dvh` tall.
- Landmark centres are spaced evenly across the room width, in the order of section 3. Llegada sits on the middle line. After it, landmarks alternate 10dvh above and 10dvh below that line.
- On a phone, the edge of the next card is already in view from Llegada.
- The camera cannot travel more than 24px past the room's edges.

The drag surface of the room uses `touch-action: pinch-zoom`, so one finger moves the camera instead of scrolling the page, and two fingers can still zoom. `html` and `body` use `overscroll-behavior: none`, so the document does not pull to refresh or chain a scroll. Buttons, links, and `Guardar QR` use `touch-action: manipulation` so they still receive taps. The viewport meta does not disable zoom. A system back-swipe from the screen edge is outside what CSS can turn off.

### What the guest does

- Drag with the mouse, or with one finger, to move in any direction.
- Use the wheel or a trackpad to move vertically, and shift-wheel or a horizontal swipe to move sideways.
- Use the arrow keys to move as well. Each press moves the camera 120px.
- Tap a signpost to glide to that landmark.
- Tap or drag a toy. Tap `Saludar` when a cat offers it.
- The theme control, the music control, and `Tus gatos` stay fixed on screen while the room moves. `Confirmar por WhatsApp` and `Ver en el mapa` are ordinary links inside their landmarks.
- When a control inside the room receives keyboard focus, the camera glides so that control is in view.

Llegada shows `Muévete para explorar`. The next landmark is already in view at the edge, so the direction of the party is obvious.

### Depth while moving

Moving the camera moves several layers at different speeds, so the room feels deep. No extra library. The same camera position drives the layers.

| Layer | What is on it | How it moves |
| --- | --- | --- |
| Far | Field color, a soft pink glow, a few stars or pixels | Slowest. About a quarter of the camera travel. |
| Mid | Landmark cards, the countdown, the QR, the door, and the cats and toys that sit on them or play with them | With the camera, one to one. This is the page the guest reads. |
| Near | A heart, a star, or a pixel passing close. Decoration only. | Slightly faster than the camera, so they slip across the cards. |

Cats stay on the mid layer, so a cat sitting on a card stays on that card while the camera moves. The near layer never covers the words or the QR code for more than a moment, and the rules in **Playing with what is on screen** still put them back. In the 3D era the far layer is the Three.js space. The cards and the cats stay HTML and SVG on top.

`prefers-reduced-motion: reduce` turns the speed difference off. Every layer moves with the camera at the same speed. The guest can still move the camera.

### Three eras

Horizontal camera position is the camera's left edge divided by (room width − viewport width). It runs from `0` at the left end of the room to `1` at the right end, where Familia is. The era follows that number. Vertical movement does not change the era. The thresholds `0.33` and `0.66` are starting values in the tuning module.

| Position | Era | What it looks like |
| --- | --- | --- |
| `0` to `0.33` | Pixel | Top-down, chunky pixels, black, white, and one pink. Hearts, stars, yarn, and the cats. |
| `0.33` to `0.66` | Color | The same room, with the full pink-and-black palette and a thunder bolt. |
| `0.66` to `1` | 3D | A simple Three.js space behind the cards: a stroller with a small pink bow, a crown, a pink spotlight, floating hearts and stars, one guitar pick. The cats stay the same SVG drawings on top. Landmark text stays HTML on top of the canvas. |

When landmarks are omitted, the room is narrower and the eras still span its whole width.

In the pixel era, every cat accent renders as the one pink or as white. The accents arrive with the color era.

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

### When motion or WebGL is unavailable

`prefers-reduced-motion: reduce` keeps the same room and the same camera. Every layer moves at the camera's speed, so there is no depth. Cats are still pictures. They do not roam, scratch in a loop, or throw things on their own. A tap on the countdown or the QR may play one small settle, then stop. `Saludar` still works, with the same noticing rules. Signposts jump to their landmark instead of gliding. The era still follows the camera position, but there is no canvas: the 3D part of the room keeps the color era's look. The gate count does not run.

If WebGL cannot start, the pixel and color drawing still render, and Presente keeps its HTML without the canvas.

### Coming back

The next visit loads **Tus gatos** from `localStorage`. Cats greeted in the current round still show their heart. Years later the place is gone, and the room and its cats are still there to meet.

The saved list is best effort. A browser may clear it on its own: Safari does so after 7 days of use without a visit, and private windows and in-app browsers may not keep it.

## 5. Visual identity

Color and character come from:

- `ideas/IMG-20260913-WA0012.jpg` — black field, magenta light, blush pink, cat and stroller.
- `ideas/IMG-20260913-WA0017(1).jpg` — the round badge. Reference only.
- `ideas/IMG-20260913-WA0018(1).jpg` — a black cat and a stroller, drawn as a pink line.
- `ideas/dad.jpg` — dad, about six months ago. Short, dense curls. The shadow is that curl type grown toward an afro, fuller than the photo.
- `ideas/IMG-20260926-WA0000.jpg` — a seated black cat with a pink bow. A cat drawing, not a portrait of dad.

The words "Mia's Baby Shower" are not on the site. The title is **Baby shower de Mia**.

The world is cats. Rock is the pick, the note, and the spotlight, not a costume. Safe and recognizable beside the cats: heart, star, thunder, crown, music note, guitar pick. A guest cannot see a skull, a spike, a vest, a weapon, or a fight.

Each cat is recognizable at a glance: a different silhouette, a different accent color, and one loop that belongs only to them. Luz is never still. Mimo is round and low. Susto is small and half-hidden. Bram is the one with the pick. Nana sits on the QR frame. Misha is long and calm, close to the door. Kira sits by that same door and watches the family come in.

### Generated look and behavior

Cats, toys, and the family shadows are made for this site. A picture that does not match this section does not ship. The implementer draws them. There is no separate art delivery.

The default is inline SVG, or CSS shapes, one per cat, using that cat's accent. The playing, noticing, and staying states are the same drawing with a small change (pose, heart). Scratch, throw, and startle reuse that playing drawing. Exported PNGs are allowed only when they already match this section. They are not required.

Family shadows are drawn as SVG paths. They are not a photograph run through `brightness(0)` or a similar filter. Filtering `ideas/dad.jpg` would keep a face, and the door has no faces. The photo is only the curl reference.

Shared cat look:

- One style for all seven. Big simple eyes, a small pink nose, pink inner ears, a black or near-black body, as in `ideas/IMG-20260926-WA0000.jpg` and `ideas/IMG-20260913-WA0018(1).jpg`. Mimo is the one exception: a blush body.
- Readable as a silhouette at about 64 pixels. No tiny patterns that disappear on a phone.
- One accent color per cat, from the table below. The accents are starting values in the tuning module. No other colors on a cat.
- No text in the image. No photo texture. No copied game or film character.
- No skulls, spikes, vests, or weapons. Bows stay light: Mimo alone wears a small bow.
- Three states, same cat in each: playing, noticing the guest, and staying (a small heart). The noticing state is when `Saludar` may appear.

| Cat | Look | Accent | Loop |
| --- | --- | --- | --- |
| Luz | Round head, high tail, hot-pink chest | `#FF2D8A` hot pink | Bats a countdown digit, chases the heart, pounces, lands. Almost never sits. |
| Mimo | Low and round, blush body, half-closed eyes, a small bow | `#F7C5D8` blush | Curled on the corner of a card, slow blink. If the guest waits, the head lifts. |
| Susto | Small, ears back, mostly hidden, wide pale eyes | `#FFF7FB` paper white | Jumps at nothing, then peeks from behind the button or the count. |
| Bram | Stocky, lightning-shaped tail tip | `#E20064` deep pink | Scratches the countdown frame, throws the pick, flops. |
| Nana | Upright, crown-shaped ears | `#FFC94D` crown gold | Sits on the QR frame, sniffs the code, steps off it. |
| Misha | Long body, calm eyes, tail up, a soft glow | `#C8A2FF` calm lavender | One scratch on the door frame. Turns the head sooner when music is playing. |
| Kira | Slim, star-bright eyes, sits taller than Misha | `#FFF1A8` star yellow | Bats the star off the door, watches it drop, steps toward the family. |

Toys and page objects share the palette: yarn, box, heart, star, guitar pick, the countdown, the QR frame, the door. A thrown object travels a short arc and returns. Scratch marks fade. Nothing stays on top of the words or the QR code.

Family shadows are solid near-black shapes with no faces, clothes, or interior lines except the hair outline in the door table. They move once, into the lit doorway, then rest. Misha and Kira stand beside them as full cats, not as shadows.

Files, if exported: transparent PNG, one cat state per file, named `{id}-playing.png`, `{id}-noticing.png`, `{id}-staying.png`, under `src/assets/cats/`. Toys under `src/assets/toys/`. The door shadows can be one SVG. `ideas/` is not copied into the site.

Working palette:

| Role | Dark theme | Light theme |
| --- | --- | --- |
| Field | Near-black | Blush white |
| Primary accent | Hot pink / magenta neon | The same pink as glow. Pink text uses the deep pink token, so it passes 4.5:1. |
| Secondary surface | Blush pink | Soft pink panels |
| Ink | Blush white | Near-black |
| Line | Pink at low opacity | Pink or black at low opacity |

The pixel era uses black, white, and one pink. The color era uses the full palette and the cat accents. The 3D era adds the spotlight. Bows stay light: a small pink bow on the stroller, one on a corner of the gift card, and Mimo's. The family shadows have none. Floral garlands and sweet script stay out.

Button labels on hot pink use near-black ink (`#141414`, 5.26:1). Pink text is never set on a blush panel.

Typography: one open-licensed pixel face for short titles, and one plain readable face for the verse, the address, the time, the countdown, the cat lines, and the buttons. No unlicensed font files. No Nintendo, Capcom, or Pixar type.

Theme: dark is the black room with pink light. Light is the blush field with black ink. The era changes the rendering, not which theme is active.

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
- Toys, far-layer decoration, and the door shadows are decorative and hidden from screen readers. The door line is the visible text for the door.

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
4. **Given** either invitation, **When** the guest never activates confirm, **Then** the site has stored nothing about them.

### US-4 — See the gift QR (P1, R1)

**Independent test:** Render Presente with a fixture image and with no image.

**Acceptance scenarios:**

1. **Given** the QR image is present, **When** the guest can see Presente, **Then** that image is visible on a white plate, at least the minimum QR size from the tuning module (220 CSS pixels), with the alternative text from section 6.
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

### US-7 — Move from pixels into 3D (P1; era mapping R1, looks R2, canvas R3)

**Independent test:** Map horizontal position samples to eras. Render with reduced motion and assert the landmarks without a canvas.

**Acceptance scenarios:**

1. **Given** the default thresholds and horizontal position `0`, `0.32`, `0.33`, `0.65`, `0.66`, and `1`, **When** the era is resolved, **Then** the results are pixel, pixel, color, color, 3D, and 3D.
2. **Given** WebGL and motion allowed, **When** horizontal position first reaches the 3D threshold, **Then** a Three.js canvas is mounted and the landmark text is still present. **When** the position goes back below it, **Then** the canvas stays mounted and paused.
3. **Given** reduced motion, **When** an invitation loads, **Then** no canvas is mounted, every landmark that belongs at that clock is present as text, and every layer moves at the camera's speed.
4. **Given** the opening view, **When** it paints, **Then** `Muévete para explorar` is visible.

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
3. **Given** the invitation, **When** the guest greets Misha, **Then** `misha` is stored and the page shows `Legendario` and `Está en calma, y está en casa.`
4. **Given** the invitation, **When** the guest greets Kira, **Then** `kira` is stored and the page shows `Legendario` and `Mira la puerta, y se queda cerca.`
5. **Given** the gate, **When** it renders, **Then** Misha and Kira are not there, and neither is the family door.
6. **Given** two cats already stored, **When** the guest opens either invitation, **Then** those two show their lines and no third id is added until a new greet.
7. **Given** the gate, **When** the guest greets Mimo, **Then** `mimo` is stored, and Bram is not on the gate.
8. **Given** **Tus gatos** for a cat not yet greeted, **When** it renders, **Then** the guest sees the rarity and `Aún no se acerca`, and does not see that cat's line.
9. **Given** the default waits and a Común cat inside the middle area, **When** the camera has been still for 0.5 s, **Then** the cat is noticing. At 0.4 s it is not.
10. **Given** Susto noticing, **When** the camera moves faster than 600 px per second while he is inside the middle area, **Then** he is not noticing and his wait starts again.
11. **Given** Misha inside the middle area, **When** music is playing, **Then** he notices after 1.2 s. Without music, after 2.5 s.
12. **Given** stored data with an unknown id, a duplicate, or unreadable JSON, **When** the page loads, **Then** those entries are dropped and the page renders.

### US-10 — Watch the gate loop (P2, R1)

**Independent test:** Render the gate with motion allowed and with reduced motion.

**Acceptance scenarios:**

1. **Given** the gate and motion allowed, **When** it is showing, **Then** the count is visible and moves from `9` toward `0`, and at least one cat is in the room.
2. **Given** the count has reached `0`, **When** the finale finishes, **Then** the count is back at `9` and both gate sentences are still visible.
3. **Given** reduced motion, **When** the gate renders, **Then** both sentences are visible, the cats are still, and the count does not run.

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
2. **Given** an invitation and motion allowed, **When** it renders, **Then** Luz, Mimo, Susto, Bram, Nana, Misha, and Kira are present, and the family door shows dad with a fuller afro, Miguelito and Mia with smaller curly outlines, mom with straight hair, both legendary cats beside them, and the line `Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.`
3. **Given** the invitation countdown, **When** the guest taps it, **Then** a cat bats or scratches it, the numbers wobble, and they settle back to the real time, still readable.
4. **Given** the QR, **When** Nana is on its frame or the guest taps it, **Then** the code may tilt and then lies flat and uncovered.
5. **Given** Susto, **When** the moment plays, **Then** Susto startles at an empty spot and comes back. No other creature appears.
6. **Given** reduced motion, **When** either page renders, **Then** the cats that belong there are visible and they do not roam, scratch in a loop, or throw things on their own.

### US-13 — Relive the party (P2, R2, live before `2026-10-18T00:00:00-04:00`)

After the party, the page thanks the guest, and the cats can be met again.

**Independent test:** A pure function takes the cat state and returns the state after `Jugar otra vez`. Render each invitation after its cutoff.

**Acceptance scenarios:**

1. **Given** Saturday at or after its cutoff, **When** the room renders, **Then** Llegada shows the post-party hero line and the relive line, and does not show the invitation hero line.
2. **Given** the party is over and the state `{ caught: ["luz", "mimo", "nana"], round: ["luz", "mimo", "nana"], rounds: 1 }`, **When** the guest activates `Jugar otra vez`, **Then** the state is `{ caught: ["luz", "mimo", "nana"], round: [], rounds: 2 }`, and **Tus gatos** shows `0 de 7` and `Vuelta 2`.
3. **Given** a new round, **When** a cat met before notices the guest, **Then** `Saludar` is offered again. Greeting adds it to `round` and does not add a second copy to `caught`.
4. **Given** a clock before the cutoff, **When** **Tus gatos** opens, **Then** there is no `Jugar otra vez`.
5. **Given** the gate, **When** **Tus gatos** opens, **Then** there is no `Jugar otra vez`.

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
- **BR-12.** Horizontal camera position maps to the three eras. Landmark text is HTML. It is not gated on greeting a cat or on reaching the 3D era.
- **BR-13.** Roaming, the canvas, the depth layers, and the gate count yield to `prefers-reduced-motion`. The canvas also yields to a failed WebGL start. The room, the camera, the words, the greets, and the cat list do not.
- **BR-14.** The cat state is `{ caught: string[], round: string[], rounds: number }` under one `localStorage` key. An id is appended to `caught` once, in first-greet order, and to `round` once per round. Ids come only from the seven in section 3. On load, unknown ids, duplicates, and unreadable data are dropped.
- **BR-15.** `Saludar` is offered only for a cat that is present on that page, noticing the guest, and not in the current round. Loading the page does not greet anyone. Misha and Kira are present only on an invitation, at the family door.
- **BR-16.** The site collects no analytics and sets no tracking cookies. The only `localStorage` keys are `mia-cats` (the cat state in BR-14), `mia-theme` (`dark` or `light`), and `mia-music` (`on` or `off`). If storage throws, the page still renders and the visit simply does not persist.
- **BR-17.** Both days use the pin `-17.73170923809386, -63.15786528996242` and the place wording in section 6.
- **BR-18.** The cast is the seven cats plus the gate toys and the invitation toys in section 3. Skulls, spikes, vests, weapons, guns, and fighting poses are not in the room or on the gate.
- **BR-19.** At most one audio file plays, looping, mastered quiet. It starts only after the guest turns it on, or, on a later visit if they already did, at the guest's first gesture. A greeting does not play its own sound.
- **BR-20.** The page viewport does not scroll horizontally. The camera moves inside the room by drag, touch, wheel, and arrow keys. Keyboard focus inside the room brings the focused control into view.
- **BR-21.** Every number and color that tunes the feel lives in one tuning module: sizes, speeds, waits, thresholds, parallax, glide, the gate count, the QR size, the theme tokens, and the cat accents. Components and tests read it. Changing a value there never requires a component change.
- **BR-22.** `Jugar otra vez` exists only in the party-over state, on an invitation. It empties `round`, adds one to `rounds`, and keeps `caught`.
- **BR-23.** Every page carries the same share preview: `og:title` and `og:description` from section 6, and an `og:image` that is a 1200×630 JPEG under 300 KB with an absolute URL. The preview names no date and no place. Every page sets `<meta name="robots" content="noindex">`.

## 9. Functional requirements

- **FR-1.** The system MUST render the landmarks in section 3, omitting Dónde, Confirmar, and Presente when BR-11 says so.
- **FR-2.** The system MUST show the title, the hero line, the verse, the citation, and `Muévete para explorar` on an invitation. In the party-over state, Llegada shows the post-party lines in place of the hero line.
- **FR-3.** The system MUST show the resolved day's date line and `16:00`.
- **FR-4.** The system MUST show the event countdown, following US-6.
- **FR-5.** The system MUST offer `Ver en el mapa` only while the place is visible.
- **FR-6.** The system MUST link confirmation to WhatsApp using BR-3, only on an invitation, and only while the party is current.
- **FR-7.** The system MUST show the QR image or the pending sentence, following US-4, only while the party is current.
- **FR-8.** The system MUST let the guest choose dark or light and restore that choice later, on the gate and on both invitations.
- **FR-9.** The system MUST change era with horizontal camera position, following US-7, with original cats and the toys in BR-18.
- **FR-10.** The system MUST stay usable from 320px wide through a desktop width. The page does not scroll sideways. The camera moves by mouse drag, touch drag, wheel, and arrow keys, following BR-20.
- **FR-11.** The system MUST expose the theme control, the music control, the signposts, the confirm link, the map link, `Saludar`, `Tus gatos`, and `Jugar otra vez` to keyboard and to a screen reader, with the accessible names in section 6, and MUST bring a focused control inside the room into view.
- **FR-12.** The system MUST build to static files that open locally with `vite preview` for `/`, `/?e=n4vk`, and `/?e=q8lm`.
- **FR-13.** The system MUST keep copy and contact data in the content module from BR-2.
- **FR-14.** The system MUST resolve the opening with the pure function from US-8.
- **FR-15.** The system MUST decide whether the party is over with the pure function from US-5.
- **FR-16.** The system MUST update the cat state only through the pure functions from US-9 and US-13, then persist that result.
- **FR-17.** The system MUST show the gate loop from US-10 whenever US-8 returns the gate.
- **FR-18.** The system MUST offer the music control from US-11 whenever a track file is configured, on the gate and on both invitations.
- **FR-19.** The system MUST show the cats and toys from US-12 on the gate and on the invitation, and MUST let the guest greet only the cats that page is allowed to host.
- **FR-20.** The system MUST read every tunable number and color from the tuning module (BR-21).
- **FR-21.** The system MUST enter the party-over state from US-5 and US-13 at that day's cutoff, without a reload, and MUST offer `Jugar otra vez` following BR-22.
- **FR-22.** The system MUST ship the share preview in BR-23 on every page.

## 10. Constraints

### Product

- Static site only. The QR image, once added, is public.
- Guest-facing copy is Spanish, from section 6.
- Code, test names, and this spec are English.
- Timezone: `America/La_Paz` (Bolivia, UTC−4, no daylight saving).
- The spoken place is the Prolongación Beni line in section 6. The map pin remains the coordinates already confirmed.
- The QR image file is still to be added. Until then the pending sentence is shown.
- The ambience track is still to be added. Until then the music control is hidden.
- Clearing site data clears the cat state. A browser may also clear it on its own (see *Coming back*). `Jugar otra vez` starts a new round and does not erase the list.
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
| tailwindcss and @tailwindcss/vite | 4.3.3 |
| vitest | 5.0.1 |

- React with Vite, TypeScript in strict mode.
- Three.js through React Three Fiber, for the far layer of the 3D era only. No game engine. The scene is a separate chunk, loaded with a dynamic import when the camera nears the 3D era, so it is not in the first download.
- Cats are SVG or CSS in every era. The 3D era uses the same seven drawings, not a second cast.
- Tailwind CSS 4. Theme tokens are CSS variables fed from the tuning module. No second styling system.
- Vitest and React Testing Library cover the acceptance scenarios that do not need real layout. The manual checks in section 12 cover the rest. No end-to-end suite in this version.
- One `index.html`.
- Vite `base` is `'./'`. One build serves local preview and GitHub Pages. `.github/workflows/pages.yml` publishes `dist` on push to `main`.
- No component kit, no animation library, no router, no state library. Theme, cats, and music are `localStorage` plus React state.

### Quality bar

- Small components: gate, room, landmark, countdown, location, confirmation, gift, collection, cat, toy, theme, scene.
- The page receives a resolved opening, an instant, and a cat state. URL parsing, the clock, the party-over check, the layout, the era, noticing, and greet math stay in pure functions.
- No magic numbers in components. Every tunable value comes from the tuning module.
- The 3D scene does not import invitation copy. Landmarks do not import Three.js.
- Lint must pass with no disabled rules hiding a problem in new code.

### Accessibility and performance

- WCAG 2.2 AA for contrast, control names, keyboard movement, and reduced motion.
- The page `lang` is `es`.
- At most the seven cats and the invitation toys in section 3 are on an invitation. The gate shows three cats.
- The canvas uses simple geometries. It mounts the first time the camera reaches the 3D era, then stays mounted and pauses whenever the camera is outside that era or the canvas is off screen.
- The QR is sharp, on a white plate with quiet space around it, at least the minimum QR size, and is not blurred or tinted.
- Landmark text is HTML in every era. The gate sentences stay readable through the finale.
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

Every value below is a starting value, chosen by judgment before the first build. The hosts tune them by looking at the page. Changing one never requires a component change (BR-21).

| Group | Name | Starting value |
| --- | --- | --- |
| Room | Landmark slot width | `min(85vw, 420px)` |
| Room | Landmark card width | `min(80vw, 380px)` |
| Room | Minimum room width | `300vw` |
| Room | Room height | `150dvh` |
| Room | Landmark vertical offset | `10dvh` |
| Camera | Edge margin | `24px` |
| Camera | Arrow key step | `120px` |
| Camera | Signpost glide | at most `400ms` |
| Depth | Far, mid, and near layer speed | `0.25`, `1`, `1.15` |
| Eras | Pixel to color, color to 3D | `0.33`, `0.66` |
| Noticing | Middle area of the viewport | `60%` |
| Noticing | Camera counts as still below | `40 px/s` |
| Noticing | Wait: Común, Poco común, Legendario | `500ms`, `1500ms`, `2500ms` |
| Noticing | Misha's wait while music plays | `1200ms` |
| Noticing | Susto's rush speed | `600 px/s` |
| Noticing | `Saludar` stays after the cat leaves the area | `1000ms` |
| Gate | Count start and step | `9`, `1000ms` |
| Gate | Finale length | `1500ms` |
| QR | Minimum size | `220px` |
| Colors | Theme tokens | Section 16 |
| Colors | Cat accents | Section 5 |

## 12. Traceability

| Id | Proves | Test focus |
| --- | --- | --- |
| US-8, FR-14, FR-17, BR-9, BR-10 | Only the two codes open a party | `resolveInvite` for both codes and for missing or junk codes; gate has no date |
| US-10, US-12 | The gate is a screen with cats | Count loops; Luz, Mimo, and Susto are present; Bram is absent |
| US-1, FR-1, FR-2, FR-3, FR-10 | The room can be read | Landmarks, verse, one date, signpost target, no overlapping cards in the layout function |
| US-1, FR-11, BR-20 | Keyboard and screen reader | Focus brings a control into view; controls have the accessible names in section 6 |
| US-2, FR-8, BR-7 | Theme choice sticks | Toggle and its own storage key; contrast of every token pair in use |
| US-3, FR-6, BR-3 | WhatsApp names the right day | Exact decoded message; absent on the gate |
| US-4, FR-7, BR-5, BR-6 | One shared QR | Image or pending sentence; no QR library |
| US-5, FR-5, FR-15, FR-21, BR-11 | Party current, then over | Map href before the cutoff; address, confirm, QR, countdown, and their signposts absent after it; switch without reload |
| US-6, FR-4, BR-8 | Countdown math | Fake timers against each start instant; no countdown after the cutoff |
| US-7, FR-9, BR-12, BR-13 | Pixels, then 3D | Era from horizontal position; canvas mounts once and pauses; none with reduced motion |
| US-9, FR-16, FR-19, BR-14, BR-15 | Cats persist and stay distinct | Greet once per round; noticing waits; bad stored data dropped; Misha and Kira are `Legendario` and absent from the gate; lines hidden until greeted |
| US-13, FR-21, BR-22 | Relive the party | Post-party lines; `Jugar otra vez` empties the round and keeps `caught`; absent before the cutoff and on the gate |
| US-11, FR-18, BR-19 | Ambience waits for a yes | No control without a file; paused until activated; starts at the first gesture on a later visit; refused playback shows `Activar música` |
| BR-16 | Storage can fail | The page renders when `localStorage` throws |
| FR-20, BR-21 | One tuning source | Tests import values from the tuning module |
| FR-22, BR-23 | Share preview | `index.html` has the `og:` tags, an absolute image URL, no date, and `noindex` |
| FR-12, FR-13 | Static build, one content source | Preview serves `/` and both query links |

How a cat walks, and how the 3D room looks, is reviewed by looking at the page. It is not asserted with screenshot tests.

Manual checks, on real phones, before each release:

- iPhone Safari, Android Chrome, and a link opened from inside WhatsApp.
- At 320px, 390px, tablet, and desktop widths: landmark text is readable, actions are tappable, and the page does not scroll sideways (US-1 AC3).
- The QR scans from a second phone, and a saved copy opens in a bank app (US-4).
- The WhatsApp message with the link shows the preview card (BR-23).
- The door reads as dad, mom, Miguelito, and Mia, with Misha and Kira beside them (US-12 AC2).

## 13. Success criteria

- **SC-1.** A guest with a real link can say the verse, the date, 16:00, and the address after moving through the room or tapping the signposts, without greeting a cat.
- **SC-2.** That page never shows the other day's date.
- **SC-3.** `/` and any unknown `e` show the special-guest sentences, the continue loop, and the gate cats, and never a party, on every date.
- **SC-4.** From the midnight after a day's party, that page has no address, no map, no confirm button, no gift QR, and no countdown. It thanks the guest, and the room can still be explored.
- **SC-5.** Confirm opens WhatsApp to `59176632451` with that day's message, in one tap.
- **SC-6.** Greeting a cat adds that cat, with a different line and a rarity, and that cat is still there after a reload and on the other link.
- **SC-7.** The end of an invitation shows dad, mom, Miguelito, and Mia as shadows, told apart by curly or straight hair, with Misha and Kira happy beside them. The gate does not show that door.
- **SC-8.** With reduced motion, or without WebGL, every landmark that belongs at that clock is still present, and a greet still saves.
- **SC-9.** On a phone, a finger can move the room both across and down, and a mouse can do the same on a computer.
- **SC-10.** `npm test` and `vite preview` pass on Node 26 for `/`, `/?e=n4vk`, and `/?e=q8lm` before any GitHub setup.
- **SC-11.** After the party, a guest can press `Jugar otra vez` and meet every cat again, and the cats met before stay in **Tus gatos**.
- **SC-12.** A WhatsApp message with either link shows the preview card with the title and the image, and no date.
- **SC-13.** Changing a number or color in the tuning module changes the page without touching a component.

## 14. Assumptions

- "The param is not found" includes a missing `e` and any value other than the two codes. Junk links do not open Saturday or Sunday.
- The party-over state starts at the midnight after the party. The address stays through the evening.
- One cat state per browser, shared by the gate and both links.
- The numbers and colors in the tuning module are starting values. The hosts tune them after the first build.
- Seven cats is the whole cast. Rarity is fixed, not random. Misha and Kira are the only `Legendario` cats.
- Misha and Kira stay visible and happy at the door on every invitation visit. Greeting them adds them to **Tus gatos**. The door does not wait for other cats.
- Dad, Miguelito, and Mia are the curly shadows. Dad’s hair has grown since `ideas/dad.jpg` and tends toward an afro, so his outline is the tallest and fullest. Mom is the straight-haired shadow. Miguelito and Mia are curly at a child’s height and at the smallest height. No faces are drawn.
- Greeting cannot fail. A cat who is not ready simply does not offer `Saludar` yet.
- The celebration is visual. The only sound is the one track the hosts provide, and only after the guest turns it on.
- The map pin stays on the coordinates already confirmed. Only the words of the address changed.
- The first-visit theme follows the OS, then the guest's choice wins.
- Parent names are omitted. The hero line is the parents speaking to the guest. Both parents love cats. The rock stays in the pick, the note, and the light.
- The verse is the example's wording, including "Jehová" and the citation Salmo 127:3.
- Original art only. Inside Out and Pokémon describe feelings and the pleasure of meeting someone rare. They do not supply drawings.
- The camera-inside-a-viewport is how "scroll up, down, left, and right" works on a phone without a sideways page scrollbar.

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

The camera starts on Llegada. Room size, layout, camera margin, glide time, parallax, noticing waits, and every other number are starting values in the tuning module (section 11).

Color tokens (in the tuning module):

| Token | Hex |
| --- | --- |
| Field, dark | `#0A0A0A` |
| Ink, light theme | `#141414` |
| Hot pink | `#FF2D8A` |
| Deep pink, for pink text in the light theme | `#E20064` |
| Blush | `#F7C5D8` |
| Paper | `#FFF7FB` |

Scratch, throw, and startle reuse the cat's playing picture. No extra pose files.

Share preview: `public/og-image.jpg`, 1200×630, a JPEG under 300 KB. It shows the title and a cat in the site's pink on black, with no date and no place. The implementer makes it from the site's own art. The favicon is a small cat from the same art. `theme-color` is `#0A0A0A`.

### Release plan

The links never change, so the site keeps improving after they go out. Most guests open the link once, the night they get it, so R1 is what most guests see.

**R1 — live on 27 September 2026, before the links go out that night.**

1. The repository `mia-babyshower`, with `ideas/` in `.gitignore` before the first commit. Pages set to GitHub Actions. The site URL in `.env`.
2. The content module, the tuning module, and the pure functions with tests: invite code, party over, countdown, layout, era.
3. The guest gate: the two sentences, the count, a simple finale.
4. The room: the camera by drag, wheel, and arrow keys; the landmark cards; the signposts; theme; reduced motion; focus that brings a control into view.
5. The facts: date, `16:00`, countdown, address and map, WhatsApp, the QR or its pending sentence, `Guardar QR`.
6. The share preview, the favicon, and `noindex` (BR-23). WhatsApp freezes the preview when a message is sent, so this must be live before the links go out.
7. The manual checks in section 12.

**R1 stretch — the same day, if time remains.** The family door with the four shadows and Misha and Kira. Two or three cats as simple SVGs, with noticing, greeting, and **Tus gatos**.

**R2 — before the first party, 17 October 2026.** All seven cats and their acts. The pixel and color looks. The depth layers. The party-over state with the post-party lines and `Jugar otra vez`, which must be live before `2026-10-18T00:00:00-04:00`. The bow accents.

**R3 — optional, before the first party.** The 3D era. Music, once the track arrives.

**After the parties.** The commit that removes the address (section 10).

`npm test` and `vite preview` of `/`, `/?e=n4vk`, and `/?e=q8lm` are the local finish line for each release. Pushing `main` is what publishes, once Pages is set to GitHub Actions.
