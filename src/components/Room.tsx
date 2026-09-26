import { useMemo, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode, type UIEvent } from 'react'
import { copy, days, shared, type CatId, type DayId } from '../content'
import { useActs, type ActId } from '../hooks/useActs'
import { useCamera } from '../hooks/useCamera'
import { useKeyboardModality } from '../hooks/useKeyboardModality'
import { useNoticing } from '../hooks/useNoticing'
import { useViewport } from '../hooks/useViewport'
import { cameraTargetFor, horizontalPosition } from '../logic/camera'
import type { CatState } from '../logic/catState'
import { eraAt, type Era } from '../logic/era'
import { computeLayout, landmarksFor, type LandmarkId } from '../logic/layout'
import { isPartyOver } from '../logic/party'
import { tuning } from '../tuning'
import { Cat } from './Cat'
import { Confirmation } from './Confirmation'
import { Countdown } from './Countdown'
import { FamilyDoor } from './FamilyDoor'
import { Gift } from './Gift'
import { Landmark } from './Landmark'
import { Location } from './Location'
import { hasWebGL, SceneHost } from './SceneHost'
import { Signposts } from './Signposts'
import { Throwable } from './Throwable'
import { HeartToy, PickToy, StarToy, ThunderBolt } from './Toys'

interface Props {
  day: DayId
  now: number
  reducedMotion: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  musicPlaying: boolean
  qrUrl: string | undefined
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

// Fixed decoration spots, as fractions of the layer. Deterministic, so rendering stays pure.
const farDots = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 37) % 100) / 100,
  y: ((i * 53 + 11) % 100) / 100,
  size: 2 + (i % 3) * 2,
}))
// Near decorations stay in bands above and below the cards, so none comes to rest on the words.
const nearBits = Array.from({ length: 12 }, (_, i) => ({
  x: (i + 0.3) / 12,
  y: i % 2 === 0 ? 0.17 + ((i * 7) % 6) / 100 : 0.77 + ((i * 5) % 6) / 100,
  kind: (['heart', 'star', 'pixel', 'thunder', 'pixel', 'pick'] as const)[i % 6],
}))

function isOutside(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect()
  // Without a layout (zero box) there is nothing to measure, so bring it into view anyway.
  if (r.width === 0 && r.height === 0) return true
  return r.left < 0 || r.top < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight
}

// §3 The room, §4 How the room moves.
export function Room({ day, now, reducedMotion, catState, onGreet, musicPlaying, qrUrl }: Props) {
  const { vw, vh } = useViewport()
  const partyOver = isPartyOver(day, now)
  const ids = useMemo(() => landmarksFor(partyOver), [partyOver])
  const layout = useMemo(() => computeLayout(vw, vh, ids), [vw, vh, ids])
  const [start] = useState(() => cameraTargetFor(layout.positions.llegada, layout, vw, vh))
  const cam = useCamera({ room: layout, vw, vh, reducedMotion, start })
  const viewport = useRef<HTMLDivElement | null>(null)
  const keyboard = useKeyboardModality()

  const position = horizontalPosition(cam.camera.x, layout.roomWidth, vw)
  const era = eraAt(position)
  // Without a canvas, the 3D part of the room keeps the color era's look (§4).
  const look: Era = era === '3d' && (reducedMotion || !hasWebGL()) ? 'color' : era
  const depth = reducedMotion ? { far: 1, mid: 1, near: 1 } : tuning.depth
  const noticing = useNoticing({ catIds: roomCats, container: viewport, cameraRef: cam.cameraRef, musicPlaying })
  const { active, play } = useActs({ available: roomActs, autonomous: !reducedMotion })

  const goTo = (id: LandmarkId) => cam.glideTo(cameraTargetFor(layout.positions[id], layout, vw, vh))

  // Keyboard focus inside the room brings the focused control into view (BR-20, FR-11).
  const onFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (!keyboard.current) return
    const target = e.target as HTMLElement
    const id = target.closest<HTMLElement>('[data-landmark-id]')?.dataset.landmarkId as LandmarkId | undefined
    if (id && ids.includes(id) && isOutside(target)) goTo(id)
  }

  // The browser may scroll a clipped box to show focus. The camera owns position, so undo that.
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    e.currentTarget.scrollLeft = 0
    e.currentTarget.scrollTop = 0
  }

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
        era={look}
        noticing={Boolean(noticing[id])}
        inRound={catState.round.includes(id)}
        acting={acting[id]}
        still={reducedMotion}
        onGreet={onGreet}
        size={size}
      />
    </div>
  )

  const tapCountdown = () => {
    play('luzBat')
    play('bramScratch')
  }

  const record = days[day]
  const content: Record<LandmarkId, ReactNode> = {
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

  const layer = (factor: number): CSSProperties => ({
    transform: `translate3d(${-cam.camera.x * factor}px, ${-cam.camera.y * factor}px, 0)`,
  })

  return (
    <main className="room" data-era={look} aria-label={copy.a11y.room}>
      <div
        ref={viewport}
        className="room-viewport"
        {...cam.surfaceProps}
        onScroll={onScroll}
        onFocusCapture={onFocusCapture}
      >
        <SceneHost era={era} position={position} reducedMotion={reducedMotion} />

        <div
          className="layer layer-far"
          aria-hidden="true"
          style={{ ...layer(depth.far), width: layout.roomWidth * depth.far + vw, height: layout.roomHeight * depth.far + vh }}
        >
          {farDots.map((dot, i) => (
            <span
              key={i}
              className="far-dot"
              style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%`, width: dot.size, height: dot.size }}
            />
          ))}
        </div>

        <div
          className="layer layer-mid"
          data-testid="room-mid"
          style={{ ...layer(depth.mid), width: layout.roomWidth, height: layout.roomHeight }}
        >
          {ids.map((id) => (
            <Landmark key={id} id={id} at={layout.positions[id]} width={layout.cardWidth}>
              {content[id]}
            </Landmark>
          ))}
        </div>

        <div
          className="layer layer-near"
          aria-hidden="true"
          style={{ ...layer(depth.near), width: layout.roomWidth * depth.near + vw, height: layout.roomHeight }}
        >
          {nearBits.map((bit, i) => (
            <span key={i} className={`near-bit near-${bit.kind}`} style={{ left: `${bit.x * 100}%`, top: `${bit.y * 100}%` }}>
              {bit.kind === 'heart' && <HeartToy size={18} />}
              {bit.kind === 'star' && <StarToy size={16} />}
              {bit.kind === 'thunder' && <ThunderBolt size={22} />}
              {bit.kind === 'pick' && <PickToy size={14} />}
              {bit.kind === 'pixel' && <span className="pixel-square" />}
            </span>
          ))}
        </div>
      </div>

      <Signposts landmarks={ids} onGo={goTo} />
    </main>
  )
}
