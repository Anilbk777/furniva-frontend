import { z } from 'zod'

import type { EmployeeInput } from 'src/features/employees/types'

function digits(value: string): string {
  return value.replace(/[\s\-()]/g, '')
}

export const employeeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'errors.required')
      .max(120, 'errors.employeeNameLength'),
    phone: z.string().trim().max(20, 'errors.phoneInvalid'),
    role_title: z.string().trim().max(80, 'errors.roleLength'),
    monthly_salary: z.string().trim(),
    joined_date_bs: z.string().trim(),
    note: z.string().trim().max(1000, 'errors.noteLength'),
  })
  .superRefine((values, ctx) => {
    if (values.phone && !/^\d{7,15}$/.test(digits(values.phone))) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'errors.phoneInvalid' })
    }
    if (values.monthly_salary && !/^\d+(\.\d{1,2})?$/.test(values.monthly_salary)) {
      ctx.addIssue({
        code: 'custom',
        path: ['monthly_salary'],
        message: 'errors.salaryInvalid',
      })
    }
    if (values.joined_date_bs && !/^\d{4}-\d{2}-\d{2}$/.test(values.joined_date_bs)) {
      ctx.addIssue({
        code: 'custom',
        path: ['joined_date_bs'],
        message: 'errors.bsDateInvalid',
      })
    }
  })

export type EmployeeValues = z.input<typeof employeeSchema>

function nullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function toEmployeeInput(values: EmployeeValues): EmployeeInput {
  return {
    name: values.name.trim(),
    phone: nullable(values.phone),
    role_title: nullable(values.role_title),
    monthly_salary: values.monthly_salary ? Number(values.monthly_salary) : null,
    joined_date_bs: nullable(values.joined_date_bs),
    note: nullable(values.note),
  }
}
