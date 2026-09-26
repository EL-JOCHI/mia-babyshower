import { tuning } from '../tuning'

export interface Drop { id: number; kind: 'yarn' | 'heart'; x: number; y: number }
export interface GateGame {
  phase: 'ready' | 'playing' | 'over'
  timeLeftMs: number; score: number; combo: number; best: number; newRecord: boolean
  catcherX: number; drops: Drop[]; nextId: number; spawnInMs: number; seed: number
}

const t = () => tuning.gateGame
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

// mulberry32: a tiny seeded random source, so the game is reproducible in tests.
function rand(seed: number): [number, number] {
  let s = (seed + 0x6d2b79f5) | 0
  let r = Math.imul(s ^ (s >>> 15), 1 | s)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  s = s | 0
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, s]
}

export function newGame(best: number, seed = Date.now() % 100000): GateGame {
  return { phase: 'ready', timeLeftMs: t().durationMs, score: 0, combo: 1, best, newRecord: false,
    catcherX: 0.5, drops: [], nextId: 1, spawnInMs: 0, seed }
}

export function startGame(g: GateGame): GateGame {
  return { ...newGame(g.best, g.seed), phase: 'playing' }
}

export function moveCatcher(g: GateGame, x: number): GateGame {
  return { ...g, catcherX: clamp01(x) }
}

export function tick(g: GateGame, dtMs: number): GateGame {
  if (g.phase !== 'playing') return g
  const cfg = t()
  const dt = Math.min(dtMs, cfg.maxStepMs)
  let { score, combo, seed, nextId, spawnInMs } = g
  const drops: Drop[] = []
  for (const d of g.drops) {
    const y = d.y + (cfg.fallPerS * dt) / 1000
    if (y >= cfg.catchY && d.y < cfg.catchY && Math.abs(d.x - g.catcherX) <= cfg.catchRadius) {
      score += cfg.points[d.kind] * combo
      combo = Math.min(cfg.comboMax, combo + 1)
      continue
    }
    if (y > 1) { combo = 1; continue }
    drops.push({ ...d, y })
  }
  spawnInMs -= dt
  while (spawnInMs <= 0) {
    const [rx, s1] = rand(seed)
    const [rk, s2] = rand(s1)
    seed = s2
    drops.push({ id: nextId++, kind: rk < cfg.heartChance ? 'heart' : 'yarn', x: 0.06 + rx * 0.88, y: 0 })
    spawnInMs += cfg.spawnEveryMs
  }
  const timeLeftMs = Math.max(0, g.timeLeftMs - dt)
  if (timeLeftMs === 0) {
    const newRecord = score > g.best
    return { ...g, phase: 'over', timeLeftMs, score, combo, drops: [], best: Math.max(g.best, score), newRecord, seed, nextId, spawnInMs }
  }
  return { ...g, timeLeftMs, score, combo, drops, seed, nextId, spawnInMs }
}
