// Builds the <head> tags that must exist before any script runs: the share preview (BR-23),
// the theme tokens as CSS variables (BR-21), and the pre-paint theme choice (US-2).
// The Vite config injects this into index.html, so the copy and colors keep one source.

import { copy } from './content'
import { storageKeys } from './logic/storageKeys'
import { themes, tokens, type ThemeName, type ThemeTokens } from './tuning'

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
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
    `--hot-pink:${tokens.hotPink}`,
    `--deep-pink:${tokens.deepPink}`,
    `--blush:${tokens.blush}`,
    `--paper:${tokens.paper}`,
  ].join(';')
}

export function themeCss(): string {
  const names = Object.keys(themes) as ThemeName[]
  return names.map((name) => `:root[data-theme="${name}"]{${cssVars(themes[name])}}`).join('')
}

function prePaintThemeScript(): string {
  return (
    `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(storageKeys.theme)})}catch(e){}` +
    `if(t!=="dark"&&t!=="light"){try{t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch(e){t="dark"}}` +
    `document.documentElement.setAttribute("data-theme",t)})();`
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
    `<style id="theme-tokens">${themeCss()}</style>`,
    `<script>${prePaintThemeScript()}</script>`,
  ].join('\n    ')
}
