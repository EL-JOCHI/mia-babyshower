import { copy } from '../content'
import type { ThemeName } from '../tuning'

interface Props {
  theme: ThemeName
  onTheme: (theme: ThemeName) => void
}

// US-2: Oscuro and Claro, with the active option marked.
export function ThemeControl({ theme, onTheme }: Props) {
  return (
    <div className="theme-control" role="group" aria-label={copy.a11y.theme}>
      {(['dark', 'light'] as const).map((name) => (
        <button
          key={name}
          type="button"
          className="hud-button"
          aria-pressed={theme === name}
          onClick={() => onTheme(name)}
        >
          {name === 'dark' ? copy.themeDark : copy.themeLight}
        </button>
      ))}
    </div>
  )
}
