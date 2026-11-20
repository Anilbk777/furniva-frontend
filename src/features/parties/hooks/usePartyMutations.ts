import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { partyKeys, partyTransactionKeys } from 'src/features/parties/api/keys'
import {
  createParty,
  deleteParty,
  updateParty,
} from 'src/features/parties/api/partiesApi'
import type { PartyInput, PartyUpdateInput } from 'src/features/parties/types'

export function useCreateParty() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('parties')

  return useMutation({
    mutationFn: (input: PartyInput) => createParty(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}

export function useUpdateParty(partyId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('parties')

  return useMutation({
    mutationFn: (input: PartyUpdateInput) => updateParty(partyId, input),
    onSuccess(response) {
      if (response.data) {
        queryClient.setQueryData(partyKeys.detail(partyId), response.data)
      }
      void queryClient.invalidateQueries({ queryKey: partyKeys.all })
      void queryClient.invalidateQueries({ queryKey: partyTransactionKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useDeleteParty(partyId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('parties')

  return useMutation({
    mutationFn: () => deleteParty(partyId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyKeys.all })
      void queryClient.invalidateQueries({ queryKey: partyTransactionKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
