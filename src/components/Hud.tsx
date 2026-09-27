import type { RefObject } from 'react'
import { copy } from '../content'
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
  // The quest log, on the invitation only (design §6).
  quest: QuestLogProps | null
}

// The controls that stay fixed on screen on the gate and on both invitations (§3), with the
// quest log on the left of the invitation.
export function Hud({ theme, onTheme, music, onOpenCollection, collectionOpen, collectionButtonRef, quest }: Props) {
  return (
    <header className="hud">
      {quest && <QuestLog {...quest} />}
      <ThemeControl theme={theme} onTheme={onTheme} />
      <MusicControl available={music.available} playing={music.playing} onToggle={music.toggle} />
      <button
        ref={collectionButtonRef}
        type="button"
        className="hud-button hud-collection"
        aria-haspopup="dialog"
        aria-expanded={collectionOpen}
        onClick={onOpenCollection}
      >
        {copy.collection}
      </button>
    </header>
  )
}
