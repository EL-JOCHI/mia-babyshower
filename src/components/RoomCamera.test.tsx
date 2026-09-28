import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement, useEffect, type ComponentProps, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copy } from '../content'
import { dioramaCss } from '../headMeta'
import { cameraTargetFor, clampCamera } from '../logic/camera'
import { emptyCatState } from '../logic/catState'
import { emptyProgress } from '../logic/progress'
import { bookQrPx } from '../logic/book'
import { computeLayout, landmarksFor, type LandmarkId } from '../logic/layout'
import { hasWebGL } from '../logic/webgl'
import { cssColor, tuning } from '../tuning'
import { beforeSatCutoff, beforeSunCutoff, renderRoom } from '../test/helpers'
import { WorldRoom } from './WorldRoom'

// jsdom has no WebGL. The world stands in as its pages in plain DOM: it gets ready, fails on
// purpose, or stalls and never draws a first frame.
const world = vi.hoisted(() => ({ mode: 'fails' as 'fails' | 'ready' | 'stalls', mounts: 0 }))
const backdrop = vi.hoisted(() => ({
  mode: 'waits' as 'waits' | 'ready' | 'fails',
  ready: null as null | (() => void),
  mounts: 0,
}))
vi.mock('../world/World', () => ({
  default: function World({
    ids,
    content,
    mood,
    theme,
    tier,
    running,
    paused,
    doorComplete,
    onDoorTap,
    onReady,
  }: {
    ids: LandmarkId[]
    content: Record<LandmarkId, ReactNode>
    mood: string
    theme: string
    tier: string
    running: boolean
    paused: boolean
    doorComplete: boolean
    onDoorTap: () => void
    onReady: () => void
  }) {
    if (world.mode === 'fails') throw new Error('The world could not start')
    useEffect(() => {
      world.mounts += 1
    }, [])
    useEffect(() => {
      if (world.mode === 'ready') onReady()
    }, [onReady])
    return createElement(
      'div',
      {
        'data-testid': 'world',
        'data-mood': mood,
        'data-theme': theme,
        'data-tier': tier,
        'data-running': String(running),
        'data-paused': String(paused),
        'data-door-complete': String(doorComplete),
      },
      createElement('canvas', { key: 'canvas' }),
      // Stands in for the 3D door piece at the Familia station.
      createElement('button', { key: 'door', type: 'button', 'data-testid': 'world-door', onClick: onDoorTap }),
      ids.map((id) => createElement('section', { key: id, 'data-landmark-id': id }, content[id])),
    )
  },
  // Level 2's live attic: it waits, gets ready, or fails on purpose; `backdrop.ready` readies it.
  Backdrop: function Backdrop({
    mood,
    theme,
    tier,
    paused,
    onReady,
  }: {
    mood: string
    theme: string
    tier: string
    paused: boolean
    onReady: () => void
  }) {
    if (backdrop.mode === 'fails') throw new Error('The attic could not start')
    useEffect(() => {
      backdrop.mounts += 1
    }, [])
    useEffect(() => {
      backdrop.ready = onReady
      if (backdrop.mode === 'ready') onReady()
    }, [onReady])
    return createElement(
      'div',
      { 'data-testid': 'backdrop', 'data-mood': mood, 'data-theme': theme, 'data-tier': tier, 'data-paused': String(paused) },
      createElement('canvas'),
    )
  },
}))
vi.mock('../logic/webgl', () => ({ hasWebGL: vi.fn(() => true) }))

// §4 What the guest does: drag, touch, wheel, and focus move the camera; taps still reach their target.

const surface = () => document.querySelector('.room-viewport') as HTMLElement
const mid = () => screen.getByTestId('room-mid') as HTMLElement

function cameraX(): number {
  const match = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(mid().style.transform)
  return -Number(match?.[1] ?? 0)
}
function cameraY(): number {
  const match = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(mid().style.transform)
  return -Number(match?.[2] ?? 0)
}

function drag(target: Element, from: [number, number], to: [number, number], pointerId = 1) {
  fireEvent.pointerDown(target, { pointerId, isPrimary: pointerId === 1, button: 0, clientX: from[0], clientY: from[1] })
  fireEvent.pointerMove(target, { pointerId, clientX: to[0], clientY: to[1] })
  fireEvent.pointerUp(target, { pointerId, clientX: to[0], clientY: to[1] })
}

