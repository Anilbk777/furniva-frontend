import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import {
  partyTypeSchema,
  type PartyTypeValues,
} from 'src/features/parties/schemas/partyType.schemas'
import { translate } from 'src/lib/i18n'

export interface PartyTypeFormProps {
  initialName?: string
  pending?: boolean
  submitLabel?: string
  onSave: (name: string) => void
  onCancel?: () => void
}

export function PartyTypeForm({
  initialName = '',
  pending = false,
  submitLabel,
  onSave,
  onCancel,
}: PartyTypeFormProps) {
  const { t } = useTranslation(['parties', 'errors', 'common'])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartyTypeValues>({
    resolver: zodResolver(partyTypeSchema),
    defaultValues: { name: initialName },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSave(values.name.trim()))}
      className="flex flex-col gap-3"
    >
      <FormField
        id="party-type-name"
        label={t('parties:typeName')}
        error={errors.name?.message ? translate(t, errors.name.message) : undefined}
      >
        {(describedBy) => (
          <Input
            id="party-type-name"
            placeholder={t('parties:typeNamePlaceholder')}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy}
            {...register('name')}
          />
        )}
      </FormField>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" loading={pending}>
          {submitLabel ?? t('parties:addType')}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            {t('common:cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
