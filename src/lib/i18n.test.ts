import { describe, expect, it } from 'vitest'

import i18n, { translate } from 'src/lib/i18n'

describe('i18n', () => {
  it('switches between English and Nepali', async () => {
    await i18n.changeLanguage('en')
    expect(translate(i18n.t, 'common:dashboard')).toBe('Dashboard')
    expect(translate(i18n.t, 'errors.invalidCredentials')).toBe('Invalid credentials')

    await i18n.changeLanguage('ne')
    expect(translate(i18n.t, 'common:dashboard')).toBe('ड्यासबोर्ड')

    await i18n.changeLanguage('en')
  })
})
