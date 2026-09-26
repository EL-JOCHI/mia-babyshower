import { useCallback, useEffect, useRef, useState } from 'react'
import { tuning } from '../tuning'

// §3 Playing with what is on screen: the acts, each owned by one cat.
export type ActId = 'luzBat' | 'bramScratch' | 'mimoLift' | 'nanaSit' | 'sustoStartle' | 'mishaScratch' | 'kiraStar'

export type ActiveActs = Partial<Record<ActId, number>>

interface Options {
  available: readonly ActId[]
  autonomous: boolean
}

let sequence = 0

// An act plays for a moment and then everything returns to rest.
export function useActs({ available, autonomous }: Options) {
  const [active, setActive] = useState<ActiveActs>({})
  const timers = useRef(new Map<ActId, number>())
  const key = available.join(',')

  const play = useCallback(
    (act: ActId) => {
      if (!key.split(',').includes(act)) return
      sequence += 1
      const stamp = sequence
      setActive((prev) => ({ ...prev, [act]: stamp }))
      const old = timers.current.get(act)
      if (old) window.clearTimeout(old)
      const duration = act.endsWith('Scratch') ? tuning.acts.scratchFadeMs : tuning.acts.actMs
      timers.current.set(
        act,
        window.setTimeout(() => {
          timers.current.delete(act)
          setActive((prev) => {
            const next = { ...prev }
            delete next[act]
            return next
          })
        }, duration),
      )
    },
    [key],
  )

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  // Cats also play on their own, now and then, when motion is allowed.
  useEffect(() => {
    if (!autonomous || !key) return
    const acts = key.split(',') as ActId[]
    let id = 0
    const schedule = () => {
      const { autoMinMs, autoMaxMs } = tuning.acts
      id = window.setTimeout(() => {
        if (!document.hidden) play(acts[Math.floor(Math.random() * acts.length)]!)
        schedule()
      }, autoMinMs + Math.random() * (autoMaxMs - autoMinMs))
    }
    schedule()
    return () => window.clearTimeout(id)
  }, [autonomous, key, play])

  return { active, play }
}
