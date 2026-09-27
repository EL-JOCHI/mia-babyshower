import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gateGameCopy } from '../content'
import { storageKeys } from '../logic/storageKeys'
import { tuning } from '../tuning'
import { GateGame } from './GateGame'

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
})
