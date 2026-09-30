import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { googleTranslateProxy } from './vite.translate.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), googleTranslateProxy(env.GOOGLE_TRANSLATE_API_KEY)],
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
  }
})
