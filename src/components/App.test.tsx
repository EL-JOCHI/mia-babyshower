import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { battleCopy, copy, days, gameCopy, shared } from '../content'
import { storageKeys } from '../logic/storageKeys'
import { whatsappUrl } from '../logic/whatsapp'
import { tuning } from '../tuning'
import { advance, at, beforeSatCutoff, catsInView, satCutoff, stubMedia } from '../test/helpers'
import { App } from './App'

const openCollection = () => fireEvent.click(screen.getByRole('button', { name: copy.collection }))
const dialog = () => within(screen.getByRole('dialog', { name: copy.collection }))
const stored = (key: string) => JSON.parse(localStorage.getItem(key)!)

// Most of these run with reduced motion, so the battle is instant (no wipe, no typewriter) and the
// flat room is on screen.
const startBattle = (name: 'Misha' | 'Kira') =>
  fireEvent.click(screen.getByRole('button', { name: battleCopy.start, description: name }))
const play = (move: string) => fireEvent.click(screen.getByRole('button', { name: move }))
const winBattle = (name: 'Misha' | 'Kira') => {
  startBattle(name)
  for (let i = 0; i < 3; i++) play(battleCopy.moves.ovillo)
  fireEvent.click(screen.getByRole('button', { name: copy.caught(name) }))
}

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

  // Two whole battles in the full App: about 2 s alone, so it gets room on a busy machine.
  it('greets Misha and Kira as Legendario, each through a battle (AC3, AC4, design §7)', () => {
    window.__prefersReducedMotion = true
    vi.setSystemTime(beforeSatCutoff)
    catsInView()
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.legendario + tuning.noticing.tickMs)
    expect(screen.queryByRole('button', { name: 'Saludar a Misha' })).not.toBeInTheDocument()
    winBattle('Misha')
    expect(screen.getByRole('status')).toHaveTextContent('Legendario')
    expect(screen.getByRole('status')).toHaveTextContent('Está en calma, y está en casa.')
    winBattle('Kira')
    expect(screen.getByRole('status')).toHaveTextContent('Mira la puerta, y se queda cerca.')
    expect(stored(storageKeys.cats).caught).toEqual(['misha', 'kira'])
  }, 15000)

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

describe('US-14 The legendary battle and the card reward (design §6, §7)', () => {
  beforeEach(() => {
    window.__prefersReducedMotion = true
    vi.useFakeTimers()
    vi.setSystemTime(beforeSatCutoff)
    catsInView()
  })
  afterEach(() => vi.useRealTimers())

  const noticeLegendaries = () => advance(tuning.noticing.waitMs.legendario + tuning.noticing.tickMs)

  it('greeting Misha through the battle stores her in mia-cats and shows Legendario', () => {
    // With motion: the wipe plays and every line types out before the next move.
    window.__prefersReducedMotion = false
    const typeOut = () => advance(10000)
    render(<App search="?e=n4vk" />)
    noticeLegendaries()
    startBattle('Misha')
    expect(screen.getByRole('dialog', { name: battleCopy.intro('Misha') })).toBeInTheDocument()
    advance(tuning.battleScreen.wipeMs)
    typeOut()
    for (let i = 0; i < 3; i++) {
      play(battleCopy.moves.ovillo)
      typeOut()
    }
    expect(screen.getByRole('log')).toHaveTextContent(battleCopy.finisher.misha)
    fireEvent.click(screen.getByRole('button', { name: copy.caught('Misha') }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(stored(storageKeys.cats)).toEqual({ caught: ['misha'], round: ['misha'], rounds: 1 })
    expect(screen.getByRole('status')).toHaveTextContent('Legendario')
    expect(screen.getByTestId('card-reveal')).toHaveTextContent('Legendario')
    expect(screen.getByTestId('card-reveal')).toHaveClass('rarity-legendario')
  })

  it('Huir stores nothing, and the cat can be challenged again', () => {
    render(<App search="?e=n4vk" />)
    noticeLegendaries()
    startBattle('Kira')
    play(battleCopy.moves.huir)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.cats)).toBeNull()
    expect(localStorage.getItem(storageKeys.progress)).toBeNull()
    expect(screen.queryByTestId('card-reveal')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: battleCopy.start, description: 'Kira' })).toBeInTheDocument()
  })

  it('keeps one dialog at a time: Tus gatos cannot open during a battle, and Escape is Huir (Review Focus 1)', () => {
    render(<App search="?e=n4vk" />)
    noticeLegendaries()
    startBattle('Misha')
    expect(document.querySelector('.app-page')).toHaveAttribute('inert')
    fireEvent.click(screen.getByRole('button', { name: copy.collection }))
    expect(screen.queryByRole('dialog', { name: copy.collection })).not.toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.querySelector('.app-page')).not.toHaveAttribute('inert')
    expect(localStorage.getItem(storageKeys.cats)).toBeNull()
  })

  it('starts no battle while Tus gatos is open', () => {
    render(<App search="?e=n4vk" />)
    noticeLegendaries()
    openCollection()
    fireEvent.click(screen.getByRole('button', { name: battleCopy.start, description: 'Misha' }))
    expect(screen.queryByRole('dialog', { name: battleCopy.intro('Misha') })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: copy.collection })).toBeInTheDocument()
  })

  it('shows the card for a normal greeting, and a tap sends it away', () => {
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    const card = screen.getByTestId('card-reveal')
    expect(card).toHaveClass('rarity-comun')
    expect(card).toHaveTextContent('Luz')
    expect(card).toHaveTextContent('Común')
    fireEvent.click(card)
    advance(tuning.card.leaveMs + 10)
    expect(screen.queryByTestId('card-reveal')).not.toBeInTheDocument()
  })

  it('a first greeting earns XP for the cat and the first-cat badge (metCat)', () => {
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    const progress = stored(storageKeys.progress)
    expect(progress.xp).toBeGreaterThan(0)
    expect(progress.xp).toBe(tuning.progress.catXp.comun + tuning.progress.badgeXp.primerGato)
    expect(progress.badges).toEqual(['primerGato'])
  })

  it('a known cat greeted again in a new round adds no XP', () => {
    vi.setSystemTime(satCutoff)
    localStorage.setItem(storageKeys.cats, JSON.stringify({ caught: ['luz'], round: [], rounds: 2 }))
    const progress = JSON.stringify({ pages: [], badges: ['primerGato'], xp: 40 })
    localStorage.setItem(storageKeys.progress, progress)
    render(<App search="?e=n4vk" />)
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(stored(storageKeys.cats).round).toEqual(['luz'])
    expect(localStorage.getItem(storageKeys.progress)).toBe(progress)
  })
})

