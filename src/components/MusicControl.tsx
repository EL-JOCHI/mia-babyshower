import { copy } from '../content'

interface Props {
  available: boolean
  playing: boolean
  onToggle: () => void
}

// A speaker in the ink style of the sun and the moon: a filled shape with a lighter second line
// offset beside it. Sound waves while the music plays; a small cross while it is off.
function Speaker({ playing }: { playing: boolean }) {
  return (
    <svg className="theme-icon music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-playing={playing}>
      <path className="theme-icon-echo" d="M4.8 9.6 H 8.6 L 13.6 5.4 V 19 L 8.6 15 H 4.8 Z" />
      <path className="theme-icon-fill" d="M4 10.2 H 7.8 L 12.8 6.2 V 17.8 L 7.8 13.8 H 4 Z" />
      {playing ? (
        <path
          className="theme-icon-line music-icon-waves"
          d="M15.6 9.6 C 16.7 10.9, 16.7 13.1, 15.6 14.4 M18.2 7.2 C 20.5 9.9, 20.5 14.1, 18.2 16.8"
        />
      ) : (
        <path className="theme-icon-line music-icon-muted" d="M15.8 9.4 L 20.4 14.6 M20.4 9.4 L 15.8 14.6" />
      )}
    </svg>
  )
}

// US-11: absent until the track exists. A speaker icon whose name follows what is actually playing:
// Activar música while it is off, Silenciar música while it plays, as visually hidden text.
export function MusicControl({ available, playing, onToggle }: Props) {
  if (!available) return null
  return (
    <button type="button" className="hud-button hud-icon-button" data-music-control onClick={onToggle}>
      <Speaker playing={playing} />
      <span className="sr-only">{playing ? copy.musicOff : copy.musicOn}</span>
    </button>
  )
}
