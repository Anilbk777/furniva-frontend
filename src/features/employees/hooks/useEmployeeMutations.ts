import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from 'src/features/employees/api/employeesApi'
import { employeeKeys, transactionKeys } from 'src/features/employees/api/keys'
import type { EmployeeInput, EmployeeUpdateInput } from 'src/features/employees/types'

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('employees')

  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}

export function useUpdateEmployee(employeeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('employees')

  return useMutation({
    mutationFn: (input: EmployeeUpdateInput) => updateEmployee(employeeId, input),
    onSuccess(response) {
      if (response.data) {
        queryClient.setQueryData(employeeKeys.detail(employeeId), response.data)
      }
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useDeleteEmployee(employeeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('employees')

  return useMutation({
    mutationFn: () => deleteEmployee(employeeId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
