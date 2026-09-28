import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { battleCopy, copy, days, gameCopy, shared } from '../content'
import { FlatRoom } from './FlatRoom'
import { cameraTargetFor } from '../logic/camera'
import { computeLayout, landmarksFor } from '../logic/layout'
import { emptyProgress } from '../logic/progress'
import { whatsappUrl } from '../logic/whatsapp'
import { tuning } from '../tuning'
import {
  advance,
  at,
  beforeSatCutoff,
  beforeSunCutoff,
  catsInView,
  renderRoom,
  satCutoff,
  sunCutoff,
} from '../test/helpers'

const landmark = (id: string) => document.querySelector(`[data-landmark-id="${id}"]`)
const signposts = () => within(screen.getByRole('navigation', { name: copy.a11y.signposts }))
const midTransform = () => (screen.getByTestId('room-mid') as HTMLElement).style.transform

function expectCameraOn(id: 'cuando' | 'confirmar' | 'familia', partyOver = false) {
  const layout = computeLayout(window.innerWidth, window.innerHeight, landmarksFor(partyOver))
  const target = cameraTargetFor(layout.positions[id], layout, window.innerWidth, window.innerHeight)
  expect(midTransform()).toBe(`translate3d(${-target.x}px, ${-target.y}px, 0)`)
}

describe('US-1 Read my invitation by moving through the room', () => {
  it('shows every current landmark and the Saturday facts before the cutoff (AC1)', () => {
    renderRoom({ day: 'sat', now: beforeSatCutoff })
    for (const id of ['llegada', 'palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia']) {
      expect(landmark(id)).toBeInTheDocument()
    }
    expect(screen.getByText(copy.hero)).toBeInTheDocument()
    expect(screen.getByText(copy.verseCitation)).toBeInTheDocument()
    expect(screen.getByText(copy.verse)).toBeInTheDocument()
    expect(screen.getByText('sábado 17 de octubre de 2026')).toBeInTheDocument()
    expect(screen.getByText('16:00')).toBeInTheDocument()
    expect(screen.getByText(shared.place)).toBeInTheDocument()
  })

  it('shows the Sunday date and never the Saturday date (AC2, US-8 AC5, BR-10)', () => {
    renderRoom({ day: 'sun', now: beforeSunCutoff })
    expect(screen.getByText('domingo 18 de octubre de 2026')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('17 de octubre')
    expect(document.body.textContent).not.toContain(days.sat.dateLine)
  })

  it('never shows the Sunday date on Saturday (US-8 AC5)', () => {
    renderRoom({ day: 'sat' })
    expect(document.body.textContent).not.toContain(days.sun.dateLine)
  })

  it('moves the camera to Cuándo from La fecha (AC4)', () => {
    renderRoom({ reducedMotion: true })
    fireEvent.click(signposts().getByRole('button', { name: 'La fecha' }))
    expectCameraOn('cuando')
  })

  it('glides to Cuándo when motion is allowed', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    try {
      renderRoom()
      fireEvent.click(signposts().getByRole('button', { name: 'La fecha' }))
      act(() => {
        vi.advanceTimersByTime(tuning.camera.glideMs + 50)
      })
      expectCameraOn('cuando')
    } finally {
      vi.useRealTimers()
    }
  })

  it('brings a keyboard-focused control into view (AC5, FR-11)', () => {
    renderRoom({ reducedMotion: true })
    fireEvent.keyDown(window, { key: 'Tab' })
    act(() => screen.getByRole('link', { name: copy.confirm }).focus())
    expectCameraOn('confirmar')
  })

  it('moves the camera with the arrow keys (BR-20)', () => {
    renderRoom({ reducedMotion: true })
    const before = midTransform()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(midTransform()).not.toBe(before)
  })

  it('lists the signposts in order, with Inicio first', () => {
    renderRoom()
    const names = signposts()
      .getAllByRole('button')
      .map((b) => b.textContent)
    expect(names).toEqual(['Inicio', 'La fecha', 'El lugar', 'Confirmar', 'El regalo', 'La familia'])
  })
})

