import { describe, expect, it } from 'vitest'

import {
  adToBs,
  bsFirstWeekday,
  bsMonthLength,
  formatBsDate,
  parseBsDate,
} from 'src/lib/bsCalendar'

describe('bsCalendar', () => {
  it('anchors BS 2000-01-01 to AD 1943-04-14', () => {
    expect(adToBs(new Date(1943, 3, 14))).toEqual({ year: 2000, month: 1, day: 1 })
  })

  it('converts known Nepali New Year dates', () => {
    expect(adToBs(new Date(2024, 3, 13))).toEqual({ year: 2081, month: 1, day: 1 })
    expect(adToBs(new Date(2026, 3, 14))).toEqual({ year: 2083, month: 1, day: 1 })
  })

  it('aligns the BS month start with the real weekday', () => {
    expect(bsFirstWeekday(2083, 1)).toBe(new Date(2026, 3, 14).getDay())
  })

  it('parses and formats BS dates with bounds checking', () => {
    expect(parseBsDate('2083-08-03')).toEqual({ year: 2083, month: 8, day: 3 })
    expect(parseBsDate('२०८३-०८-०३')).toEqual({ year: 2083, month: 8, day: 3 })
    expect(formatBsDate({ year: 2083, month: 8, day: 3 })).toBe('2083-08-03')
    expect(parseBsDate('2083-08-30')).toBeNull()
    expect(parseBsDate('1999-01-01')).toBeNull()
  })

  it('knows month lengths', () => {
    expect(bsMonthLength(2083, 1)).toBe(31)
    expect(bsMonthLength(2083, 8)).toBe(29)
    expect(bsMonthLength(2083, 13)).toBe(0)
  })
})
