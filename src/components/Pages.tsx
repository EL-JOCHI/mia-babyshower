import type { ReactNode, RefObject } from 'react'
import { catIds, copy, days, shared, type CatId, type DayId } from '../content'
import { useActs, type ActId, type ActiveActs } from '../hooks/useActs'
import { useNoticing } from '../hooks/useNoticing'
import type { BattleCat } from '../logic/battle'
import type { CatState } from '../logic/catState'
import type { Stage } from '../logic/era'
import type { LandmarkId, Point } from '../logic/layout'
import type { Progress, ProgressEvent } from '../logic/progress'
import { tuning } from '../tuning'
import { Candle, CandleCountdown } from './CandleCountdown'
import { Cat } from './Cat'
import { Confirmation } from './Confirmation'
import { FamilyDoor } from './FamilyDoor'
import { Gift } from './Gift'
import { Location } from './Location'
import { PageCard } from './PageCard'
import { Throwable } from './Throwable'
import { HeartToy, PickToy, StarToy } from './Toys'
import { TreasureMap } from './TreasureMap'

// A cat perched at a spot on its page (the spot is a CSS class), at a size.
export type PerchCat = (id: CatId, spot: string, size?: number) => ReactNode

interface PagesInput {
  day: DayId
  now: number
  partyOver: boolean
  // The acts playing now, and how to play one (§3 Playing with what is on screen).
  acts: { active: ActiveActs; play: (act: ActId) => void }
  cats: PerchCat
  // Confirmar por WhatsApp and Guardar QR count toward the game layer (design §6).
  onEvent: (event: ProgressEvent) => void
  progress: Progress
  // The pages standing, or in view, now: their objects open at once, found or not (design §10:
  // the facts are never gated). Once open, an object stays open.
  standing: readonly LandmarkId[]
  qrPayload: string
  // Reduced motion: every object is already open and settled.
  still: boolean
  // In the book, the family stands in the 3D doorway above the card (spec §6): the card drops its
  // paper door and keeps the star, Misha and Kira, and the line. The frame tap moves to the 3D door.
  familyInWorld: boolean
}

// Design §5: the facts, each on its pop-up page with its own object. Both rooms show these: the
// flat room lays them out on its layers, the 3D book stands them up at its stations.
export function Pages({
  day,
  now,
  partyOver,
  acts,
  cats,
  onEvent,
  progress,
  standing,
  qrPayload,
  still,
  familyInWorld,
}: PagesInput): Record<LandmarkId, ReactNode> {
  const { active, play } = acts
  // Found (the stamp, the badge, the XP) and open (the object shows its fact) are separate.
  const found = (id: LandmarkId) => progress.pages.includes(id)
  const open = (id: LandmarkId) => still || found(id) || standing.includes(id)
  const record = days[day]

  const tapCountdown = () => {
    play('luzBat')
    play('bramScratch')
  }

  return {
    llegada: (
      <PageCard id="llegada" found={false}>
        <h1 className="title">{copy.title}</h1>
        {partyOver ? (
          <>
            <p className="hero">{copy.postPartyHero}</p>
            <p className="relive">{copy.relive}</p>
          </>
        ) : (
          <p className="hero">{copy.hero}</p>
        )}
        <p className="move-hint">{copy.moveHint}</p>
        {cats('chona', 'perch-llegada-chona')}
        {/* After the party (spec §3), Chavela and Minina move here from Confirmar. */}
        {partyOver && cats('susto', 'perch-llegada-susto')}
        {partyOver && cats('minina', 'perch-llegada-minina')}
      </PageCard>
    ),
    // An illuminated manuscript page, with a candle flickering beside the verse.
    palabra: (
      <PageCard id="palabra" found={found('palabra')}>
        <blockquote className="verse" onClick={() => play('mimoLift')}>
          <p className="verse-text">{copy.verse}</p>
          <cite className="verse-citation">{copy.verseCitation}</cite>
        </blockquote>
        <Candle wax={tuning.objects.candle.verseWax} className="verse-candle" />
        {cats('mimo', 'perch-palabra-mimo')}
        {/* After the party (spec §3), Delilah and Chori move here from Presente and Dónde. */}
        {partyOver && cats('nana', 'perch-palabra-nana')}
        {partyOver && cats('chori', 'perch-palabra-chori')}
      </PageCard>
    ),
    // The date and 16:30 pinned to the page, then the melting candle, the flip-card countdown,
    // and the hourglass.
    cuando: (
      <PageCard id="cuando" found={found('cuando')}>
        <div className="pinned-note">
          <span className="pin" aria-hidden="true" />
          <p className="date-line">{record.dateLine}</p>
          <p className="time-line">{shared.clockTime}</p>
        </div>
        {!partyOver && (
          <CandleCountdown
            target={record.start}
            now={now}
            wobbling={Boolean(active.luzBat)}
            scratched={Boolean(active.bramScratch)}
            onTap={tapCountdown}
          />
        )}
        {cats('luz', 'perch-cuando-luz')}
        {cats('bram', 'perch-cuando-bram')}
        <Throwable className="toy-spot toy-spot-heart" knocked={Boolean(active.luzBat)}>
          <HeartToy size={22} />
        </Throwable>
        <Throwable className="toy-spot toy-spot-pick" knocked={Boolean(active.bramScratch)}>
          <PickToy size={18} />
        </Throwable>
      </PageCard>
    ),
    donde: (
      <PageCard id="donde" found={found('donde')}>
        <TreasureMap unrolled={open('donde')}>
          <Location />
        </TreasureMap>
        {cats('chori', 'perch-donde-chori')}
      </PageCard>
    ),
    confirmar: (
      <PageCard id="confirmar" found={found('confirmar')}>
        <Confirmation
          day={day}
          sealed={progress.badges.includes('sellada')}
          onConfirm={() => onEvent({ type: 'confirmed' })}
          onEmptySpotTap={() => play('sustoStartle')}
        >
          {cats('susto', 'perch-confirmar-susto')}
          {cats('minina', 'perch-confirmar-minina')}
        </Confirmation>
      </PageCard>
    ),
    presente: (
      <PageCard id="presente" found={found('presente')}>
        <Gift
          qrPayload={qrPayload}
          open={open('presente')}
          tilting={Boolean(active.nanaSit)}
          onQrTap={() => play('nanaSit')}
          onSave={() => onEvent({ type: 'savedQr' })}
          nana={cats('nana', 'perch-presente-nana', tuning.catSize.qr)}
        />
      </PageCard>
    ),
    // The lit door and the family. Finding every page lights the door brighter.
    familia: (
      <PageCard id="familia" found={found('familia')}>
        <div
          className={`door-stage${progress.badges.includes('cuentoCompleto') ? ' is-complete' : ''}${familyInWorld ? ' is-in-world' : ''}`}
        >
          {!familyInWorld && (
            <FamilyDoor scratching={Boolean(active.mishaScratch)} still={still} onFrameTap={() => play('mishaScratch')} />
          )}
          <div
            className={`door-star${active.kiraStar ? ' is-dropping' : ''}`}
            aria-hidden="true"
            onClick={() => play('kiraStar')}
          >
            <StarToy size={30} />
          </div>
          {cats('misha', 'perch-familia-misha', tuning.catSize.door)}
          {cats('kira', 'perch-familia-kira', tuning.catSize.door)}
        </div>
        <p className="door-line">{copy.doorLine}</p>
      </PageCard>
    ),
  }
}

