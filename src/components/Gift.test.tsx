import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveQr } from './Gift'
import pagesCss from '../styles/pages.css?raw'

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

// The open gift box's folded pieces are invisible but still hit-tested; the front's fold used to
// cover Guardar QR, so a tap on the button landed on the box and saved nothing.
describe('the open gift box lets taps through', () => {
  const tapThrough = new Set(
    [...pagesCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, , body]) => /pointer-events:\s*none/.test(body!))
      .flatMap(([, selectors]) => selectors!.split(',').map((selector) => selector.trim())),
  )

  it.each(['.gift-box-front', '.gift-box-lid', '.gift-bow', '.gift-ribbon'])('%s', (piece) => {
    expect(tapThrough).toContain(`.gift-box.is-open ${piece}`)
  })
})
