import type { ReactNode } from 'react'
import { copy } from '../content'
import { tuning } from '../tuning'
import { BowToy } from './Toys'

interface Props {
  qrUrl: string | undefined
  tilting: boolean
  onQrTap: () => void
  nana?: ReactNode
}

const fileName = 'qr-regalo-mia.png'

// US-4 AC4: share the file when the browser can share files, otherwise download it.
// No bank deep link: the hosts supplied an image, not a payment URI.
export async function saveQr(url: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const file = new File([blob], fileName, { type: blob.type || 'image/png' })
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] })
      return
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
  }
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

// Presente (BR-6): presence first, then the QR, then the line that the guest chooses the amount.
export function Gift({ qrUrl, tilting, onQrTap, nana }: Props) {
  return (
    <div className="gift">
      <BowToy className="gift-bow" />
      <p className="gift-lead">{copy.giftLead}</p>
      {qrUrl ? (
        <div className="qr-block">
          <div className="qr-perch">{nana}</div>
          <figure
            className={`qr-plate${tilting ? ' is-tilting' : ''}`}
            data-no-drag
            onClick={onQrTap}
            style={{ minWidth: tuning.qr.minPx + 32 }}
          >
            <img
              src={qrUrl}
              alt={copy.qrAlt}
              width={tuning.qr.minPx}
              height={tuning.qr.minPx}
              style={{ width: tuning.qr.minPx, height: tuning.qr.minPx }}
              draggable={false}
            />
          </figure>
          <button type="button" className="button button-secondary" onClick={() => void saveQr(qrUrl)}>
            {copy.qrSave}
          </button>
        </div>
      ) : (
        <div className="qr-block">
          <div className="qr-perch">{nana}</div>
          <p className="qr-pending">{copy.qrPending}</p>
        </div>
      )}
      <p className="gift-offer">{copy.giftOffer}</p>
    </div>
  )
}
