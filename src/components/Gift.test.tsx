import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveQr } from './Gift'

describe('US-4 AC4 Guardar QR', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: async () => new Blob(['png'], { type: 'image/png' }) })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'canShare')
    Reflect.deleteProperty(navigator, 'share')
  })

  it('shares the image file when the browser can share files', async () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr('/qr.png')
    expect(share).toHaveBeenCalledTimes(1)
    const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }]
    expect(files[0]).toBeInstanceOf(File)
    expect(files[0]!.type).toBe('image/png')
    expect(click).not.toHaveBeenCalled()
  })

  it('downloads the image otherwise, and opens no bank link', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.getAttribute('href')).toBe('/qr.png')
      expect(this.download).toBe('qr-regalo-mia.png')
    })
    await saveQr('/qr.png')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('does nothing more when the guest cancels the share sheet', async () => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('cancelled', 'AbortError')
      },
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr('/qr.png')
    expect(click).not.toHaveBeenCalled()
  })
})
