import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { readStorage, writeStorage } from '../logic/storage'
import { storageKeys } from '../logic/storageKeys'

export interface MusicApi {
  available: boolean
  playing: boolean
  audioRef: RefObject<HTMLAudioElement | null>
  toggle: () => void
}

// Gestures that grant user activation on phones and computers. A touch pointerdown does not.
const gestureEvents = ['pointerup', 'touchend', 'click', 'keydown'] as const

// §4 Music, US-11. Off until the guest turns it on. A stored "on" resumes at the first gesture,
// because browsers block sound before one. The control reflects what is actually playing.
export function useMusic(src: string | undefined): MusicApi {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const wanted = useRef(readStorage(storageKeys.music) === 'on')
  const pending = useRef(false)
  const available = Boolean(src)

  // Resolves true when playback started. A refused play leaves the control reading Activar música.
  const start = useCallback((fromTheStart: boolean): Promise<boolean> => {
    const audio = audioRef.current
    if (!audio || pending.current) return Promise.resolve(false)
    if (fromTheStart) audio.currentTime = 0
    pending.current = true
    return Promise.resolve(audio.play()).then(
      () => {
        pending.current = false
        return true
      },
      () => {
        pending.current = false
        setPlaying(false)
        return false
      },
    )
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

  // A stored "on" starts at the first gesture that is not the music control itself. The listeners
  // stay until playback actually starts, the guest turns music off, or it is already playing.
  useEffect(() => {
    if (!available || !wanted.current) return
    let removed = false
    const remove = () => {
      removed = true
      gestureEvents.forEach((name) => window.removeEventListener(name, onGesture, true))
    }
    const onGesture = (e: Event) => {
      const audio = audioRef.current
      if (!audio || !wanted.current || !audio.paused) {
        remove()
        return
      }
      if (e.target instanceof Element && e.target.closest('[data-music-control]')) return
      void start(false).then((started) => {
        if (started && !removed) remove()
      })
    }
    gestureEvents.forEach((name) => window.addEventListener(name, onGesture, true))
    return remove
  }, [available, start])

  // Pause while the page is hidden. Resume when it is visible again, if the choice is on.
  useEffect(() => {
    if (!available) return
    const resumeAfterHide = { current: false }
    const onVisibility = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) {
        resumeAfterHide.current = !audio.paused
        audio.pause()
      } else if (wanted.current && resumeAfterHide.current) {
        resumeAfterHide.current = false
        void start(false)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [available, start])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || pending.current) return
    if (playing) {
      wanted.current = false
      writeStorage(storageKeys.music, 'off')
      audio.pause()
    } else {
      wanted.current = true
      writeStorage(storageKeys.music, 'on')
      void start(true)
    }
  }, [playing, start])

  return { available, playing, audioRef, toggle }
}
