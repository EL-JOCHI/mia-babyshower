import { useEffect, useRef, useState, type RefObject } from 'react'
import type { CatId } from '../content'
import type { Point } from '../logic/layout'
import { idleNotice, stepNotice, type NoticeTimer } from '../logic/noticing'
import { tuning } from '../tuning'

interface Options {
  catIds: readonly CatId[]
  container: RefObject<HTMLElement | null>
  cameraRef: { readonly current: Point }
  musicPlaying: boolean
  // How much of the screen counts as "in view" (design §3). Defaults to tuning.noticing.zone; the
  // gate's camera never moves, so its cats pass a much wider zone instead (tuning.gateScreen.noticeZone).
  zone?: number
}

type Noticing = Partial<Record<CatId, boolean>>

function inZone(rect: DOMRect, vw: number, vh: number, zone: number): boolean {
  const margin = (1 - zone) / 2
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  return x >= vw * margin && x <= vw * (1 - margin) && y >= vh * margin && y <= vh * (1 - margin)
}

// §3 Noticing, run on a steady tick. Each cat's element carries data-cat-id.
export function useNoticing({ catIds, container, cameraRef, musicPlaying, zone }: Options): Noticing {
  const [noticing, setNoticing] = useState<Noticing>({})
  const timers = useRef<Partial<Record<CatId, NoticeTimer>>>({})
  const music = useRef(musicPlaying)
  const key = catIds.join(',')
  const activeZone = zone ?? tuning.noticing.zone

  useEffect(() => {
    music.current = musicPlaying
  }, [musicPlaying])

  useEffect(() => {
    const { tickMs } = tuning.noticing
    const ids = key ? (key.split(',') as CatId[]) : []
    let last = cameraRef.current

    // A fixed step keeps the waits exact and the result the same under test timers.
    const id = window.setInterval(() => {
      const dt = tickMs
      const cam = cameraRef.current
      const speed = (Math.hypot(cam.x - last.x, cam.y - last.y) / dt) * 1000
      last = cam

      // One pass over the page finds every cat (the first element per cat, as querySelector would).
      const found = new Map<string, HTMLElement>()
      for (const el of container.current?.querySelectorAll<HTMLElement>('[data-cat-id]') ?? []) {
        const catId = el.dataset.catId
        if (catId && !found.has(catId)) found.set(catId, el)
      }
      const next: Noticing = {}
      let changed = false
      for (const catId of ids) {
        const el = found.get(catId)
        const within = el ? inZone(el.getBoundingClientRect(), window.innerWidth, window.innerHeight, activeZone) : false
        const prev = timers.current[catId] ?? idleNotice
        const timer = stepNotice(prev, { catId, inZone: within, speed, musicPlaying: music.current }, dt)
        timers.current[catId] = timer
        next[catId] = timer.noticing
        if (timer.noticing !== prev.noticing) changed = true
      }
      if (changed) setNoticing(next)
    }, tickMs)
    return () => window.clearInterval(id)
  }, [key, container, cameraRef, activeZone])

  return noticing
}