describe('camera input (§4, BR-20)', () => {
  it('moves the camera by the drag distance, opposite to the finger', () => {
    renderRoom()
    const x0 = cameraX()
    drag(surface(), [300, 400], [100, 400])
    expect(cameraX()).toBeCloseTo(x0 + 200, 5)
  })

  it('ignores movement below the drag threshold, so a tap stays a tap', () => {
    renderRoom()
    const x0 = cameraX()
    const small = tuning.camera.dragThresholdPx - 2
    drag(surface(), [300, 400], [300 - small, 400])
    expect(cameraX()).toBe(x0)
  })

  it('does not drag when the press starts on a link, a button, or the QR', () => {
    renderRoom({ qrUrl: '/qr.png' })
    const x0 = cameraX()
    drag(screen.getByRole('link', { name: copy.map }), [300, 400], [100, 400])
    drag(screen.getByRole('button', { name: copy.qrSave }), [300, 400], [100, 400])
    drag(document.querySelector('.qr-plate')!, [300, 400], [100, 400])
    drag(document.querySelector('.place')!, [300, 400], [100, 400])
    expect(cameraX()).toBe(x0)
  })

  it('swallows the click that ends a drag, so dragging over the countdown does not tap it', () => {
    renderRoom()
    const countdown = screen.getByTestId('countdown')
    drag(countdown, [300, 400], [100, 400])
    fireEvent.click(countdown)
    expect(countdown).not.toHaveClass('is-wobbling')
    fireEvent.pointerDown(countdown, { pointerId: 1, isPrimary: true, button: 0, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(countdown, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.click(countdown)
    expect(countdown).toHaveClass('is-wobbling')
  })

  it('hands a second finger to pinch zoom instead of dragging', () => {
    renderRoom()
    const x0 = cameraX()
    fireEvent.pointerDown(surface(), { pointerId: 1, isPrimary: true, button: 0, clientX: 300, clientY: 400 })
    fireEvent.pointerDown(surface(), { pointerId: 2, isPrimary: false, button: 0, clientX: 320, clientY: 420 })
    fireEvent.pointerMove(surface(), { pointerId: 1, clientX: 100, clientY: 400 })
    expect(cameraX()).toBe(x0)
    fireEvent.pointerUp(surface(), { pointerId: 1 })
    fireEvent.pointerUp(surface(), { pointerId: 2 })
    drag(surface(), [300, 400], [100, 400])
    expect(cameraX()).toBeCloseTo(x0 + 200, 5)
  })

  it('recovers when an earlier pointer never reported its end', () => {
    renderRoom()
    const x0 = cameraX()
    fireEvent.pointerDown(surface(), { pointerId: 7, isPrimary: true, button: 0, clientX: 300, clientY: 400 })
    drag(surface(), [300, 400], [100, 400], 1)
    expect(cameraX()).toBeCloseTo(x0 + 200, 5)
  })

  it('moves vertically with the wheel and sideways with shift-wheel', () => {
    renderRoom()
    const [x0, y0] = [cameraX(), cameraY()]
    fireEvent.wheel(surface(), { deltaY: 50 })
    expect(cameraY()).toBeCloseTo(y0 + 50, 5)
    fireEvent.wheel(surface(), { deltaY: 80, shiftKey: true })
    expect(cameraX()).toBeCloseTo(x0 + 80, 5)
  })

  it('brings a control back into view each time it is focused again (FR-11)', () => {
    renderRoom({ reducedMotion: true })
    const layout = computeLayout(window.innerWidth, window.innerHeight, landmarksFor(false))
    const target = cameraTargetFor(layout.positions.donde, layout, window.innerWidth, window.innerHeight)
    const link = screen.getByRole('link', { name: copy.map })
    fireEvent.keyDown(window, { key: 'Tab' })
    act(() => link.focus())
    expect(cameraX()).toBeCloseTo(target.x, 5)
    for (let i = 0; i < 20; i++) fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(cameraX()).not.toBeCloseTo(target.x, 0)
    act(() => link.blur())
    fireEvent.keyDown(window, { key: 'Tab' })
    act(() => link.focus())
    expect(cameraX()).toBeCloseTo(target.x, 5)
  })

  it('does not move the camera when a tap focuses a control', () => {
    renderRoom({ reducedMotion: true })
    const x0 = cameraX()
    const link = screen.getByRole('link', { name: copy.confirm })
    fireEvent.pointerDown(link, { pointerId: 1, isPrimary: true, button: 0 })
    act(() => link.focus())
    expect(cameraX()).toBe(x0)
  })
})

describe('the flat room (design §2 fallback)', () => {
  it('reaches the luz stage at the family door, with no canvas', () => {
    renderRoom({ reducedMotion: true })
    expect(screen.getByRole('main')).toHaveAttribute('data-era', 'boceto')
    fireEvent.click(screen.getByRole('button', { name: 'La familia' }))
    expect(screen.getByRole('main')).toHaveAttribute('data-era', 'luz')
    expect(document.querySelector('canvas')).toBeNull()
  })
})

function worldRoom(props: Partial<ComponentProps<typeof WorldRoom>> = {}) {
  return (
    <WorldRoom
      day="sat"
      now={beforeSatCutoff}
      reducedMotion={false}
      catState={emptyCatState}
      onGreet={vi.fn()}
      onChallenge={vi.fn()}
      musicPlaying={false}
      qrUrl={undefined}
      progress={emptyProgress}
      onEvent={vi.fn()}
      theme="dark"
      {...props}
    />
  )
}

function renderWorldRoom(props: Partial<ComponentProps<typeof WorldRoom>> = {}) {
  return render(worldRoom(props))
}

const cover = () => document.querySelector('.book-cover')
const worldSurface = () => document.querySelector('.world-surface') as HTMLElement
const bookReady = () => waitFor(() => expect(cover()).toHaveAttribute('aria-hidden', 'true'))

// Where the flat room's camera rests to centre a page, on the screen as it is now.
function flatTarget(id: LandmarkId) {
  const layout = computeLayout(window.innerWidth, window.innerHeight, landmarksFor(false))
  return cameraTargetFor(layout.positions[id], layout, window.innerWidth, window.innerHeight)
}

// jsdom's window is 1024 × 768. A test may make it shorter, or turn it, like a phone.
const jsdomWidth = window.innerWidth
const jsdomHeight = window.innerHeight
function setScreenHeight(height: number) {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}
function setScreenSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  setScreenHeight(height)
}

describe('the 3D book and its fallback (design §2)', () => {
  beforeEach(() => {
    world.mode = 'fails'
    world.mounts = 0
    backdrop.mode = 'waits'
    backdrop.ready = null
    backdrop.mounts = 0
    vi.mocked(hasWebGL).mockReturnValue(true)
  })
  afterEach(() => setScreenSize(jsdomWidth, jsdomHeight))

  it('shows the cover at once, and ends on the flat room when the world fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderWorldRoom()
    expect(cover()).toHaveTextContent(copy.title)
    expect(screen.getByText(copy.hero)).toBeInTheDocument()
    expect(await screen.findByTestId('room-mid')).toBeInTheDocument()
    expect(cover()).toBeNull()
  })

  it('uses the flat room with reduced motion', () => {
    renderWorldRoom({ reducedMotion: true })
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
    expect(cover()).toBeNull()
  })

  it('uses the flat room, with no canvas, when WebGL cannot start', () => {
    vi.mocked(hasWebGL).mockReturnValue(false)
    renderWorldRoom()
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('opens the cover on the first move, once the book is ready', async () => {
    world.mode = 'ready'
    const onFirstMove = vi.fn()
    renderWorldRoom({ onFirstMove })
    await bookReady()
    expect(cover()).not.toHaveClass('is-opening')
    fireEvent.wheel(worldSurface(), { deltaY: 120 })
    fireEvent.wheel(worldSurface(), { deltaY: 120 })
    expect(onFirstMove).toHaveBeenCalledTimes(1)
    expect(cover()).toHaveClass('is-opening')
  })

  // Performance (design §12): behind the closed, opaque cover the world renders on demand — the
  // frame it needs to get ready, then only when something changes — and it runs continuously from
  // the moment the cover starts to open.
  it('keeps the world waiting behind the closed cover, and runs it once the cover opens', async () => {
    world.mode = 'ready'
    renderWorldRoom()
    await bookReady()
    expect(screen.getByTestId('world')).toHaveAttribute('data-running', 'false')
    fireEvent.wheel(worldSurface(), { deltaY: 120 })
    expect(cover()).toHaveClass('is-opening')
    expect(screen.getByTestId('world')).toHaveAttribute('data-running', 'true')
  })

  it('opens the cover on any key, so the keyboard never tabs into a closed book', async () => {
    world.mode = 'ready'
    const onFirstMove = vi.fn()
    renderWorldRoom({ onFirstMove })
    await bookReady()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(cover()).toHaveClass('is-opening')
    // Tab opens the book for the keyboard, but only a real move counts as the first move.
    expect(onFirstMove).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onFirstMove).toHaveBeenCalledTimes(1)
  })

  it('falls back to the flat room when the world never gets ready (facts are never gated)', async () => {
    world.mode = 'stalls'
    vi.useFakeTimers()
    try {
      renderWorldRoom()
      await act(async () => {
        await vi.dynamicImportSettled()
      })
      expect(screen.getByTestId('world')).toBeInTheDocument()
      expect(screen.queryByTestId('room-mid')).not.toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(tuning.world.loadTimeoutMs + 10)
      })
      expect(screen.getByTestId('room-mid')).toBeInTheDocument()
      expect(cover()).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('hands the theme to the world, and updates it without a reload (design §3)', async () => {
    world.mode = 'ready'
    const view = renderWorldRoom({ theme: 'dark' })
    expect(await screen.findByTestId('world')).toHaveAttribute('data-theme', 'dark')
    view.rerender(
      <WorldRoom
        day="sat"
        now={beforeSatCutoff}
        reducedMotion={false}
        catState={emptyCatState}
        onGreet={vi.fn()}
        onChallenge={vi.fn()}
        musicPlaying={false}
        qrUrl={undefined}
        progress={emptyProgress}
        onEvent={vi.fn()}
        theme="light"
      />,
    )
    expect(screen.getByTestId('world')).toHaveAttribute('data-theme', 'light')
  })

  it("hands the day's mood to the world: Saturday's night, Sunday's dusk (spec §3)", async () => {
    world.mode = 'ready'
    const saturday = renderWorldRoom()
    expect(await screen.findByTestId('world')).toHaveAttribute('data-mood', 'saturday')
    saturday.unmount()
    renderWorldRoom({ day: 'sun', now: beforeSunCutoff })
    expect(await screen.findByTestId('world')).toHaveAttribute('data-mood', 'sunday')
  })

  it('hands the device tier to the world (spec §8)', async () => {
    world.mode = 'ready'
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 })
    try {
      renderWorldRoom()
      expect(await screen.findByTestId('world')).toHaveAttribute('data-tier', 'normal')
    } finally {
      delete (navigator as { hardwareConcurrency?: number }).hardwareConcurrency
    }
  })

  // Review Focus 2: the guest switches theme at level 1. This guards the swap: it passes before and
  // after this task, and must keep passing.
  it('swaps the light and dark looks in place: no remount, and no flash of the cover (Review Focus 2)', async () => {
    world.mode = 'ready'
    const view = renderWorldRoom({ day: 'sun', now: beforeSunCutoff, theme: 'dark' })
    await bookReady()
    const node = screen.getByTestId('world')
    view.rerender(worldRoom({ day: 'sun', now: beforeSunCutoff, theme: 'light' }))
    expect(screen.getByTestId('world')).toBe(node)
    expect(node).toHaveAttribute('data-theme', 'light')
    expect(node).toHaveAttribute('data-mood', 'sunday')
    expect(world.mounts).toBe(1)
    expect(cover()).toHaveAttribute('aria-hidden', 'true')
    expect(cover()).not.toHaveClass('is-opening')
  })

  // Design §9: a page is never drawn below tuning.world.page.minScale, so a screen too short to
  // show one whole gets the flat room from the start.
  it('uses the flat room on a screen too short for a readable page (a phone held sideways)', () => {
    world.mode = 'ready'
    setScreenHeight(390)
    renderWorldRoom()
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
    expect(cover()).toBeNull()
  })

  it('draws the QR in the book large enough to stay at its minimum size on a page at its smallest', async () => {
    world.mode = 'ready'
    renderWorldRoom({ qrUrl: '/qr.png' })
    await bookReady()
    expect(worldSurface().style.getPropertyValue('--qr-px')).toBe(`${bookQrPx}px`)
    expect(screen.getByRole('img', { name: copy.qrAlt }).style.width).toBe(`var(--qr-px, ${tuning.qr.minPx}px)`)
  })

  it("starts Misha's scratch from the 3D doorway, and keeps the card's line and cats without its paper door (spec §6)", async () => {
    world.mode = 'ready'
    renderWorldRoom()
    await bookReady()
    const familia = document.querySelector('[data-landmark-id="familia"]')!
    expect(familia.querySelector('.family-door')).toBeNull()
    expect(familia.querySelector('.door-stage')).toHaveClass('is-in-world')
    expect(familia).toHaveTextContent(copy.doorLine)
    expect(familia.querySelector('.cat-misha')).not.toBeNull()
    expect(familia.querySelector('.cat-kira')).not.toBeNull()
    fireEvent.click(screen.getByTestId('world-door'))
    expect(familia.querySelector('.cat-misha')).toHaveClass('act-scratch')
  })

  it('tells the world once every page is found, so the doorway glows brighter (spec §6)', async () => {
    world.mode = 'ready'
    renderWorldRoom({ progress: { ...emptyProgress, badges: ['cuentoCompleto'] } })
    expect(await screen.findByTestId('world')).toHaveAttribute('data-door-complete', 'true')
  })

  // Facts are never gated, and nothing counts before the guest can see it (design §6): while the
  // book is still loading behind its cover, a signpost or a move records no page and no first move.
  it('records no page and no first move before the book is ready', async () => {
    world.mode = 'stalls'
    const onEvent = vi.fn()
    const onFirstMove = vi.fn()
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
    try {
      renderWorldRoom({ onEvent, onFirstMove })
      fireEvent.click(screen.getByRole('button', { name: copy.signposts.donde }))
      act(() => {
        vi.advanceTimersByTime(tuning.world.glideMs + tuning.pages.settleMs + 50)
      })
      fireEvent.wheel(worldSurface(), { deltaY: 120 })
      act(() => {
        vi.advanceTimersByTime(tuning.pages.snapDelayMs + tuning.world.glideMs + tuning.pages.settleMs + 50)
      })
      expect(screen.queryByTestId('room-mid')).not.toBeInTheDocument()
      expect(onEvent).not.toHaveBeenCalled()
      expect(onFirstMove).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  // The slow-data case: a guest taps a signpost while the book is still loading, and the book
  // never gets ready. The flat room opens on the page they asked for, not on the cover.
  it('opens the flat room on the page the guest was aiming for when the book never gets ready', () => {
    world.mode = 'stalls'
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
    try {
      renderWorldRoom()
      fireEvent.click(screen.getByRole('button', { name: copy.signposts.donde }))
      act(() => {
        vi.advanceTimersByTime(tuning.world.loadTimeoutMs + 10)
      })
      expect(screen.getByTestId('room-mid')).toBeInTheDocument()
      expect(cameraX()).toBeCloseTo(flatTarget('donde').x, 5)
      expect(cameraY()).toBeCloseTo(flatTarget('donde').y, 5)
    } finally {
      vi.useRealTimers()
    }
  })

  describe('moving through the book', () => {
    beforeEach(() => {
      world.mode = 'ready'
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    })
    afterEach(() => vi.useRealTimers())

    const settle = () =>
      act(() => {
        vi.advanceTimersByTime(tuning.world.glideMs + 50)
      })

    it('moves forward with a drag and never past either end', async () => {
      renderWorldRoom()
      await bookReady()
      const main = screen.getByRole('main')
      fireEvent.pointerDown(worldSurface(), { pointerId: 1, isPrimary: true, button: 0, clientX: 800, clientY: 400 })
      fireEvent.pointerMove(worldSurface(), { pointerId: 1, clientX: 800 - window.innerWidth * 1.4, clientY: 400 })
      expect(main).toHaveAttribute('data-era', 'luz')
      fireEvent.pointerMove(worldSurface(), { pointerId: 1, clientX: 800 + window.innerWidth * 9, clientY: 400 })
      expect(main).toHaveAttribute('data-era', 'boceto')
      fireEvent.pointerUp(worldSurface(), { pointerId: 1 })
    })

    it('glides to the family door from its signpost, into the luz stage', async () => {
      renderWorldRoom()
      await bookReady()
      fireEvent.click(screen.getByRole('button', { name: 'La familia' }))
      settle()
      expect(screen.getByRole('main')).toHaveAttribute('data-era', 'luz')
      expect(cover()).toHaveClass('is-opening')
    })

    it('steps from page to page with the arrow keys', async () => {
      renderWorldRoom()
      await bookReady()
      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(window, { key: 'ArrowRight' })
        settle()
      }
      expect(screen.getByRole('main')).toHaveAttribute('data-era', 'tinta')
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      settle()
      expect(screen.getByRole('main')).toHaveAttribute('data-era', 'boceto')
    })

    it('counts the page the camera comes to rest on, and not the pages it glides past (design §6)', async () => {
      const onEvent = vi.fn()
      renderWorldRoom({ onEvent })
      await bookReady()
      // The settle wait is a timeout: fake it too, now that waitFor is done.
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
      fireEvent.click(screen.getByRole('button', { name: 'La familia' }))
      settle()
      act(() => {
        vi.advanceTimersByTime(tuning.pages.settleMs + 10)
      })
      expect(onEvent).toHaveBeenCalledTimes(1)
      expect(onEvent).toHaveBeenCalledWith({
        type: 'reachedPage',
        page: 'familia',
        pages: ['palabra', 'cuando', 'donde', 'confirmar', 'presente', 'familia'],
      })
    })

    // A drag from the right edge that leaves progress at `to` (the book reads on as the finger goes left).
    const dragTo = (to: number) => {
      const from = window.innerWidth - 4
      const x = from - (to / tuning.world.dragProgressPerViewport) * window.innerWidth
      fireEvent.pointerDown(worldSurface(), { pointerId: 1, isPrimary: true, button: 0, clientX: from, clientY: 400 })
      fireEvent.pointerMove(worldSurface(), { pointerId: 1, clientX: x, clientY: 400 })
    }
    const release = () => fireEvent.pointerUp(worldSurface(), { pointerId: 1 })

    it('opens the map as soon as Dónde stands, before it counts as found (the facts are never gated)', async () => {
      const onEvent = vi.fn()
      renderWorldRoom({ onEvent })
      await bookReady()
      // Dónde is at 0.5: inside the pop-up range, outside the reach.
      dragTo(0.5 - (tuning.world.stationEps + tuning.world.popUp.range) / 2)
      expect(document.querySelector('.treasure-map')).toHaveClass('is-unrolled')
      expect(document.querySelector('.gift-box')).not.toHaveClass('is-open')
      expect(onEvent).not.toHaveBeenCalled()
      release()
    })

    it('snaps to the nearest page after a drag, and then counts it', async () => {
      const onEvent = vi.fn()
      renderWorldRoom({ onEvent })
      await bookReady()
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
      // Just past the reach of Dónde (0.5), where it would never count on its own.
      dragTo(0.5 - tuning.world.stationEps * 1.5)
      release()
      settle()
      act(() => {
        vi.advanceTimersByTime(tuning.pages.settleMs + 10)
      })
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'reachedPage', page: 'donde' }))
    })

    it('snaps to the nearest page once the wheel goes idle', async () => {
      const onEvent = vi.fn()
      renderWorldRoom({ onEvent })
      await bookReady()
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
      // Scrolling down reads on: this wheel leaves progress just short of Palabra (1/6).
      const deltaY = ((1 / 6 - tuning.world.stationEps * 1.5) / tuning.world.dragProgressPerViewport) * window.innerWidth
      fireEvent.wheel(worldSurface(), { deltaY })
      act(() => {
        vi.advanceTimersByTime(tuning.pages.snapDelayMs + 10)
      })
      settle()
      act(() => {
        vi.advanceTimersByTime(tuning.pages.settleMs + 10)
      })
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'reachedPage', page: 'palabra' }))
    })

    // Mobile browsers drop WebGL contexts, most often on the way back from WhatsApp after
    // Confirmar: the flat room takes over on the page the guest was on.
    it('hands over to the flat room on the current page when the WebGL context is lost', async () => {
      renderWorldRoom()
      await bookReady()
      fireEvent.click(screen.getByRole('button', { name: copy.signposts.confirmar }))
      settle()
      const canvas = worldSurface().querySelector('canvas')!
      act(() => {
        canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
      })
      expect(screen.getByTestId('room-mid')).toBeInTheDocument()
      expect(cameraX()).toBeCloseTo(flatTarget('confirmar').x, 5)
      // Spec §7: a lost context is level 3 for the rest of the visit: no live attic.
      await act(async () => {
        await vi.dynamicImportSettled()
      })
      expect(screen.queryByTestId('backdrop')).toBeNull()
      expect(screen.getByRole('main')).toHaveAttribute('data-level', 'diorama')
    })

    it('stops listening for a lost context once the book is gone', async () => {
      const view = renderWorldRoom()
      await bookReady()
      const surface = worldSurface()
      const remove = vi.spyOn(surface, 'removeEventListener')
      view.unmount()
      expect(remove).toHaveBeenCalledWith('webglcontextlost', expect.any(Function), true)
    })

    // Design §9: turning a phone sideways leaves too little height for a readable page, so the
    // book hands over to the flat room, on the same page, for the rest of the visit.
    it('hands over to the flat room on the current page when the screen turns too short', async () => {
      renderWorldRoom()
      await bookReady()
      fireEvent.click(screen.getByRole('button', { name: copy.signposts.donde }))
      settle()
      setScreenHeight(390)
      act(() => {
        window.dispatchEvent(new Event('resize'))
      })
      expect(screen.getByTestId('room-mid')).toBeInTheDocument()
      expect(cameraX()).toBeCloseTo(flatTarget('donde').x, 5)
      // Spec §7: then the live attic comes in behind the cards.
      expect(await screen.findByTestId('backdrop')).toBeInTheDocument()
    })

    it('glides to the page that keyboard focus enters (FR-11)', async () => {
      renderWorldRoom()
      await bookReady()
      fireEvent.keyDown(window, { key: 'Tab' })
      act(() => screen.getByRole('link', { name: copy.confirm }).focus())
      settle()
      expect(screen.getByRole('main')).toHaveAttribute('data-era', 'luz')
    })
  })
})

