import type { ReactNode, RefObject } from 'react'
import { copy, days, shared, type CatId, type DayId } from '../content'
import { useActs, type ActId } from '../hooks/useActs'
import { useNoticing } from '../hooks/useNoticing'
import type { BattleCat } from '../logic/battle'
import type { CatState } from '../logic/catState'
import type { Stage } from '../logic/era'
import type { LandmarkId, Point } from '../logic/layout'
import { tuning } from '../tuning'
import { Cat } from './Cat'
import { Confirmation } from './Confirmation'
import { Countdown } from './Countdown'
import { FamilyDoor } from './FamilyDoor'
import { Gift } from './Gift'
import { Location } from './Location'
import { Throwable } from './Throwable'
import { HeartToy, PickToy, StarToy } from './Toys'

interface Options {
  day: DayId
  now: number
  partyOver: boolean
  stage: Stage
  reducedMotion: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  onChallenge: (id: BattleCat) => void
  musicPlaying: boolean
  qrUrl: string | undefined
  // Where the cats are measured for noticing, and the camera whose speed counts as rushing.
  container: RefObject<HTMLElement | null>
  cameraRef: { readonly current: Point }
}

const roomCats: readonly CatId[] = ['luz', 'mimo', 'susto', 'bram', 'nana', 'misha', 'kira']
const roomActs: readonly ActId[] = [
  'luzBat',
  'bramScratch',
  'mimoLift',
  'nanaSit',
  'sustoStartle',
  'mishaScratch',
  'kiraStar',
]

// The facts on each page, with their perched cats and acts. The flat room and the 3D book both
// show them. TODO(Task 7): the pop-up Pages replace this adapter.
export function useLandmarkContent({
  day,
  now,
  partyOver,
  stage,
  reducedMotion,
  catState,
  onGreet,
  onChallenge,
  musicPlaying,
  qrUrl,
  container,
  cameraRef,
}: Options): Record<LandmarkId, ReactNode> {
  const noticing = useNoticing({ catIds: roomCats, container, cameraRef, musicPlaying })
  const { active, play } = useActs({ available: roomActs, autonomous: !reducedMotion })

  const acting: Partial<Record<CatId, string>> = {
    luz: active.luzBat ? 'bat' : undefined,
    bram: active.bramScratch ? 'scratch' : undefined,
    mimo: active.mimoLift ? 'lift' : undefined,
    nana: active.nanaSit ? 'sit' : undefined,
    susto: active.sustoStartle ? 'startle' : undefined,
    misha: active.mishaScratch ? 'scratch' : undefined,
    kira: active.kiraStar ? 'bat' : undefined,
  }

  const cat = (id: CatId, className: string, size: number = tuning.catSize.room) => (
    <div className={`perch ${className}`}>
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

  const tapCountdown = () => {
    play('luzBat')
    play('bramScratch')
  }

  const record = days[day]
  return {
    llegada: (
      <>
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
        {partyOver && cat('susto', 'perch-llegada-susto')}
      </>
    ),
    palabra: (
      <>
        <blockquote className="verse" onClick={() => play('mimoLift')}>
          <p className="verse-text">{copy.verse}</p>
          <cite className="verse-citation">{copy.verseCitation}</cite>
        </blockquote>
        {cat('mimo', 'perch-palabra-mimo')}
        {partyOver && cat('nana', 'perch-palabra-nana')}
      </>
    ),
    cuando: (
      <>
        <p className="date-line">{record.dateLine}</p>
        <p className="time-line">{shared.clockTime}</p>
        {!partyOver && (
          <Countdown
            target={record.start}
            now={now}
            wobbling={Boolean(active.luzBat)}
            scratched={Boolean(active.bramScratch)}
            onTap={tapCountdown}
          />
        )}
        {cat('luz', 'perch-cuando-luz')}
        {cat('bram', 'perch-cuando-bram')}
        <Throwable className="toy-spot toy-spot-heart" knocked={Boolean(active.luzBat)}>
          <HeartToy size={22} />
        </Throwable>
        <Throwable className="toy-spot toy-spot-pick" knocked={Boolean(active.bramScratch)}>
          <PickToy size={18} />
        </Throwable>
      </>
    ),
    donde: <Location />,
    confirmar: (
      <Confirmation day={day} onEmptySpotTap={() => play('sustoStartle')}>
        {cat('susto', 'perch-confirmar-susto')}
      </Confirmation>
    ),
    presente: (
      <Gift
        qrUrl={qrUrl}
        tilting={Boolean(active.nanaSit)}
        onQrTap={() => play('nanaSit')}
        nana={cat('nana', 'perch-presente-nana', tuning.catSize.qr)}
      />
    ),
    familia: (
      <>
        <div className="door-stage">
          <FamilyDoor scratching={Boolean(active.mishaScratch)} still={reducedMotion} onFrameTap={() => play('mishaScratch')} />
          <div
            className={`door-star${active.kiraStar ? ' is-dropping' : ''}`}
            aria-hidden="true"
            onClick={() => play('kiraStar')}
          >
            <StarToy size={30} />
          </div>
          {cat('misha', 'perch-familia-misha', tuning.catSize.door)}
          {cat('kira', 'perch-familia-kira', tuning.catSize.door)}
        </div>
        <p className="door-line">{copy.doorLine}</p>
      </>
    ),
  }
}
