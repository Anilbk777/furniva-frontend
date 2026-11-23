import type { AttendanceListFilters } from 'src/features/attendance/types'

export const attendanceKeys = {
  all: ['attendance'] as const,
  employees: ['attendance', 'employees'] as const,
  today: (page: number, limit: number) => ['attendance', 'today', page, limit] as const,
  list: (filters: AttendanceListFilters) => ['attendance', 'list', filters] as const,
  details: (employeeId: string, fromDate: string, toDate: string) =>
    ['attendance', 'details', employeeId, fromDate, toDate] as const,
}
