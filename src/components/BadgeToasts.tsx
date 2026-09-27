import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { gameCopy } from '../content'
import { levelFor, type Award } from '../logic/progress'
import { tuning } from '../tuning'

interface Props {
  // The queue of awards, oldest first.
  awards: readonly Award[]
  // The XP after every award in the queue, so each toast knows whether its award raised the level.
  xp: number
  // While a card is showing, the queue waits.
  paused?: boolean
  // The toast at the front of the queue has had its time.
  onDone: () => void
}

// Design §6: one toast at a time from the queue: the badge's name and +{xp} XP (just +{xp} XP for a
// cat's XP), and ¡Subiste a nivel {n}! when that award raised the level. Each toast stays
// tuning.quest.toastMs. The region is a polite live region, so screen readers hear one line per
// award; it is not role="status", which the greeting already uses.
export function BadgeToasts({ awards, xp, paused = false, onDone }: Props) {
  // How many toasts have gone, and whether the current one is on its way out.
  const [shown, setShown] = useState({ count: 0, leaving: false })
  const current = paused ? undefined : awards[0]
  const { toastMs, toastLeaveMs } = tuning.quest

  // A toast that comes back after a pause starts over, not on its way out.
  const [was, setWas] = useState(current)
  if (was !== current) {
    setWas(current)
    if (shown.leaving) setShown((s) => ({ ...s, leaving: false }))
  }

  const done = useCallback(() => {
    setShown((s) => ({ count: s.count + 1, leaving: false }))
    onDone()
  }, [onDone])

  useEffect(() => {
    if (!current) return
    const leave = window.setTimeout(() => setShown((s) => ({ ...s, leaving: true })), toastMs - toastLeaveMs)
    const end = window.setTimeout(done, toastMs)
    return () => {
      window.clearTimeout(leave)
      window.clearTimeout(end)
    }
  }, [current, done, toastMs, toastLeaveMs])

  let levelUp: number | null = null
  if (current) {
    const before = xp - awards.reduce((sum, award) => sum + award.xp, 0)
    const reached = levelFor(before + current.xp).level
    if (reached > levelFor(before).level) levelUp = reached
  }

  const style = { '--toast-leave-ms': `${toastLeaveMs}ms` } as CSSProperties
  const classes = ['badge-toast', levelUp ? 'is-level-up' : '', shown.leaving ? 'is-leaving' : '']
  return (
    <div className="badge-toasts" aria-live="polite" aria-atomic="true" style={style}>
      {current && (
        <div className={classes.filter(Boolean).join(' ')} data-testid="badge-toast" key={shown.count}>
          <span className="badge-toast-icon" aria-hidden="true">
            ★
          </span>
          <div className="badge-toast-text">
            {current.badge && <p className="badge-toast-name">{gameCopy.badges[current.badge]}</p>}
            <p className="badge-toast-xp">{gameCopy.badgeXp(current.xp)}</p>
            {levelUp && <p className="badge-toast-level">{gameCopy.levelUp(levelUp)}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
