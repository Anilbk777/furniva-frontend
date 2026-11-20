import { describe, expect, it } from 'vitest'

import { normalizeIdentifier, normalizePhone } from 'src/features/auth/utils/phone'

describe('normalizePhone', () => {
  it('keeps a valid 10-digit phone number', () => {
    expect(normalizePhone('9841234567')).toBe('9841234567')
  })

  it('removes separators, country code, and leading zeros', () => {
    expect(normalizePhone('+977 984-123-4567')).toBe('9841234567')
    expect(normalizePhone('(01) 9841234567')).toBe('9841234567')
  })

  it('strips non-digit characters', () => {
    expect(normalizePhone('984abc1234567')).toBe('9841234567')
  })
})

describe('normalizeIdentifier', () => {
  it('lowercases emails', () => {
    expect(normalizeIdentifier(' Demo@Furniva.Local ')).toBe('demo@furniva.local')
  })

  it('normalizes phone identifiers', () => {
    expect(normalizeIdentifier('+977 984-123-4567')).toBe('9841234567')
  })
})
