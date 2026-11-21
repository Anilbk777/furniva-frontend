import { describe, expect, it } from 'vitest'

import {
  attendanceSchema,
  toAttendanceFormOutput,
  toAttendanceInput,
} from 'src/features/attendance/schemas/attendance.schemas'

const valid = {
  bs_date: '2083-08-03',
  status: 'present' as const,
  check_in: '09:30 AM',
  check_out: '06:00 PM',
  overtime_hours: '1.5',
  note: 'Regular shift',
}

describe('attendanceSchema', () => {
  it('accepts a valid present day', () => {
    expect(attendanceSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts an absent day without times or overtime', () => {
    expect(
      attendanceSchema.safeParse({
        ...valid,
        status: 'absent',
        check_in: '',
        check_out: '',
        overtime_hours: '0',
      }).success,
    ).toBe(true)
  })

  it('rejects absent and leave days with work details', () => {
    expect(
      attendanceSchema.safeParse({ ...valid, status: 'absent' }).success,
    ).toBe(false)
    expect(
      attendanceSchema.safeParse({ ...valid, status: 'leave' }).success,
    ).toBe(false)
  })

  it('rejects a checkout without a check-in', () => {
    expect(
      attendanceSchema.safeParse({ ...valid, check_in: '' }).success,
    ).toBe(false)
  })

  it('rejects a checkout before the check-in', () => {
    expect(
      attendanceSchema.safeParse({
        ...valid,
        check_in: '06:00 PM',
        check_out: '09:30 AM',
      }).success,
    ).toBe(false)
  })

  it('rejects invalid dates, times and overtime', () => {
    expect(attendanceSchema.safeParse({ ...valid, bs_date: '83-8-3' }).success).toBe(false)
    expect(attendanceSchema.safeParse({ ...valid, check_in: '9:30' }).success).toBe(false)
    expect(attendanceSchema.safeParse({ ...valid, overtime_hours: '25' }).success).toBe(false)
    expect(attendanceSchema.safeParse({ ...valid, overtime_hours: '1.234' }).success).toBe(false)
  })

  it('rejects notes longer than 500 characters', () => {
    expect(
      attendanceSchema.safeParse({ ...valid, note: 'x'.repeat(501) }).success,
    ).toBe(false)
  })

  it('maps form values to the API payload', () => {
    expect(toAttendanceInput(valid, 'employee-1')).toEqual({
      employee_id: 'employee-1',
      bs_date: '2083-08-03',
      status: 'present',
      check_in: '09:30 AM',
      check_out: '06:00 PM',
      overtime_hours: 1.5,
      note: 'Regular shift',
    })
  })

  it('drops work details on no-work days and sends an empty note as null', () => {
    expect(
      toAttendanceFormOutput({
        ...valid,
        status: 'leave',
        note: '   ',
      }),
    ).toEqual({
      bs_date: '2083-08-03',
      status: 'leave',
      check_in: null,
      check_out: null,
      overtime_hours: 0,
      note: null,
    })
  })
})
