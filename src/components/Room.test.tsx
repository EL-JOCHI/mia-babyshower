import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copy, days, shared } from '../content'
import { Room } from './Room'
import { cameraTargetFor } from '../logic/camera'
import { computeLayout, landmarksFor } from '../logic/layout'
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
  it('shows the image with its alternative text, on a plate at the minimum size (AC1)', () => {
    renderRoom({ qrUrl: '/qr-fixture.png' })
    const img = screen.getByRole('img', { name: copy.qrAlt })
    expect(img).toHaveAttribute('src', '/qr-fixture.png')
    expect(img).toHaveAttribute('width', String(tuning.qr.minPx))
    expect(img.closest('.qr-plate')).not.toBeNull()
  })

  it('shows the pending sentence, no image, and no Guardar QR when the file is missing (AC2)', () => {
    renderRoom({ qrUrl: undefined })
    expect(screen.getByText(copy.qrPending)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: copy.qrAlt })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
  })

  it('leads with presence and the offer, and names no amount, bank, or account (AC3)', () => {
    renderRoom()
    expect(screen.getByText(copy.giftLead)).toBeInTheDocument()
    expect(screen.getByText(copy.giftOffer)).toBeInTheDocument()
    const text = landmark('presente')?.textContent ?? ''
    expect(text).not.toMatch(/Bs\.?|\d+\s?bs|banco|cuenta/i)
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
    expect(screen.queryByText(copy.giftOffer)).not.toBeInTheDocument()
    expect(screen.queryByText(copy.qrPending)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: copy.qrSave })).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
    for (const name of ['El lugar', 'Confirmar', 'El regalo']) {
      expect(signposts().queryByRole('button', { name })).not.toBeInTheDocument()
    }
    for (const id of ['llegada', 'palabra', 'cuando', 'familia']) expect(landmark(id)).toBeInTheDocument()
  }

  it('removes the place, confirm, gift, countdown, and their signposts at the Saturday cutoff (AC3)', () => {
    renderRoom({ day: 'sat', now: satCutoff, qrUrl: '/qr.png' })
    expectOver()
  })

  it('does the same at the Sunday cutoff (AC4)', () => {
    renderRoom({ day: 'sun', now: sunCutoff })
    expectOver()
  })

  it('switches without a reload when the clock reaches the cutoff (AC5)', () => {
    const view = renderRoom({ now: at('2026-10-17T23:59:59-04:00') })
    expect(screen.getByText(shared.place)).toBeInTheDocument()
    view.rerender(<Room {...view.props} now={satCutoff} />)
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

describe('US-7 Move from pixels into 3D', () => {
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

  it('starts in the pixel era', () => {
    renderRoom()
    expect(screen.getByRole('main')).toHaveAttribute('data-era', 'pixel')
  })
})

describe('US-12 Watch the cats play (invitation)', () => {
  it('has all seven cats and the family door line (AC2)', () => {
    renderRoom()
    for (const name of ['Luz', 'Mimo', 'Susto', 'Bram', 'Nana', 'Misha', 'Kira']) {
      expect(screen.getByRole('img', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(copy.doorLine)).toBeInTheDocument()
    expect(document.querySelector('.figure-dad')).not.toBeNull()
    expect(document.querySelector('.figure-mom')).not.toBeNull()
    expect(document.querySelector('.figure-miguelito')).not.toBeNull()
    expect(document.querySelector('.figure-mia')).not.toBeNull()
  })

  it('draws the family as solid shadows whose top copy has no outline, so no face or inner line shows (§5)', () => {
    renderRoom()
    const groups = document.querySelectorAll('.family-shadows')
    expect(groups).toHaveLength(2)
    const top = groups[1]!
    expect(top).not.toHaveAttribute('stroke')
    expect(top.querySelectorAll('.family-figure')).toHaveLength(4)
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
      renderRoom({ qrUrl: '/qr.png' })
      const plate = document.querySelector('.qr-plate')!
      fireEvent.click(plate)
      expect(plate).toHaveClass('is-tilting')
      expect(document.querySelector('.cat-nana')).toHaveClass('act-sit')
      advance(tuning.acts.actMs + 10)
      expect(plate).not.toHaveClass('is-tilting')
    })

    it('does not play the tilt from Guardar QR', () => {
      renderRoom({ qrUrl: '/qr.png' })
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
      fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
      expect(document.querySelector('.qr-plate')).not.toHaveClass('is-tilting')
      vi.unstubAllGlobals()
    })

    it('startles Susto at an empty spot near the button, and never from the link itself (AC5)', () => {
      renderRoom()
      const spot = document.querySelector('.confirm-spot') as HTMLElement
      fireEvent.click(spot)
      expect(document.querySelector('.cat-susto')).toHaveClass('act-startle')
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
    expect(screen.queryByRole('button', { name: 'Saludar a Luz' })).not.toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    const button = screen.getByRole('button', { name: 'Saludar a Luz' })
    expect(button).toHaveTextContent(copy.greet)
    expect(screen.queryByRole('button', { name: 'Saludar a Kira' })).not.toBeInTheDocument()
    fireEvent.click(button)
    expect(onGreet).toHaveBeenCalledWith('luz')
  })

  it('does not offer Saludar for a cat already in the current round (BR-15)', () => {
    catsInView()
    renderRoom({ catState: { caught: ['luz'], round: ['luz'], rounds: 1 } })
    advance(3000)
    expect(screen.queryByRole('button', { name: 'Saludar a Luz' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Saludar a Mimo' })).toBeInTheDocument()
  })

  it('offers Misha sooner while music plays', () => {
    catsInView()
    renderRoom({ musicPlaying: true })
    advance(tuning.noticing.mishaMusicWaitMs + tuning.noticing.tickMs)
    expect(screen.getByRole('button', { name: 'Saludar a Misha' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Saludar a Kira' })).not.toBeInTheDocument()
  })
})
