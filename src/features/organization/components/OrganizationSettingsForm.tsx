import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { applyFieldErrors, mapApiError } from 'src/features/auth'
import { useUpdateOrganization } from 'src/features/organization/hooks/useUpdateOrganization'
import {
  organizationSchema,
  type OrganizationValues,
} from 'src/features/organization/schemas/organization.schemas'
import { translate } from 'src/lib/i18n'

export interface OrganizationSettingsFormProps {
  initialName: string
}

export function OrganizationSettingsForm({ initialName }: OrganizationSettingsFormProps) {
  const { t } = useTranslation(['organization', 'errors', 'common'])
  const update = useUpdateOrganization()
  const [alert, setAlert] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: initialName },
  })

  function handleError(error: unknown) {
    const mapped = mapApiError(error)
    setAlert(translate(t, mapped.messageKey))
    applyFieldErrors(mapped, (field, fieldError) => {
      setError(field as keyof OrganizationValues, fieldError)
    })
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setAlert(undefined)
        update.mutate({ name: values.name }, { onError: handleError })
      })}
      className="flex flex-col gap-4"
    >
      {alert ? <Alert variant="error">{alert}</Alert> : null}
      <FormField
        id="organization-settings-name"
        label={t('organization:name')}
        error={errors.name?.message ? translate(t, errors.name.message) : undefined}
      >
        {(describedBy) => (
          <Input
            id="organization-settings-name"
            autoComplete="organization"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy}
            {...register('name')}
          />
        )}
      </FormField>
      <Button type="submit" className="self-start" disabled={update.isPending}>
        {t('common:save')}
      </Button>
    </form>
  )
}