describe('three levels (spec §7)', () => {
  beforeEach(() => {
    world.mode = 'stalls'
    world.mounts = 0
    backdrop.mode = 'waits'
    backdrop.ready = null
    backdrop.mounts = 0
    vi.mocked(hasWebGL).mockReturnValue(true)
  })
  afterEach(() => setScreenSize(jsdomWidth, jsdomHeight))

  const level = () => screen.getByRole('main').getAttribute('data-level')
  const backdropBox = () => document.querySelector<HTMLElement>('.room-backdrop')
  const settleImports = () =>
    act(async () => {
      await vi.dynamicImportSettled()
    })

  it('opens the flat room over the diorama at the timeout, then fades the live attic in without moving the cards, the focus, or the pan (Review Focus 1)', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
    try {
      renderWorldRoom()
      fireEvent.click(screen.getByRole('button', { name: copy.signposts.donde }))
      act(() => {
        vi.advanceTimersByTime(tuning.world.loadTimeoutMs + 10)
      })
      expect(screen.getByTestId('room-mid')).toBeInTheDocument()
      expect(level()).toBe('diorama')
      expect(document.querySelector('.paper-diorama')).not.toHaveClass('is-resting')
      drag(surface(), [300, 400], [240, 400])
      act(() => {
        vi.advanceTimersByTime(tuning.camera.glideMs + 50)
      })
      const link = screen.getByRole('link', { name: copy.map })
      act(() => link.focus())
      const card = document.querySelector<HTMLElement>('.landmark-donde')!
      const before = { camera: mid().style.transform, left: card.style.left, top: card.style.top }
      await settleImports()
      expect(screen.getByTestId('backdrop')).toBeInTheDocument()
      expect(backdropBox()).not.toHaveClass('is-ready')
      act(() => backdrop.ready!())
      expect(backdropBox()).toHaveClass('is-ready')
      expect(backdropBox()!.style.getPropertyValue('--backdrop-fade')).toBe(`${tuning.world.backdropFadeMs}ms`)
      expect(level()).toBe('backdrop')
      expect(document.querySelector('.paper-diorama')).toHaveClass('is-resting')
      expect(mid().style.transform).toBe(before.camera)
      expect(card.style.left).toBe(before.left)
      expect(card.style.top).toBe(before.top)
      expect(document.activeElement).toBe(link)
    } finally {
      vi.useRealTimers()
    }
  })

  it('gives a short screen the live attic behind the cards directly (spec §7)', async () => {
    setScreenSize(844, 390)
    renderWorldRoom()
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
    expect(document.querySelector('.book-cover')).toBeNull()
    expect(level()).toBe('diorama')
    expect(await screen.findByTestId('backdrop')).toHaveAttribute('data-mood', 'saturday')
    act(() => backdrop.ready!())
    expect(level()).toBe('backdrop')
  })

  it('drops to the diorama on the same page when the live attic loses its WebGL context, with no retry (spec §7)', async () => {
    setScreenSize(844, 390)
    backdrop.mode = 'ready'
    renderWorldRoom()
    await screen.findByTestId('backdrop')
    expect(level()).toBe('backdrop')
    const camera = mid().style.transform
    act(() => {
      screen.getByTestId('backdrop').querySelector('canvas')!.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    })
    expect(screen.queryByTestId('backdrop')).toBeNull()
    expect(level()).toBe('diorama')
    expect(mid().style.transform).toBe(camera)
    expect(document.querySelector('.paper-diorama')).not.toHaveClass('is-resting')
    await settleImports()
    expect(screen.queryByTestId('backdrop')).toBeNull()
  })

  it('drops to the diorama when the live attic cannot start (spec §7)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setScreenSize(844, 390)
    backdrop.mode = 'fails'
    renderWorldRoom()
    await settleImports()
    await waitFor(() => expect(backdropBox()).toBeNull())
    expect(level()).toBe('diorama')
    expect(screen.getByTestId('room-mid')).toBeInTheDocument()
  })

  it('keeps reduced motion on the still diorama: no live attic and no canvas (spec §7)', async () => {
    renderWorldRoom({ reducedMotion: true })
    await settleImports()
    expect(document.querySelector('.paper-diorama')).toHaveClass('is-still')
    expect(screen.queryByTestId('backdrop')).toBeNull()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('swaps the live attic and the diorama to the other look in place (Review Focus 2)', async () => {
    setScreenSize(844, 390)
    backdrop.mode = 'ready'
    const view = renderWorldRoom({ theme: 'dark' })
    const attic = await screen.findByTestId('backdrop')
    const diorama = document.querySelector('.paper-diorama')
    view.rerender(worldRoom({ theme: 'light' }))
    expect(screen.getByTestId('backdrop')).toBe(attic)
    expect(attic).toHaveAttribute('data-theme', 'light')
    expect(backdrop.mounts).toBe(1)
    expect(document.querySelector('.paper-diorama')).toBe(diorama)
    expect(diorama).toHaveAttribute('data-mood', 'saturday')
    // The diorama recolors through the head's variables: each theme has its own block for the mood.
    const { dark, light } = tuning.world.looks.saturday
    expect(dioramaCss()).toContain(`:root[data-theme="dark"] [data-mood="saturday"]{--diorama-sky-top:${cssColor(dark.skyTop)}`)
    expect(dioramaCss()).toContain(`:root[data-theme="light"] [data-mood="saturday"]{--diorama-sky-top:${cssColor(light.skyTop)}`)
  })

  it('re-frames the live attic when the phone turns, and leaves the card scale and the pan to the flat room (Review Focus 3)', async () => {
    setScreenSize(844, 390)
    backdrop.mode = 'ready'
    renderWorldRoom()
    const attic = await screen.findByTestId('backdrop')
    const before = computeLayout(844, 390, landmarksFor(false))
    const start = cameraTargetFor(before.positions.llegada, before, 844, 390)
    setScreenSize(390, 844)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByTestId('backdrop')).toBe(attic)
    expect(backdrop.mounts).toBe(1)
    expect(level()).toBe('backdrop')
    const after = computeLayout(390, 844, landmarksFor(false))
    const camera = clampCamera(start, after, 390, 844, tuning.camera.edgeMarginPx)
    expect(mid().style.transform).toBe(`translate3d(${-camera.x}px, ${-camera.y}px, 0)`)
    expect(document.querySelector<HTMLElement>('.landmark-scale')!.style.zoom).toBe(String(after.scale))
  })
})

