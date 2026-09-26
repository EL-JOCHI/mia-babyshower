import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ambienceUrl, qrImageUrl } from '../assets'
import type { CatId } from '../content'
import { useCatState } from '../hooks/useCatState'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useMusic } from '../hooks/useMusic'
import { useNow } from '../hooks/useNow'
import { useProgress } from '../hooks/useProgress'
import { useTheme } from '../hooks/useTheme'
import type { BattleCat } from '../logic/battle'
import { resolveInvite } from '../logic/invite'
import { isPartyOver } from '../logic/party'
import { tuning } from '../tuning'
import { InkDefs } from './art/InkDefs'
import { Battle } from './Battle'
import { CardReveal } from './CardReveal'
import { Collection } from './Collection'
import { Gate } from './Gate'
import { GreetingToast } from './GreetingToast'
import { Hud } from './Hud'
import { WorldRoom } from './WorldRoom'

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
  const { dispatch } = useProgress()
  const { available: musicAvailable, playing: musicPlaying, audioRef, toggle: toggleMusic } = useMusic(musicUrl)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [battleCat, setBattleCat] = useState<BattleCat | null>(null)
  const [toast, setToast] = useState<{ id: CatId; at: number } | null>(null)
  const collectionButton = useRef<HTMLButtonElement | null>(null)
  const battleOpener = useRef<HTMLElement | null>(null)
  // Every cat ever met, kept current for the greeting handler so a double tap cannot count one twice.
  const caught = useRef(cats.state.caught)

  useEffect(() => {
    caught.current = cats.state.caught
  }, [cats.state.caught])

  // A successful greeting (a normal one, or a battle won): the cat stays, its card flips in, and a
  // cat met for the first time earns its XP (design §6).
  const { greetCat } = cats
  const onGreet = useCallback(
    (id: CatId) => {
      const known = caught.current
      greetCat(id)
      if (!known.includes(id)) {
        caught.current = [...known, id]
        dispatch({ type: 'metCat', cat: id, metCount: known.length + 1 })
      }
      setToast({ id, at: performance.now() })
    },
    [dispatch, greetCat],
  )

  // One dialog at a time (Review Focus 1): no battle while Tus gatos is open, and the reverse.
  const onChallenge = useCallback(
    (id: BattleCat) => {
      if (collectionOpen) return
      battleOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setBattleCat((current) => current ?? id)
    },
    [collectionOpen],
  )

  // Focus goes back to ¡A jugar!, or to the cat once it has joined and the button is gone.
  const closeBattle = useCallback((cat: BattleCat) => {
    setBattleCat(null)
    window.requestAnimationFrame(() => {
      const opener = battleOpener.current
      if (opener?.isConnected) opener.focus()
      else document.querySelector<HTMLElement>(`[data-cat-id="${cat}"] .cat-figure`)?.focus()
    })
  }, [])

  const onWin = useCallback(
    (cat: BattleCat) => {
      closeBattle(cat)
      onGreet(cat)
    },
    [closeBattle, onGreet],
  )

  const onFlee = useCallback(() => {
    if (battleCat) closeBattle(battleCat)
  }, [battleCat, closeBattle])

  const openCollection = useCallback(() => {
    if (!battleCat) setCollectionOpen(true)
  }, [battleCat])

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
      <InkDefs still={reducedMotion} />
      <div className="app-page" inert={collectionOpen || battleCat !== null}>
        <Hud
          theme={theme}
          onTheme={setTheme}
          music={{ available: musicAvailable, playing: musicPlaying, toggle: toggleMusic }}
          onOpenCollection={openCollection}
          collectionOpen={collectionOpen}
          collectionButtonRef={collectionButton}
        />
        {opening.kind === 'gate' ? (
          <Gate reducedMotion={reducedMotion} catState={cats.state} onGreet={onGreet} musicPlaying={musicPlaying} />
        ) : (
          <WorldRoom
            theme={theme}
            day={opening.day}
            now={now}
            reducedMotion={reducedMotion}
            catState={cats.state}
            onGreet={onGreet}
            onChallenge={onChallenge}
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
      {battleCat && <Battle cat={battleCat} onWin={onWin} onFlee={onFlee} instant={reducedMotion} />}
      {toast && <CardReveal key={toast.at} catId={toast.id} />}
      <GreetingToast catId={toast?.id ?? null} />
      {musicAvailable && <audio ref={audioRef} src={musicUrl} loop preload="none" />}
    </div>
  )
}
