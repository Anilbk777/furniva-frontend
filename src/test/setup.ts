import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from 'src/mocks/server'
import { mockState } from 'src/mocks/handlers'
import { setSessionRedirectHandler } from 'src/lib/http'
import i18n from 'src/lib/i18n'

beforeAll(() => {
  server.listen()
  setSessionRedirectHandler(() => undefined)
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  mockState.reset()
  localStorage.clear()
  sessionStorage.clear()
    document.documentElement.lang = 'en'
    void i18n.changeLanguage('en')
  })

afterAll(() => {
  server.close()
})
