import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { customerKeys } from 'src/features/customers/api/keys'
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from 'src/features/customers/api/customersApi'
import type { CustomerInput, CustomerUpdateInput } from 'src/features/customers/types'

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('customers')

  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}

export function useUpdateCustomer(customerId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('customers')

  return useMutation({
    mutationFn: (input: CustomerUpdateInput) => updateCustomer(customerId, input),
    onSuccess(response) {
      if (response.data) {
        queryClient.setQueryData(customerKeys.detail(customerId), response.data)
      }
      void queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useDeleteCustomer(customerId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('customers')

  return useMutation({
    mutationFn: () => deleteCustomer(customerId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
