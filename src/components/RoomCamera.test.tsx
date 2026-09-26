import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement, useEffect, type ComponentProps, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copy } from '../content'
import { cameraTargetFor } from '../logic/camera'
import { emptyCatState } from '../logic/catState'
import { computeLayout, landmarksFor, type LandmarkId } from '../logic/layout'
import { hasWebGL } from '../logic/webgl'
import { tuning } from '../tuning'
import { beforeSatCutoff, renderRoom } from '../test/helpers'
import { WorldRoom } from './WorldRoom'

// jsdom has no WebGL. The world stands in as its pages in plain DOM: it gets ready, fails on
// purpose, or stalls and never draws a first frame.
const world = vi.hoisted(() => ({ mode: 'fails' as 'fails' | 'ready' | 'stalls' }))
vi.mock('../world/World', () => ({
  default: function World({
    ids,
    content,
    theme,
    onReady,
  }: {
    ids: LandmarkId[]
    content: Record<LandmarkId, ReactNode>
    theme: string
    onReady: () => void
  }) {
    if (world.mode === 'fails') throw new Error('The world could not start')
    useEffect(() => {
      if (world.mode === 'ready') onReady()
    }, [onReady])
    return createElement(
      'div',
      { 'data-testid': 'world', 'data-theme': theme },
      ids.map((id) => createElement('section', { key: id, 'data-landmark-id': id }, content[id])),
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

function renderWorldRoom(props: Partial<ComponentProps<typeof WorldRoom>> = {}) {
  return render(
    <WorldRoom
      day="sat"
      now={beforeSatCutoff}
      reducedMotion={false}
      catState={emptyCatState}
      onGreet={vi.fn()}
      musicPlaying={false}
      qrUrl={undefined}
      theme="dark"
      {...props}
    />,
  )
}

const cover = () => document.querySelector('.book-cover')
const worldSurface = () => document.querySelector('.world-surface') as HTMLElement
const bookReady = () => waitFor(() => expect(cover()).toHaveAttribute('aria-hidden', 'true'))

describe('the 3D book and its fallback (design §2)', () => {
  beforeEach(() => {
    world.mode = 'fails'
    vi.mocked(hasWebGL).mockReturnValue(true)
  })

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

  it('opens the cover on any key, so the keyboard never tabs into a closed book', async () => {
    world.mode = 'ready'
    renderWorldRoom()
    await bookReady()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(cover()).toHaveClass('is-opening')
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
        musicPlaying={false}
        qrUrl={undefined}
        theme="light"
      />,
    )
    expect(screen.getByTestId('world')).toHaveAttribute('data-theme', 'light')
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
