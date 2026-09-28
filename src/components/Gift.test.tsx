import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import qrBankUrl from '../assets/qr-bank.png'
import { copy, shared } from '../content'
import indexCss from '../index.css?raw'
import { tuning } from '../tuning'
import { Gift, saveQr } from './Gift'
import pagesCss from '../styles/pages.css?raw'

const png = () => new Blob(['png'], { type: 'image/png' })
// A fetch that found the image, and one that did not (a 404 page, a captive portal).
const found = () => ({ ok: true, status: 200, blob: async () => png() })
const notFound = () => ({ ok: false, status: 404, blob: async () => new Blob(['not found'], { type: 'text/html' }) })

describe('US-4 AC4 Guardar QR', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => found()))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'canShare')
    Reflect.deleteProperty(navigator, 'share')
  })

  it('shares the image file as qr-regalo-mia.png when the browser can share files', async () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr(qrBankUrl)
    expect(share).toHaveBeenCalledTimes(1)
    const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }]
    expect(files[0]).toBeInstanceOf(File)
    expect(files[0]!.name).toBe('qr-regalo-mia.png')
    expect(files[0]!.type).toBe('image/png')
    expect(click).not.toHaveBeenCalled()
  })

  it('shares an image already fetched without fetching it again, so the share runs inside the tap', () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    void saveQr(qrBankUrl, png())
    // No await yet: iOS lets a page share only while it handles the tap.
    expect(share).toHaveBeenCalledTimes(1)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('downloads the image otherwise, and opens no bank link', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.getAttribute('href')).toBe(qrBankUrl)
      expect(this.download).toBe('qr-regalo-mia.png')
    })
    await saveQr(qrBankUrl)
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('still downloads the image when it cannot be fetched first', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: vi.fn(async () => {}) })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr(qrBankUrl)
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
    await saveQr(qrBankUrl)
    expect(click).not.toHaveBeenCalled()
  })
})

