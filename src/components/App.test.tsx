import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copy, days, shared } from '../content'
import { storageKeys } from '../logic/storageKeys'
import { tuning } from '../tuning'
import { advance, at, beforeSatCutoff, catsInView, satCutoff, stubMedia } from '../test/helpers'
import { App } from './App'

const openCollection = () => fireEvent.click(screen.getByRole('button', { name: copy.collection }))
const dialog = () => within(screen.getByRole('dialog', { name: copy.collection }))

describe('US-8 Enter only with the link I was sent', () => {
  it('shows the gate with both sentences, and no date, place, WhatsApp, or QR (AC4, SC-3)', () => {
    render(<App search="" qrUrl="/qr.png" />)
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
    const text = document.body.textContent ?? ''
    for (const hidden of [days.sat.dateLine, days.sun.dateLine, shared.place, '16:00']) expect(text).not.toContain(hidden)
    expect(screen.queryByRole('link', { name: copy.confirm })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: copy.qrAlt })).not.toBeInTheDocument()
    expect(document.querySelector('a[href*="wa.me"]')).toBeNull()
  })

  it('shows the gate for a junk code (AC3)', () => {
    render(<App search="?e=17-octubre" />)
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
  })

  it('opens Saturday for n4vk at any time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(at('2026-10-16T09:00:00-04:00'))
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(days.sat.dateLine)).toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('US-10 Watch the gate loop', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('counts from 9 toward 0 with cats present, then plays the finale and returns to 9 (AC1, AC2)', () => {
    render(<App search="" />)
    const count = screen.getByTestId('gate-count')
    expect(count).toHaveTextContent('9')
    expect(screen.getByRole('img', { name: 'Luz' })).toBeInTheDocument()
    advance(tuning.gate.stepMs)
    expect(count).toHaveTextContent('8')
    for (let i = 0; i < 8; i++) advance(tuning.gate.stepMs)
    expect(count).toHaveTextContent('0')
    expect(screen.getByRole('main')).toHaveClass('is-finale')
    advance(tuning.gate.finaleMs)
    expect(screen.getByTestId('gate-count')).toHaveTextContent('9')
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    expect(screen.getByText(copy.gate[1])).toBeInTheDocument()
  })

  it('shows the sentences and still cats, and runs no count, with reduced motion (AC3)', () => {
    window.__prefersReducedMotion = true
    render(<App search="" />)
    expect(screen.queryByTestId('gate-count')).not.toBeInTheDocument()
    expect(screen.getByText(copy.gate[0])).toBeInTheDocument()
    for (const el of document.querySelectorAll('.cat')) expect(el).toHaveClass('is-still')
  })
})

describe('US-12 The gate is a room with cats (AC1)', () => {
  it('has Luz, Mimo, and Susto with the yarn, the box, and a heart; no Bram, Misha, Kira, or door', () => {
    render(<App search="" />)
    for (const name of ['Luz', 'Mimo', 'Susto']) expect(screen.getByRole('img', { name })).toBeInTheDocument()
    for (const name of ['Bram', 'Nana', 'Misha', 'Kira']) expect(screen.queryByRole('img', { name })).not.toBeInTheDocument()
    expect(document.querySelector('.toy-yarn')).not.toBeNull()
    expect(document.querySelector('.toy-box')).not.toBeNull()
    expect(document.querySelector('.toy-heart')).not.toBeNull()
    expect(document.querySelector('.family-door')).toBeNull()
  })
})

describe('US-2 Choose a theme', () => {
  it('follows the operating system on a first visit (AC1)', () => {
    window.__prefersLight = true
    render(<App search="" />)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('button', { name: copy.themeLight })).toHaveAttribute('aria-pressed', 'true')
  })

  it('is dark when the scheme reads dark (AC1)', () => {
    render(<App search="" />)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('switches immediately, marks the active option, and remembers it on another page (AC2, AC3)', () => {
    const first = render(<App search="?e=n4vk" />)
    fireEvent.click(screen.getByRole('button', { name: copy.themeLight }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('button', { name: copy.themeLight })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: copy.themeDark })).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem(storageKeys.theme)).toBe('light')
    first.unmount()
    render(<App search="" />)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })
})

