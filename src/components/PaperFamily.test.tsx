import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { tuning } from '../tuning'
import { PaperFamily } from './PaperFamily'

// A controllable IntersectionObserver: the test says when the door comes into view.
class FakeObserver {
  static instances: FakeObserver[] = []
  disconnected = false
  private readonly callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeObserver.instances.push(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.disconnected = true
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  enter() {
    if (!this.disconnected) {
      this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
  }
}

const family = () => document.querySelector('.paper-family')!
const { foldMs, walkMs, staggerMs } = tuning.family
const entrance = foldMs + walkMs + staggerMs * 3

describe('the CSS paper family (spec §6)', () => {
  beforeEach(() => {
    FakeObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('lies flat until the door is in view, then folds up and walks in, once', () => {
    render(<PaperFamily still={false} />)
    expect(family()).toHaveClass('is-waiting')
    act(() => FakeObserver.instances[0]!.enter())
    expect(family()).toHaveClass('is-entering')
    act(() => {
      vi.advanceTimersByTime(entrance + 10)
    })
    expect(family()).toHaveClass('is-standing')
    expect(FakeObserver.instances[0]!.disconnected).toBe(true)
    act(() => FakeObserver.instances[0]!.enter())
    expect(family()).toHaveClass('is-standing')
    expect(family()).not.toHaveClass('is-entering')
  })

  it('simply stands with reduced motion: no fold and no walk', () => {
    render(<PaperFamily still />)
    expect(family()).toHaveClass('is-standing')
    expect(FakeObserver.instances).toHaveLength(0)
    act(() => {
      vi.advanceTimersByTime(entrance + 10)
    })
    expect(family()).toHaveClass('is-standing')
  })

  it('walks the figures in one after another, dad first and Mia last, hidden from screen readers', () => {
    render(<PaperFamily still={false} />)
    const figures = [...document.querySelectorAll<HTMLElement>('.paper-figure')]
    expect(figures.map((f) => [...f.classList].find((name) => name.startsWith('figure-')))).toEqual([
      'figure-dad',
      'figure-mom',
      'figure-miguelito',
      'figure-mia',
    ])
    expect(figures.map((f) => f.style.getPropertyValue('--figure-delay'))).toEqual([0, 1, 2, 3].map((i) => `${i * staggerMs}ms`))
    expect(family()).toHaveAttribute('aria-hidden', 'true')
  })

  it("cuts each figure from paper in the cats' double ink line, with no line boil, moving or still", () => {
    for (const still of [false, true]) {
      const view = render(<PaperFamily still={still} />)
      for (const layer of document.querySelectorAll('.figure-body, .figure-hair')) {
        const cut = layer.querySelector('[filter="url(#paper-cut)"]')
        expect(cut).not.toBeNull()
        expect(cut!.querySelector('.figure-ink')).not.toBeNull()
        expect(cut!.querySelector('.figure-echo')).not.toBeNull()
      }
      expect(document.querySelectorAll('.figure-body, .figure-hair')).toHaveLength(8)
      expect(family().querySelector('[filter="url(#ink-boil)"]')).toBeNull()
      view.unmount()
    }
  })
})
