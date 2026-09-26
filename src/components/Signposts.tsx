import { copy } from '../content'
import type { LandmarkId } from '../logic/layout'

type SignpostId = keyof typeof copy.signposts

interface Props {
  landmarks: readonly LandmarkId[]
  onGo: (id: LandmarkId) => void
}

const order: readonly SignpostId[] = ['llegada', 'cuando', 'donde', 'confirmar', 'presente', 'familia']

// §3: signposts stay on screen. A signpost is absent when its landmark is absent.
export function Signposts({ landmarks, onGo }: Props) {
  const present = order.filter((id) => landmarks.includes(id))
  return (
    <nav className="signposts" aria-label={copy.a11y.signposts}>
      <ul>
        {present.map((id) => (
          <li key={id}>
            <button type="button" className="signpost" onClick={() => onGo(id)}>
              {copy.signposts[id]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
