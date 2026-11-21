export type AttendanceStatus = 'present' | 'half_day' | 'absent' | 'leave'

export const attendanceStatuses: AttendanceStatus[] = [
  'present',
  'half_day',
  'absent',
  'leave',
]

export const noWorkStatuses: AttendanceStatus[] = ['absent', 'leave']

export interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  bs_date: string
  status: AttendanceStatus | string
  check_in: string | null
  check_out: string | null
  overtime_hours: number | string
  note: string | null
  created_at: string | null
  updated_at: string | null
}

export interface AttendanceListFilters {
  employee_id?: string
  status?: AttendanceStatus
  from_date?: string
  to_date?: string
  page?: number
  limit?: number
}

export interface AttendanceListResult {
  attendances: AttendanceRecord[]
  pagination: Pagination
}

export interface AttendanceInput {
  employee_id: string
  bs_date: string
  status: AttendanceStatus
  check_in?: string | null
  check_out?: string | null
  overtime_hours?: number
  note?: string | null
}

export interface AttendanceUpdateInput {
  bs_date?: string
  status?: AttendanceStatus
  check_in?: string | null
  check_out?: string | null
  overtime_hours?: number
  note?: string | null
}

export interface AttendanceEmployeeBrief {
  id: string
  name: string
}

export interface AttendanceSummary {
  from_date: string
  to_date: string
  total_days: number
  recorded_days: number
  unmarked_days: number
  present: number
  half_day: number
  absent: number
  leave: number
  worked_days: number | string
  total_overtime_hours: number | string
}

export interface EmployeeAttendanceDetails {
  employee: AttendanceEmployeeBrief
  from_date: string
  to_date: string
  total_records: number
  summary: AttendanceSummary
  records: AttendanceRecord[]
}
