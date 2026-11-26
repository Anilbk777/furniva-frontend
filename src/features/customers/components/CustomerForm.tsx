import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { Label } from 'src/components/ui/Label'
import { Select } from 'src/components/ui/Select'
import {
  customerSchema,
  toCustomerInput,
  type CustomerValues,
} from 'src/features/customers/schemas/customer.schemas'
import { customerTypes, type Customer, type CustomerInput } from 'src/features/customers/types'
import { translate } from 'src/lib/i18n'

export interface CustomerFormProps {
  customer?: Customer
  pending?: boolean
  error?: string
  onSave: (input: CustomerInput) => void
  onCancel?: () => void
  submitLabel?: string
}

export function CustomerForm({
  customer,
  pending = false,
  error,
  onSave,
  onCancel,
  submitLabel,
}: CustomerFormProps) {
  const { t } = useTranslation(['customers', 'errors', 'common'])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_type: customer?.customer_type ?? 'individual',
      name: customer?.name ?? '',
      mobile: customer?.mobile ?? '',
      alt_phone: customer?.alt_phone ?? '',
      city_area: customer?.city_area ?? '',
      landmark: customer?.landmark ?? '',
      opening_balance: customer ? String(customer.opening_balance ?? 0) : '0',
      khata_note: customer?.khata_note ?? '',
    },
  })

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSave(toCustomerInput(values)))}
      className="flex flex-col gap-4"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="customer-name"
          label={t('customers:name')}
          error={fieldError(errors.name?.message)}
        >
          {(describedBy) => (
            <Input
              id="customer-name"
              autoComplete="name"
              placeholder={t('customers:namePlaceholder')}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy}
              {...register('name')}
            />
          )}
        </FormField>

        <FormField
          id="customer-type"
          label={t('customers:type')}
          error={fieldError(errors.customer_type?.message)}
        >
          {(describedBy) => (
            <Controller
              control={control}
              name="customer_type"
              render={({ field }) => (
                <Select
                  id="customer-type"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-describedby={describedBy}
                  aria-invalid={errors.customer_type ? true : undefined}
                >
                  {customerTypes.map((type) => (
                    <option key={type} value={type}>
                      {translate(t, `customers.types.${type}`)}
                    </option>
                  ))}
                </Select>
              )}
            />
          )}
        </FormField>

        <FormField
          id="customer-mobile"
          label={t('customers:mobile')}
          error={fieldError(errors.mobile?.message)}
        >
          {(describedBy) => (
            <Input
              id="customer-mobile"
              type="tel"
              inputMode="tel"
              placeholder="98XXXXXXXX"
              aria-invalid={errors.mobile ? true : undefined}
              aria-describedby={describedBy}
              {...register('mobile')}
            />
          )}
        </FormField>

        <FormField
          id="customer-alt-phone"
          label={t('customers:altPhone')}
          error={fieldError(errors.alt_phone?.message)}
        >
          {(describedBy) => (
            <Input
              id="customer-alt-phone"
              type="tel"
              inputMode="tel"
              placeholder="98XXXXXXXX"
              aria-invalid={errors.alt_phone ? true : undefined}
              aria-describedby={describedBy}
              {...register('alt_phone')}
            />
          )}
        </FormField>

        <FormField
          id="customer-area"
          label={t('customers:cityArea')}
          error={fieldError(errors.city_area?.message)}
        >
          {(describedBy) => (
            <Input
              id="customer-area"
              placeholder={t('customers:cityAreaPlaceholder')}
              aria-invalid={errors.city_area ? true : undefined}
              aria-describedby={describedBy}
              {...register('city_area')}
            />
          )}
        </FormField>

        <FormField
          id="customer-landmark"
          label={t('customers:landmark')}
          error={fieldError(errors.landmark?.message)}
        >
          {(describedBy) => (
            <Input
              id="customer-landmark"
              placeholder={t('customers:landmarkPlaceholder')}
              aria-invalid={errors.landmark ? true : undefined}
              aria-describedby={describedBy}
              {...register('landmark')}
            />
          )}
        </FormField>

        <FormField
          id="customer-opening-balance"
          label={t('customers:openingBalance')}
          error={fieldError(errors.opening_balance?.message)}
        >
          {(describedBy) => (
            <Input
              id="customer-opening-balance"
              inputMode="decimal"
              placeholder="0"
              aria-invalid={errors.opening_balance ? true : undefined}
              aria-describedby={describedBy}
              {...register('opening_balance')}
            />
          )}
        </FormField>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="customer-note">{t('customers:khataNote')}</Label>
          <textarea
            id="customer-note"
            rows={3}
            aria-invalid={errors.khata_note ? true : undefined}
            className="w-full rounded-sm border border-line bg-card-alt px-3 py-2 text-base text-charcoal placeholder:text-charcoal-400 aria-invalid:border-danger"
            {...register('khata_note')}
          />
          {errors.khata_note?.message ? (
            <p role="alert" className="font-ui text-sm text-danger-700">
              {fieldError(errors.khata_note.message)}
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
