import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PaperDiorama } from './PaperDiorama'

const diorama = () => document.querySelector('.paper-diorama')!
const offset = (name: string) => {
  const layer = document.querySelector<HTMLElement>(`.diorama-${name}`)!
  return Number(/translate3d\((-?[\d.]+)px/.exec(layer.style.transform)?.[1] ?? 0)
}

describe('the paper diorama (spec §7 Level 3)', () => {
  it("draws Saturday's attic, with stars in the window and a star garland, hidden from screen readers", () => {
    render(<PaperDiorama mood="saturday" pan={0.5} still={false} resting={false} />)
    expect(diorama()).toHaveClass('mood-saturday')
    expect(diorama()).toHaveAttribute('data-mood', 'saturday')
    expect(diorama()).toHaveAttribute('aria-hidden', 'true')
    expect(diorama().querySelectorAll('.diorama-star').length).toBeGreaterThan(0)
    expect(diorama().querySelectorAll('.diorama-garland-star').length).toBeGreaterThan(0)
    expect(diorama().querySelectorAll('.diorama-lantern')).toHaveLength(0)
    expect(diorama().querySelector('canvas')).toBeNull()
  })

  it("hangs Sunday's lanterns instead, with no stars", () => {
    render(<PaperDiorama mood="sunday" pan={0.5} still={false} resting={false} />)
    expect(diorama()).toHaveClass('mood-sunday')
    expect(diorama().querySelectorAll('.diorama-lantern').length).toBeGreaterThan(0)
    expect(diorama().querySelectorAll('.diorama-star')).toHaveLength(0)
  })

  it('slides its layers with the flat camera, the nearer ones farther', () => {
    const view = render(<PaperDiorama mood="sunday" pan={0} still={false} resting={false} />)
    const wall = offset('wall')
    const floor = offset('floor')
    view.rerender(<PaperDiorama mood="sunday" pan={1} still={false} resting={false} />)
    expect(offset('wall')).not.toBe(wall)
    expect(Math.abs(offset('floor') - floor)).toBeGreaterThan(Math.abs(offset('wall') - wall))
  })

  it('holds still with reduced motion: no depth motion and no animation', () => {
    render(<PaperDiorama mood="saturday" pan={0.8} still resting={false} />)
    expect(diorama()).toHaveClass('is-still')
    for (const layer of document.querySelectorAll<HTMLElement>('.diorama-layer')) expect(layer.style.transform).toBe('')
  })

  it('stops animating once the live attic is over it', () => {
    render(<PaperDiorama mood="saturday" pan={0.5} still={false} resting />)
    expect(diorama()).toHaveClass('is-resting')
  })
})
