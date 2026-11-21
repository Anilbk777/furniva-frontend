import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { listAttendance } from 'src/features/attendance/api/attendanceApi'
import { attendanceKeys } from 'src/features/attendance/api/keys'
import type { AttendanceRecord } from 'src/features/attendance/types'

const PAGE_LIMIT = 100

export function useTodayAttendance(date: string) {
  return useQuery({
    queryKey: attendanceKeys.today(date),
    queryFn: async () => {
      const records: AttendanceRecord[] = []
      let page = 1
      let totalPages = 1

      while (page <= totalPages) {
        const response = await listAttendance({
          from_date: date,
          to_date: date,
          page,
          limit: PAGE_LIMIT,
        })
        const data = response.data
        if (!data) break
        records.push(...data.attendances)
        totalPages = data.pagination.total_pages
        page += 1
      }

      return records
    },
    enabled: Boolean(date),
    placeholderData: keepPreviousData,
  })
}
