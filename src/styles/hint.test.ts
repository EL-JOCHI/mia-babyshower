import { describe, expect, it } from 'vitest'
import { copy } from '../content'
import { headMeta, hintCss } from '../headMeta'
import indexCss from '../index.css?raw'
import { tuning } from '../tuning'
import pagesCss from './pages.css?raw'

const uncommented = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

// The declarations of every rule whose selector list includes `selector`, inside or outside @media.
function rulesFor(css: string, selector: string): string {
  return [...uncommented(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors!.split(',').map((s) => s.trim()).includes(selector))
    .map(([, , body]) => body)
    .join(';')
}

// The body of the `@media (prefers-reduced-motion: reduce)` blocks.
function reducedMotion(css: string): string {
  const text = uncommented(css)
  const bodies: string[] = []
  let at = text.indexOf('@media (prefers-reduced-motion: reduce)')
  while (at !== -1) {
    let depth = 0
    let i = text.indexOf('{', at)
    const start = i
    for (; i < text.length; i++) {
      if (text[i] === '{') depth++
      else if (text[i] === '}' && --depth === 0) break
    }
    bodies.push(text.slice(start + 1, i))
    at = text.indexOf('@media (prefers-reduced-motion: reduce)', i)
  }
  return bodies.join('\n')
}

describe('the move hint: Desliza, with a sliding hand', () => {
  it('says Desliza para explorar', () => {
    expect(copy.moveHint).toBe('Desliza para explorar')
  })

  it('writes the hint timings from tuning as CSS variables in the head', () => {
    const { slideMs, slideCount, nudgeDelayMs, nudgeMs, nudgeCount } = tuning.hint
    const css = hintCss()
    expect(css).toContain(`--hint-slide-ms:${slideMs}ms`)
    expect(css).toContain(`--hint-slide-count:${slideCount}`)
    expect(css).toContain(`--signpost-nudge-delay:${nudgeDelayMs}ms`)
    expect(css).toContain(`--signpost-nudge-ms:${nudgeMs}ms`)
    expect(css).toContain(`--signpost-nudge-count:${nudgeCount}`)
    expect(headMeta('https://example.test/')).toContain(css)
  })

  it('slides a hand beside the hint a few times, then rests (never an endless loop)', () => {
    const hand = rulesFor(pagesCss, '.move-hint::before')
    expect(hand).toMatch(/animation:[^;]*hint-swipe[^;]*var\(--hint-slide-ms\)/)
    expect(hand).toMatch(/var\(--hint-slide-count\)/)
    expect(hand).not.toMatch(/infinite/)
    expect(uncommented(pagesCss)).toMatch(/@keyframes hint-swipe/)
  })

  it('nudges the signpost buttons a couple of times after the page opens', () => {
    const nudge = rulesFor(indexCss, '.signposts ul')
    expect(nudge).toMatch(/animation:[^;]*signpost-nudge[^;]*var\(--signpost-nudge-ms\)/)
    expect(nudge).toMatch(/var\(--signpost-nudge-delay\)/)
    expect(nudge).toMatch(/var\(--signpost-nudge-count\)/)
    expect(uncommented(indexCss)).toMatch(/@keyframes signpost-nudge/)
    // With a soft glow on each button, on the same timing.
    expect(rulesFor(indexCss, '.signpost')).toMatch(/animation:[^;]*signpost-glow[^;]*var\(--signpost-nudge-ms\)/)
  })

  it('holds the hand still and does not nudge the signposts with reduced motion', () => {
    expect(rulesFor(reducedMotion(pagesCss), '.move-hint::before')).toMatch(/animation:\s*none/)
    expect(rulesFor(reducedMotion(indexCss), '.signposts ul')).toMatch(/animation:\s*none/)
    expect(rulesFor(reducedMotion(indexCss), '.signpost')).toMatch(/animation:\s*none/)
  })
})
