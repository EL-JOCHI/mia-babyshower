import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { copy, type CatId } from '../content'
import { useActs, type ActId } from '../hooks/useActs'
import { useNoticing } from '../hooks/useNoticing'
import type { CatState } from '../logic/catState'
import { tuning } from '../tuning'
import { Cat } from './Cat'
import { BoxToy, HeartToy, StarToy, ThunderBolt, YarnToy } from './Toys'

interface Props {
  reducedMotion: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  musicPlaying: boolean
}

const gateCats: readonly CatId[] = ['luz', 'mimo', 'susto']
const gateActs: readonly ActId[] = ['luzBat', 'mimoLift', 'sustoStartle']
const still = { current: { x: 0, y: 0 } } as const

const spots: Record<CatId, CSSProperties> = {
  luz: { left: '26%', top: '58%' },
  mimo: { left: '80%', top: '34%' },
  susto: { left: '70%', top: '70%' },
  bram: {},
  nana: {},
  misha: {},
  kira: {},
}

// US-10: the count runs 9 → 0, one step a second. At 0 a short finale plays, then 9 again.
export function useGateLoop(reducedMotion: boolean): number {
  const { countFrom, stepMs, finaleMs } = tuning.gate
  const [count, setCount] = useState<number>(countFrom)
  useEffect(() => {
    if (reducedMotion) return
    const id = window.setTimeout(
      () => setCount((c) => (c === 0 ? countFrom : c - 1)),
      count === 0 ? finaleMs : stepMs,
    )
    return () => window.clearTimeout(id)
  }, [count, countFrom, finaleMs, reducedMotion, stepMs])
  return count
}

// §3 The guest gate: an arcade continue screen with none of the fighting. No date, no place,
// no WhatsApp, no QR. There is no button that enters a party.
export function Gate({ reducedMotion, catState, onGreet, musicPlaying }: Props) {
  const count = useGateLoop(reducedMotion)
  const root = useRef<HTMLElement | null>(null)
  const noticing = useNoticing({ catIds: gateCats, container: root, cameraRef: still, musicPlaying })
  const { active, play } = useActs({ available: gateActs, autonomous: !reducedMotion })
  const finale = !reducedMotion && count === 0

  const acting: Partial<Record<CatId, string>> = {
    luz: active.luzBat ? 'bat' : undefined,
    mimo: active.mimoLift ? 'lift' : undefined,
    susto: active.sustoStartle ? 'startle' : undefined,
  }

  return (
    <main ref={root} className={`gate era-color${finale ? ' is-finale' : ''}`}>
      <div className="gate-sentences">
        <p className="gate-sentence">{copy.gate[0]}</p>
        <p className="gate-sentence">{copy.gate[1]}</p>
      </div>

      {!reducedMotion && (
        <div
          className={`gate-count${active.luzBat ? ' is-wobbling' : ''}`}
          data-testid="gate-count"
          aria-hidden="true"
          onClick={() => play('luzBat')}
        >
          {count}
        </div>
      )}

      <div className="gate-toys" aria-hidden="true">
        <YarnToy className="gate-yarn" />
        <BoxToy className="gate-box" />
        <HeartToy className="gate-heart" />
      </div>

      {gateCats.map((id) => (
        <div key={id} className={`gate-spot gate-spot-${id}`} style={spots[id]}>
          <Cat
            id={id}
            era="color"
            noticing={Boolean(noticing[id])}
            inRound={catState.round.includes(id)}
            acting={acting[id]}
            still={reducedMotion}
            onGreet={onGreet}
            size={72}
          />
          {finale && (
            <div className="finale-burst" aria-hidden="true">
              <HeartToy className="burst-1" size={22} />
              <StarToy className="burst-2" size={22} />
              <ThunderBolt className="burst-3" size={26} />
              <HeartToy className="burst-4" size={16} />
            </div>
          )}
        </div>
      ))}
    </main>
  )
}
