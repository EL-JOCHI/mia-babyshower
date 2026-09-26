import { days, shared, type DayId } from '../content'

// BR-3: the number and that day's message, encoded with encodeURIComponent.
export function whatsappUrl(day: DayId): string {
  return `https://wa.me/${shared.whatsappNumber}?text=${encodeURIComponent(days[day].whatsappMessage)}`
}
