import { useState, type CSSProperties } from 'react'
import { copy, type DayId } from '../content'
import { whatsappUrl } from '../logic/whatsapp'
import { tuning } from '../tuning'

interface Props {
  day: DayId
  // The invitation has already been sealed (the Invitación sellada badge).
  sealed: boolean
  onConfirm: () => void
}

// Confirmar (design §5): the invitation letter. Haz click aquí para confirmar tu asistencia is a normal link: the tap
// presses a wax seal onto the letter while the browser opens WhatsApp in a new tab at once. The
// link's own navigation is never delayed or held back, so popup blockers stay happy (BR-3).
export function WaxSealConfirm({ day, sealed, onConfirm }: Props) {
  const [presses, setPresses] = useState(0)
  const style = { '--seal-ms': `${tuning.objects.sealMs}ms` } as CSSProperties
  const onClick = () => {
    setPresses((n) => n + 1)
    onConfirm()
  }
  const classes = ['wax-seal', sealed || presses > 0 ? 'is-sealed' : '', presses > 0 ? 'is-pressing' : '']
  return (
    <div className="letter" style={style}>
      <div className="letter-envelope" aria-hidden="true">
        <svg className="letter-art" viewBox="0 0 200 120" focusable="false">
          <rect className="letter-body" x={4} y={6} width={192} height={110} rx={4} />
          <path className="letter-fold" d="M6 114 L84 58 M194 114 L116 58" />
          <path className="letter-flap" d="M5 8 L100 74 L195 8" />
        </svg>
        {/* Keyed by press, so every tap presses the seal again. */}
        <span key={presses} className={classes.filter(Boolean).join(' ')}>
          <svg viewBox="0 0 60 60" focusable="false">
            <path
              className="wax-blob"
              d="M30 3 C 38 2, 41 7, 47 8 C 54 10, 55 17, 57 23 C 59 30, 55 34, 56 40 C 57 48, 50 52, 44 55 C 37 58, 33 56, 27 57 C 19 58, 14 53, 9 49 C 4 45, 5 38, 3 32 C 1 25, 5 20, 7 14 C 10 7, 22 4, 30 3 Z"
            />
            <circle className="wax-ring" cx={30} cy={30} r={17} />
            <path className="wax-heart" d="M30 40 C 22 34, 19 30, 19 26 C 19 21, 26 19, 30 24 C 34 19, 41 21, 41 26 C 41 30, 38 34, 30 40 Z" />
          </svg>
        </span>
      </div>
      <a className="button" href={whatsappUrl(day)} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {copy.confirm}
      </a>
    </div>
  )
}