describe('US-15 The game layer: pages, badges, and XP (design §5, §6)', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    })
    vi.setSystemTime(beforeSatCutoff)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const toast = () => screen.getByTestId('badge-toast')
  // The camera glides to the page, then rests there long enough to count as arriving.
  const arrive = () => {
    advance(tuning.camera.glideMs + 50)
    advance(tuning.pages.settleMs + 10)
  }

  it('counts Cuándo once the camera arrives from La fecha, with its badge and XP', () => {
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.pages(0, 6))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'La fecha' }))
    arrive()
    expect(screen.getByText(gameCopy.pages(1, 6))).toBeInTheDocument()
    expect(toast()).toHaveTextContent(gameCopy.badges.fecha)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.badgeXp.fecha))
    expect(stored(storageKeys.progress)).toEqual({ pages: ['cuando'], badges: ['fecha'], xp: tuning.progress.badgeXp.fecha })
  })

  it('counts three pages after the party', () => {
    vi.setSystemTime(satCutoff)
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.pages(0, 3))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'La familia' }))
    arrive()
    expect(screen.getByText(gameCopy.pages(1, 3))).toBeInTheDocument()
    expect(toast()).toHaveTextContent(gameCopy.badges.puerta)
  })

  it('seals the invitation from Confirmar por WhatsApp, and the link still opens WhatsApp at once', () => {
    render(<App search="?e=n4vk" />)
    const link = screen.getByRole('link', { name: copy.confirm })
    // The click's default action (opening WhatsApp in a new tab) is never held back.
    expect(fireEvent.click(link)).toBe(true)
    expect(link).toHaveAttribute('href', whatsappUrl('sat'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(toast()).toHaveTextContent(gameCopy.badges.sellada)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.badgeXp.sellada))
    expect(stored(storageKeys.progress).badges).toEqual(['sellada'])
  })

  it('earns QR guardado from Guardar QR', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<App search="?e=n4vk" qrUrl="/qr.png" />)
    fireEvent.click(screen.getByRole('button', { name: copy.qrSave }))
    expect(toast()).toHaveTextContent(gameCopy.badges.qrGuardado)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.badgeXp.qrGuardado))
    expect(stored(storageKeys.progress).badges).toEqual(['qrGuardado'])
  })

  it('earns Abriste el cuento from the first arrow key, and not from Tab', () => {
    render(<App search="?e=n4vk" />)
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
    expect(localStorage.getItem(storageKeys.progress)).toBeNull()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(toast()).toHaveTextContent(gameCopy.badges.openBook)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.badgeXp.openBook))
  })

  it('shows one toast at a time, each for a while, with the level-up line when the level rises', () => {
    localStorage.setItem(storageKeys.progress, JSON.stringify({ pages: [], badges: ['openBook'], xp: 50 }))
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.level(1))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: copy.confirm }))
    fireEvent.click(screen.getByRole('button', { name: 'La fecha' }))
    arrive()
    expect(screen.getAllByTestId('badge-toast')).toHaveLength(1)
    expect(toast()).toHaveTextContent(gameCopy.badges.sellada)
    expect(toast()).toHaveTextContent(gameCopy.levelUp(2))
    expect(screen.getByText(gameCopy.level(2))).toBeInTheDocument()
    advance(tuning.quest.toastMs)
    expect(toast()).toHaveTextContent(gameCopy.badges.fecha)
    expect(toast()).not.toHaveTextContent(gameCopy.levelUp(2))
    advance(tuning.quest.toastMs)
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
  })

  it('holds the badge toasts until the card has gone, and counts the cat in the quest log', () => {
    catsInView()
    render(<App search="?e=n4vk" />)
    expect(screen.getByText(gameCopy.cats(0))).toBeInTheDocument()
    advance(tuning.noticing.waitMs.comun + tuning.noticing.tickMs)
    fireEvent.click(screen.getByRole('button', { name: 'Saludar a Luz' }))
    expect(screen.getByText(gameCopy.cats(1))).toBeInTheDocument()
    expect(screen.getByTestId('card-reveal')).toBeInTheDocument()
    expect(screen.queryByTestId('badge-toast')).not.toBeInTheDocument()
    advance(tuning.greetingToastMs + 10)
    expect(toast()).toHaveTextContent(gameCopy.badgeXp(tuning.progress.catXp.comun))
  })

  it('shows every object already open with reduced motion: the gift box with the QR, and the map', () => {
    window.__prefersReducedMotion = true
    render(<App search="?e=n4vk" qrUrl="/qr.png" />)
    const box = document.querySelector<HTMLElement>('.gift-box')!
    expect(box).toHaveClass('is-open')
    expect(within(box).getByRole('img', { name: copy.qrAlt })).toBeInTheDocument()
    expect(within(box).getByRole('button', { name: copy.qrSave })).toBeInTheDocument()
    expect(document.querySelector('.treasure-map')).toHaveClass('is-unrolled')
  })

  it('shows no quest log on the gate', () => {
    render(<App search="" />)
    expect(screen.queryByText(gameCopy.pages(0, 6))).not.toBeInTheDocument()
  })
})