describe('US-15 Moving and reaching pages in the flat room (design §6)', () => {
  it('reports the first move once, from the first arrow key, and never from Tab', () => {
    const { onFirstMove } = renderRoom({ reducedMotion: true })
    fireEvent.keyDown(window, { key: 'Tab' })
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'Shift' })
    expect(onFirstMove).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.wheel(document.querySelector('.room-viewport')!, { deltaY: 40 })
    expect(onFirstMove).toHaveBeenCalledTimes(1)
  })

  it('reports the first move from a drag or the wheel too, but not from a signpost', () => {
    const wheel = renderRoom({ reducedMotion: true })
    fireEvent.click(signposts().getByRole('button', { name: 'La fecha' }))
    expect(wheel.onFirstMove).not.toHaveBeenCalled()
    fireEvent.wheel(document.querySelector('.room-viewport')!, { deltaY: 40 })
    expect(wheel.onFirstMove).toHaveBeenCalledTimes(1)
  })

  describe('reaching a page', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('reports a page once the camera rests on it, with the pages that count', () => {
      const { onEvent } = renderRoom({ reducedMotion: true })
      fireEvent.click(signposts().getByRole('button', { name: 'La fecha' }))
      expect(onEvent).not.toHaveBeenCalled()
      advance(tuning.pages.settleMs + 10)
      expect(onEvent).toHaveBeenCalledTimes(1)
      expect(onEvent).toHaveBeenCalledWith({
        type: 'reachedPage',
        page: 'cuando',
        pages: ['palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'],
      })
    })

    it('does not count a page the camera only passes', () => {
      const { onEvent } = renderRoom({ reducedMotion: true })
      fireEvent.click(signposts().getByRole('button', { name: 'La fecha' }))
      advance(tuning.pages.settleMs / 2)
      fireEvent.click(signposts().getByRole('button', { name: 'El lugar' }))
      advance(tuning.pages.settleMs + 10)
      expect(onEvent).toHaveBeenCalledTimes(1)
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'reachedPage', page: 'donde' }))
    })
  })

  it('stamps a found page, and not the others', () => {
    renderRoom({ progress: { pages: ['cuando'], badges: ['fecha'], xp: 30 } })
    expect(within(landmark('cuando') as HTMLElement).getByText(gameCopy.pageFound)).toBeInTheDocument()
    expect(within(landmark('donde') as HTMLElement).queryByText(gameCopy.pageFound)).not.toBeInTheDocument()
  })

  describe('the facts are never gated (design §10)', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] }))
    afterEach(() => vi.useRealTimers())

    const glide = () => advance(tuning.camera.glideMs + 50)

    it('opens the map and the gift box as soon as their pages come into view, before they are found', () => {
      renderRoom()
      // Both pages start off screen, so their objects wait to play.
      expect(document.querySelector('.treasure-map')).not.toHaveClass('is-unrolled')
      expect(document.querySelector('.gift-box')).not.toHaveClass('is-open')
      fireEvent.click(signposts().getByRole('button', { name: 'El lugar' }))
      glide()
      // The progress passed in has found nothing: the map is open because Dónde is in view.
      expect(document.querySelector('.treasure-map')).toHaveClass('is-unrolled')
      expect(document.querySelector('.gift-box')).not.toHaveClass('is-open')
      fireEvent.click(signposts().getByRole('button', { name: 'El regalo' }))
      glide()
      expect(document.querySelector('.gift-box')).toHaveClass('is-open')
      expect(within(document.querySelector<HTMLElement>('.gift-box')!).getByRole('img', { name: copy.qrAlt })).toBeInTheDocument()
      // Once open, an object stays open: it plays once.
      fireEvent.click(signposts().getByRole('button', { name: 'Inicio' }))
      glide()
      expect(document.querySelector('.treasure-map')).toHaveClass('is-unrolled')
      expect(document.querySelector('.gift-box')).toHaveClass('is-open')
    })

    it('snaps to the nearest page when the wheel stops, and counts it', () => {
      const { onEvent } = renderRoom()
      fireEvent.wheel(document.querySelector('.room-viewport')!, { deltaX: 480, deltaY: 40 })
      advance(tuning.pages.snapDelayMs + 10)
      glide()
      expectCameraOn('cuando')
      advance(tuning.pages.settleMs + 10)
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'reachedPage', page: 'cuando' }))
    })

    it('snaps to the nearest page when a drag is released', () => {
      renderRoom()
      const surface = document.querySelector('.room-viewport')!
      fireEvent.pointerDown(surface, { pointerId: 1, isPrimary: true, button: 0, clientX: 900, clientY: 400 })
      fireEvent.pointerMove(surface, { pointerId: 1, clientX: 420, clientY: 360 })
      fireEvent.pointerUp(surface, { pointerId: 1, clientX: 420, clientY: 360 })
      glide()
      expectCameraOn('cuando')
    })

    it('keeps the arrow keys stepping freely, with no snap', () => {
      renderRoom()
      const before = midTransform()
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      advance(tuning.pages.snapDelayMs + tuning.camera.glideMs + 100)
      expect(midTransform()).not.toBe(before)
      expect(midTransform()).toBe(`translate3d(${-tuning.camera.arrowStepPx}px, ${before.match(/, (-?[\d.]+)px/)![1]}px, 0)`)
    })
  })

  it('opens the gift box when something inside it takes focus', () => {
    renderRoom()
    act(() => screen.getByRole('button', { name: copy.qrSave }).focus())
    expect(document.querySelector('.gift-box')).toHaveClass('is-open')
  })

  it('shows the pending sentence inside the box when the payload is empty', () => {
    renderRoom({ qrPayload: '' })
    expect(document.querySelector('.gift-box')).toContainElement(screen.getByText(copy.qrPending))
  })

  it('reports Guardar QR and Confirmar por WhatsApp as progress events', () => {
    // The bank's image never arrives here, so Guardar QR neither shares nor downloads.
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    try {
      const { onEvent } = renderRoom()
      fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
      expect(onEvent).toHaveBeenCalledWith({ type: 'savedQr' })
      fireEvent.click(screen.getByRole('link', { name: copy.confirm }))
      expect(onEvent).toHaveBeenCalledWith({ type: 'confirmed' })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('presses the wax seal once the invitation is sealed', () => {
    const view = renderRoom()
    expect(document.querySelector('.wax-seal')).not.toHaveClass('is-sealed')
    view.rerender(<FlatRoom {...view.props} progress={{ pages: [], badges: ['sellada'], xp: 50 }} />)
    expect(document.querySelector('.wax-seal')).toHaveClass('is-sealed')
  })
})

describe('US-3 Confirm the correct day on WhatsApp', () => {
  it('links Saturday to the Saturday message (AC1)', () => {
    renderRoom({ day: 'sat' })
    expect(screen.getByRole('link', { name: copy.confirm })).toHaveAttribute('href', whatsappUrl('sat'))
  })

  it('links Sunday to the Sunday message (AC2)', () => {
    renderRoom({ day: 'sun', now: beforeSunCutoff })
    const href = screen.getByRole('link', { name: copy.confirm }).getAttribute('href') ?? ''
    expect(new URL(href).searchParams.get('text')).toBe(days.sun.whatsappMessage)
  })
})

describe('US-4 See the gift QR', () => {
  it('draws the QR from its payload, with its alternative text, on a plate at the minimum size (AC1, spec §2)', () => {
    renderRoom()
    const qr = screen.getByRole('img', { name: copy.qrAlt })
    expect(qr.tagName.toLowerCase()).toBe('svg')
    expect(qr).toHaveAttribute('width', String(tuning.qr.minPx))
    expect(qr.closest('.qr-plate')).not.toBeNull()
    // Three rounded finder eyes (a ring and a pupil each), the modules, and the cat emblem.
    expect(qr.querySelectorAll('.gift-qr-eye')).toHaveLength(6)
    expect(qr.querySelector('.gift-qr-modules')).not.toBeNull()
    expect(qr.querySelector('.gift-qr-emblem')).not.toBeNull()
  })

  it('shows the pending sentence, no QR, and no Guardar QR when the payload is empty (AC2)', () => {
    renderRoom({ qrPayload: '' })
    expect(screen.getByText(copy.qrPending)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: copy.qrAlt })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
    expect(screen.queryByText(copy.qrHint)).not.toBeInTheDocument()
  })

  it('leads with presence in one line, and names no amount, bank, or account (AC3, spec §4)', () => {
    renderRoom()
    const gift = within(landmark('presente') as HTMLElement)
    expect(gift.getByText(copy.gift)).toBeInTheDocument()
    expect(copy.gift).toBe(
      'El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.',
    )
    const text = landmark('presente')?.textContent ?? ''
    expect(text).not.toMatch(/Bs\.?|\d+\s?bs|banco|cuenta/i)
    expect(text).not.toContain(shared.giftQr)
  })

  it('makes Guardar QR a cat button: a drawn cat face with a download arrow beside the text, and the hint below', () => {
    renderRoom()
    const button = screen.getByRole('button', { name: copy.qrSave })
    expect(button.querySelector('svg.gift-save-cat')).toHaveAttribute('aria-hidden', 'true')
    expect(button.querySelector('.gift-save-cat-arrow')).not.toBeNull()
    expect(button).toHaveTextContent(copy.qrSave)
    const hint = screen.getByText(copy.qrHint)
    expect(copy.qrHint).toBe('Toca el gatito para guardar el QR en tu celular.')
    expect(button.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // Delilah still perches on the gift box.
    expect(document.querySelector('.gift-box .qr-perch [data-cat-id="nana"]')).not.toBeNull()
  })
})

describe('US-5 Find the place, then see the party end', () => {
  it('links the map to the confirmed pin (AC1)', () => {
    renderRoom()
    expect(screen.getByRole('link', { name: copy.map })).toHaveAttribute('href', shared.mapUrl)
  })

  it('keeps the address, map, confirm, and Presente at 23:59 (AC2)', () => {
    renderRoom({ now: at('2026-10-17T23:59:00-04:00') })
    expect(screen.getByText(shared.place)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: copy.map })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: copy.confirm })).toBeInTheDocument()
    expect(landmark('presente')).toBeInTheDocument()
  })

  const expectOver = () => {
    expect(screen.queryByText(shared.place)).not.toBeInTheDocument()
    expect(screen.queryByText(shared.city)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: copy.map })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: copy.confirm })).not.toBeInTheDocument()
    expect(screen.queryByText(copy.gift)).not.toBeInTheDocument()
    expect(screen.queryByText(copy.qrPending)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
    for (const name of ['El lugar', 'Confirmar', 'El regalo']) {
      expect(signposts().queryByRole('button', { name })).not.toBeInTheDocument()
    }
    for (const id of ['llegada', 'palabra', 'cuando', 'familia']) expect(landmark(id)).toBeInTheDocument()
  }

  it('removes the place, confirm, gift, countdown, and their signposts at the Saturday cutoff (AC3)', () => {
    renderRoom({ day: 'sat', now: satCutoff })
    expectOver()
  })

  it('does the same at the Sunday cutoff (AC4)', () => {
    renderRoom({ day: 'sun', now: sunCutoff })
    expectOver()
  })

  it('switches without a reload when the clock reaches the cutoff (AC5)', () => {
    const view = renderRoom({ now: at('2026-10-17T23:59:59-04:00') })
    expect(screen.getByText(shared.place)).toBeInTheDocument()
    view.rerender(<FlatRoom {...view.props} now={satCutoff} />)
    expectOver()
  })
})

