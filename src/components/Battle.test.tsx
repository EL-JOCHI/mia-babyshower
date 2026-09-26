import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { battleCopy, copy } from '../content'
import { tuning } from '../tuning'
import { Battle } from './Battle'

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })
// Long enough for the wipe, or for any turn's lines to type out.
const typeOut = () => advance(15000)

describe('Battle dialog (spec §7)', () => {
  it('opens as a dialog with the intro, both bars, and the four moves', () => {
    render(<Battle cat="misha" onWin={vi.fn()} onFlee={vi.fn()} />)
    const dialog = screen.getByRole('dialog', { name: battleCopy.intro('Misha') })
    expect(within(dialog).getByText(battleCopy.catBar)).toBeInTheDocument()
    expect(within(dialog).getByText(battleCopy.youBar)).toBeInTheDocument()
    for (const label of Object.values(battleCopy.moves)) expect(within(dialog).getByRole('button', { name: label })).toBeInTheDocument()
  })
  it('announces lines in a live region and wins with the finisher', () => {
    const onWin = vi.fn()
    render(<Battle cat="kira" onWin={onWin} onFlee={vi.fn()} instant />)
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: battleCopy.moves.ovillo }))
    expect(screen.getByRole('log')).toHaveTextContent(battleCopy.finisher.kira)
    fireEvent.click(screen.getByRole('button', { name: /continuar|Se quedó contigo/i }))
    expect(onWin).toHaveBeenCalledWith('kira')
  })
  it('treats Escape as Huir', () => {
    const onFlee = vi.fn()
    render(<Battle cat="misha" onWin={vi.fn()} onFlee={onFlee} instant />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onFlee).toHaveBeenCalled()
  })
})

describe('Battle screen timing (spec §7 flow, accessibility)', () => {
  afterEach(() => vi.useRealTimers())

  it('plays the wipe, types each line, and keeps the moves disabled until the line is done', () => {
    vi.useFakeTimers()
    render(<Battle cat="misha" onWin={vi.fn()} onFlee={vi.fn()} />)
    const ovillo = screen.getByRole('button', { name: battleCopy.moves.ovillo })
    expect(ovillo).toHaveFocus()
    expect(ovillo).toHaveAttribute('aria-disabled', 'true')
    expect(document.querySelector('.battle-wipe')).not.toBeNull()
    advance(tuning.battleScreen.wipeMs)
    expect(document.querySelector('.battle-wipe')).toBeNull()
    typeOut()
    expect(ovillo).not.toHaveAttribute('aria-disabled')
    fireEvent.click(ovillo)
    expect(ovillo).toHaveAttribute('aria-disabled', 'true')
    // A move while a line types does nothing.
    fireEvent.click(screen.getByRole('button', { name: battleCopy.moves.mimos }))
    typeOut()
    const log = screen.getByRole('log')
    expect(log).toHaveTextContent(battleCopy.yourMove.ovillo('Misha'))
    expect(log).toHaveTextContent(battleCopy.catMoves.misha[0])
    expect(log).not.toHaveTextContent(battleCopy.yourMove.mimos('Misha'))
    expect(ovillo).not.toHaveAttribute('aria-disabled')
  })

  it('lowers the bars toward their values: energy with your move, paciencia with the answer', () => {
    render(<Battle cat="kira" onWin={vi.fn()} onFlee={vi.fn()} instant />)
    const energy = screen.getByRole('meter', { name: battleCopy.catBar })
    const patience = screen.getByRole('meter', { name: battleCopy.youBar })
    expect(energy).toHaveAttribute('aria-valuenow', String(tuning.battle.energy))
    fireEvent.click(screen.getByRole('button', { name: battleCopy.moves.mimos }))
    expect(energy).toHaveAttribute('aria-valuenow', String(tuning.battle.energy - tuning.battle.damage.mimos))
    expect(patience).toHaveAttribute('aria-valuenow', String(tuning.battle.patience - tuning.battle.catDamage[0]))
  })

  it('leaves with Huir after its line, and saves nothing', () => {
    vi.useFakeTimers()
    const onFlee = vi.fn()
    const onWin = vi.fn()
    render(<Battle cat="kira" onWin={onWin} onFlee={onFlee} />)
    advance(tuning.battleScreen.wipeMs)
    typeOut()
    fireEvent.click(screen.getByRole('button', { name: battleCopy.moves.huir }))
    expect(onFlee).not.toHaveBeenCalled()
    typeOut()
    expect(screen.getByRole('log')).toHaveTextContent(battleCopy.fled)
    expect(onFlee).toHaveBeenCalledTimes(1)
    expect(onWin).not.toHaveBeenCalled()
  })

  it('moves focus to the win button, whose label is the caught line', () => {
    render(<Battle cat="misha" onWin={vi.fn()} onFlee={vi.fn()} instant />)
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: battleCopy.moves.ovillo }))
    expect(screen.getByRole('button', { name: copy.caught('Misha') })).toHaveFocus()
    expect(screen.queryByRole('button', { name: battleCopy.moves.huir })).not.toBeInTheDocument()
  })
})
