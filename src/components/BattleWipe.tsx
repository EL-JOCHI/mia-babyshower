import { useEffect, type CSSProperties } from 'react'
import { tuning } from '../tuning'

interface Props {
  onDone: () => void
}

// The battle-screen spiral wipe (design §7 step 1): spiral arms sweep in over the page, then sweep
// away to reveal the battle. It is decorative, and the battle skips it with reduced motion.
export function BattleWipe({ onDone }: Props) {
  const { wipeMs } = tuning.battleScreen
  useEffect(() => {
    const id = window.setTimeout(onDone, wipeMs)
    return () => window.clearTimeout(id)
  }, [onDone, wipeMs])
  return <div className="battle-wipe" aria-hidden="true" style={{ '--wipe-ms': `${wipeMs}ms` } as CSSProperties} />
}
