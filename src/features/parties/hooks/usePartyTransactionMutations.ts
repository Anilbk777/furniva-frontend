import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { partyTransactionKeys } from 'src/features/parties/api/keys'
import {
  createPartyTransaction,
  deletePartyTransaction,
  updatePartyTransaction,
} from 'src/features/parties/api/transactionsApi'
import type {
  PartyTransactionInput,
  PartyTransactionUpdateInput,
} from 'src/features/parties/types'

export function useCreatePartyTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('partyTransactions')

  return useMutation({
    mutationFn: (input: PartyTransactionInput) => createPartyTransaction(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyTransactionKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}

export function useUpdatePartyTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('partyTransactions')

  return useMutation({
    mutationFn: ({
      transactionId,
      input,
    }: {
      transactionId: string
      input: PartyTransactionUpdateInput
    }) => updatePartyTransaction(transactionId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyTransactionKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useDeletePartyTransaction() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('partyTransactions')

  return useMutation({
    mutationFn: (transactionId: string) => deletePartyTransaction(transactionId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyTransactionKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
