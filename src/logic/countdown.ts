export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// US-6: non-negative units until the start instant, and zero from the start on.
export function countdown(targetIso: string, now: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((Date.parse(targetIso) - now) / 1000))
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
