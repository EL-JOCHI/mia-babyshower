import { useEffect, useState } from 'react'

// The clock, read once per tick. Rendering code receives the instant as a prop.
export function useNow(tickMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])
  return now
}
