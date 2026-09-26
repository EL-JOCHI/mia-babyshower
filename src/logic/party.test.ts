import { describe, expect, it } from 'vitest'
import { isPartyOver } from './party'

const at = (iso: string) => Date.parse(iso)

describe('isPartyOver (US-5, BR-11)', () => {
  it('keeps Saturday current through 23:59:59 and over from midnight', () => {
    expect(isPartyOver('sat', at('2026-10-17T23:59:00-04:00'))).toBe(false)
    expect(isPartyOver('sat', at('2026-10-17T23:59:59-04:00'))).toBe(false)
    expect(isPartyOver('sat', at('2026-10-18T00:00:00-04:00'))).toBe(true)
  })

  it('keeps Sunday current until its own midnight', () => {
    expect(isPartyOver('sun', at('2026-10-18T00:00:00-04:00'))).toBe(false)
    expect(isPartyOver('sun', at('2026-10-18T23:59:59-04:00'))).toBe(false)
    expect(isPartyOver('sun', at('2026-10-19T00:00:00-04:00'))).toBe(true)
  })

  it('stays over years later', () => {
    expect(isPartyOver('sat', at('2031-01-01T12:00:00-04:00'))).toBe(true)
  })
})