describe('US-6 Watch the countdown', () => {
  it('reads zero between the start and the cutoff (AC2)', () => {
    renderRoom({ now: at('2026-10-17T18:00:00-04:00') })
    const numbers = screen
      .getByTestId('countdown')
      .querySelectorAll('.countdown-number')
    expect(Array.from(numbers).map((n) => n.textContent)).toEqual(['00', '00', '00', '00'])
  })

  it('is gone after the cutoff, and the date and 16:00 stay as a memory (AC5)', () => {
    renderRoom({ now: satCutoff })
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
    expect(screen.getByText(days.sat.dateLine)).toBeInTheDocument()
    expect(screen.getByText('16:00')).toBeInTheDocument()
  })
})

describe('US-7 Move from sketch to light', () => {
  it('shows the move hint on the opening view (AC4)', () => {
    renderRoom()
    expect(screen.getByText(copy.moveHint)).toBeInTheDocument()
  })

  it('mounts no canvas with reduced motion and moves every layer at the camera speed (AC3)', () => {
    const { container } = renderRoom({ reducedMotion: true })
    expect(container.querySelector('canvas')).toBeNull()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    const far = container.querySelector<HTMLElement>('.layer-far')!.style.transform
    const near = container.querySelector<HTMLElement>('.layer-near')!.style.transform
    expect(far).toBe(midTransform())
    expect(near).toBe(midTransform())
  })

  it('starts in the boceto stage', () => {
    renderRoom()
    expect(screen.getByRole('main')).toHaveAttribute('data-era', 'boceto')
  })
})

