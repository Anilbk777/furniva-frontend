import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { transactionKeys } from 'src/features/employees/api/keys'
import { createTransaction } from 'src/features/employees/api/transactionsApi'
import type { TransactionInput } from 'src/features/employees/types'

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('transactions')

  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}