// Every cat is in the room (spec §3: ten cats).
const roomCats: readonly CatId[] = catIds
const roomActs: readonly ActId[] = [
  'luzBat',
  'bramScratch',
  'mimoLift',
  'nanaSit',
  'sustoStartle',
  'mishaScratch',
  'kiraStar',
]

interface RoomPagesOptions {
  day: DayId
  now: number
  partyOver: boolean
  stage: Stage
  reducedMotion: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrPayload: string
  progress: Progress
  onEvent: (event: ProgressEvent) => void
  standing: readonly LandmarkId[]
  // Where the cats are measured for noticing, and the camera whose speed counts as rushing.
  container: RefObject<HTMLElement | null>
  cameraRef: { readonly current: Point }
  // The book stands the family in its 3D doorway (see PagesInput.familyInWorld).
  familyInWorld: boolean
}

// The pages as a room shows them: the cats on their perches notice the guest, and the acts play,
// now and then on their own when motion is allowed.
export function usePages({
  day,
  now,
  partyOver,
  stage,
  reducedMotion,
  catState,
  onGreet,
  onChallenge,
  musicPlaying,
  qrPayload,
  progress,
  onEvent,
  standing,
  container,
  cameraRef,
  familyInWorld,
}: RoomPagesOptions): { content: Record<LandmarkId, ReactNode>; playAct: (act: ActId) => void } {
  const noticing = useNoticing({ catIds: roomCats, container, cameraRef, musicPlaying })
  const acts = useActs({ available: roomActs, autonomous: !reducedMotion })
  const { active } = acts

  const acting: Partial<Record<CatId, string>> = {
    luz: active.luzBat ? 'bat' : undefined,
    bram: active.bramScratch ? 'scratch' : undefined,
    mimo: active.mimoLift ? 'lift' : undefined,
    nana: active.nanaSit ? 'sit' : undefined,
    susto: active.sustoStartle ? 'startle' : undefined,
    misha: active.mishaScratch ? 'scratch' : undefined,
    kira: active.kiraStar ? 'bat' : undefined,
  }

  const cats: PerchCat = (id, spot, size = tuning.catSize.room) => (
    <div className={`perch ${spot}`}>
      <Cat
        id={id}
        stage={stage}
        noticing={Boolean(noticing[id])}
        inRound={catState.round.includes(id)}
        acting={acting[id]}
        still={reducedMotion}
        onGreet={onGreet}
        onChallenge={onChallenge}
        size={size}
      />
    </div>
  )

  const content = Pages({ day, now, partyOver, acts, cats, onEvent, progress, standing, qrPayload, still: reducedMotion, familyInWorld })
  return { content, playAct: acts.play }
}
