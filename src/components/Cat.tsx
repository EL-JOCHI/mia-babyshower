import { memo, useId, useRef, type CSSProperties } from 'react'
import { battleCopy, catById, copy, type CatId } from '../content'
import type { BattleCat } from '../logic/battle'
import type { Stage } from '../logic/era'
import { tuning } from '../tuning'
import { CatSprite } from './art/CatSprite'

interface Props {
  id: CatId
  stage: Stage
  noticing: boolean
  inRound: boolean
  acting?: string
  still: boolean
  onGreet: (id: CatId) => void
  // Misha and Kira answer with a battle instead of a greeting (design §7). Only the invitation has them.
  onChallenge?: (id: BattleCat) => void
  style?: CSSProperties
  size?: number
}

function isBattleCat(id: CatId): id is BattleCat {
  return id === 'misha' || id === 'kira'
}

// A cat on the page: playing, noticing (Saludar appears), or staying (a small heart marks it).
// When Misha or Kira notices the guest, Saludar becomes ¡A jugar!.
export const Cat = memo(function Cat({
  id,
  stage,
  noticing,
  inRound,
  acting,
  still,
  onGreet,
  onChallenge,
  style,
  size = tuning.catSize.room,
}: Props) {
  const cat = catById(id)
  const figure = useRef<HTMLDivElement | null>(null)
  const nameId = useId()
  const offerGreeting = noticing && !inRound
  const pose = inRound ? 'staying' : noticing ? 'noticing' : 'playing'
  const classes = ['cat', `cat-${id}`, still ? 'is-still' : 'is-roaming', acting ? `act-${acting}` : '']
  const behavior = { '--behavior': `${tuning.cats.behaviorMs[id]}ms`, ...style } as CSSProperties

  const greet = () => {
    onGreet(id)
    // Saludar goes away once the cat stays, so keep focus on the cat instead of losing it.
    figure.current?.focus()
  }

  return (
    <div className={classes.filter(Boolean).join(' ')} data-cat-id={id} style={behavior}>
      <div ref={figure} className="cat-figure" role="img" aria-label={cat.name} tabIndex={-1}>
        <CatSprite id={id} stage={stage} pose={pose} size={size} boil={!still} />
      </div>
      {offerGreeting &&
        (isBattleCat(id) ? (
          <>
            {/* Two cats at the door both say ¡A jugar!, so each button names its cat as a description. */}
            <span id={nameId} hidden>
              {cat.name}
            </span>
            <button
              type="button"
              className="saludar saludar-battle"
              aria-describedby={nameId}
              onClick={() => onChallenge?.(id)}
            >
              {battleCopy.start}
            </button>
          </>
        ) : (
          <button type="button" className="saludar" aria-label={copy.greetName(cat.name)} onClick={greet}>
            {copy.greet}
          </button>
        ))}
    </div>
  )
})