describe('pausing (spec §8, Review Focus 4)', () => {
  beforeEach(() => {
    world.mounts = 0
    backdrop.mode = 'ready'
    backdrop.ready = null
    backdrop.mounts = 0
    vi.mocked(hasWebGL).mockReturnValue(true)
  })
  afterEach(() => {
    setScreenSize(jsdomWidth, jsdomHeight)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  })

  const hide = (hidden: boolean) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
  }

  it('stops the book while a full-screen dialog is open or the tab is hidden, and resumes after', async () => {
    world.mode = 'ready'
    const view = renderWorldRoom()
    await bookReady()
    const book = () => screen.getByTestId('world')
    expect(book()).toHaveAttribute('data-paused', 'false')
    view.rerender(worldRoom({ dialogOpen: true }))
    expect(book()).toHaveAttribute('data-paused', 'true')
    view.rerender(worldRoom({ dialogOpen: false }))
    expect(book()).toHaveAttribute('data-paused', 'false')
    hide(true)
    expect(book()).toHaveAttribute('data-paused', 'true')
    hide(false)
    expect(book()).toHaveAttribute('data-paused', 'false')
    expect(world.mounts).toBe(1)
  })

  it('stops the live attic the same way at level 2', async () => {
    world.mode = 'stalls'
    setScreenSize(844, 390)
    const view = renderWorldRoom()
    const attic = await screen.findByTestId('backdrop')
    expect(attic).toHaveAttribute('data-paused', 'false')
    view.rerender(worldRoom({ dialogOpen: true }))
    expect(attic).toHaveAttribute('data-paused', 'true')
    view.rerender(worldRoom({ dialogOpen: false }))
    hide(true)
    expect(attic).toHaveAttribute('data-paused', 'true')
    hide(false)
    expect(attic).toHaveAttribute('data-paused', 'false')
    expect(backdrop.mounts).toBe(1)
  })
})
