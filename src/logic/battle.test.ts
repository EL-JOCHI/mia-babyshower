import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { chooseMove, startBattle } from './battle'

const b = tuning.battle

describe('legendary battle', () => {
  it('starts full, with the intro line', () => {
    const s = startBattle('misha')
    expect(s).toMatchObject({ energy: b.energy, patience: b.patience, phase: 'choose' })
    expect(s.log).toEqual([{ kind: 'intro' }])
  })
  it('applies the move, then the cat answers in a fixed order', () => {
    const s = chooseMove(startBattle('kira'), 'mimos')
    expect(s.energy).toBe(b.energy - b.damage.mimos)
    expect(s.patience).toBe(b.patience - b.catDamage[0]!)
    expect(s.log.slice(1)).toEqual([{ kind: 'you', move: 'mimos' }, { kind: 'cat', index: 0 }, { kind: 'effect' }])
    expect(chooseMove(s, 'mimos').log.at(-2)).toEqual({ kind: 'cat', index: 1 })
  })
  it('marks a strong hit as very effective, and Ronroneo boosts the next move', () => {
    expect(chooseMove(startBattle('misha'), 'ovillo').log).toContainEqual({ kind: 'effective' })
    const boosted = chooseMove(chooseMove(startBattle('misha'), 'ronroneo'), 'mimos')
    expect(boosted.energy).toBe(b.energy - b.damage.ronroneo - b.damage.mimos * b.boost)
    expect(boosted.log).toContainEqual({ kind: 'effective' })
  })
  it('ends with the finisher when energy runs out, with no cat reply', () => {
    let s = startBattle('misha')
    s = chooseMove(chooseMove(s, 'ovillo'), 'ovillo')
    s = chooseMove(s, 'ovillo')
    expect(s.phase).toBe('won')
    expect(s.energy).toBe(0)
    expect(s.log.at(-1)).toEqual({ kind: 'finisher' })
  })
  it('never lets patience fall below the floor', () => {
    let s = { ...startBattle('kira'), patience: 5 }
    s = chooseMove(s, 'mimos')
    expect(s.patience).toBeGreaterThanOrEqual(b.floor)
    expect(s.log).toContainEqual({ kind: 'safety' })
  })
  it('lets the guest flee at any time, saving nothing', () => {
    const s = chooseMove(startBattle('kira'), 'huir')
    expect(s.phase).toBe('fled')
    expect(s.log.at(-1)).toEqual({ kind: 'fled' })
  })
  it('ignores moves after the battle ended', () => {
    const fled = chooseMove(startBattle('kira'), 'huir')
    expect(chooseMove(fled, 'ovillo')).toBe(fled)
  })
})
