import { useEffect, useRef } from 'react'
import { cats, copy } from '../content'
import type { CatState } from '../logic/catState'
import { tuning } from '../tuning'
import { CatSprite } from './art/CatSprite'
import { trapTab } from './focusTrap'

interface Props {
  state: CatState
  allowPlayAgain: boolean
  onPlayAgain: () => void
  onClose: () => void
}

// Tus gatos (§3): a dialog over the room. Focus moves in, Escape closes it,
// and the caller returns focus to the Tus gatos control.
export function Collection({ state, allowPlayAgain, onPlayAgain, onClose }: Props) {
  const panel = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    panel.current?.querySelector<HTMLElement>('.collection-close')?.focus()
  }, [])

  // Escape closes the dialog wherever focus happens to be.
  useEffect(() => {
    const onEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [onClose])

  return (
    <div className="collection-backdrop" onClick={onClose}>
      <div
        ref={panel}
        className="collection"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-title"
        tabIndex={-1}
        onKeyDown={(e) => trapTab(e, panel.current)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="collection-header">
          <h2 id="collection-title">{copy.collection}</h2>
          <p className="collection-count">
            <span>{copy.roundCount(state.round.length)}</span>
            {state.rounds > 1 && <span className="collection-round">{copy.roundNumber(state.rounds)}</span>}
          </p>
          <button type="button" className="hud-button collection-close" onClick={onClose}>
            {copy.close}
          </button>
        </div>
        <ul className="collection-list">
          {cats.map((cat) => {
            const met = state.caught.includes(cat.id)
            const inRound = state.round.includes(cat.id)
            return (
              <li key={cat.id} className={`collection-item${met ? ' is-met' : ''}`} data-testid={`collection-${cat.id}`}>
                <CatSprite
                  id={cat.id}
                  stage="luz"
                  pose={inRound ? 'staying' : 'playing'}
                  silhouette={!met}
                  size={tuning.catSize.collection}
                />
                <div className="collection-text">
                  {met && <p className="collection-name">{cat.name}</p>}
                  <p className={`collection-rarity rarity-${cat.rarity}`}>{copy.rarity[cat.rarity]}</p>
                  <p className="collection-line">{met ? cat.line : copy.notYet}</p>
                </div>
              </li>
            )
          })}
        </ul>
        {allowPlayAgain && (
          <button
            type="button"
            className="button collection-again"
            disabled={state.round.length === 0}
            onClick={onPlayAgain}
          >
            {copy.playAgain}
          </button>
        )}
      </div>
    </div>
  )
}
