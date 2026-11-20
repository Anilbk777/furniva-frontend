import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { partyKeys, partyTypeKeys } from 'src/features/parties/api/keys'
import {
  createPartyType,
  deletePartyType,
  updatePartyType,
} from 'src/features/parties/api/partyTypesApi'
import type { PartyTypeInput } from 'src/features/parties/types'

export function useCreatePartyType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('parties')

  return useMutation({
    mutationFn: (input: PartyTypeInput) => createPartyType(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyTypeKeys.all })
      toast.success(t('typeCreateSuccess'))
    },
  })
}

export function useUpdatePartyType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('parties')

  return useMutation({
    mutationFn: ({ typeId, input }: { typeId: string; input: PartyTypeInput }) =>
      updatePartyType(typeId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyTypeKeys.all })
      void queryClient.invalidateQueries({ queryKey: partyKeys.all })
      toast.success(t('typeUpdateSuccess'))
    },
  })
}

export function useDeletePartyType() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('parties')

  return useMutation({
    mutationFn: (typeId: string) => deletePartyType(typeId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: partyTypeKeys.all })
      toast.success(t('typeDeleteSuccess'))
    },
  })
}
