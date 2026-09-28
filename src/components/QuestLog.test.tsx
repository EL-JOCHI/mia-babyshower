import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cats, gameCopy } from '../content'
import { QuestLog } from './QuestLog'

const fill = () => (document.querySelector('.quest-log') as HTMLElement).style.getPropertyValue('--fill')

describe('QuestLog (design §6)', () => {
  it('shows the pages, the cats, the level with its title, and the XP', () => {
    render(<QuestLog pages={2} total={6} cats={3} xp={70} />)
    expect(screen.getByText(gameCopy.pages(2, 6))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.cats(3, cats.length))).toBeInTheDocument()
    // Spec §3: the total is the cats list, ten cats.
    expect(screen.getByText('Gatos 3/10')).toBeInTheDocument()
    expect(screen.getByText(gameCopy.level(2))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.levelTitles[1])).toBeInTheDocument()
    expect(screen.getByText(gameCopy.xp(70))).toBeInTheDocument()
  })

  it('fills the XP bar from the level floor toward the next level', () => {
    render(<QuestLog pages={0} total={6} cats={0} xp={120} />)
    expect(fill()).toBe('0.5')
    const bar = screen.getByRole('meter', { name: `${gameCopy.level(2)}, ${gameCopy.levelTitles[1]}` })
    expect(bar).toHaveAttribute('aria-valuemin', '60')
    expect(bar).toHaveAttribute('aria-valuemax', '180')
    expect(bar).toHaveAttribute('aria-valuenow', '120')
    expect(bar).toHaveAttribute('aria-valuetext', gameCopy.xp(120))
  })

  it('starts empty at level 1 and stays full at the top level', () => {
    const view = render(<QuestLog pages={0} total={6} cats={0} xp={0} />)
    expect(fill()).toBe('0')
    expect(screen.getByText(gameCopy.levelTitles[0])).toBeInTheDocument()
    view.rerender(<QuestLog pages={6} total={6} cats={7} xp={900} />)
    expect(fill()).toBe('1')
    expect(screen.getByText(gameCopy.level(5))).toBeInTheDocument()
    expect(screen.getByText(gameCopy.levelTitles[4])).toBeInTheDocument()
  })

  it('counts three pages after the party', () => {
    render(<QuestLog pages={1} total={3} cats={0} xp={0} />)
    expect(screen.getByText(gameCopy.pages(1, 3))).toBeInTheDocument()
  })
})
