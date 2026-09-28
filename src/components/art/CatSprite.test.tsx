import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CatId } from '../../content'
import { contrastRatio } from '../../logic/contrast'
import { cssColor, feelingColors, themes, tokens, tuning } from '../../tuning'
import indexCss from '../../index.css?raw'
import { CatSprite } from './CatSprite'
import { catDrawings } from './cats'
import { InkDefs } from './InkDefs'

const sprite = (container: HTMLElement) => container.querySelector('svg.cat-sprite')! as SVGElement
const drawn = Object.keys(catDrawings) as CatId[]

// The declarations of the CSS rule whose selector list contains `selector`.
function ruleFor(css: string, selector: string): string {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const rule = rules.find(([, selectors]) => selectors!.split(',').some((s) => s.trim() === selector))
  return rule?.[2] ?? ''
}

describe('the ten cats (spec §3)', () => {
  it('draws every one of the ten cats', () => {
    expect([...drawn].sort()).toEqual(['bram', 'chona', 'chori', 'kira', 'luz', 'mimo', 'minina', 'misha', 'nana', 'susto'])
  })

  it('dresses each family in its coat: the Misha family, the Kira family, black, and pure white', () => {
    const coats = Object.fromEntries(drawn.map((id) => [id, catDrawings[id].coat.kind]))
    expect(coats).toEqual({
      luz: 'misha',
      mimo: 'misha',
      chona: 'misha',
      chori: 'misha',
      misha: 'misha',
      bram: 'kira',
      kira: 'kira',
      nana: 'black',
      susto: 'black',
      minina: 'white',
    })
  })

  it('draws Misha white with silver-gray patches, a gray cap over the ears, and green eyes', () => {
    const svg = sprite(render(<CatSprite id="misha" stage="luz" size={68} />).container)
    expect(svg).toHaveClass('coat-misha')
    expect(svg.style.getPropertyValue('--coat')).toBe(cssColor(tuning.cats.coats.misha.coat))
    expect(svg.style.getPropertyValue('--coat-mark')).toBe(cssColor(tuning.cats.coats.misha.mark))
    expect(svg.style.getPropertyValue('--eye')).toBe(tuning.cats.eyes.misha)
    expect(svg.querySelectorAll('.cat-body .cat-mark-patch').length).toBeGreaterThanOrEqual(2)
    expect(svg.querySelectorAll('.cat-head .cat-mark-patch')).toHaveLength(1)
    expect(svg.querySelectorAll('.cat-ear-mark')).toHaveLength(2)
    expect(svg.querySelectorAll('.cat-tube-mark').length).toBeGreaterThan(0)
  })

  it.each(['kira', 'bram'] as const)('draws %s as a brown-gray tabby with stripes, a white chest, white paws, and amber-green eyes', (id) => {
    const svg = sprite(render(<CatSprite id={id} stage="luz" size={64} />).container)
    expect(svg).toHaveClass('coat-kira')
    expect(svg.style.getPropertyValue('--eye')).toBe(tuning.cats.eyes[id])
    expect(svg.querySelectorAll('.cat-body .cat-mark-stripe').length).toBeGreaterThan(0)
    expect(svg.querySelectorAll('.cat-head .cat-mark-stripe').length).toBeGreaterThan(0)
    expect(svg.querySelector('.cat-body .cat-mark-white')).not.toBeNull()
    expect(svg.querySelectorAll('.cat-paw-white')).toHaveLength(catDrawings[id].legs.length)
  })

  it('draws Minina pure white, with no patches, apart from the Misha family', () => {
    const svg = sprite(render(<CatSprite id="minina" stage="luz" size={64} />).container)
    expect(svg).toHaveClass('coat-white')
    expect(svg.querySelector('.cat-mark, .cat-ear-mark, .cat-tube-mark')).toBeNull()
  })

  it.each(['nana', 'susto'] as const)('keeps %s black, in the theme\'s cat body', (id) => {
    const svg = sprite(render(<CatSprite id={id} stage="luz" size={64} />).container)
    expect(svg).toHaveClass('coat-black')
    expect(svg.style.getPropertyValue('--coat')).toBe('var(--cat-body)')
  })

  it('gives Mishona her bow and her lashes, and no one else lashes', () => {
    for (const id of drawn) {
      const svg = sprite(render(<CatSprite id={id} stage="luz" size={64} />).container)
      expect(svg.querySelector('.cat-lash') !== null, id).toBe(id === 'luz')
    }
    const luz = sprite(render(<CatSprite id="luz" stage="luz" size={64} />).container)
    expect(luz.querySelectorAll('.cat-head .cat-paint-rose')).toHaveLength(2)
  })

  // Review Focus 3: a white coat on the bone card, in the light theme.
  it('keeps a white coat readable on the bone card: an ink outline over the coat, and a soft shade under it', () => {
    const svg = sprite(render(<CatSprite id="minina" stage="luz" size={tuning.catSize.card} />).container)
    for (const part of ['.cat-body', '.cat-head']) {
      const group = svg.querySelector(part)!
      expect(group.querySelector('.cat-coat-shade')).not.toBeNull()
      expect(group.querySelector('.cat-coat')).toHaveAttribute('transform', `translate(${-tuning.cats.shade.dx} ${-tuning.cats.shade.dy})`)
      expect(group.querySelector('.cat-outline')).toHaveAttribute('stroke-width', String(tuning.cats.line))
    }
    expect(tuning.cats.coats.white.shade).not.toEqual(tuning.cats.coats.white.coat)
    // The outline is ink (--cat-line is --shadow), and ink reads on both themes' paper.
    expect(ruleFor(indexCss, '.cat-outline')).toMatch(/stroke:\s*var\(--cat-line\)/)
    expect(ruleFor(indexCss, '.cat-sprite')).toMatch(/--cat-line:\s*var\(--shadow\)/)
    for (const name of ['dark', 'light'] as const) {
      expect(contrastRatio(tokens.shadow, themes[name].page)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(tokens.shadow, tokens.bone)).toBeGreaterThanOrEqual(4.5)
    }
    // The light coats' tube edges, paw pads, and whiskers are ink too, never the bone meant for a black coat.
    for (const kind of ['misha', 'kira', 'white']) {
      expect(ruleFor(indexCss, `.cat-sprite.coat-${kind}:not(.stage-boceto)`)).toMatch(/--cat-edge:\s*var\(--shadow\)/)
    }
  })
})

describe('CatSprite (design §4)', () => {
  it.each(drawn)('draws %s with the named rig groups', (id) => {
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
