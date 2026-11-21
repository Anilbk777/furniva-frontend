import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  AttendanceInput,
  AttendanceListFilters,
  AttendanceListResult,
  AttendanceRecord,
  AttendanceUpdateInput,
  EmployeeAttendanceDetails,
} from 'src/features/attendance/types'

export function listAttendance(
  filters: AttendanceListFilters = {},
): Promise<ApiResponse<AttendanceListResult>> {
  return http
    .get<ApiResponse<AttendanceListResult>>('/attendance', {
      params: {
        employee_id: filters.employee_id || undefined,
        status: filters.status || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    })
    .then((response) => response.data)
}

export function getEmployeeAttendanceDetails(
  employeeId: string,
  fromDate: string,
  toDate: string,
): Promise<ApiResponse<EmployeeAttendanceDetails>> {
  return http
    .get<ApiResponse<EmployeeAttendanceDetails>>(
      `/attendance/employees/${employeeId}/details`,
      { params: { from_date: fromDate, to_date: toDate } },
    )
    .then((response) => response.data)
}

export function createAttendance(
  input: AttendanceInput,
): Promise<ApiResponse<AttendanceRecord>> {
  return http
    .post<ApiResponse<AttendanceRecord>>('/attendance', input)
    .then((response) => response.data)
}

export function updateAttendance(
  attendanceId: string,
  input: AttendanceUpdateInput,
): Promise<ApiResponse<AttendanceRecord>> {
  return http
    .patch<ApiResponse<AttendanceRecord>>(`/attendance/${attendanceId}`, input)
    .then((response) => response.data)
}

export function deleteAttendance(attendanceId: string): Promise<ApiResponse<null>> {
  return http
    .delete<ApiResponse<null>>(`/attendance/${attendanceId}`)
    .then((response) => response.data)
}