describe('US-12 Watch the cats play (invitation)', () => {
  it('has all ten cats and the family door line (AC2)', () => {
    renderRoom()
    for (const name of ['Mishona', 'Choni', 'Chavela', 'Kiri kiri', 'Delilah', 'Chona', 'Chori', 'Minina', 'Misha', 'Kira']) {
      expect(screen.getByRole('img', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(copy.doorLine)).toBeInTheDocument()
    expect(document.querySelector('.figure-dad')).not.toBeNull()
    expect(document.querySelector('.figure-mom')).not.toBeNull()
    expect(document.querySelector('.figure-miguelito')).not.toBeNull()
    expect(document.querySelector('.figure-mia')).not.toBeNull()
  })

  // Spec §3: each cat on its page before the party, and all ten on the four pages left after it.
  const perched = (id: string) =>
    [...(landmark(id)?.querySelectorAll('[data-cat-id]') ?? [])].map((el) => el.getAttribute('data-cat-id')).sort()

  it('perches each cat on its page before the party', () => {
    renderRoom()
    expect(perched('llegada')).toEqual(['chona'])
    expect(perched('palabra')).toEqual(['mimo'])
    expect(perched('cuando')).toEqual(['bram', 'luz'])
    expect(perched('donde')).toEqual(['chori'])
    expect(perched('confirmar')).toEqual(['minina', 'susto'])
    expect(perched('presente')).toEqual(['nana'])
    expect(perched('familia')).toEqual(['kira', 'misha'])
  })

  // Review Focus 4: ten cats on four pages after the party.
  it.each([
    ['sat', satCutoff],
    ['sun', sunCutoff],
  ] as const)('keeps all ten cats on the four pages left after the %s party', (day, now) => {
    renderRoom({ day, now })
    expect(perched('llegada')).toEqual(['chona', 'minina', 'susto'])
    expect(perched('palabra')).toEqual(['chori', 'mimo', 'nana'])
    expect(perched('cuando')).toEqual(['bram', 'luz'])
    expect(perched('familia')).toEqual(['kira', 'misha'])
    const all = ['llegada', 'palabra', 'cuando', 'familia'].flatMap(perched)
    expect(all).toHaveLength(10)
    expect(new Set(all).size).toBe(10)
    // Each page's perches are separate spots: no two cats share one.
    const spots = [...document.querySelectorAll('.perch')].map((el) => el.className)
    expect(new Set(spots).size).toBe(spots.length)
  })

  it('draws the family as faceless paper figures in three layers, whose top copy has no outline (spec §6)', () => {
    renderRoom()
    const figures = document.querySelectorAll('.family-door .paper-family .paper-figure')
    expect(figures).toHaveLength(4)
    for (const figure of figures) {
      expect([...figure.querySelectorAll('.figure-layer')].map((layer) => layer.getAttribute('class'))).toEqual([
        'figure-layer figure-rim',
        'figure-layer figure-body',
        'figure-layer figure-hair',
      ])
      for (const fill of figure.querySelectorAll('.figure-fill')) expect(fill).not.toHaveAttribute('stroke')
    }
    expect(document.querySelector('.paper-family [class*="face"], .paper-family [class*="eye"], .paper-family [class*="mouth"]')).toBeNull()
  })

  it('lights the door brighter around the paper family once every page is found (spec §6)', () => {
    renderRoom({ progress: { ...emptyProgress, badges: ['cuentoCompleto'] } })
    const stage = document.querySelector('.door-stage')!
    expect(stage).toHaveClass('is-complete')
    expect(stage.querySelector('.family-door .paper-family')).not.toBeNull()
  })

  describe('acts', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('wobbles the countdown when tapped, then settles back to the real time (AC3)', () => {
      renderRoom()
      const countdown = screen.getByTestId('countdown')
      const before = countdown.textContent
      fireEvent.click(countdown)
      expect(countdown).toHaveClass('is-wobbling')
      expect(document.querySelector('.cat-luz')).toHaveClass('act-bat')
      advance(tuning.acts.actMs + 10)
      expect(countdown).not.toHaveClass('is-wobbling')
      expect(countdown.textContent).toBe(before)
    })

    it('tilts the QR when tapped, then lays it flat again (AC4)', () => {
      renderRoom()
      const plate = document.querySelector('.qr-plate')!
      fireEvent.click(plate)
      expect(plate).toHaveClass('is-tilting')
      expect(document.querySelector('.cat-nana')).toHaveClass('act-sit')
      advance(tuning.acts.actMs + 10)
      expect(plate).not.toHaveClass('is-tilting')
    })

    it('does not play the tilt from Guardar QR', () => {
      renderRoom()
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
      fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
      expect(document.querySelector('.qr-plate')).not.toHaveClass('is-tilting')
      vi.unstubAllGlobals()
    })

    it('startles Chavela at an empty spot near the button, and never from the link itself (AC5)', () => {
      renderRoom()
      const spot = document.querySelector('.confirm-spot') as HTMLElement
      fireEvent.click(spot)
      expect(document.querySelector('.cat-susto')).toHaveClass('act-startle')
    })

    it('does not startle Chavela from a tap on Minina by the seal, nor from the link (spec §3)', () => {
      renderRoom()
      fireEvent.click(document.querySelector('.perch-confirmar-minina .cat-figure')!)
      expect(document.querySelector('.cat-susto')).not.toHaveClass('act-startle')
      fireEvent.click(screen.getByRole('link', { name: copy.confirm }))
      expect(document.querySelector('.cat-susto')).not.toHaveClass('act-startle')
    })

    it("starts Misha's scratch from the door frame, with the paper family in the doorway (spec §6)", () => {
      renderRoom()
      fireEvent.click(document.querySelector('.door-frame-hit')!)
      expect(document.querySelector('.door-scratch')).toHaveClass('is-visible')
      expect(document.querySelector('.cat-misha')).toHaveClass('act-scratch')
      expect(document.querySelector('.family-door .paper-family')).not.toBeNull()
      advance(tuning.acts.scratchFadeMs + 10)
      expect(document.querySelector('.door-scratch')).not.toHaveClass('is-visible')
    })
  })

  it('keeps cats still with reduced motion (AC6)', () => {
    renderRoom({ reducedMotion: true })
    for (const el of document.querySelectorAll('.cat')) expect(el).toHaveClass('is-still')
  })
})

describe('US-9 noticing and greeting in the room', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('offers Saludar after the rarity wait, and greets on activation', () => {
    catsInView()
    const { onGreet } = renderRoom()
    expect(screen.queryByRole('button', { name: 'Saludar a Mishona' })).not.toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    const button = screen.getByRole('button', { name: 'Saludar a Mishona' })
    expect(button).toHaveTextContent(copy.greet)
    expect(screen.queryByRole('button', { name: 'Saludar a Kira' })).not.toBeInTheDocument()
    fireEvent.click(button)
    expect(onGreet).toHaveBeenCalledWith('luz')
  })

  it('does not offer Saludar for a cat already in the current round (BR-15)', () => {
    catsInView()
    renderRoom({ catState: { caught: ['luz'], round: ['luz'], rounds: 1 } })
    advance(3000)
    expect(screen.queryByRole('button', { name: 'Saludar a Mishona' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Saludar a Choni' })).toBeInTheDocument()
  })

  it('offers Misha sooner while music plays', () => {
    catsInView()
    renderRoom({ musicPlaying: true })
    advance(tuning.noticing.mishaMusicWaitMs + tuning.noticing.tickMs)
    expect(screen.getByRole('button', { name: battleCopy.start, description: 'Misha' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: battleCopy.start, description: 'Kira' })).not.toBeInTheDocument()
  })

  it('turns Saludar into ¡A jugar! for Misha and Kira, which starts a battle instead of greeting (design §7)', () => {
    catsInView()
    const { onGreet, onChallenge } = renderRoom()
    advance(tuning.noticing.waitMs.legendario + tuning.noticing.tickMs)
    expect(screen.queryByRole('button', { name: 'Saludar a Misha' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Saludar a Kira' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: battleCopy.start, description: 'Kira' }))
    expect(onChallenge).toHaveBeenCalledWith('kira')
    expect(onGreet).not.toHaveBeenCalled()
  })
})

describe('the paper diorama behind the flat room (spec §7)', () => {
  it("lays the cards over the diorama of the day's mood", () => {
    renderRoom({ day: 'sun', now: beforeSunCutoff })
    const diorama = document.querySelector('.paper-diorama')!
    expect(diorama).toHaveClass('mood-sunday')
    expect(diorama).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('main')).toHaveAttribute('data-level', 'diorama')
    expect(diorama.compareDocumentPosition(screen.getByTestId('room-mid')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('slides the diorama as the camera moves sideways', () => {
    renderRoom()
    const wall = () => document.querySelector<HTMLElement>('.diorama-wall')!.style.transform
    const before = wall()
    fireEvent.wheel(document.querySelector('.room-viewport')!, { deltaY: 80, shiftKey: true })
    expect(wall()).not.toBe(before)
  })

  it('holds the diorama still with reduced motion', () => {
    renderRoom({ reducedMotion: true })
    expect(document.querySelector('.paper-diorama')).toHaveClass('is-still')
    expect(document.querySelector<HTMLElement>('.diorama-wall')!.style.transform).toBe('')
  })
})
