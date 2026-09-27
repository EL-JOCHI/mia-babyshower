import { useRef, useState, type CSSProperties } from 'react'
import { copy, type CatId } from '../content'
import { useActs, type ActId } from '../hooks/useActs'
import { useNoticing } from '../hooks/useNoticing'
import type { CatState } from '../logic/catState'
import { tuning } from '../tuning'
import { Cat } from './Cat'
import { GateGame } from './GateGame'
import { Throwable } from './Throwable'
import { BoxToy, HeartToy, YarnToy } from './Toys'

interface Props {
  reducedMotion: boolean
  catState: CatState
  onGreet: (id: CatId) => void
  musicPlaying: boolean
}

const gateCats: readonly CatId[] = ['luz', 'mimo', 'susto']
const gateActs: readonly ActId[] = ['luzBat', 'mimoLift', 'sustoStartle']
const still = { current: { x: 0, y: 0 } } as const

const spots: Partial<Record<CatId, CSSProperties>> = tuning.gateScreen.catSpots

// §3 The guest gate: a 30-second arcade mini-game (design §8), with none of the fighting. No date,
// no place, no WhatsApp, no QR. There is no button that enters a party. The two sentences stay
// visible above the game in every phase, and with reduced motion.
export function Gate({ reducedMotion, catState, onGreet, musicPlaying }: Props) {
  const root = useRef<HTMLElement | null>(null)
  // Luz is the catcher while a round plays, so her roaming, greetable self steps aside; Mimo and
  // Susto stay greetable throughout.
  const [playing, setPlaying] = useState(false)
  const noticing = useNoticing({
    catIds: gateCats,
    container: root,
    cameraRef: still,
    musicPlaying,
    zone: tuning.gateScreen.noticeZone,
  })
  const { active } = useActs({ available: gateActs, autonomous: !reducedMotion })

  const acting: Partial<Record<CatId, string>> = {
    luz: active.luzBat ? 'bat' : undefined,
    mimo: active.mimoLift ? 'lift' : undefined,
    susto: active.sustoStartle ? 'startle' : undefined,
  }

  return (
    <main ref={root} className="gate era-color">
      <div className="gate-sentences">
        <p className="gate-sentence">{copy.gate[0]}</p>
        <p className="gate-sentence">{copy.gate[1]}</p>
      </div>

      <GateGame reducedMotion={reducedMotion} onPlayingChange={setPlaying} />

      <div className="gate-toys">
        <Throwable className="gate-yarn">
          <YarnToy />
        </Throwable>
        <Throwable className="gate-box">
          <BoxToy />
        </Throwable>
        <Throwable className="gate-heart">
          <HeartToy />
        </Throwable>
      </div>

      {gateCats
        .filter((id) => !(playing && id === 'luz'))
        .map((id) => (
          <div key={id} className={`gate-spot gate-spot-${id}`} style={spots[id]}>
            <Cat
              id={id}
              stage="luz"
              noticing={Boolean(noticing[id])}
              inRound={catState.round.includes(id)}
              acting={acting[id]}
              still={reducedMotion}
              onGreet={onGreet}
              size={tuning.catSize.gate}
            />
          </div>
        ))}
    </main>
  )
}
