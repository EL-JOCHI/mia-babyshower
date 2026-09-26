import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { headMeta } from './src/headMeta.ts'

function headTags(siteUrl: string): Plugin {
  return {
    name: 'mia-head-tags',
    transformIndexHtml(html) {
      return html.replace('<!--head-tags-->', headMeta(siteUrl))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: './',
    plugins: [react(), tailwindcss(), headTags(env.VITE_SITE_URL ?? '')],
    // The 3D book is its own lazy chunk (Three.js, React Three Fiber, drei), loaded behind the HTML cover.
    build: { chunkSizeWarningLimit: 1000 },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  }
})
