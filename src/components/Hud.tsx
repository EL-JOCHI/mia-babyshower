import type { RefObject } from 'react'
import { copy } from '../content'
import type { ThemeName } from '../tuning'

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
      <div className="theme-control" role="group" aria-label={copy.a11y.theme}>
        {(['dark', 'light'] as const).map((name) => (
          <button
            key={name}
            type="button"
            className="hud-button"
            aria-pressed={theme === name}
            onClick={() => onTheme(name)}
          >
            {name === 'dark' ? copy.themeDark : copy.themeLight}
          </button>
        ))}
      </div>
      {music.available && (
        <button type="button" className="hud-button" data-music-control onClick={music.toggle}>
          {music.playing ? copy.musicOff : copy.musicOn}
        </button>
      )}
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
