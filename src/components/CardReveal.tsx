import { useEffect, useState, type CSSProperties } from 'react'
import { catById, copy, type CatId } from '../content'
import { feelingColors, tuning } from '../tuning'
import { CatSprite } from './art/CatSprite'

interface Props {
  catId: CatId
}

type Phase = 'shown' | 'leaving' | 'gone'

// Legendario comes with stars around the card; each star's spot as a share of the card.
const stars = [
  { x: -0.08, y: 0.1 },
  { x: 1.02, y: 0.04 },
  { x: -0.1, y: 0.62 },
  { x: 1.05, y: 0.5 },
  { x: 0.5, y: -0.08 },
  { x: 0.9, y: 1.02 },
]

// The collectible card (design §6): it flips in after every greeting with the cat, its name, its
// line, its feeling-color frame, and the rarity shown big (Común silver shimmer, Poco común rose
// burst, Legendario gold with stars). It stays for tuning.greetingToastMs and a tap sends it away.
// It is visual only: GreetingToast is the live region that screen readers hear.
export function CardReveal({ catId }: Props) {
  const cat = catById(catId)
  const { flipMs, leaveMs } = tuning.card
  const [phase, setPhase] = useState<Phase>('shown')

  useEffect(() => {
    if (phase === 'gone') return
    const id = window.setTimeout(
      () => setPhase(phase === 'shown' ? 'leaving' : 'gone'),
      phase === 'shown' ? tuning.greetingToastMs - leaveMs : leaveMs,
    )
    return () => window.clearTimeout(id)
  }, [leaveMs, phase])

  if (phase === 'gone') return null

  const style = {
    '--feel': feelingColors[catId],
    '--flip-ms': `${flipMs}ms`,
    '--leave-ms': `${leaveMs}ms`,
  } as CSSProperties

  return (
    <div className="card-reveal-layer" aria-hidden="true">
      <div
        className={`card-reveal rarity-${cat.rarity}${phase === 'leaving' ? ' is-leaving' : ''}`}
        data-testid="card-reveal"
        style={style}
        onClick={() => setPhase('leaving')}
      >
        <div className="card-burst" />
        <div className="card-flip">
          <div className="card-face card-back">
            <span className="card-emblem" />
          </div>
          <div className="card-face card-front">
            <span className="card-frame" />
            <p className="card-rarity">
              {cat.rarity === 'legendario' && <span className="card-rarity-stars">★★★ </span>}
              {copy.rarity[cat.rarity]}
            </p>
            <div className="card-art">
              <CatSprite id={catId} stage="luz" pose="staying" size={tuning.catSize.card} boil />
            </div>
            <p className="card-name">{cat.name}</p>
            <p className="card-line">{cat.line}</p>
          </div>
        </div>
        {cat.rarity === 'legendario' &&
          stars.map((star, i) => (
            <span
              key={i}
              className="card-star"
              style={{ left: `${star.x * 100}%`, top: `${star.y * 100}%`, '--i': i } as CSSProperties}
            >
              ★
            </span>
          ))}
      </div>
    </div>
  )
}
