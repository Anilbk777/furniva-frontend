import { Controller, useForm } from 'react-hook-form'
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
  toTransactionInput,
  transactionSchema,
  type TransactionValues,
} from 'src/features/employees/schemas/transaction.schemas'
import {
  employeeTxKinds,
  paymentMethods,
  type Transaction,
  type TransactionInput,
} from 'src/features/employees/types'
import { translate } from 'src/lib/i18n'

export interface TransactionFormProps {
  employeeId: string
  defaultDate: string
  transaction?: Transaction
  pending?: boolean
  error?: string
  submitLabel?: string
  onSave: (input: TransactionInput) => void
  onCancel?: () => void
}

export function TransactionForm({
  employeeId,
  defaultDate,
  transaction,
  pending = false,
  error,
  submitLabel,
  onSave,
  onCancel,
}: TransactionFormProps) {
  const { t, i18n } = useTranslation(['transactions', 'employees', 'errors', 'common'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      kind:
        transaction?.kind === 'employee_salary'
          ? 'employee_salary'
          : 'employee_advance',
      bs_date: transaction?.bs_date ?? defaultDate,
      amount: transaction ? String(transaction.amount) : '',
      payment_method: (transaction?.payment_method ??
        'cash') as TransactionValues['payment_method'],
      note: transaction?.note ?? '',
    },
  })

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        onSave(toTransactionInput(values, employeeId)),
      )}
      className="flex flex-col gap-4"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="tx-kind"
          label={t("transactions:kind")}
          error={fieldError(errors.kind?.message)}
        >
          {(describedBy) => (
            <Select
              id="tx-kind"
              aria-describedby={describedBy}
              {...register("kind")}
            >
              {employeeTxKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {translate(t, `employees.kinds.${kind}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          id="tx-date"
          label={t("transactions:bsDate")}
          hint={t("transactions:bsDateHint")}
          error={fieldError(errors.bs_date?.message)}
        >
          {(describedBy) => (
            <Controller
              control={control}
              name="bs_date"
              render={({ field }) => (
                <BsDatePicker
                  id="tx-date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  language={language}
                  openLabel={t("common:pickDate")}
                  placeholder="2083-08-03"
                  invalid={Boolean(errors.bs_date)}
                  describedBy={describedBy}
                />
              )}
            />
          )}
        </FormField>

        <FormField
          id="tx-amount"
          label={t("transactions:amount")}
          error={fieldError(errors.amount?.message)}
        >
          {(describedBy) => (
            <Input
              id="tx-amount"
              inputMode="decimal"
              placeholder="0.00"
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={describedBy}
              {...register("amount")}
            />
          )}
        </FormField>

        <FormField
          id="tx-method"
          label={t("transactions:paymentMethod")}
          error={fieldError(errors.payment_method?.message)}
        >
          {(describedBy) => (
            <Select
              id="tx-method"
              aria-describedby={describedBy}
              {...register("payment_method")}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {translate(t, `employees.paymentMethods.${method}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="tx-note">{t("transactions:note")}</Label>
          <textarea
            id="tx-note"
            rows={3}
            aria-invalid={errors.note ? true : undefined}
            className="w-full rounded-sm border border-line bg-card-alt px-3 py-2 text-base text-charcoal placeholder:text-charcoal-400 aria-invalid:border-danger"
            {...register("note")}
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
          {submitLabel ?? t("transactions:create")}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            {t("common:cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
