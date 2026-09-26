import type { CSSProperties } from 'react'
import { catById, copy, type CatId } from '../content'
import type { Era } from '../logic/era'
import { catAccents, catPixelAccents } from '../tuning'
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
export function Cat({ id, era, noticing, inRound, acting, still, onGreet, style, size = 64 }: Props) {
  const cat = catById(id)
  const accent = era === 'pixel' ? catPixelAccents[id] : catAccents[id]
  const offerGreeting = noticing && !inRound
  const pose = inRound ? 'staying' : noticing ? 'noticing' : 'playing'
  const classes = ['cat', `cat-${id}`, still ? 'is-still' : 'is-roaming', acting ? `act-${acting}` : '']
  return (
    <div className={classes.filter(Boolean).join(' ')} data-cat-id={id} style={style}>
      <div className="cat-figure" role="img" aria-label={cat.name}>
        <CatArt id={id} pose={pose} accent={accent} size={size} />
      </div>
      {offerGreeting && (
        <button type="button" className="saludar" aria-label={copy.greetName(cat.name)} onClick={() => onGreet(id)}>
          {copy.greet}
        </button>
      )}
    </div>
  )
}
