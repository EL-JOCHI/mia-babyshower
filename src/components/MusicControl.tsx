import { copy } from '../content'

interface Props {
  available: boolean
  playing: boolean
  onToggle: () => void
}

// US-11: absent until the track exists. The label follows what is actually playing.
export function MusicControl({ available, playing, onToggle }: Props) {
  if (!available) return null
  return (
    <button type="button" className="hud-button" data-music-control onClick={onToggle}>
      {playing ? copy.musicOff : copy.musicOn}
    </button>
  )
}
