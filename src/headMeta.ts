// Builds the <head> tags that must exist before any script runs: the share preview (BR-23),
// the theme tokens as CSS variables (BR-21), the pre-paint theme choice (US-2), and the opening
// the first paint shows. Also builds that first paint, the HTML inside #root until the app starts.
// The Vite config injects both into index.html, so the copy and colors keep one source.

import { copy, days, type DayId } from './content.ts'
import { storageKeys } from './logic/storageKeys.ts'
import { cssColor, themes, tokens, tuning, type MoodId, type ThemeName, type ThemeTokens, type WorldLook } from './tuning.ts'

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function cssVars(theme: ThemeTokens): string {
  return [
    `--field:${theme.field}`,
    `--ink:${theme.ink}`,
    `--accent:${theme.accent}`,
    `--accent-text:${theme.accentText}`,
    `--surface:${theme.surface}`,
    `--line:${theme.line}`,
    `--button-bg:${theme.buttonBg}`,
    `--button-ink:${theme.buttonInk}`,
    `--cat-body:${theme.catBody}`,
    `--cat-paper:${theme.catPaper}`,
    `--page:${theme.page}`,
    `--page-shade:${theme.pageShade}`,
    `--page-ink:${theme.pageInk}`,
    `--page-accent-text:${theme.pageAccentText}`,
    `--page-line:${theme.pageLine}`,
    // Burton pink noir (design §3).
    `--bone:${tokens.bone}`,
    `--rose:${tokens.rose}`,
    `--deep-rose:${tokens.deepRose}`,
    `--plum:${tokens.plum}`,
    `--candle:${tokens.candle}`,
    `--shadow:${tokens.shadow}`,
    `--paper-white:${tokens.paperWhite}`,
  ].join(';')
}

export function themeCss(): string {
  const names = Object.keys(themes) as ThemeName[]
  return names.map((name) => `:root[data-theme="${name}"]{${cssVars(themes[name])}}`).join('')
}

// Design §9: --ui-px is one CSS pixel on a phone and grows with the screen's width up to
// 1 + grow pixels at tuning.screen.toPx, then stops: the same ramp as screenScale. The HUD, the
// dialogs, and the gate size themselves in it; the pages (in the book, or zoomed in the flat room)
// reset it to 1px.
export function screenCss(): string {
  const { fromPx, toPx, grow } = tuning.screen
  return `:root{--ui-px:clamp(1px, calc(1px + (100vw - ${fromPx}px) * ${grow} / ${toPx - fromPx}), ${1 + grow}px)}`
}

// The first page's hint timings (tuning.hint), for the sliding hand and the signposts' nudge.
export function hintCss(): string {
  const { slideMs, slideCount, nudgeDelayMs, nudgeMs, nudgeCount } = tuning.hint
  return `:root{--hint-slide-ms:${slideMs}ms;--hint-slide-count:${slideCount};--signpost-nudge-delay:${nudgeDelayMs}ms;--signpost-nudge-ms:${nudgeMs}ms;--signpost-nudge-count:${nudgeCount}}`
}

const round2 = (value: number) => Number(value.toFixed(2))

// Spec §7 Level 3: the paper diorama's colors, one set per mood and theme, from the same looks as
// the 3D attic (tuning.world.looks). The diorama carries data-mood and the root carries data-theme,
// so switching theme recolors it in place. The moon or sun sits where the 3D window has it, in the
// diorama window's units.
function dioramaVars(look: WorldLook): string {
  const { windowRadius, orb } = tuning.world.attic
  const toDiorama = tuning.diorama.windowRadius / windowRadius
  return [
    `--diorama-sky-top:${cssColor(look.skyTop)}`,
    `--diorama-sky-bottom:${cssColor(look.skyBottom)}`,
    `--diorama-orb:${cssColor(look.orb)}`,
    `--diorama-halo:${cssColor(look.halo)}`,
    `--diorama-orb-dx:${round2(look.orbAt[0] * toDiorama)}px`,
    `--diorama-orb-dy:${round2(-look.orbAt[1] * toDiorama)}px`,
    `--diorama-orb-scale:${round2((orb.radius * look.orbSize) / windowRadius)}`,
    `--diorama-wood:${cssColor(look.wood)}`,
    `--diorama-floor:${cssColor(look.floor)}`,
    `--diorama-beam:${cssColor(look.beam)}`,
    `--diorama-cloth:${cssColor(look.cloth)}`,
    `--diorama-fog:${cssColor(look.fog)}`,
    `--diorama-shaft:${cssColor(look.shaft)}`,
    `--diorama-shaft-opacity:${look.shaftOpacity}`,
    `--diorama-sparkle:${cssColor(look.sparkle)}`,
    `--diorama-stars:${look.stars}`,
    `--diorama-lantern-glow:${look.lanternGlow}`,
  ].join(';')
}

