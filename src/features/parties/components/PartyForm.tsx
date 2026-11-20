import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { Label } from 'src/components/ui/Label'
import { Select } from 'src/components/ui/Select'
import { Skeleton } from 'src/components/ui/Skeleton'
import {
  partySchema,
  toPartyInput,
  type PartyValues,
} from 'src/features/parties/schemas/party.schemas'
import { usePartyTypes } from 'src/features/parties/hooks/usePartyTypes'
import type { Party, PartyInput } from 'src/features/parties/types'
import { translate } from 'src/lib/i18n'

export interface PartyFormProps {
  party?: Party
  pending?: boolean
  error?: string
  onSave: (input: PartyInput) => void
  onCancel?: () => void
  submitLabel?: string
}

export function PartyForm({
  party,
  pending = false,
  error,
  onSave,
  onCancel,
  submitLabel,
}: PartyFormProps) {
  const { t } = useTranslation(['parties', 'errors', 'common'])
  const types = usePartyTypes()

  const {
    control,
    register,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PartyValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: party?.name ?? '',
      party_type_id: party?.party_type.id ?? '',
      phone: party?.phone ?? '',
      address: party?.address ?? '',
      note: party?.note ?? '',
    },
  })

  // Types load asynchronously, so preselect the first one for a new party.
  useEffect(() => {
    if (party) return
    const firstType = types.data?.[0]
    if (!firstType) return
    if (!getValues('party_type_id')) setValue('party_type_id', firstType.id)
  }, [party, types.data, getValues, setValue])

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  if (types.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
    )
  }

  if (!types.data?.length) {
    return <Alert variant="error">{t('parties:typesRequired')}</Alert>
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSave(toPartyInput(values)))}
      className="flex flex-col gap-4"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="party-name"
          label={t('parties:name')}
          error={fieldError(errors.name?.message)}
        >
          {(describedBy) => (
            <Input
              id="party-name"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy}
              {...register('name')}
            />
          )}
        </FormField>

        <FormField
          id="party-type"
          label={t('parties:type')}
          error={fieldError(errors.party_type_id?.message)}
        >
          {(describedBy) => (
            <Controller
              control={control}
              name="party_type_id"
              render={({ field }) => (
                <Select
                  id="party-type"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-describedby={describedBy}
                  aria-invalid={errors.party_type_id ? true : undefined}
                >
                  <option value="" disabled>
                    {t('parties:typePlaceholder')}
                  </option>
                  {types.data?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          )}
        </FormField>

        <FormField
          id="party-phone"
          label={t('parties:phone')}
          error={fieldError(errors.phone?.message)}
        >
          {(describedBy) => (
            <Input
              id="party-phone"
              type="tel"
              inputMode="tel"
              placeholder="98XXXXXXXX"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describedBy}
              {...register('phone')}
            />
          )}
        </FormField>

        <FormField
          id="party-address"
          label={t('parties:address')}
          error={fieldError(errors.address?.message)}
        >
          {(describedBy) => (
            <Input
              id="party-address"
              placeholder={t('parties:addressPlaceholder')}
              aria-invalid={errors.address ? true : undefined}
              aria-describedby={describedBy}
              {...register('address')}
            />
          )}
        </FormField>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="party-note">{t('parties:note')}</Label>
          <textarea
            id="party-note"
            rows={3}
            aria-invalid={errors.note ? true : undefined}
            className="w-full rounded-sm border border-line bg-card-alt px-3 py-2 text-base text-charcoal placeholder:text-charcoal-400 aria-invalid:border-danger"
            {...register('note')}
          />
          {errors.note?.message ? (
            <p role="alert" className="font-ui text-sm text-danger-700">
              {fieldError(errors.note.message)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          {submitLabel ?? t('common:save')}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            {t('common:cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
