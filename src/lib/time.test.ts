import { describe, expect, it } from 'vitest'

import { formatApiTime, parseApiTime, timeToMinutes } from 'src/lib/time'

describe('time helpers', () => {
  it('parses 12-hour API times', () => {
    expect(parseApiTime('09:30 AM')).toEqual({ hour: 9, minute: 30, meridiem: 'AM' })
    expect(parseApiTime('12:05 PM')).toEqual({ hour: 12, minute: 5, meridiem: 'PM' })
    expect(parseApiTime('7:00 am')).toEqual({ hour: 7, minute: 0, meridiem: 'AM' })
  })

  it('rejects invalid times', () => {
    expect(parseApiTime('')).toBeNull()
    expect(parseApiTime('13:00 PM')).toBeNull()
    expect(parseApiTime('09:60 AM')).toBeNull()
    expect(parseApiTime('09:30')).toBeNull()
  })

  it('formats time parts back to the API shape', () => {
    expect(formatApiTime({ hour: 9, minute: 5, meridiem: 'AM' })).toBe('09:05 AM')
    expect(formatApiTime({ hour: 12, minute: 0, meridiem: 'PM' })).toBe('12:00 PM')
  })

  it('orders times as minutes of the day', () => {
    expect(timeToMinutes('09:30 AM')).toBe(570)
    expect(timeToMinutes('02:30 PM')).toBe(870)
    expect(timeToMinutes('12:00 AM')).toBe(0)
    expect(timeToMinutes('12:00 PM')).toBe(720)
    expect(timeToMinutes('')).toBeNull()
  })
})
