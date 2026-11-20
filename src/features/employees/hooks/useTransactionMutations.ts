import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { transactionKeys } from 'src/features/employees/api/keys'
import {
  deleteTransaction,
  updateTransaction,
} from 'src/features/employees/api/transactionsApi'
import type { TransactionUpdateInput } from 'src/features/employees/types'

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('transactions')

  return useMutation({
    mutationFn: ({
      transactionId,
      input,
    }: {
      transactionId: string
      input: TransactionUpdateInput
    }) => updateTransaction(transactionId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('transactions')

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(transactionId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
