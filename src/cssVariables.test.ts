import { describe, expect, it } from 'vitest'
import { screenCss, themeCss } from './headMeta'

// Every source file's text, tests excluded (they quote variable names on purpose).
const sources = import.meta.glob<string>(['./**/*.{ts,tsx,css}', '!./**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const names = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].map((match) => match[1]!)

// BR-21: the theme tokens reach CSS as variables. A `var(--name)` that nothing defines silently
// falls back to the property's initial value (a black fill, a transparent stop), so every name a
// file reads must be defined somewhere: in the head's generated styles (src/headMeta.ts), declared
// in a stylesheet (`--name:`), or set inline by a component (`'--name': …`, `['--name' as string]: …`,
// or setProperty).
describe('CSS variables (BR-21)', () => {
  // The stylesheets come through as text (vite.config.ts lets ?raw CSS through in tests), so the
  // guard cannot pass by reading empty files.
  it('reads the source files, stylesheets included', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(50)
    for (const sheet of ['./index.css', './styles/pages.css', './styles/game.css']) {
      expect(sources[sheet]).toContain('var(--')
    }
  })

  it('defines every variable that a stylesheet or component reads', () => {
    const defined = new Set([
      ...names(themeCss() + screenCss(), /(--[\w-]+)\s*:/g),
      ...Object.entries(sources).flatMap(([path, text]) => [
        ...(path.endsWith('.css') ? names(text, /(--[\w-]+)\s*:/g) : []),
        ...names(text, /['"](--[\w-]+)['"]\s*:/g),
        ...names(text, /\[\s*['"](--[\w-]+)['"](?:\s+as\s+\w+)?\s*\]\s*:/g),
        ...names(text, /setProperty\(\s*['"](--[\w-]+)['"]/g),
      ]),
    ])
    const undefinedReads = Object.entries(sources).flatMap(([path, text]) =>
      names(text, /var\(\s*(--[\w-]+)/g)
        .filter((name) => !defined.has(name))
        .map((name) => `${path}: ${name}`),
    )
    expect([...new Set(undefinedReads)]).toEqual([])
  })
})
