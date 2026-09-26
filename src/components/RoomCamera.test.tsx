import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { copy } from '../content'
import { cameraTargetFor } from '../logic/camera'
import { computeLayout, landmarksFor } from '../logic/layout'
import { tuning } from '../tuning'
import { renderRoom } from '../test/helpers'

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

describe('the 3D part of the room without a canvas (§4)', () => {
  it('keeps the color look with reduced motion', () => {
    renderRoom({ reducedMotion: true })
    fireEvent.click(screen.getByRole('button', { name: 'La familia' }))
    expect(screen.getByRole('main')).toHaveAttribute('data-era', 'color')
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('keeps the color look and mounts nothing when WebGL cannot start', async () => {
    vi.resetModules()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    try {
      const { renderRoom: freshRoom } = await import('../test/helpers')
      freshRoom()
      fireEvent.click(screen.getByRole('button', { name: 'La familia' }))
      act(() => {
        vi.advanceTimersByTime(tuning.camera.glideMs + 50)
      })
      expect(screen.getByRole('main')).toHaveAttribute('data-era', 'color')
      expect(document.querySelector('canvas')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
