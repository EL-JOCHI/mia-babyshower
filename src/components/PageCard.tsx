import { useState, type CSSProperties, type ReactNode } from 'react'
import { gameCopy } from '../content'
import type { LandmarkId } from '../logic/layout'
import { tuning } from '../tuning'

interface Props {
  id: LandmarkId
  // The page has been found (design §5): it carries the ¡Página encontrada! stamp.
  found: boolean
  children: ReactNode
}

// Design §3 and §5: every fact sits on a piece of parchment with a torn, hand-drawn edge (the
// #paper-edge filter, on the paper behind the words so the words stay sharp). The first time the
// page is found, the paper gives a little "fwip" and the stamp presses in; a page found on an
// earlier visit keeps its stamp without pressing it again. Llegada is the book's cover instead.
export function PageCard({ id, found, children }: Props) {
  const [foundAtFirst] = useState(found)
  const fresh = found && !foundAtFirst
  const classes = ['page-card', `page-card-${id}`, id === 'llegada' ? 'is-cover' : '', found ? 'is-found' : '', fresh ? 'is-fresh' : '']
  const style = {
    '--stamp-ms': `${tuning.pages.stampMs}ms`,
    '--fwip-ms': `${tuning.pages.fwipMs}ms`,
  } as CSSProperties
  return (
    <div className={classes.filter(Boolean).join(' ')} style={style}>
      {children}
      <div className="page-paper" aria-hidden="true" />
      {found && <p className="page-stamp">{gameCopy.pageFound}</p>}
    </div>
  )
}
