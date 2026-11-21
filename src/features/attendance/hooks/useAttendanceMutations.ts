import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  createAttendance,
  deleteAttendance,
  updateAttendance,
} from 'src/features/attendance/api/attendanceApi'
import { attendanceKeys } from 'src/features/attendance/api/keys'
import type {
  AttendanceInput,
  AttendanceUpdateInput,
} from 'src/features/attendance/types'

export function useCreateAttendance() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('attendance')

  return useMutation({
    mutationFn: (input: AttendanceInput) => createAttendance(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('attendance')

  return useMutation({
    mutationFn: ({
      attendanceId,
      input,
    }: {
      attendanceId: string
      input: AttendanceUpdateInput
    }) => updateAttendance(attendanceId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('attendance')

  return useMutation({
    mutationFn: (attendanceId: string) => deleteAttendance(attendanceId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
