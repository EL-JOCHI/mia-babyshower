import { describe, expect, it } from 'vitest'
import { emptyCatState, greet, playAgain, sanitizeCatState } from './catState'

describe('greet (US-9, BR-14)', () => {
  it('adds a first greet to caught and to the round', () => {
    expect(greet(emptyCatState, 'luz')).toEqual({ caught: ['luz'], round: ['luz'], rounds: 1 })
  })

  it('leaves the state unchanged when the cat is already in the round', () => {
    const state = greet(emptyCatState, 'luz')
    expect(greet(state, 'luz')).toBe(state)
  })

  it('keeps greet order', () => {
    const state = greet(greet(greet(emptyCatState, 'mimo'), 'kira'), 'luz')
    expect(state.caught).toEqual(['mimo', 'kira', 'luz'])
  })
})

describe('playAgain (US-13, BR-22)', () => {
  it('empties the round, counts a new round, and keeps caught', () => {
    expect(playAgain({ caught: ['luz', 'mimo', 'nana'], round: ['luz', 'mimo', 'nana'], rounds: 1 })).toEqual({
      caught: ['luz', 'mimo', 'nana'],
      round: [],
      rounds: 2,
    })
  })

  it('lets a cat met before be greeted again without a second copy in caught', () => {
    const again = playAgain({ caught: ['luz'], round: ['luz'], rounds: 1 })
    expect(greet(again, 'luz')).toEqual({ caught: ['luz'], round: ['luz'], rounds: 2 })
  })
})

describe('sanitizeCatState (BR-14, US-9 AC12)', () => {
  it('returns the empty state for unreadable data', () => {
    for (const raw of [null, undefined, 'x', 42, [], { caught: 'luz' }]) {
      expect(sanitizeCatState(raw)).toEqual(emptyCatState)
    }
  })

  it('drops unknown ids and duplicates, and keeps the round inside caught', () => {
    expect(
      sanitizeCatState({ caught: ['luz', 'ghost', 'luz', 'kira'], round: ['kira', 'bram', 'kira'], rounds: 3 }),
    ).toEqual({ caught: ['luz', 'kira'], round: ['kira'], rounds: 3 })
  })

  it('still loads a collection saved before the rename: the old IDs are the renamed cats (spec §3)', () => {
    const old = { caught: ['luz', 'mimo', 'susto', 'bram', 'nana', 'misha', 'kira'], round: ['nana', 'kira'], rounds: 2 }
    expect(sanitizeCatState(old)).toEqual(old)
    expect(sanitizeCatState({ caught: ['chona', 'chori', 'minina'] }).caught).toEqual(['chona', 'chori', 'minina'])
  })

  it('treats a stored list without a round as the first round', () => {
    expect(sanitizeCatState({ caught: ['mimo'] })).toEqual({ caught: ['mimo'], round: ['mimo'], rounds: 1 })
  })

  it('repairs a bad round number', () => {
    expect(sanitizeCatState({ caught: [], round: [], rounds: -2 }).rounds).toBe(1)
    expect(sanitizeCatState({ caught: [], round: [], rounds: 2.5 }).rounds).toBe(1)
  })
})
