import { tuning } from '../tuning'

export type BattleCat = 'misha' | 'kira'
export type MoveId = 'ovillo' | 'mimos' | 'ronroneo' | 'huir'
export type BattleLine =
  | { kind: 'intro' } | { kind: 'you'; move: Exclude<MoveId, 'huir'> } | { kind: 'effective' }
  | { kind: 'cat'; index: number } | { kind: 'effect' } | { kind: 'safety' } | { kind: 'finisher' } | { kind: 'fled' }
export interface BattleState {
  cat: BattleCat; energy: number; patience: number; boosted: boolean; catTurn: number
  phase: 'choose' | 'won' | 'fled'; log: BattleLine[]
}

export function startBattle(cat: BattleCat): BattleState {
  const b = tuning.battle
  return { cat, energy: b.energy, patience: b.patience, boosted: false, catTurn: 0, phase: 'choose', log: [{ kind: 'intro' }] }
}

export function chooseMove(s: BattleState, move: MoveId): BattleState {
  if (s.phase !== 'choose') return s
  const b = tuning.battle
  if (move === 'huir') return { ...s, phase: 'fled', log: [...s.log, { kind: 'fled' }] }
  const log: BattleLine[] = [...s.log, { kind: 'you', move }]
  const hit = b.damage[move] * (s.boosted ? b.boost : 1)
  if (hit >= b.effectiveAt) log.push({ kind: 'effective' })
  const energy = Math.max(0, s.energy - hit)
  if (energy === 0) return { ...s, energy, boosted: false, phase: 'won', log: [...log, { kind: 'finisher' }] }
  const index = s.catTurn % b.catDamage.length
  let patience = s.patience - b.catDamage[index]!
  log.push({ kind: 'cat', index }, { kind: 'effect' })
  if (patience < b.floor) {
    patience = Math.min(b.patience, Math.max(b.floor, patience) + b.safetyRestore)
    log.push({ kind: 'safety' })
  }
  return { ...s, energy, patience, boosted: move === 'ronroneo', catTurn: s.catTurn + 1, log }
}
