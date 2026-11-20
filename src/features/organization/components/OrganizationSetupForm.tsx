import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { applyFieldErrors, AuthFormHeader, mapApiError } from 'src/features/auth'
import { useCreateOrganization } from 'src/features/organization/hooks/useCreateOrganization'
import {
  organizationSchema,
  type OrganizationValues,
} from 'src/features/organization/schemas/organization.schemas'
import { translate } from 'src/lib/i18n'

export function OrganizationSetupForm() {
  const { t } = useTranslation(['organization', 'errors', 'common'])
  const create = useCreateOrganization()
  const [alert, setAlert] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: '' },
  })

  function handleError(error: unknown) {
    const mapped = mapApiError(error)
    setAlert(translate(t, mapped.messageKey))
    applyFieldErrors(mapped, (field, fieldError) => {
      setError(field as keyof OrganizationValues, fieldError)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthFormHeader
        title={t('organization:setupTitle')}
        subtitle={t('organization:setupSubtitle')}
      />

      {alert ? <Alert variant="error">{alert}</Alert> : null}

      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setAlert(undefined)
          create.mutate({ name: values.name }, { onError: handleError })
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          id="organization-name"
          label={t('organization:name')}
          error={
            errors.name?.message ? translate(t, errors.name.message) : undefined
          }
        >
          {(describedBy) => (
            <Input
              id="organization-name"
              placeholder={t('organization:namePlaceholder')}
              autoComplete="organization"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy}
              {...register('name')}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" disabled={create.isPending}>
          {t('organization:create')}
        </Button>
      </form>
    </div>
  )
}
