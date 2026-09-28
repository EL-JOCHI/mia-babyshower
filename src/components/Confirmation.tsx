import type { MouseEvent, ReactNode } from 'react'
import type { DayId } from '../content'
import { WaxSealConfirm } from './WaxSealConfirm'

interface Props {
  day: DayId
  sealed: boolean
  onConfirm: () => void
  onEmptySpotTap: () => void
  children?: ReactNode
}

// Confirmar (§3, BR-3): a handoff to WhatsApp with that day's message, on the invitation letter.
// A tap on the empty space near the button startles Chavela; the link itself never does, and
// neither does a tap on a cat (Minina batting at the seal is not empty space).
export function Confirmation({ day, sealed, onConfirm, onEmptySpotTap, children }: Props) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button, [data-cat-id]')) return
    onEmptySpotTap()
  }
  return (
    <div className="confirm-spot" onClick={onClick}>
      <WaxSealConfirm day={day} sealed={sealed} onConfirm={onConfirm} />
      {children}
    </div>
  )
}
