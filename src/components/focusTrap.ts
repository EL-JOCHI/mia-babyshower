import type { KeyboardEvent } from 'react'

const focusable = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

// A dialog keeps Tab and Shift+Tab inside itself.
export function trapTab(e: KeyboardEvent<HTMLElement>, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return
  const items = Array.from(container.querySelectorAll<HTMLElement>(focusable))
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) return
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
