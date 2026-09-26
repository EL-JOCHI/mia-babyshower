import { describe, expect, it } from 'vitest'
import { days, shared } from './content'
import { headMeta, themeCss } from './headMeta'

const siteUrl = 'https://el-jochi.github.io/mia-babyshower/'

describe('headMeta (BR-23, FR-22)', () => {
  const html = headMeta(siteUrl)

  it('carries the share preview with an absolute image URL', () => {
    expect(html).toContain('<meta property="og:title" content="Baby shower de Mia" />')
    expect(html).toContain('<meta property="og:description" content="Una invitación para invitados especiales." />')
    expect(html).toContain(`<meta property="og:image" content="${siteUrl}og-image.jpg" />`)
    expect(html).toContain('<title>Baby shower de Mia</title>')
  })

  it('asks search engines not to index the site', () => {
    expect(html).toContain('<meta name="robots" content="noindex" />')
  })

  it('names no date and no place', () => {
    for (const secret of [days.sat.dateLine, days.sun.dateLine, '17 de octubre', '18 de octubre', shared.place]) {
      expect(html).not.toContain(secret)
    }
  })

  it('adds a trailing slash to the site URL when missing', () => {
    expect(headMeta('https://example.org/x')).toContain('content="https://example.org/x/og-image.jpg"')
  })
})

describe('themeCss (BR-21)', () => {
  it('emits variables for both themes from the tuning module', () => {
    const css = themeCss()
    expect(css).toContain(':root[data-theme="dark"]{--field:#0A0A0A')
    expect(css).toContain(':root[data-theme="light"]{--field:#FFF7FB')
    expect(css).toContain('--accent-text:#E20064')
  })
})
