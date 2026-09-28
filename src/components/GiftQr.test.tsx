import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { shared } from '../content'
import { screenCode } from '../logic/qr'
import { GiftQr } from './GiftQr'

// The real encoder, watched.
vi.mock('../logic/qr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logic/qr')>()
  return { ...actual, screenCode: vi.fn(actual.screenCode) }
})

const encodings = (payload: string) => vi.mocked(screenCode).mock.calls.filter(([text]) => text === payload).length

// Encoding the gift QR takes tens of milliseconds on a phone, on the main thread: it runs once per
// page load, not on every render, and not again when the page mounts the QR anew (a handoff between
// rooms).
describe('the screen QR is encoded once per payload', () => {
  it('builds the matrix once across renders and remounts with the same payload', () => {
    const view = render(<GiftQr payload={shared.giftQr} size="220px" />)
    view.rerender(<GiftQr payload={shared.giftQr} size="245px" />)
    const drawn = view.container.innerHTML
    view.unmount()
    const again = render(<GiftQr payload={shared.giftQr} size="245px" />)
    expect(encodings(shared.giftQr)).toBe(1)
    // The remount draws the very same code.
    expect(again.container.innerHTML).toBe(drawn)
  })

  it('encodes a different payload on its own', () => {
    const other = 'otro regalo'
    render(<GiftQr payload={other} size="220px" />)
    expect(encodings(other)).toBe(1)
  })
})