describe('Tus gatos dialog', () => {
  it('closes with Escape even when focus has left the dialog', () => {
    render(<App search="" />)
    fireEvent.click(screen.getByRole('button', { name: copy.collection }))
    act(() => (document.activeElement as HTMLElement | null)?.blur())
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('makes the page behind it inert while open', () => {
    render(<App search="" />)
    fireEvent.click(screen.getByRole('button', { name: copy.collection }))
    expect(document.querySelector('.app-page')).toHaveAttribute('inert')
  })

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

  it('disables Jugar otra vez while the new round is still empty, so a double tap skips nothing', () => {
    vi.setSystemTime(satCutoff)
    localStorage.setItem(storageKeys.cats, JSON.stringify({ caught: ['luz'], round: ['luz'], rounds: 1 }))
    render(<App search="?e=n4vk" />)
    openCollection()
    const again = dialog().getByRole('button', { name: copy.playAgain })
    fireEvent.click(again)
    expect(again).toBeDisabled()
    fireEvent.click(again)
    expect(JSON.parse(localStorage.getItem(storageKeys.cats)!).rounds).toBe(2)
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
    // A touch pointerdown grants no user activation, so it must not be the trigger.
    await act(async () => fireEvent.pointerDown(document.body))
    expect(media.play).not.toHaveBeenCalled()
    await act(async () => fireEvent.pointerUp(document.body))
    expect(media.play).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: copy.musicOff })).toBeInTheDocument()
    await act(async () => fireEvent.click(document.body))
    expect(media.play).toHaveBeenCalledTimes(1)
  })

  it('does not restart the track when the first gesture was the music control (§4)', async () => {
    localStorage.setItem(storageKeys.music, 'on')
    const media = stubMedia()
    render(<App search="?e=n4vk" musicUrl="/ambience.mp3" />)
    const control = screen.getByRole('button', { name: copy.musicOn })
    await act(async () => {
      fireEvent.pointerUp(control)
      fireEvent.click(control)
    })
    expect(media.play).toHaveBeenCalledTimes(1)
    const audio = document.querySelector('audio')!
    audio.currentTime = 42
    await act(async () => {
      fireEvent.pointerUp(document.body)
      fireEvent.click(document.body)
    })
    expect(media.play).toHaveBeenCalledTimes(1)
    expect(audio.currentTime).toBe(42)
  })

  it('keeps reading Activar música when the browser refuses (AC6)', async () => {
    localStorage.setItem(storageKeys.music, 'on')
    stubMedia({ refuse: true })
    render(<App search="" musicUrl="/ambience.mp3" />)
    await act(async () => fireEvent.pointerUp(document.body))
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
    await act(async () => document.dispatchEvent(new Event('visibilitychange')))
    expect(media.play).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: copy.musicOff })).toBeInTheDocument()
  })

  it('stays silent after the page returns if the music was off', async () => {
    const media = stubMedia()
    render(<App search="" musicUrl="/ambience.mp3" />)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    await act(async () => document.dispatchEvent(new Event('visibilitychange')))
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    await act(async () => document.dispatchEvent(new Event('visibilitychange')))
    expect(media.play).not.toHaveBeenCalled()
  })
})
