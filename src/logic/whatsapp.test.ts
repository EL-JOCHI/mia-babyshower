import { describe, expect, it } from 'vitest'
import { days, shared } from '../content'
import { whatsappUrl } from './whatsapp'

describe('whatsappUrl (US-3, BR-3)', () => {
  it('builds the Saturday link with the encoded Saturday message', () => {
    const url = new URL(whatsappUrl('sat'))
    expect(`${url.origin}${url.pathname}`).toBe('https://wa.me/59176632451')
    expect(url.searchParams.get('text')).toBe(days.sat.whatsappMessage)
    expect(whatsappUrl('sat')).toBe(`https://wa.me/59176632451?text=${encodeURIComponent(days.sat.whatsappMessage)}`)
  })

  it('builds the Sunday link without the Saturday date', () => {
    const text = new URL(whatsappUrl('sun')).searchParams.get('text') ?? ''
    expect(text).toBe(days.sun.whatsappMessage)
    expect(text).not.toContain('17 de octubre')
    expect(text).toContain('16:30')
    expect(shared.whatsappNumber).toBe('59176632451')
  })
})
