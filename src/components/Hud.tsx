import type { RefObject } from 'react'
import { copy } from '../content'
import type { ThemeName } from '../tuning'
import { MusicControl } from './MusicControl'
import { ThemeControl } from './ThemeControl'

interface Props {
  theme: ThemeName
  onTheme: (theme: ThemeName) => void
  music: { available: boolean; playing: boolean; toggle: () => void }
  onOpenCollection: () => void
  collectionOpen: boolean
  collectionButtonRef: RefObject<HTMLButtonElement | null>
}

// The controls that stay fixed on screen on the gate and on both invitations (§3).
export function Hud({ theme, onTheme, music, onOpenCollection, collectionOpen, collectionButtonRef }: Props) {
  return (
    <header className="hud">
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
