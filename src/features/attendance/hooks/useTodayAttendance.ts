import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getTodayAttendance } from 'src/features/attendance/api/attendanceApi'
import { attendanceKeys } from 'src/features/attendance/api/keys'

export function useTodayAttendance(page: number, limit: number) {
  return useQuery({
    queryKey: attendanceKeys.today(page, limit),
    queryFn: async () => (await getTodayAttendance(page, limit)).data,
    placeholderData: keepPreviousData,
  })
}
