import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { gameCopy } from '../content'
import { PageCard } from './PageCard'

const card = () => document.querySelector('.page-card')!

describe('PageCard (design §5)', () => {
  it('lays the page on torn parchment, with no stamp until the page is found', () => {
    render(
      <PageCard id="cuando" found={false}>
        <p>sábado</p>
      </PageCard>,
    )
    expect(screen.getByText('sábado')).toBeInTheDocument()
    expect(card().querySelector('.page-paper')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText(gameCopy.pageFound)).not.toBeInTheDocument()
  })

  it('presses the stamp the first time the page is found', () => {
    const view = render(
      <PageCard id="cuando" found={false}>
        <p>sábado</p>
      </PageCard>,
    )
    view.rerender(
      <PageCard id="cuando" found>
        <p>sábado</p>
      </PageCard>,
    )
    expect(screen.getByText(gameCopy.pageFound)).toBeInTheDocument()
    expect(card()).toHaveClass('is-found', 'is-fresh')
  })

  it('keeps the stamp of a page found on an earlier visit, without pressing it again', () => {
    render(
      <PageCard id="cuando" found>
        <p>sábado</p>
      </PageCard>,
    )
    expect(screen.getByText(gameCopy.pageFound)).toBeInTheDocument()
    expect(card()).toHaveClass('is-found')
    expect(card()).not.toHaveClass('is-fresh')
  })

  it('makes Llegada the book cover', () => {
    render(
      <PageCard id="llegada" found={false}>
        <h1>Mia</h1>
      </PageCard>,
    )
    expect(card()).toHaveClass('is-cover')
  })
})