export function dioramaCss(): string {
  const moods = Object.keys(tuning.world.looks) as MoodId[]
  const names = Object.keys(themes) as ThemeName[]
  return moods
    .flatMap((mood) =>
      names.map((theme) => `:root[data-theme="${theme}"] [data-mood="${mood}"]{${dioramaVars(tuning.world.looks[mood][theme])}}`),
    )
    .join('')
}

function prePaintThemeScript(): string {
  return (
    `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(storageKeys.theme)})}catch(e){}` +
    `if(t!=="dark"&&t!=="light"){try{t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch(e){t="dark"}}` +
    `document.documentElement.setAttribute("data-theme",t)})();`
  )
}

// Design §2 Loading: which first paint to show, before any module loads. It reads the code the
// way resolveInvite does (the first `e`, trimmed, any case) and the day's cutoff the way
// isPartyOver does, from the same content module: `day` (the cover), `over` (the post-party
// cover), or `gate`. The app replaces the first paint as soon as it starts.
export function openingScript(): string {
  const checks = (Object.keys(days) as DayId[])
    .map((id) => `if(e===${JSON.stringify(days[id].code)})o=${Date.parse(days[id].overFrom)};`)
    .join('')
  return (
    `(function(){var e="",o=null;try{e=(new URLSearchParams(location.search).get("e")||"").trim().toLowerCase()}catch(x){}` +
    checks +
    `document.documentElement.setAttribute("data-opening",o===null?"gate":Date.now()>=o?"over":"day")})();`
  )
}

// The first paint (design §2 Loading): the book cover in HTML, readable as soon as the page and
// its stylesheet arrive, with the same markup the app draws, so the app takes over in place. The
// head's data-opening shows one of the three (src/index.css). No date and no place (BR-10).
export function firstPaint(): string {
  const cover = (name: string, lines: string) =>
    `<div class="book-cover first-paint-${name}"><div class="book-cover-inner">` +
    `<p class="cover-title">${escapeText(copy.title)}</p>${lines}` +
    `<p class="move-hint">${escapeText(copy.moveHint)}</p></div></div>`
  return (
    `<div class="app first-paint">` +
    cover('day', `<p class="cover-hero">${escapeText(copy.hero)}</p>`) +
    cover(
      'over',
      `<p class="cover-hero">${escapeText(copy.postPartyHero)}</p><p class="cover-hero relive">${escapeText(copy.relive)}</p>`,
    ) +
    `<div class="gate first-paint-gate"><div class="gate-sentences">` +
    copy.gate.map((line) => `<p class="gate-sentence">${escapeText(line)}</p>`).join('') +
    `</div></div></div>`
  )
}

export function headMeta(siteUrl: string): string {
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  const title = escapeAttr(copy.share.title)
  const description = escapeAttr(copy.share.description)
  return [
    `<title>${title}</title>`,
    `<meta name="robots" content="noindex" />`,
    `<meta name="description" content="${description}" />`,
    `<meta name="theme-color" content="${themes.dark.field}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="es_BO" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeAttr(base)}" />`,
    `<meta property="og:image" content="${escapeAttr(`${base}og-image.jpg`)}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${title}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<style id="theme-tokens">${themeCss()}${screenCss()}${dioramaCss()}${hintCss()}</style>`,
    `<script>${prePaintThemeScript()}${openingScript()}</script>`,
  ].join('\n    ')
}