describe('US-3 AC4 and BR-16 storage', () => {
  it('stores nothing when the guest only reads the invitation', () => {
    render(<App search="?e=n4vk" />)
    expect(localStorage.length).toBe(0)
  })

  it('still renders when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    render(<App search="?e=n4vk" />)
    fireEvent.click(screen.getByRole('button', { name: copy.themeLight }))
    expect(screen.getByText(copy.hero)).toBeInTheDocument()
  })

  it('drops junk stored cat data and still renders (US-9 AC12)', () => {
    localStorage.setItem(storageKeys.cats, '{not json')
    render(<App search="" />)
    openCollection()
    expect(dialog().getByText(copy.roundCount(0))).toBeInTheDocument()
  })
})

describe('US-9 Meet the cats and keep them', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('greets Luz, stores her, and shows the caught line, rarity, and line (AC1)', () => {
    vi.setSystemTime(beforeSatCutoff)
    catsInView()
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({ caught: ['luz'], round: ['luz'], rounds: 1 })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(copy.caught('Luz'))
    expect(status).toHaveTextContent('Común')
    expect(status).toHaveTextContent('Siempre encuentra algo que perseguir.')
    advance(tuning.greetingToastMs + 10)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('greets Misha and Kira as Legendario (AC3, AC4)', () => {
    vi.setSystemTime(beforeSatCutoff)
    catsInView()
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.legendario + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Misha' }))
    expect(screen.getByRole('status')).toHaveTextContent('Legendario')
    expect(screen.getByRole('status')).toHaveTextContent('Está en calma, y está en casa.')
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Kira' }))
    expect(screen.getByRole('status')).toHaveTextContent('Mira la puerta, y se queda cerca.')
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!).caught).toEqual(['misha', 'kira'])
  })

  it('greets Mimo on the gate, where Bram never appears (AC5, AC7)', () => {
    catsInView()
    render(<App search="" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Mimo' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!).caught).toEqual(['mimo'])
    expect(screen.queryByRole('img', { name: 'Bram' })).not.toBeInTheDocument()
  })

  it('shows two stored cats with their lines and adds nothing until a new greet (AC6)', () => {
    vi.setSystemTime(beforeSatCutoff)
    const stored = JSON.stringify({ caught: ['luz', 'nana'], round: ['luz', 'nana'], rounds: 1 })
    localStorage.setItem(storageKeys.cats, stored)
    render(<App search="?e=q8lm" />)
    openCollection()
    expect(dialog().getByText('Siempre encuentra algo que perseguir.')).toBeInTheDocument()
    expect(dialog().getByText('Elige un solo lugar, y ese es el suyo.')).toBeInTheDocument()
    expect(dialog().getByText(copy.roundCount(2))).toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.cats)).toBe(stored)
  })

  it('shows the rarity and Aún no se acerca for a cat not yet greeted, without its line (AC8)', () => {
    render(<App search="" />)
    openCollection()
    const kira = within(screen.getByTestId('collection-kira'))
    expect(kira.getByText('Legendario')).toBeInTheDocument()
    expect(kira.getByText(copy.notYet)).toBeInTheDocument()
    expect(kira.queryByText('Mira la puerta, y se queda cerca.')).not.toBeInTheDocument()
    expect(kira.queryByText('Kira')).not.toBeInTheDocument()
  })
})

describe('Tus gatos dialog', () => {
  it('moves focus in, closes with Escape, and returns focus to the control', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
    render(<App search="" />)
    const trigger = screen.getByRole('button', { name: copy.collection })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: copy.collection })).toContainElement(document.activeElement as HTMLElement)
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    vi.useRealTimers()
  })
})