// Controller ruling 1: Guardar QR saves the bank's own QR image, not a re-encode. The bank's code is
// version 13 at error correction L with a UTF-8 marker; a re-encode would be the same text in a
// different code, and this is the money path.
describe("the saved QR is the bank's own image", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'canShare')
    Reflect.deleteProperty(navigator, 'share')
  })

  // Read relative to this test file, so the run's working directory (or another checkout) never
  // changes which image is checked. (Not `new URL('…', import.meta.url)`: Vite rewrites that pattern
  // into the page's http URL, which node:fs cannot open.)
  const bytes = readFileSync(resolve(import.meta.dirname, '../assets/qr-bank.png'))
  const image = PNG.sync.read(bytes)

  // The bank's image is pinned byte for byte (the padded crop of the bank's own QR, 741×741). A
  // re-crop, re-encode, or "optimization" of it must fail here loudly, and be decoded, scanned with
  // the bank app, and re-pinned on purpose.
  it('is exactly the committed, padded bank image (SHA-256 pinned)', () => {
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('af3591650e723275a3790e2de2be014bdc065b300dee3e78755f58a9a99e1099')
  })
  const decodeImage = () => jsQR(new Uint8ClampedArray(image.data), image.width, image.height, { inversionAttempts: 'dontInvert' })

  it("decodes, from the committed file, to the stored payload exactly: the bank's version-13 code, fully opaque", () => {
    // A transparent pixel reads as black in some galleries.
    for (let i = 3; i < image.data.length; i += 4) if (image.data[i] !== 255) throw new Error(`a transparent pixel at byte ${i}`)
    const code = decodeImage()
    expect(code?.data).toBe(shared.giftQr)
    expect(code?.version).toBe(13)
    expect(code?.chunks[0]).toEqual({ type: 'eci', assignmentNumber: 26 })
  })

  // Bank apps reading from the gallery need the white quiet zone (ISO/IEC 18004: 4 modules). The
  // margin on each side is measured from the image's edge to the first dark pixel, where the code's
  // outermost modules (its finder patterns' outer rings) begin, in modules of the image's own size.
  it('keeps a clean white quiet zone of at least 4 modules on every side, pure white beyond the old crop', () => {
    const { width, height, data } = image
    const pixel = (x: number, y: number) => (y * width + x) * 4
    const dark = (x: number, y: number) => {
      const i = pixel(x, y)
      return 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]! < 128
    }
    let [left, right, top, bottom] = [width, -1, height, -1]
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!dark(x, y)) continue
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
    const code = decodeImage()
    const modules = 17 + 4 * code!.version
    const moduleX = (right - left + 1) / modules
    const moduleY = (bottom - top + 1) / modules
    // The dark box is the code itself: square, and where jsqr finds the finder patterns' corners.
    expect(Math.abs(moduleX - moduleY) / moduleX).toBeLessThan(0.02)
    expect(Math.abs(code!.location.topLeftCorner.x - left)).toBeLessThan(moduleX)
    expect(Math.abs(code!.location.topLeftCorner.y - top)).toBeLessThan(moduleY)
    expect(Math.abs(code!.location.topRightCorner.x - (right + 1))).toBeLessThan(moduleX)
    expect(Math.abs(code!.location.bottomLeftCorner.y - (bottom + 1))).toBeLessThan(moduleY)
    const quiet = {
      left: left / moduleX,
      right: (width - 1 - right) / moduleX,
      top: top / moduleY,
      bottom: (height - 1 - bottom) / moduleY,
    }
    for (const [side, span] of Object.entries(quiet)) expect(span, side).toBeGreaterThanOrEqual(4)
    // Past 2 modules from the code (the bank's crop kept about 1), every pixel is pure opaque white.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const outside = x < left - 2 * moduleX || x > right + 2 * moduleX || y < top - 2 * moduleY || y > bottom + 2 * moduleY
        const i = pixel(x, y)
        if (outside && (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255 || data[i + 3] !== 255)) {
          throw new Error(`a pixel that is not pure white in the quiet zone at ${x},${y}`)
        }
      }
    }
  })

  it('is the file the gift page fetches ahead of the tap, and what Guardar QR then shares, inside the tap', async () => {
    const fetchImage = vi.fn(async () => found())
    vi.stubGlobal('fetch', fetchImage)
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const onSave = vi.fn()
    render(<Gift qrPayload={shared.giftQr} open tilting={false} onQrTap={vi.fn()} onSave={onSave} />)
    expect(fetchImage).toHaveBeenCalledWith(qrBankUrl)
    // Let the prefetch land.
    await new Promise((settle) => setTimeout(settle, 0))
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    expect(share).toHaveBeenCalledTimes(1)
    expect(fetchImage).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  // F6: a failed prefetch must never be shared as the QR; the tap fetches the image again instead.
  it('never shares a prefetch that came back not ok: the tap fetches the image again', async () => {
    const fetchImage = vi.fn().mockResolvedValueOnce(notFound()).mockResolvedValue(found())
    vi.stubGlobal('fetch', fetchImage)
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    render(<Gift qrPayload={shared.giftQr} open tilting={false} onQrTap={vi.fn()} onSave={vi.fn()} />)
    // Let the failed prefetch land.
    await new Promise((settle) => setTimeout(settle, 0))
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    expect(fetchImage).toHaveBeenCalledTimes(2)
    const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }]
    expect(files[0]!.type).toBe('image/png')
    expect(await files[0]!.text()).toBe('png')
  })

  it('downloads the image, sharing nothing, when the fetch at the tap is not ok either', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => notFound()))
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await saveQr(qrBankUrl)
    expect(share).not.toHaveBeenCalled()
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('is what Guardar QR downloads where the browser cannot share files', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => found()))
    const hrefs: (string | null)[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      hrefs.push(this.getAttribute('href'))
      expect(this.download).toBe('qr-regalo-mia.png')
    })
    render(<Gift qrPayload={shared.giftQr} open tilting={false} onQrTap={vi.fn()} onSave={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    await waitFor(() => expect(hrefs).toEqual([qrBankUrl]))
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

// Requirements, Playing with what is on screen: a long press on the QR saves the bank's own image
// where sharing and downloading are unavailable, such as some in-app browsers. The drawn SVG offers
// no "Save image", so the bank's image lies over it, invisible.
describe("a long press on the QR saves the bank's own image", () => {
  // The declarations of the CSS rule whose selector list is exactly `selector`.
  const ruleFor = (selector: string) =>
    [...pagesCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selectors]) => selectors!.trim() === selector)?.[2] ?? ''

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => found()))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lays the bank image over the drawn QR: invisible, unnamed, and never focused', () => {
    const onQrTap = vi.fn()
    render(<Gift qrPayload={shared.giftQr} open tilting={false} onQrTap={onQrTap} onSave={vi.fn()} />)
    const plate = document.querySelector<HTMLElement>('figure.qr-plate')!
    const image = plate.querySelector('img')!
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('src', qrBankUrl)
    expect(image).toHaveAttribute('alt', '')
    expect(image).toHaveClass('qr-plate-save')
    // Not in the tab order.
    expect(image).not.toHaveAttribute('tabindex')
    expect(image.tabIndex).toBeLessThan(0)
    // Over the drawing, covering the whole plate, at opacity 0.
    expect(plate.querySelector('svg.gift-qr')!.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(ruleFor('.qr-plate')).toMatch(/position:\s*relative/)
    const save = ruleFor('.qr-plate-save')
    expect(save).toMatch(/position:\s*absolute/)
    expect(save).toMatch(/inset:\s*0/)
    expect(save).toMatch(/width:\s*100%/)
    expect(save).toMatch(/height:\s*100%/)
    expect(save).toMatch(/opacity:\s*0\s*;/)
    // Screen readers still get the drawn QR's name, and only it.
    expect(within(plate).getAllByRole('img')).toEqual([screen.getByRole('img', { name: copy.qrAlt })])
    // A tap on the plate still reaches it (the QR's tilt).
    fireEvent.click(image)
    expect(onQrTap).toHaveBeenCalledTimes(1)
  })
})

