import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { ConfirmDialog } from 'src/components/ui/ConfirmDialog'
import { IconButton } from 'src/components/ui/IconButton'
import { Skeleton } from 'src/components/ui/Skeleton'
import { PartyTypeForm } from 'src/features/parties/components/PartyTypeForm'
import { usePartyTypes } from 'src/features/parties/hooks/usePartyTypes'
import {
  useCreatePartyType,
  useDeletePartyType,
  useUpdatePartyType,
} from 'src/features/parties/hooks/usePartyTypeMutations'
import type { PartyType } from 'src/features/parties/types'
import { mapApiError } from 'src/features/auth'
import { translate } from 'src/lib/i18n'

export function PartyTypeManager() {
  const { t } = useTranslation(['parties', 'common', 'errors'])
  const types = usePartyTypes()
  const create = useCreatePartyType()
  const update = useUpdatePartyType()
  const remove = useDeletePartyType()

  const [editing, setEditing] = useState<PartyType | null>(null)
  const [deleting, setDeleting] = useState<PartyType | null>(null)
  const [error, setError] = useState<string | undefined>()

  function handleCreate(name: string): void {
    setError(undefined)
    create.mutate(
      { name },
      {
        onError(error: unknown) {
          setError(translate(t, mapApiError(error).messageKey))
        },
      },
    )
  }

  function handleRename(name: string): void {
    if (!editing) return
    setError(undefined)
    update.mutate(
      { typeId: editing.id, input: { name } },
      {
        onSuccess() {
          setEditing(null)
        },
        onError(error: unknown) {
          setError(translate(t, mapApiError(error).messageKey))
        },
      },
    )
  }

  function handleDelete(): void {
    if (!deleting) return
    setError(undefined)
    remove.mutate(deleting.id, {
      onSuccess() {
        setDeleting(null)
      },
      onError(error: unknown) {
        setError(translate(t, mapApiError(error).messageKey))
        setDeleting(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <PartyTypeForm
        pending={create.isPending}
        submitLabel={t('parties:addType')}
        onSave={handleCreate}
      />

      {types.isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : types.isError ? (
        <Alert variant="error">{t('parties:typesLoadError')}</Alert>
      ) : !types.data?.length ? (
        <p className="text-sm text-charcoal-500">{t('parties:typesEmpty')}</p>
      ) : (
        <ul className="divide-y divide-line rounded-sm border border-line">
          {types.data.map((type) => (
            <li key={type.id} className="flex flex-col gap-3 p-3">
              {editing?.id === type.id ? (
                <PartyTypeForm
                  key={type.id}
                  initialName={type.name}
                  pending={update.isPending}
                  submitLabel={t('common:save')}
                  onSave={handleRename}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-ui text-sm font-semibold text-charcoal">
                    {type.name}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <IconButton
                      label={t('common:edit')}
                      variant="outlined"
                      size="sm"
                      onClick={() => {
                        setError(undefined)
                        setEditing(type)
                      }}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </IconButton>
                    <IconButton
                      label={t('common:delete')}
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setError(undefined)
                        setDeleting(type)
                      }}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </IconButton>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={t('parties:typeDeleteTitle', { name: deleting?.name ?? '' })}
        description={t('parties:typeDeleteBody')}
        confirmLabel={t('common:confirm')}
        cancelLabel={t('common:cancel')}
        pending={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
