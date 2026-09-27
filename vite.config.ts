import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { firstPaint, headMeta } from './src/headMeta.ts'

function headTags(siteUrl: string): Plugin {
  return {
    name: 'mia-head-tags',
    transformIndexHtml(html) {
      return html.replace('<!--head-tags-->', headMeta(siteUrl)).replace('<!--first-paint-->', firstPaint())
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
      // Deploys run `npm test` on shared CI runners: a few whole-App tests (a 30 s gate round, two
      // battles) take seconds of fake time and can pass 5 s on a slow or busy machine.
      testTimeout: 20000,
    },
  }
})
