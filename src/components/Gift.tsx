import { useEffect, useRef, type ReactNode } from 'react'
import qrBankUrl from '../assets/qr-bank.png'
import { copy } from '../content'
import { tuning } from '../tuning'
import { GiftBox } from './GiftBox'
import { GiftQr } from './GiftQr'

interface Props {
  // Spec §2: the bank payload (content's shared.giftQr). Empty, and the box shows the pending line.
  qrPayload: string
  // The gift box stands open (the page is found, or motion is reduced).
  open: boolean
  tilting: boolean
  onQrTap: () => void
  // Guardar QR was tapped (the QR guardado badge).
  onSave: () => void
  nana?: ReactNode
}

const fileName = 'qr-regalo-mia.png'
// The QR's size: tuning.qr.minPx, or larger where the room sets --qr-px (the 3D book, whose pages
// may be drawn below their design size).
const qrSize = `var(--qr-px, ${tuning.qr.minPx}px)`

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

// The image as a file, only when it was really found: a 404 page or a captive portal's page is never
// shared as the QR.
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`the QR image did not load (${response.status})`)
  return response.blob()
}

// US-4 AC4: share the file when the browser can share files, otherwise download it.
// No bank deep link: the bank gave a QR, not a payment URI.
// With the file already fetched, share runs inside the tap itself, which iOS requires.
export async function saveQr(url: string, prefetched?: Blob | null): Promise<void> {
  try {
    const blob = prefetched ?? (await fetchImage(url))
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

// Spec §2 The cat button: a small drawn cat face with a download arrow.
function SaveCat() {
  return (
    <svg className="gift-save-cat" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        className="gift-save-cat-head"
        d="M7.2 13 L 6.6 4.6 L 12.6 8.6 C 14.8 7.9, 17.2 7.9, 19.4 8.6 L 25.4 4.6 L 24.8 13 C 25.6 14.4, 26 15.8, 26 17.4 C 26 23.2, 21.6 27, 16 27 C 10.4 27, 6 23.2, 6 17.4 C 6 15.8, 6.4 14.4, 7.2 13 Z"
      />
      <circle className="gift-save-cat-eye" cx={11.6} cy={16} r={1.6} />
      <circle className="gift-save-cat-eye" cx={20.4} cy={16} r={1.6} />
      <path className="gift-save-cat-arrow" d="M16 17.6 V 24.4 M12.8 21.4 L 16 24.6 L 19.2 21.4" />
    </svg>
  )
}

// Presente (BR-6, spec §2): one line (presence first, then the QR), the QR drawn from its payload in
// the gift box, and Guardar QR as a cat button with its hint below. Guardar QR saves the bank's own
// QR image (controller ruling 1: the drawing is a re-encode, a different code with the same text).
export function Gift({ qrPayload, open, tilting, onQrTap, onSave, nana }: Props) {
  const blob = useRef<Blob | null>(null)

  useEffect(() => {
    if (!qrPayload || typeof fetch !== 'function') return
    let cancelled = false
    // Kept only when it loaded; otherwise the tap fetches it again, or downloads it.
    fetchImage(qrBankUrl)
      .then((file) => {
        if (!cancelled) blob.current = file
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [qrPayload])

  const save = qrPayload ? (
    <div className="gift-save">
      <button
        type="button"
        className="button button-secondary gift-save-button"
        onClick={() => {
          // Share first, still inside the tap, as iOS requires; then count it.
          void saveQr(qrBankUrl, blob.current)
          onSave()
        }}
      >
        <SaveCat />
        <span>{copy.qrSave}</span>
      </button>
      <p className="gift-hint">{copy.qrHint}</p>
    </div>
  ) : null

  return (
    <div className="gift">
      <p className="gift-text">{copy.gift}</p>
      <GiftBox open={open} perch={nana} below={save}>
        {qrPayload ? (
          <figure className={`qr-plate${tilting ? ' is-tilting' : ''}`} data-no-drag onClick={onQrTap}>
            <GiftQr payload={qrPayload} size={qrSize} />
            {/* The bank's own image, invisible over the drawing: a long press saves it where sharing
                and downloading are unavailable, such as some in-app browsers. Screen readers skip it
                and keep the drawing's name. */}
            <img className="qr-plate-save" src={qrBankUrl} alt="" draggable={false} />
          </figure>
        ) : (
          <p className="qr-pending">{copy.qrPending}</p>
        )}
      </GiftBox>
    </div>
  )
}
