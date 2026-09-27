import { describe, expect, it } from 'vitest'
import { copy, days, shared } from './content'
import { dioramaCss, firstPaint, headMeta, openingScript, themeCss } from './headMeta'
import { cssColor, feelingColors, tokens, tuning } from './tuning'

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
    expect(css).toContain(':root[data-theme="dark"]{--field:#140E14')
    expect(css).toContain(':root[data-theme="light"]{--field:#F1E7D6')
    expect(css).toContain('--accent-text:#BB3267')
  })
})

describe('screenCss (design §9)', () => {
  it('defines one growing pixel for the HUD and dialogs, clamped between a phone and the widest screen', () => {
    const { fromPx, toPx, grow } = tuning.screen
    expect(headMeta(siteUrl)).toContain(
      `:root{--ui-px:clamp(1px, calc(1px + (100vw - ${fromPx}px) * ${grow} / ${toPx - fromPx}), ${1 + grow}px)}`,
    )
  })
})

describe('dioramaCss (spec §7 Level 3)', () => {
  const css = dioramaCss()

  it('emits one block of colors per mood and theme, from the attic looks', () => {
    for (const mood of ['saturday', 'sunday'] as const) {
      for (const theme of ['dark', 'light'] as const) {
        const look = tuning.world.looks[mood][theme]
        expect(css).toContain(
          `:root[data-theme="${theme}"] [data-mood="${mood}"]{--diorama-sky-top:${cssColor(look.skyTop)};--diorama-sky-bottom:${cssColor(look.skyBottom)};`,
        )
        expect(css).toContain(`--diorama-orb:${cssColor(look.orb)};`)
      }
    }
  })

  it('places the moon or the sun where the 3D window has it, in the diorama window units', () => {
    const look = tuning.world.looks.saturday.dark
    const { windowRadius } = tuning.world.attic
    const dx = Number(((look.orbAt[0] / windowRadius) * tuning.diorama.windowRadius).toFixed(2))
    expect(css).toContain(`--diorama-orb-dx:${dx}px`)
  })

  it('is part of the head styles', () => {
    expect(headMeta(siteUrl)).toContain(dioramaCss())
  })

  it('uses only the palette tokens and the feeling colors (no new colors)', () => {
    const allowed = new Set([...Object.values(tokens), ...Object.values(feelingColors)].map((c) => c.toUpperCase()))
    for (const hex of css.match(/#[0-9A-Fa-f]{6}/g) ?? []) expect(allowed.has(hex.toUpperCase()), hex).toBe(true)
  })
})

// Design §2 Loading: the first paint is the book cover in HTML, readable before any script runs.
describe('firstPaint (design §2 Loading)', () => {
  const html = firstPaint()
  const variant = (name: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.querySelector(`.first-paint-${name}`)?.textContent ?? ''
  }

  it('is the cover with the title, the hero line, and the move hint on an invitation', () => {
    expect(variant('day')).toContain(copy.title)
    expect(variant('day')).toContain(copy.hero)
    expect(variant('day')).toContain(copy.moveHint)
  })

  it('carries the post-party lines, not the hero line, once the party is over', () => {
    expect(variant('over')).toContain(copy.postPartyHero)
    expect(variant('over')).toContain(copy.relive)
    expect(variant('over')).not.toContain(copy.hero)
  })

  it('is only the two gate sentences on the gate', () => {
    expect(variant('gate')).toContain(copy.gate[0])
    expect(variant('gate')).toContain(copy.gate[1])
    expect(variant('gate')).not.toContain(copy.hero)
  })

  it('names no date and no place', () => {
    for (const secret of [days.sat.dateLine, days.sun.dateLine, '17 de octubre', '18 de octubre', shared.place, shared.city]) {
      expect(html).not.toContain(secret)
    }
  })
})

describe('openingScript (design §2 Loading, US-8, US-5)', () => {
  // Runs the head script against a URL and a clock, and returns the opening it picks.
  const opening = (search: string, now: number) => {
    const attributes: Record<string, string> = {}
    const documentStub = { documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } }
    const DateStub = { now: () => now }
    new Function('location', 'document', 'Date', openingScript())({ search }, documentStub, DateStub)
    return attributes['data-opening']
  }
  const beforeSat = Date.parse(days.sat.overFrom) - 1
  const satOver = Date.parse(days.sat.overFrom)

  it('picks the cover for either code, as resolveInvite reads it', () => {
    expect(opening('?e=n4vk', beforeSat)).toBe('day')
    expect(opening('?e=q8lm', satOver)).toBe('day')
    expect(opening('?e=N4VK', beforeSat)).toBe('day')
    expect(opening('?e=%20n4vk%20', beforeSat)).toBe('day')
    expect(opening('?x=1&e=q8lm', beforeSat)).toBe('day')
  })

  it('picks the post-party cover from that day\'s cutoff on', () => {
    expect(opening('?e=n4vk', satOver)).toBe('over')
    expect(opening('?e=q8lm', Date.parse(days.sun.overFrom))).toBe('over')
  })

  it('picks the gate for anything else', () => {
    for (const search of ['', '?e=', '?e=1', '?e=17-octubre', '?e=constructor', '?e=__proto__', '?e=toString']) {
      expect(opening(search, beforeSat)).toBe('gate')
    }
  })
})
