import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { FlatRoom } from '../components/FlatRoom'
import type { CatId, DayId } from '../content'
import type { BattleCat } from '../logic/battle'
import { emptyCatState, type CatState } from '../logic/catState'

export const at = (iso: string) => Date.parse(iso)

export const beforeSatCutoff = at('2026-10-17T12:00:00-04:00')
export const satCutoff = at('2026-10-18T00:00:00-04:00')
export const beforeSunCutoff = at('2026-10-18T12:00:00-04:00')
export const sunCutoff = at('2026-10-19T00:00:00-04:00')

interface RoomOptions {
  day?: DayId
  now?: number
  reducedMotion?: boolean
  catState?: CatState
  onGreet?: (id: CatId) => void
  onChallenge?: (id: BattleCat) => void
  musicPlaying?: boolean
  qrUrl?: string
}

export function renderRoom(options: RoomOptions = {}) {
  const onGreet = options.onGreet ?? vi.fn()
  const onChallenge = options.onChallenge ?? vi.fn()
  const props = {
    day: options.day ?? ('sat' as DayId),
    now: options.now ?? beforeSatCutoff,
    reducedMotion: options.reducedMotion ?? false,
    catState: options.catState ?? emptyCatState,
    onGreet,
    onChallenge,
    musicPlaying: options.musicPlaying ?? false,
    qrUrl: options.qrUrl,
  }
  const view = render(<FlatRoom {...props} />)
  return { ...view, onGreet, onChallenge, props }
}

// Put every cat in the middle of the viewport, so noticing can run in jsdom.
export function catsInView() {
  const centre = {
    x: window.innerWidth / 2 - 32,
    y: window.innerHeight / 2 - 32,
    width: 64,
    height: 64,
  }
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const box = this.matches('[data-cat-id]') ? centre : { x: 0, y: 0, width: 0, height: 0 }
    return {
      ...box,
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
      toJSON: () => box,
    } as DOMRect
  })
}

export function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

// jsdom has no media playback. Record calls and fire the element's own events.
export function stubMedia(options: { refuse?: boolean } = {}) {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    if (options.refuse) return Promise.reject(new DOMException('blocked', 'NotAllowedError'))
    Object.defineProperty(this, 'paused', { configurable: true, value: false })
    this.dispatchEvent(new Event('playing'))
    return Promise.resolve()
  })
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: true })
    this.dispatchEvent(new Event('pause'))
  })
  return { play, pause }
}
