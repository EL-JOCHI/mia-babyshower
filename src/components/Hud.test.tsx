import { render, screen, within } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cats, copy } from '../content'
import indexCss from '../index.css?raw'
import { Hud } from './Hud'

function renderHud(catsMet = 3) {
  return render(
    <Hud
      theme="dark"
      onTheme={vi.fn()}
      music={{ available: true, playing: false, toggle: vi.fn() }}
      onOpenCollection={vi.fn()}
      collectionOpen={false}
      collectionButtonRef={createRef()}
      catsMet={catsMet}
      quest={null}
    />,
  )
}

// The declarations of the CSS rule whose selector list is exactly `selector`.
function ruleFor(css: string, selector: string): string {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  return rules.find(([, selectors]) => selectors!.trim() === selector)?.[2] ?? ''
}

describe('the controls (spec §4)', () => {
  it('shows a moon for Oscuro and a sun for Claro, named for screen readers, with the active one pressed', () => {
    renderHud()
    const theme = within(screen.getByRole('group', { name: copy.a11y.theme }))
    const dark = theme.getByRole('button', { name: copy.themeDark })
    const light = theme.getByRole('button', { name: copy.themeLight })
    expect(dark).toHaveAttribute('aria-pressed', 'true')
    expect(light).toHaveAttribute('aria-pressed', 'false')
    for (const button of [dark, light]) {
      expect(button.querySelector('svg.theme-icon')).toHaveAttribute('aria-hidden', 'true')
      // The word is there for screen readers only.
      expect(button.querySelector('.sr-only')).not.toBeNull()
    }
  })

  it('makes every icon button a touch target of at least 44 px', () => {
    renderHud()
    expect(ruleFor(indexCss, '.hud-icon-button')).toMatch(/min-width:\s*calc\(44 \* var\(--ui-px\)\)/)
    expect(ruleFor(indexCss, '.hud-icon-button')).toMatch(/min-height:\s*calc\(44 \* var\(--ui-px\)\)/)
    for (const name of [copy.themeDark, copy.themeLight, copy.collection]) {
      expect(screen.getByRole('button', { name })).toHaveClass('hud-icon-button')
    }
  })

  it('shows Tus gatos as a cat head with the cats met out of all of them, and announces the count with its name', () => {
    renderHud(3)
    // Read as words, `3 de 10`: Spanish speech may read `3/10` as a date or a fraction.
    const button = screen.getByRole('button', { name: copy.collection, description: copy.roundCount(3, cats.length) })
    expect(button).toHaveAccessibleDescription('3 de 10')
    expect(button).toHaveAccessibleName('Tus gatos')
    expect(button.querySelector('svg.hud-cat')).toHaveAttribute('aria-hidden', 'true')
    // The badge still shows 3/10, for the eye only.
    const badge = within(button).getByText('3/10')
    expect(badge).toHaveClass('hud-badge')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
    // The words are visually hidden.
    expect(within(button).getByText('3 de 10')).toHaveClass('sr-only')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
  })
})
