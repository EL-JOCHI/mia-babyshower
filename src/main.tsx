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

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
