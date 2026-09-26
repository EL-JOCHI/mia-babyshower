import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { readStorage, writeStorage } from '../logic/storage'
import { storageKeys } from '../logic/storageKeys'

export interface MusicApi {
  available: boolean
  playing: boolean
  audioRef: RefObject<HTMLAudioElement | null>
  toggle: () => void
}

// §4 Music, US-11. Off until the guest turns it on. A stored "on" resumes at the first gesture,
// because browsers block sound before one. The control reflects what is actually playing.
export function useMusic(src: string | undefined): MusicApi {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const wanted = useRef(readStorage(storageKeys.music) === 'on')
  const available = Boolean(src)

  const start = useCallback((fromTheStart: boolean) => {
    const audio = audioRef.current
    if (!audio) return
    if (fromTheStart) audio.currentTime = 0
    const attempt = audio.play()
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => setPlaying(false))
  }, [])

  // Keep the label honest: follow the element's own events.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('playing', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('playing', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [available])

  // A stored "on" starts at the first tap, drag, or key press that is not the music control itself.
  useEffect(() => {
    if (!available || !wanted.current) return
    const onGesture = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('[data-music-control]')) return
      remove()
      if (wanted.current) start(true)
    }
    const events = ['pointerdown', 'keydown', 'touchend'] as const
    const remove = () => events.forEach((name) => window.removeEventListener(name, onGesture, true))
    events.forEach((name) => window.addEventListener(name, onGesture, true))
    return remove
  }, [available, start])

  // Pause while the page is hidden. Resume when it is visible again, if the choice is on.
  useEffect(() => {
    if (!available) return
    const onVisibility = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) audio.pause()
      else if (wanted.current && audio.paused && audio.currentTime > 0) start(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [available, start])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      wanted.current = false
      writeStorage(storageKeys.music, 'off')
      audio.pause()
    } else {
      wanted.current = true
      writeStorage(storageKeys.music, 'on')
      start(true)
    }
  }, [playing, start])

  return { available, playing, audioRef, toggle }
}
