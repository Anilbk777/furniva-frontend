import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { BsDatePicker } from 'src/components/ui/BsDatePicker'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { Label } from 'src/components/ui/Label'
import { Select } from 'src/components/ui/Select'
import {
  partyTransactionSchema,
  toPartyTransactionInput,
  type PartyTransactionValues,
} from 'src/features/parties/schemas/partyTransaction.schemas'
import {
  partyPaymentRule,
  partyTxKinds,
  paymentMethods,
  type PartyTransactionInput,
  type Transaction,
} from 'src/features/parties/types'
import { translate } from 'src/lib/i18n'

export interface PartyTransactionFormProps {
  partyId: string
  defaultDate: string
  transaction?: Transaction
  pending?: boolean
  error?: string
  submitLabel?: string
  onSave: (input: PartyTransactionInput) => void
  onCancel?: () => void
}

function defaultPaymentMethod(transaction?: Transaction): PartyTransactionValues['payment_method'] {
  if (!transaction) return 'cash'
  if (transaction.payment_method) {
    return transaction.payment_method as PartyTransactionValues['payment_method']
  }
  return 'none'
}

export function PartyTransactionForm({
  partyId,
  defaultDate,
  transaction,
  pending = false,
  error,
  submitLabel,
  onSave,
  onCancel,
}: PartyTransactionFormProps) {
  const { t, i18n } = useTranslation([
    'partyTransactions',
    'parties',
    'errors',
    'common',
  ])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartyTransactionValues>({
    resolver: zodResolver(partyTransactionSchema),
    defaultValues: {
      kind: (transaction?.kind as PartyTransactionValues['kind']) ?? 'credit_sale',
      bs_date: transaction?.bs_date ?? defaultDate,
      amount: transaction ? String(transaction.amount) : '',
      payment_method: defaultPaymentMethod(transaction),
      note: transaction?.note ?? '',
    },
  })

  const kind = useWatch({ control, name: 'kind' })
  const paymentRule = partyPaymentRule[kind]

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        onSave(toPartyTransactionInput(values, partyId)),
      )}
      className="flex flex-col gap-4"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="party-tx-kind"
          label={t('partyTransactions:kind')}
          error={fieldError(errors.kind?.message)}
        >
          {(describedBy) => (
            <Select id="party-tx-kind" aria-describedby={describedBy} {...register('kind')}>
              {partyTxKinds.map((value) => (
                <option key={value} value={value}>
                  {translate(t, `parties.kinds.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          id="party-tx-date"
          label={t('partyTransactions:bsDate')}
          hint={t('partyTransactions:bsDateHint')}
          error={fieldError(errors.bs_date?.message)}
        >
          {(describedBy) => (
            <Controller
              control={control}
              name="bs_date"
              render={({ field }) => (
                <BsDatePicker
                  id="party-tx-date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  language={language}
                  openLabel={t('common:pickDate')}
                  placeholder="2083-08-03"
                  invalid={Boolean(errors.bs_date)}
                  describedBy={describedBy}
                />
              )}
            />
          )}
        </FormField>

        <FormField
          id="party-tx-amount"
          label={t('partyTransactions:amount')}
          error={fieldError(errors.amount?.message)}
        >
          {(describedBy) => (
            <Input
              id="party-tx-amount"
              inputMode="decimal"
              placeholder="0.00"
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={describedBy}
              {...register('amount')}
            />
          )}
        </FormField>

        {paymentRule === 'forbidden' ? null : (
          <FormField
            id="party-tx-method"
            label={t('partyTransactions:paymentMethod')}
            error={fieldError(errors.payment_method?.message)}
          >
            {(describedBy) => (
              <Select
                id="party-tx-method"
                aria-describedby={describedBy}
                aria-invalid={errors.payment_method ? true : undefined}
                {...register('payment_method')}
              >
                {paymentRule === 'optional' ? (
                  <option value="none">{t('partyTransactions:noPaymentMethod')}</option>
                ) : null}
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {translate(t, `parties.paymentMethods.${method}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="party-tx-note">{t('partyTransactions:note')}</Label>
          <textarea
            id="party-tx-note"
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
          {submitLabel ?? t('partyTransactions:create')}
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
