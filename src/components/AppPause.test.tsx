import { fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { copy } from '../content'
import { App } from './App'

// The room stands in as a recorder of what App tells it, after each render.
const seen = vi.hoisted(() => ({ dialogOpen: [] as (boolean | undefined)[] }))
vi.mock('./WorldRoom', () => ({
  WorldRoom: function WorldRoom({ dialogOpen }: { dialogOpen?: boolean }) {
    useEffect(() => {
      seen.dialogOpen.push(dialogOpen)
    })
    return null
  },
}))

describe('the 3D pauses under a full-screen dialog (spec §8, Review Focus 4)', () => {
  it('tells the room while Tus gatos is open, and again once it closes', () => {
    render(<App search="?e=n4vk" />)
    expect(seen.dialogOpen.at(-1)).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: copy.collection }))
    expect(seen.dialogOpen.at(-1)).toBe(true)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(seen.dialogOpen.at(-1)).toBe(false)
  })
})
