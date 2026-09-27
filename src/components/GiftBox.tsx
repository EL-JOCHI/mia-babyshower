import { useState, type CSSProperties, type ReactNode } from 'react'
import { tuning } from '../tuning'

interface Props {
  // The page is standing or in view, found, or motion is reduced: the box stands open. Once open,
  // it stays open, so it opens once.
  open: boolean
  // Who perches on the box (Nana).
  perch?: ReactNode
  // What the box holds: the QR plate, or the pending sentence.
  children: ReactNode
  // What sits below the box: Guardar QR.
  below?: ReactNode
}

// Presente (design §5): a gift box. As soon as its page stands (or is in view), the ribbon unties,
// the lid lifts away, and the front folds down flat like a pop-up, revealing the QR plate. A tap or
// keyboard focus inside opens it too.
export function GiftBox({ open, perch, children, below }: Props) {
  const [isOpen, setOpen] = useState(open)
  if (open && !isOpen) setOpen(true)
  const { untieMs, liftMs, liftDelayMs } = tuning.objects.gift
  const style = {
    '--untie-ms': `${untieMs}ms`,
    '--lift-ms': `${liftMs}ms`,
    '--lift-delay': `${liftDelayMs}ms`,
  } as CSSProperties
  return (
    <div
      className={`gift-box${isOpen ? ' is-open' : ''}`}
      style={style}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen(true)}
    >
      <div className="qr-perch">{perch}</div>
      <div className="gift-box-art">
        <div className="gift-box-back" aria-hidden="true" />
        <div className="gift-box-inside">{children}</div>
        <div className="gift-box-front" aria-hidden="true" />
        <div className="gift-box-lid" aria-hidden="true" />
        <svg className="gift-ribbon" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect className="gift-ribbon-band" x={45} y={0} width={10} height={100} />
        </svg>
        <svg className="gift-bow" viewBox="0 0 80 44" aria-hidden="true" focusable="false">
          <path className="gift-bow-loop" d="M40 30 C 26 8, 6 6, 6 20 C 6 32, 26 34, 40 30 Z" />
          <path className="gift-bow-loop" d="M40 30 C 54 8, 74 6, 74 20 C 74 32, 54 34, 40 30 Z" />
          <path className="gift-bow-tail" d="M38 31 L 28 43 M42 31 L 52 43" />
          <circle className="gift-bow-knot" cx={40} cy={30} r={5} />
        </svg>
      </div>
      {below}
    </div>
  )
}
