// Latin covers every Spanish character on the page (á, é, í, ó, ú, ñ, ¡, ¿).
// Latin-ext is included where the package ships it, for the rare guest whose OS font
// fallback would otherwise show. Pixelify Sans only appears on game screens with no
// accented text, so it loads latin only.
import '@fontsource/mystery-quest/latin-400.css'
import '@fontsource/mystery-quest/latin-ext-400.css'
import '@fontsource/alegreya/latin-400.css'
import '@fontsource/alegreya/latin-500.css'
import '@fontsource/alegreya/latin-700.css'
import '@fontsource/alegreya/latin-ext-400.css'
import '@fontsource/alegreya/latin-ext-500.css'
import '@fontsource/alegreya/latin-ext-700.css'
import '@fontsource/pixelify-sans/latin-400.css'
import '@fontsource/pixelify-sans/latin-600.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/App'
import { loadWorld } from './components/loadWorld'
import { reducedMotionQuery } from './hooks/useMediaQuery'
import { shouldPreloadWorld } from './logic/book'
import { hasWebGL } from './logic/webgl'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

// Design §2 Loading: a guest who will get the 3D book starts fetching it now, before the first
// render. If this fetch fails, the room's own lazy load fails too and hands over to the flat room.
const preload = shouldPreloadWorld(window.location.search, {
  reducedMotion: window.matchMedia(reducedMotionQuery).matches,
  height: window.innerHeight,
  webgl: hasWebGL,
})
if (preload) loadWorld().catch(() => {})

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
