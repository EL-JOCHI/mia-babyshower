import type { MouseEvent, ReactNode } from 'react'
import { copy, type DayId } from '../content'
import { whatsappUrl } from '../logic/whatsapp'

interface Props {
  day: DayId
  onEmptySpotTap: () => void
  children?: ReactNode
}

// Confirmar (§3, BR-3): a handoff to WhatsApp with that day's message.
// A tap on the empty space near the button startles Susto; the link itself never does.
export function Confirmation({ day, onEmptySpotTap, children }: Props) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    onEmptySpotTap()
  }
  return (
    <div className="confirm-spot" onClick={onClick}>
      <a className="button" href={whatsappUrl(day)} target="_blank" rel="noopener noreferrer">
        {copy.confirm}
      </a>
      {children}
    </div>
  )
}
