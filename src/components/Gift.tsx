import { useEffect, useRef, type ReactNode } from 'react'
import { copy } from '../content'
import { tuning } from '../tuning'
import { GiftBox } from './GiftBox'

interface Props {
  qrUrl: string | undefined
  // The gift box stands open (the page is found, or motion is reduced).
  open: boolean
  tilting: boolean
  onQrTap: () => void
  // Guardar QR was tapped (the QR guardado badge).
  onSave: () => void
  nana?: ReactNode
}

const fileName = 'qr-regalo-mia.png'

function download(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function share(file: File): Promise<void> | null {
  if (typeof navigator.canShare !== 'function' || !navigator.canShare({ files: [file] })) return null
  return navigator.share({ files: [file] })
}

// US-4 AC4: share the file when the browser can share files, otherwise download it.
// No bank deep link: the hosts supplied an image, not a payment URI.
// With the file already fetched, share runs inside the tap itself, which iOS requires.
export async function saveQr(url: string, prefetched?: Blob | null): Promise<void> {
  try {
    const blob = prefetched ?? (await (await fetch(url)).blob())
    const sharing = share(new File([blob], fileName, { type: blob.type || 'image/png' }))
    if (sharing) {
      await sharing
      return
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
  }
  download(url)
}

// Presente (BR-6): presence first, then the QR in its gift box with Guardar QR below, then the
// line that the guest chooses the amount.
export function Gift({ qrUrl, open, tilting, onQrTap, onSave, nana }: Props) {
  const blob = useRef<Blob | null>(null)

  useEffect(() => {
    if (!qrUrl || typeof fetch !== 'function') return
    let cancelled = false
    fetch(qrUrl)
      .then((response) => response.blob())
      .then((file) => {
        if (!cancelled) blob.current = file
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [qrUrl])

  const save = qrUrl ? (
    <button
      type="button"
      className="button button-secondary"
      onClick={() => {
        // Share first, still inside the tap, as iOS requires; then count it.
        void saveQr(qrUrl, blob.current)
        onSave()
      }}
    >
      {copy.qrSave}
    </button>
  ) : null

  return (
    <div className="gift">
      <p className="gift-lead">{copy.giftLead}</p>
      <GiftBox open={open} perch={nana} below={save}>
        {qrUrl ? (
          <figure className={`qr-plate${tilting ? ' is-tilting' : ''}`} data-no-drag onClick={onQrTap}>
            <img
              src={qrUrl}
              alt={copy.qrAlt}
              width={tuning.qr.minPx}
              height={tuning.qr.minPx}
              style={{ width: tuning.qr.minPx, height: tuning.qr.minPx }}
              draggable={false}
            />
          </figure>
        ) : (
          <p className="qr-pending">{copy.qrPending}</p>
        )}
      </GiftBox>
      <p className="gift-offer">{copy.giftOffer}</p>
    </div>
  )
}
