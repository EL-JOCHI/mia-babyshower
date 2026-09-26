import { describe, expect, it } from 'vitest'
import { tuning } from '../tuning'
import { moveCatcher, newGame, startGame, tick, type GateGame } from './gateGame'

const t = tuning.gateGame
const withDrop = (g: GateGame, x: number, y: number, kind: 'yarn' | 'heart' = 'yarn'): GateGame => ({
  ...g, drops: [{ id: 99, kind, x, y }], spawnInMs: 1e9,
})

describe('gate game', () => {
  it('waits in ready, then plays for the full duration', () => {
    const g = newGame(0, 1)
    expect(g.phase).toBe('ready')
    expect(tick(g, 1000)).toEqual(g)
    const s = startGame(g)
    expect(s.phase).toBe('playing')
    expect(s.timeLeftMs).toBe(t.durationMs)
  })
  it('scores a catch under the catcher and grows the combo', () => {
    let g = moveCatcher(startGame(newGame(0, 1)), 0.5)
    g = tick(withDrop(g, 0.52, t.catchY - 0.001), 50)
    expect(g.score).toBe(t.points.yarn)
    expect(g.combo).toBe(2)
    g = tick(withDrop(g, 0.5, t.catchY - 0.001, 'heart'), 50)
    expect(g.score).toBe(t.points.yarn + t.points.heart * 2)
  })
  it('resets the combo on a miss and never goes above the maximum', () => {
    let g = { ...moveCatcher(startGame(newGame(0, 1)), 0.1), combo: t.comboMax }
    g = tick(withDrop(g, 0.9, 0.999), 50)
    expect(g.combo).toBe(1)
    expect(g.drops).toHaveLength(0)
  })
  it('clamps a large time step, so a hidden tab does not end the game at once', () => {
    const g = tick(startGame(newGame(0, 1)), 60000)
    expect(g.phase).toBe('playing')
    expect(g.timeLeftMs).toBe(t.durationMs - t.maxStepMs)
  })
  it('ends at zero, keeps the best score, and flags a new record', () => {
    let g = { ...startGame(newGame(50, 1)), score: 80, timeLeftMs: 40 }
    g = tick(g, 50)
    expect(g.phase).toBe('over')
    expect(g.best).toBe(80)
    expect(g.newRecord).toBe(true)
    const again = { ...startGame(newGame(80, 1)), score: 10, timeLeftMs: 10 }
    expect(tick(again, 50).newRecord).toBe(false)
  })
  it('spawns deterministically from the seed', () => {
    const a = tick(startGame(newGame(0, 7)), t.spawnEveryMs)
    const b = tick(startGame(newGame(0, 7)), t.spawnEveryMs)
    expect(a.drops).toEqual(b.drops)
    expect(a.drops.length).toBeGreaterThan(0)
  })
  it('keeps the catcher inside the play area', () => {
    const g = startGame(newGame(0, 1))
    expect(moveCatcher(g, -3).catcherX).toBe(0)
    expect(moveCatcher(g, 3).catcherX).toBe(1)
  })
})
