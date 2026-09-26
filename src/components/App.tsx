import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ambienceUrl, qrImageUrl } from '../assets'
import type { CatId } from '../content'
import { useCatState } from '../hooks/useCatState'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useMusic } from '../hooks/useMusic'
import { useNow } from '../hooks/useNow'
import { useTheme } from '../hooks/useTheme'
import { resolveInvite } from '../logic/invite'
import { isPartyOver } from '../logic/party'
import { tuning } from '../tuning'
import { Collection } from './Collection'
import { Gate } from './Gate'
import { GreetingToast } from './GreetingToast'
import { Hud } from './Hud'
import { Room } from './Room'

interface Props {
  search?: string
  qrUrl?: string
  musicUrl?: string
}

// One page. The opening comes from the query string once; the clock, theme, cats, and music
// are the only live inputs (§10 Quality bar).
export function App({ search = window.location.search, qrUrl = qrImageUrl, musicUrl = ambienceUrl }: Props) {
  const opening = useMemo(() => resolveInvite(search), [search])
  const now = useNow()
  const reducedMotion = useReducedMotion()
  const [theme, setTheme] = useTheme()
  const cats = useCatState()
  const { available: musicAvailable, playing: musicPlaying, audioRef, toggle: toggleMusic } = useMusic(musicUrl)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [toast, setToast] = useState<{ id: CatId; at: number } | null>(null)
  const collectionButton = useRef<HTMLButtonElement | null>(null)

  const { greetCat } = cats
  const onGreet = useCallback(
    (id: CatId) => {
      greetCat(id)
      setToast({ id, at: performance.now() })
    },
    [greetCat],
  )

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), tuning.greetingToastMs)
    return () => window.clearTimeout(timer)
  }, [toast])

  const closeCollection = useCallback(() => {
    setCollectionOpen(false)
    window.requestAnimationFrame(() => collectionButton.current?.focus())
  }, [])

  const partyOver = opening.kind === 'day' && isPartyOver(opening.day, now)

  return (
    <div className="app">
      <div className="app-page" inert={collectionOpen}>
        <Hud
          theme={theme}
          onTheme={setTheme}
          music={{ available: musicAvailable, playing: musicPlaying, toggle: toggleMusic }}
          onOpenCollection={() => setCollectionOpen(true)}
          collectionOpen={collectionOpen}
          collectionButtonRef={collectionButton}
        />
        {opening.kind === 'gate' ? (
          <Gate reducedMotion={reducedMotion} catState={cats.state} onGreet={onGreet} musicPlaying={musicPlaying} />
        ) : (
          <Room
            day={opening.day}
            now={now}
            reducedMotion={reducedMotion}
            catState={cats.state}
            onGreet={onGreet}
            musicPlaying={musicPlaying}
            qrUrl={qrUrl}
          />
        )}
      </div>
      {collectionOpen && (
        <Collection
          state={cats.state}
          allowPlayAgain={partyOver}
          onPlayAgain={cats.startNewRound}
          onClose={closeCollection}
        />
      )}
      <GreetingToast catId={toast?.id ?? null} />
      {musicAvailable && <audio ref={audioRef} src={musicUrl} loop preload="none" />}
    </div>
  )
}