// On short phone screens the signposts used to cover Guardar QR and its hint, so a tap on the button
// landed on a signpost. jsdom lays nothing out (the rectangles were measured in Chrome at 375 × 553,
// 320 × 568, 360 × 640, and 390 × 660); this guards the rules that keep them clear.
describe('short screens keep Guardar QR and its hint above the signposts', () => {
  const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rulesIn = (css: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, declarations]) => ({ selector: selectors!.trim(), declarations: declarations! }))
  const ruleIn = (css: string, selector: string) => rulesIn(strip(css)).find((rule) => rule.selector === selector)?.declarations ?? ''
  // The query's numbers and the body of the first @media block the pattern finds.
  function media(css: string, pattern: RegExp) {
    const text = strip(css)
    const match = pattern.exec(text)
    if (!match) throw new Error(`no @media block like ${pattern}`)
    const open = text.indexOf('{', match.index)
    for (let i = open, depth = 0; i < text.length; i++) {
      if (text[i] === '{') depth++
      if (text[i] === '}' && --depth === 0) return { threshold: Number(match[1]), rules: rulesIn(text.slice(open + 1, i)) }
    }
    throw new Error('an unclosed @media block')
  }
  const short = () => media(pagesCss, /@media \(max-height: (\d+)px\) \{/)
  const upright = () => media(pagesCss, /@media \(max-height: (\d+)px\) and \(orientation: portrait\) \{/)

  it("covers the whole flat room and the book's shortest screens", () => {
    // The flat room takes every screen under tuning.world.minHeightPx; an iPhone in Safari, with its
    // bars, is 390 × 664 and gets the book.
    expect(short().threshold).toBeGreaterThan(tuning.world.minHeightPx)
    expect(short().threshold).toBeGreaterThanOrEqual(664)
    expect(upright().threshold).toBe(short().threshold)
  })

  it('never shrinks the QR, its plate, or its frame', () => {
    for (const { selector, declarations } of [...short().rules, ...upright().rules]) {
      expect(selector).not.toMatch(/qr|gift-box-art|gift-box-inside/)
      expect(declarations).not.toMatch(/--qr-px|zoom|scale\(/)
    }
  })

  it('in the book, runs the paper on below the hint, since a short screen draws the page foot under the signposts', () => {
    const book = short().rules.find((rule) => rule.selector === '.station-page .page-card-presente')
    const bottom = (declarations: string) => Number(/padding(?:-bottom)?:[^;]*?(\d+)px\s*;/.exec(declarations)![1])
    expect(bottom(book!.declarations)).toBeGreaterThan(bottom(ruleIn(pagesCss, '.page-card-presente')))
  })

  it("in the flat room held upright, rests the Presente card's foot on the signposts, sized as index.css draws them", () => {
    const card = upright().rules.find((rule) => rule.selector === '.landmark-presente:not(.station-page)')!
    // Centred, unless that puts its foot under the signposts; the book's pages stand in their slots.
    expect(card.declarations).toMatch(/transform:\s*translate\(-50%, min\(-50%, calc\(50dvh - 100% - var\(--signposts-clear\)\)\)\)/)
    const clear = /--signposts-clear:\s*calc\((\d+) \* (\d+)px \+ (\d+)px \+ (max\(10px, env\(safe-area-inset-bottom\)\))\)\s*;/.exec(card.declarations)
    expect(clear).not.toBeNull()
    const [, rows, rowPx, gapPx, inset] = clear!
    // Two rows of signposts on a phone: Inicio to Confirmar, then El regalo and La familia.
    expect(Number(rows)).toBe(2)
    expect(ruleIn(indexCss, '.signpost')).toMatch(new RegExp(`min-height:\\s*calc\\(${rowPx} \\* var\\(--ui-px\\)\\)`))
    expect(ruleIn(indexCss, '.signposts ul')).toMatch(new RegExp(`gap:\\s*calc\\(${gapPx} \\* var\\(--ui-px\\)\\)`))
    expect(ruleIn(indexCss, '.signposts')).toContain(`bottom: ${inset};`)
  })
})
