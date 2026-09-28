import { useId, type RefObject } from 'react'
import { cats, copy } from '../content'
import type { ThemeName } from '../tuning'
import { MusicControl } from './MusicControl'
import { QuestLog, type QuestLogProps } from './QuestLog'
import { ThemeControl } from './ThemeControl'

interface Props {
  theme: ThemeName
  onTheme: (theme: ThemeName) => void
  music: { available: boolean; playing: boolean; toggle: () => void }
  onOpenCollection: () => void
  collectionOpen: boolean
  collectionButtonRef: RefObject<HTMLButtonElement | null>
  // Cats ever met, for the Tus gatos badge (spec §4).
  catsMet: number
  // The quest log, on the invitation only (design §6).
  quest: QuestLogProps | null
}

// Spec §4: Tus gatos as a cat's head, in the ink style.
function CatHead() {
  return (
    <svg className="hud-cat" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        className="hud-cat-head"
        d="M4.6 10.4 L 4 3.2 L 9.2 6.6 C 11 6.1, 13 6.1, 14.8 6.6 L 20 3.2 L 19.4 10.4 C 20.1 11.5, 20.4 12.7, 20.4 14 C 20.4 18.6, 16.6 21.2, 12 21.2 C 7.4 21.2, 3.6 18.6, 3.6 14 C 3.6 12.7, 3.9 11.5, 4.6 10.4 Z"
      />
      <circle className="hud-cat-eye" cx={9} cy={13.4} r={1.5} />
      <circle className="hud-cat-eye" cx={15} cy={13.4} r={1.5} />
      <path className="hud-cat-nose" d="M11 16 h2 l-1 1.2 z" />
    </svg>
  )
}

// The controls that stay fixed on screen on the gate and on both invitations (§3), with the
// quest log on the left of the invitation. Tus gatos shows how many cats the guest has met, out of
// all of them; the count is its description, so its name stays Tus gatos.
export function Hud({ theme, onTheme, music, onOpenCollection, collectionOpen, collectionButtonRef, catsMet, quest }: Props) {
  const countId = useId()
  return (
    <header className="hud">
      {quest && <QuestLog {...quest} />}
      <ThemeControl theme={theme} onTheme={onTheme} />
      <MusicControl available={music.available} playing={music.playing} onToggle={music.toggle} />
      <button
        ref={collectionButtonRef}
        type="button"
        className="hud-button hud-icon-button hud-collection"
        aria-haspopup="dialog"
        aria-expanded={collectionOpen}
        aria-describedby={countId}
        onClick={onOpenCollection}
      >
        <CatHead />
        <span className="sr-only">{copy.collection}</span>
        <span className="hud-badge" aria-hidden="true">
          {copy.collectionCount(catsMet, cats.length)}
        </span>
        {/* The count in words, `7 de 10`, for screen readers: Spanish speech may read `7/10` as a date
            or a fraction. Left out of the name, so the name stays Tus gatos. */}
        <span id={countId} className="sr-only" aria-hidden="true">
          {copy.roundCount(catsMet, cats.length)}
        </span>
      </button>
    </header>
  )
}
