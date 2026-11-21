import { z } from 'zod'

import {
  noWorkStatuses,
  type AttendanceInput,
  type AttendanceStatus,
  type AttendanceUpdateInput,
} from 'src/features/attendance/types'
import { parseApiTime, timeToMinutes } from 'src/features/attendance/utils/time'

const timeSchema = z
  .string()
  .trim()
  .refine((value) => !value || parseApiTime(value) !== null, 'errors.attendanceTimeInvalid')

export const attendanceSchema = z
  .object({
    bs_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'errors.bsDateInvalid'),
    status: z.enum(['present', 'half_day', 'absent', 'leave']),
    check_in: timeSchema,
    check_out: timeSchema,
    overtime_hours: z.string().trim().refine(
      (value) =>
        !value ||
        (/^\d{1,2}(\.\d{1,2})?$/.test(value) &&
          Number(value) >= 0 &&
          Number(value) <= 24),
      'errors.attendanceOvertimeInvalid',
    ),
    note: z.string().trim().max(500, 'errors.attendanceNoteLength'),
  })
  .superRefine((values, ctx) => {
    const isNoWork = noWorkStatuses.includes(values.status as AttendanceStatus)

    if (isNoWork) {
      if (values.check_in || values.check_out || Number(values.overtime_hours || 0) > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['status'],
          message: 'errors.attendanceNoWorkFields',
        })
      }
      return
    }

    if (values.check_out && !values.check_in) {
      ctx.addIssue({
        code: 'custom',
        path: ['check_out'],
        message: 'errors.attendanceCheckoutNeedsCheckin',
      })
    }

    if (values.check_in && values.check_out) {
      const checkIn = timeToMinutes(values.check_in)
      const checkOut = timeToMinutes(values.check_out)
      if (checkIn !== null && checkOut !== null && checkOut <= checkIn) {
        ctx.addIssue({
          code: 'custom',
          path: ['check_out'],
          message: 'errors.attendanceCheckoutBeforeCheckin',
        })
      }
    }
  })

export type AttendanceValues = z.input<typeof attendanceSchema>

export interface AttendanceFormOutput {
  bs_date: string
  status: AttendanceStatus
  check_in: string | null
  check_out: string | null
  overtime_hours: number
  note: string | null
}

export function toAttendanceFormOutput(values: AttendanceValues): AttendanceFormOutput {
  const isNoWork = noWorkStatuses.includes(values.status as AttendanceStatus)

  return {
    bs_date: values.bs_date.trim(),
    status: values.status,
    check_in: isNoWork ? null : values.check_in.trim() || null,
    check_out: isNoWork ? null : values.check_out.trim() || null,
    overtime_hours: isNoWork ? 0 : Number(values.overtime_hours || 0),
    note: values.note.trim() || null,
  }
}

export function toAttendanceInput(
  values: AttendanceValues,
  employeeId: string,
): AttendanceInput {
  return { employee_id: employeeId, ...toAttendanceFormOutput(values) }
}

export function toAttendanceUpdateInput(
  values: AttendanceValues,
): AttendanceUpdateInput {
  return toAttendanceFormOutput(values)
}
