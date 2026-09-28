import { describe, expect, it } from 'vitest'
import { ambienceUrl } from './assets'

// Spec §4 Music: the host's track is where the app looks, so the music control appears.
describe('host files (§11)', () => {
  it('finds the ambience track', () => {
    expect(ambienceUrl).toMatch(/ambience.*\.mp3$/)
  })
})
