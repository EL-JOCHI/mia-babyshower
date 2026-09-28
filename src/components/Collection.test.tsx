import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { copy } from '../content'
import { emptyCatState } from '../logic/catState'
import { Collection } from './Collection'

describe('Tus gatos: closing', () => {
  it('closes from an ink × named Cerrar for screen readers, a touch target like the other icons', () => {
    const onClose = vi.fn()
    render(<Collection state={emptyCatState} allowPlayAgain={false} onPlayAgain={vi.fn()} onClose={onClose} />)
    const close = screen.getByRole('button', { name: copy.close })
    expect(close).toHaveClass('hud-icon-button', 'collection-close')
    expect(close.querySelector('svg.close-icon')).toHaveAttribute('aria-hidden', 'true')
    // The word is there for screen readers only.
    expect(screen.getByText(copy.close)).toHaveClass('sr-only')
    // It still takes focus when the dialog opens, and still closes it.
    expect(close).toHaveFocus()
    close.click()
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
