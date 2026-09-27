import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gameCopy } from '../content'
import type { Award } from '../logic/progress'
import { tuning } from '../tuning'
import { BadgeToasts } from './BadgeToasts'

const toasts = () => screen.queryAllByTestId('badge-toast')

describe('BadgeToasts (design §6)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('shows only the front of the queue: the badge name and its XP', () => {
    const awards: Award[] = [
      { badge: 'fecha', xp: 30 },
      { badge: 'lugar', xp: 30 },
    ]
    render(<BadgeToasts awards={awards} xp={60} onDone={vi.fn()} />)
    expect(toasts()).toHaveLength(1)
    expect(toasts()[0]).toHaveTextContent(gameCopy.badges.fecha)
    expect(toasts()[0]).toHaveTextContent(gameCopy.badgeXp(30))
    expect(toasts()[0]).not.toHaveTextContent(gameCopy.badges.lugar)
  })

  it('shows plain XP for a cat met', () => {
    render(<BadgeToasts awards={[{ xp: 40 }]} xp={40} onDone={vi.fn()} />)
    expect(toasts()[0]).toHaveTextContent(gameCopy.badgeXp(40))
    expect(toasts()[0].querySelector('.badge-toast-name')).toBeNull()
  })

  it('adds the level-up line only to the award that raised the level', () => {
    // 50 XP before the queue: the seal (50) crosses 60, the date (30) does not cross 180.
    const awards: Award[] = [
      { badge: 'sellada', xp: 50 },
      { badge: 'fecha', xp: 30 },
    ]
    const onDone = vi.fn()
    const view = render(<BadgeToasts awards={awards} xp={130} onDone={onDone} />)
    expect(toasts()[0]).toHaveTextContent(gameCopy.levelUp(2))
    view.rerender(<BadgeToasts awards={awards.slice(1)} xp={130} onDone={onDone} />)
    expect(toasts()[0]).toHaveTextContent(gameCopy.badges.fecha)
    expect(toasts()[0]).not.toHaveTextContent(gameCopy.levelUp(2))
  })

  it('calls onDone once the toast has had its time', () => {
    const onDone = vi.fn()
    render(<BadgeToasts awards={[{ badge: 'lugar', xp: 30 }]} xp={30} onDone={onDone} />)
    act(() => {
      vi.advanceTimersByTime(tuning.quest.toastMs - 10)
    })
    expect(onDone).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('waits while paused, and shows nothing', () => {
    const onDone = vi.fn()
    const view = render(<BadgeToasts awards={[{ badge: 'lugar', xp: 30 }]} xp={30} paused onDone={onDone} />)
    expect(toasts()).toHaveLength(0)
    act(() => {
      vi.advanceTimersByTime(tuning.quest.toastMs * 2)
    })
    expect(onDone).not.toHaveBeenCalled()
    view.rerender(<BadgeToasts awards={[{ badge: 'lugar', xp: 30 }]} xp={30} onDone={onDone} />)
    expect(toasts()).toHaveLength(1)
  })

  it('fades the toast out at the end, and starts it over after a pause', () => {
    const awards: Award[] = [{ badge: 'lugar', xp: 30 }]
    const onDone = vi.fn()
    const view = render(<BadgeToasts awards={awards} xp={30} onDone={onDone} />)
    act(() => {
      vi.advanceTimersByTime(tuning.quest.toastMs - tuning.quest.toastLeaveMs + 10)
    })
    expect(toasts()[0]).toHaveClass('is-leaving')
    view.rerender(<BadgeToasts awards={awards} xp={30} paused onDone={onDone} />)
    view.rerender(<BadgeToasts awards={awards} xp={30} onDone={onDone} />)
    expect(toasts()[0]).not.toHaveClass('is-leaving')
    expect(onDone).not.toHaveBeenCalled()
  })

  it('speaks each award in a polite live region', () => {
    render(<BadgeToasts awards={[{ badge: 'puerta', xp: 30 }]} xp={30} onDone={vi.fn()} />)
    const region = document.querySelector('.badge-toasts')!
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent(gameCopy.badges.puerta)
  })
})
