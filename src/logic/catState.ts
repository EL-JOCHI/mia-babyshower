import { catIds, type CatId } from '../content'

// BR-14: every cat ever greeted, the cats greeted this round, and the round number.
export interface CatState {
  caught: CatId[]
  round: CatId[]
  rounds: number
}

export const emptyCatState: CatState = { caught: [], round: [], rounds: 1 }

export function greet(state: CatState, id: CatId): CatState {
  if (state.round.includes(id)) return state
  return {
    caught: state.caught.includes(id) ? state.caught : [...state.caught, id],
    round: [...state.round, id],
    rounds: state.rounds,
  }
}

// BR-22: a new round. Nothing already met is forgotten.
export function playAgain(state: CatState): CatState {
  return { caught: state.caught, round: [], rounds: state.rounds + 1 }
}

const known: ReadonlySet<string> = new Set(catIds)

function cleanIds(value: unknown): CatId[] | null {
  if (!Array.isArray(value)) return null
  const ids: CatId[] = []
  for (const item of value) {
    if (typeof item === 'string' && known.has(item) && !ids.includes(item as CatId)) ids.push(item as CatId)
  }
  return ids
}

// Stored data can be anything. Keep only what the rules allow.
export function sanitizeCatState(raw: unknown): CatState {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return emptyCatState
  const record = raw as Record<string, unknown>
  const caught = cleanIds(record.caught)
  if (!caught) return emptyCatState
  const storedRound = cleanIds(record.round)
  const round = storedRound ? storedRound.filter((id) => caught.includes(id)) : caught
  const rounds = typeof record.rounds === 'number' && Number.isInteger(record.rounds) && record.rounds >= 1 ? record.rounds : 1
  return { caught, round, rounds }
}