describe('US-13 Relive the party', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('thanks the guest after the cutoff instead of inviting (AC1)', () => {
    vi.setSystemTime(satCutoff)
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(copy.postPartyHero)).toBeInTheDocument()
    expect(screen.getByText(copy.relive)).toBeInTheDocument()
    expect(screen.queryByText(copy.hero)).not.toBeInTheDocument()
  })

  it('starts a new round with Jugar otra vez and keeps the cats already met (AC2, AC3)', () => {
    vi.setSystemTime(satCutoff)
    localStorage.setItem(
      storageKeys.cats,
      JSON.stringify({ caught: ['luz', 'mimo', 'nana'], round: ['luz', 'mimo', 'nana'], rounds: 1 }),
    )
    catsInView()
    render(<App search="?e=n4vk" />)
    openCollection()
    fireEvent.click(dialog().getByRole('button', { name: copy.playAgain }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({
      caught: ['luz', 'mimo', 'nana'],
      round: [],
      rounds: 2,
    })
    expect(dialog().getByText(copy.roundCount(0))).toBeInTheDocument()
    expect(dialog().getByText(copy.roundNumber(2))).toBeInTheDocument()
    expect(dialog().getByText('Siempre encuentra algo que perseguir.')).toBeInTheDocument()
    fireEvent.click(dialog().getByRole('button', { name: copy.close }))
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!)).toEqual({
      caught: ['luz', 'mimo', 'nana'],
      round: ['luz'],
      rounds: 2,
    })
  })

  it('offers no Jugar otra vez before the cutoff (AC4)', () => {
    vi.setSystemTime(beforeSatCutoff)
    render(<App search="?e=n4vk" />)
    openCollection()
    expect(dialog().queryByRole('button', { name: copy.playAgain })).not.toBeInTheDocument()
  })

  it('offers no Jugar otra vez on the gate (AC5)', () => {
    vi.setSystemTime(satCutoff)
    render(<App search="" />)
    openCollection()
    expect(dialog().queryByRole('button', { name: copy.playAgain })).not.toBeInTheDocument()
  })

  it('enters the party-over state without a reload when the clock passes midnight (US-5 AC5)', () => {
    vi.setSystemTime(at('2026-10-17T23:59:59-04:00'))
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(shared.place)).toBeInTheDocument()
    advance(1000)
    expect(screen.queryByText(shared.place)).not.toBeInTheDocument()
    expect(screen.getByText(copy.relive)).toBeInTheDocument()
  })
})

describe('US-11 Hear the room when I ask', () => {
  it('has no music control and no audio element without a track (AC1)', () => {
    render(<App search="" musicUrl={undefined} />)
    expect(screen.queryByRole('button', { name: copy.musicOn })).not.toBeInTheDocument()
    expect(document.querySelector('audio')).toBeNull()
  })

  it('starts paused, then plays from the start and reads Silenciar música (AC2, AC3)', async () => {
    const media = stubMedia()
    render(<App search="" musicUrl="/ambience.mp3" />)
    const audio = document.querySelector('audio')!
    expect(audio).toHaveAttribute('src', '/ambience.mp3')
    expect(media.play).not.toHaveBeenCalled()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: copy.musicOn })))
    expect(media.play).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: copy.musicOff })).toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.music)).toBe('on')
  })

  it('pauses and stays silent next time after Silenciar música (AC5)', async () => {
    const media = stubMedia()
    render(<App search="" musicUrl="/ambience.mp3" />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: copy.musicOn })))
    await act(async () => fireEvent.click(screen.getByRole('button', { name: copy.musicOff })))
    expect(media.pause).toHaveBeenCalled()
    expect(localStorage.getItem(storageKeys.music)).toBe('off')
    expect(screen.getByRole('button', { name: copy.musicOn })).toBeInTheDocument()
  })

  it('resumes a stored choice at the first gesture, not on load (AC4)', async () => {
    localStorage.setItem(storageKeys.music, 'on')
    const media = stubMedia()
    render(<App search="?e=n4vk" musicUrl="/ambience.mp3" />)
    expect(media.play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: copy.musicOn })).toBeInTheDocument()
    await act(async () => fireEvent.pointerDown(document.body))
    expect(media.play).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: copy.musicOff })).toBeInTheDocument()
  })

  it('keeps reading Activar música when the browser refuses (AC6)', async () => {
    localStorage.setItem(storageKeys.music, 'on')
    stubMedia({ refuse: true })
    render(<App search="" musicUrl="/ambience.mp3" />)
    await act(async () => fireEvent.pointerDown(document.body))
    expect(screen.getByRole('button', { name: copy.musicOn })).toBeInTheDocument()
  })

  it('pauses while the page is hidden (AC7)', async () => {
    const media = stubMedia()
    render(<App search="" musicUrl="/ambience.mp3" />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: copy.musicOn })))
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    await act(async () => document.dispatchEvent(new Event('visibilitychange')))
    expect(media.pause).toHaveBeenCalled()
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  })
})
