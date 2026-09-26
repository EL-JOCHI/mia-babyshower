import { memo, useRef, type CSSProperties } from 'react'
import { catById, copy, type CatId } from '../content'
import type { Era } from '../logic/era'
import { catAccents, catPixelAccents, tuning } from '../tuning'
import { CatArt } from './CatArt'

interface Props {
  id: CatId
  era: Era
  noticing: boolean
  inRound: boolean
  acting?: string
  still: boolean
  onGreet: (id: CatId) => void
  style?: CSSProperties
  size?: number
}

// A cat on the page: playing, noticing (Saludar appears), or staying (a small heart marks it).
export const Cat = memo(function Cat({
  id,
  era,
  noticing,
  inRound,
  acting,
  still,
  onGreet,
  style,
  size = tuning.catSize.room,
}: Props) {
  const cat = catById(id)
  const figure = useRef<HTMLDivElement | null>(null)
  const pixel = era === 'pixel'
  const accent = pixel ? catPixelAccents[id] : catAccents[id]
  const offerGreeting = noticing && !inRound
  const pose = inRound ? 'staying' : noticing ? 'noticing' : 'playing'
  const classes = ['cat', `cat-${id}`, still ? 'is-still' : 'is-roaming', acting ? `act-${acting}` : '']

  const greet = () => {
    onGreet(id)
    // Saludar goes away once the cat stays, so keep focus on the cat instead of losing it.
    figure.current?.focus()
  }

  return (
    <div className={classes.filter(Boolean).join(' ')} data-cat-id={id} style={style}>
      <div ref={figure} className="cat-figure" role="img" aria-label={cat.name} tabIndex={-1}>
        <CatArt id={id} pose={pose} accent={accent} size={size} pixel={pixel} />
      </div>
      {offerGreeting && (
        <button type="button" className="saludar" aria-label={copy.greetName(cat.name)} onClick={greet}>
          {copy.greet}
        </button>
      )}
    </div>
  )
})
