import { act, fireEvent, render, screen } from '@testing-library/react'
import { Profiler } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gateGameCopy } from '../content'
import indexCss from '../index.css?raw'
import { storageKeys } from '../logic/storageKeys'
import gameCss from '../styles/game.css?raw'
import { tuning } from '../tuning'
import { GateGame } from './GateGame'

// A rule's declarations, found by its exact selector list (comments dropped, whitespace folded).
function ruleFor(css: string, selector: string): string {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  return rules.find(([, selectors]) => selectors!.trim().replace(/\s+/g, ' ') === selector)?.[2] ?? ''
}

describe('Gate game (spec §8)', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'setInterval'] }))
  afterEach(() => vi.useRealTimers())

  it('starts on a tap, counts down, and ends with the score and best', () => {
    render(<GateGame reducedMotion={false} />)
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(screen.getByText(gateGameCopy.seconds(tuning.gateGame.durationMs / 1000))).toBeInTheDocument()
    for (let t = 0; t < tuning.gateGame.durationMs + 500; t += 50) act(() => { vi.advanceTimersByTime(50) })
    expect(screen.getByText(gateGameCopy.over)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jugar otra vez' })).toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.gateBest)).not.toBeNull()
  })
  it('shows no falling objects with reduced motion', () => {
    render(<GateGame reducedMotion />)
    expect(screen.queryByRole('button', { name: gateGameCopy.start })).not.toBeInTheDocument()
  })

  // jsdom lays nothing out: give the play field a size, as a phone would.
  const sizeField = () => {
    const field = document.querySelector('.gate-game-field') as HTMLElement
    Object.defineProperty(field, 'clientWidth', { configurable: true, value: 300 })
    Object.defineProperty(field, 'clientHeight', { configurable: true, value: 200 })
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200, x: 0, y: 0, toJSON: () => ({}) } as DOMRect)
    return field
  }

  // Spec §5: the frame loop moves the drops and the catcher itself; React renders only on events.
  it('does not re-render React on animation frames: only a score, a combo, a phase, or a best changes it', () => {
    const commits = vi.fn()
    render(
      <Profiler id="gate-game" onRender={commits}>
        <GateGame reducedMotion={false} />
      </Profiler>,
    )
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    sizeField()
    act(() => {
      vi.advanceTimersByTime(32)
    })
    commits.mockClear()
    const slots = () => [...document.querySelectorAll<HTMLElement>('.gate-game-drop')]
    const before = slots().map((slot) => slot.style.transform)
    // About 1.5 s of frames: the first drops fall, none reaches the catcher or the floor yet, and the
    // clock ticks past a whole second.
    for (let frame = 0; frame < 90; frame++) {
      act(() => {
        vi.advanceTimersByTime(16)
      })
    }
    expect(commits).not.toHaveBeenCalled()
    // The drops did move: the first slot holds a falling drop, lower than before.
    expect(slots()[0]!.dataset.kind).not.toBe('')
    expect(slots()[0]!.style.transform).not.toBe(before[0])
    expect(screen.getByText(gateGameCopy.seconds(tuning.gateGame.durationMs / 1000 - 1))).toBeInTheDocument()
  })

  it('has a drop slot for every drop that can fall at once', () => {
    const { fallPerS, spawnEveryMs } = tuning.gateGame
    // A drop falls the whole field in 1 / fallPerS seconds; one spawns every spawnEveryMs.
    const most = Math.ceil(1000 / fallPerS / spawnEveryMs) + 1
    expect(tuning.gateScreen.dropSlots).toBeGreaterThanOrEqual(most)
    render(<GateGame reducedMotion={false} />)
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    expect(document.querySelectorAll('.gate-game-drop')).toHaveLength(tuning.gateScreen.dropSlots)
  })

  it('moves the catcher from the pointer without a React render', () => {
    const commits = vi.fn()
    render(
      <Profiler id="gate-game" onRender={commits}>
        <GateGame reducedMotion={false} />
      </Profiler>,
    )
    fireEvent.click(screen.getByRole('button', { name: gateGameCopy.start }))
    const field = sizeField()
    act(() => {
      vi.advanceTimersByTime(32)
    })
    commits.mockClear()
    const catcher = document.querySelector('.gate-game-catcher') as HTMLElement
    const before = catcher.style.transform
    fireEvent.pointerMove(field, { clientX: 30, clientY: 100 })
    for (let frame = 0; frame < 10; frame++) {
      act(() => {
        vi.advanceTimersByTime(16)
      })
    }
    expect(commits).not.toHaveBeenCalled()
    // It eases from the middle (150 px) toward 30 px.
    const x = (transform: string) => Number(/translate3d\(([\d.]+)px/.exec(transform)![1])
    expect(x(before)).toBe(150)
    expect(x(catcher.style.transform)).toBeLessThan(60)
  })

  it('paints the panel above the roaming cats and their Saludar pills (z-index)', () => {
    render(<GateGame reducedMotion={false} />)
    const panel = document.querySelector('.gate-game') as HTMLElement
    const panelZ = Number(panel.style.getPropertyValue('--panel-z'))
    // .saludar and .gate-spot's z-index values, from src/index.css.
    expect(panelZ).toBeGreaterThan(4)
    expect(panelZ).toBe(tuning.gateScreen.panelZIndex)
  })
})

// Spec §5 and controller ruling 3: on a slow phone, what the frame loop moves must not redraw.
describe('the gate game stays cheap to draw', () => {
  it('moves the drops and the catcher by transform alone: no filter, no transition, each on its own layer', () => {
    for (const selector of ['.gate-game-drop', '.gate-game-catcher']) {
      const rule = ruleFor(gameCss, selector)
      expect(rule).toMatch(/will-change:\s*transform/)
      expect(rule).not.toMatch(/filter\s*:/)
      expect(rule).not.toMatch(/transition\s*:/)
    }
  })

  it("stops every gate cat's rig loops while a round plays, so no cat's filters redraw each frame", () => {
    expect(ruleFor(indexCss, '.gate.is-playing .cat-sprite, .gate.is-playing .cat-sprite *')).toMatch(/animation:\s*none/)
  })
})
