import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = env.VITE_API_ORIGIN

  if (!apiOrigin) throw new Error('VITE_API_ORIGIN must be set in .env')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { src: path.resolve(import.meta.dirname, './src') },
    },
    server: {
      proxy: {
        '/api': { target: apiOrigin, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      environmentOptions: {
        jsdom: { url: 'http://localhost/' },
      },
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      restoreMocks: true,
    },
  }
})
