import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getEmployeeAttendanceDetails } from 'src/features/attendance/api/attendanceApi'
import { attendanceKeys } from 'src/features/attendance/api/keys'

export function useAttendanceDetails(
  employeeId: string | undefined,
  fromDate: string,
  toDate: string,
) {
  return useQuery({
    queryKey: attendanceKeys.details(employeeId ?? '', fromDate, toDate),
    queryFn: async () =>
      (await getEmployeeAttendanceDetails(employeeId ?? '', fromDate, toDate)).data,
    enabled: Boolean(employeeId && fromDate && toDate),
    placeholderData: keepPreviousData,
  })
}
