import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tuning } from '../tuning'
import { CardReveal } from './CardReveal'

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe('CardReveal (design §6)', () => {
  afterEach(() => vi.useRealTimers())

  it.each([
    ['luz', 'Común', 'rarity-comun'],
    ['nana', 'Poco común', 'rarity-pocoComun'],
    ['kira', 'Legendario', 'rarity-legendario'],
  ] as const)('shows %s with the rarity %s big', (id, label, className) => {
    render(<CardReveal catId={id} />)
    const card = screen.getByTestId('card-reveal')
    expect(card).toHaveClass(className)
    expect(card.querySelector('.card-rarity')).toHaveTextContent(label)
  })

  it('is visual only: screen readers hear the greeting live region instead', () => {
    const { container } = render(<CardReveal catId="misha" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('card-reveal')).toHaveTextContent('Está en calma, y está en casa.')
  })

  it('leaves on its own after the greeting time, or at once on a tap', () => {
    vi.useFakeTimers()
    const first = render(<CardReveal catId="luz" />)
    advance(tuning.greetingToastMs - tuning.card.leaveMs)
    expect(screen.getByTestId('card-reveal')).toHaveClass('is-leaving')
    advance(tuning.card.leaveMs)
    expect(screen.queryByTestId('card-reveal')).not.toBeInTheDocument()
    first.unmount()
    render(<CardReveal catId="luz" />)
    fireEvent.click(screen.getByTestId('card-reveal'))
    advance(tuning.card.leaveMs)
    expect(screen.queryByTestId('card-reveal')).not.toBeInTheDocument()
  })
})
