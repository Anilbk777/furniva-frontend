import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-sans-devanagari/devanagari-400.css'
import '@fontsource/noto-sans-devanagari/devanagari-700.css'
import 'src/index.css'
import App from 'src/App'
import { env } from 'src/lib/env'

async function start(): Promise<void> {
  if (env.DEV && env.VITE_USE_MOCKS) {
    const { worker } = await import('src/mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass' })
  }

  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void start()
