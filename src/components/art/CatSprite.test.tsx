import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { catIds } from '../../content'
import { feelingColors } from '../../tuning'
import { CatSprite } from './CatSprite'
import { InkDefs } from './InkDefs'

const sprite = (container: HTMLElement) => container.querySelector('svg.cat-sprite')!

describe('CatSprite (design §4)', () => {
  it.each(catIds)('draws %s with the named rig groups', (id) => {
    const { container } = render(<CatSprite id={id} stage="luz" size={64} />)
    const svg = sprite(container)
    for (const part of ['.cat-body', '.cat-head', '.cat-ear-l', '.cat-ear-r', '.cat-tail']) {
      expect(svg.querySelectorAll(part)).toHaveLength(1)
    }
    // One blinking lid per eye, and the collar charm.
    expect(svg.querySelectorAll('.cat-lid')).toHaveLength(2)
    expect(svg.querySelector('.cat-charm')).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('width', '64')
  })

  it('wears its feeling color and marks the stage', () => {
    const { container } = render(<CatSprite id="kira" stage="tinta" size={64} />)
    const svg = sprite(container) as SVGElement
    expect(svg).toHaveClass('stage-tinta')
    expect(svg.style.getPropertyValue('--feel')).toBe(feelingColors.kira)
  })

  it('boils its ink only when asked', () => {
    const still = render(<CatSprite id="luz" stage="luz" size={64} />)
    expect(still.container.querySelector('[filter="url(#ink-boil)"]')).toBeNull()
    const boiling = render(<CatSprite id="luz" stage="luz" size={64} boil />)
    expect(boiling.container.querySelector('[filter="url(#ink-boil)"]')).not.toBeNull()
  })

  it('shows a small heart only when the cat stays', () => {
    expect(render(<CatSprite id="mimo" stage="luz" size={64} />).container.querySelector('.cat-heart')).toBeNull()
    const staying = render(<CatSprite id="mimo" stage="luz" pose="staying" size={64} />)
    expect(staying.container.querySelector('.cat-heart')).not.toBeNull()
  })

  it('draws a cat not yet met as a bare silhouette, with no face and no filters', () => {
    const { container } = render(<CatSprite id="bram" stage="luz" size={56} silhouette boil />)
    const svg = sprite(container)
    expect(svg).toHaveClass('is-silhouette')
    expect(svg.querySelector('.cat-eye, .cat-charm, [filter]')).toBeNull()
  })
})

describe('InkDefs (design §4 Line boil)', () => {
  it('steps the boil seed with SMIL, and holds it still with reduced motion', () => {
    const moving = render(<InkDefs still={false} />)
    const animate = moving.container.querySelector('#ink-boil feTurbulence animate')
    expect(animate).toHaveAttribute('attributeName', 'seed')
    expect(animate).toHaveAttribute('calcMode', 'discrete')
    moving.unmount()
    const still = render(<InkDefs still />)
    expect(still.container.querySelector('#ink-boil')).not.toBeNull()
    expect(still.container.querySelector('#ink-boil animate')).toBeNull()
    expect(still.container.querySelector('#paper-edge')).not.toBeNull()
  })
})
