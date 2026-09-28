import { copy } from '../content'
import type { ThemeName } from '../tuning'

interface Props {
  theme: ThemeName
  onTheme: (theme: ThemeName) => void
}

// Spec §4: a sun for Claro and a moon for Oscuro, in the ink style: a filled shape with a lighter
// second line offset beside it, like the cats' scratchy double outline.
function Sun() {
  return (
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle className="theme-icon-echo" cx={12.8} cy={11.3} r={4.6} />
      <circle className="theme-icon-fill" cx={12} cy={12} r={4.4} />
      <path
        className="theme-icon-line"
        d="M12 2.4 V 5 M12 19 V 21.6 M2.4 12 H 5 M19 12 H 21.6 M5.2 5.2 L 7 7 M17 17 L 18.8 18.8 M5.2 18.8 L 7 17 M17 7 L 18.8 5.2"
      />
    </svg>
  )
}

function Moon() {
  return (
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path className="theme-icon-echo" d="M15.8 2.6 A 9 9 0 1 0 21.6 14.8 A 7.2 7.2 0 0 1 15.8 2.6 Z" />
      <path className="theme-icon-fill" d="M15 3.4 A 9 9 0 1 0 20.8 15.6 A 7.2 7.2 0 0 1 15 3.4 Z" />
      <path className="theme-icon-line" d="M19 4.2 V 7 M17.6 5.6 H 20.4" />
    </svg>
  )
}

// US-2: Oscuro and Claro as a moon and a sun, with the active one marked (aria-pressed). Their
// names stay for screen readers, as visually hidden text.
export function ThemeControl({ theme, onTheme }: Props) {
  return (
    <div className="theme-control" role="group" aria-label={copy.a11y.theme}>
      {(['dark', 'light'] as const).map((name) => (
        <button
          key={name}
          type="button"
          className="hud-button hud-icon-button"
          aria-pressed={theme === name}
          onClick={() => onTheme(name)}
        >
          {name === 'dark' ? <Moon /> : <Sun />}
          <span className="sr-only">{name === 'dark' ? copy.themeDark : copy.themeLight}</span>
        </button>
      ))}
    </div>
  )
}
