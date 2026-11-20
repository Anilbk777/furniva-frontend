import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { BsDatePicker } from 'src/components/ui/BsDatePicker'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { Input } from 'src/components/ui/Input'
import { Label } from 'src/components/ui/Label'
import {
  employeeSchema,
  toEmployeeInput,
  type EmployeeValues,
} from 'src/features/employees/schemas/employee.schemas'
import type { Employee, EmployeeInput } from 'src/features/employees/types'
import { translate } from 'src/lib/i18n'

export interface EmployeeFormProps {
  employee?: Employee
  pending?: boolean
  error?: string
  onSave: (input: EmployeeInput) => void
  onCancel?: () => void
  submitLabel?: string
}

export function EmployeeForm({
  employee,
  pending = false,
  error,
  onSave,
  onCancel,
  submitLabel,
}: EmployeeFormProps) {
  const { t, i18n } = useTranslation(['employees', 'errors', 'common'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name ?? '',
      phone: employee?.phone ?? '',
      role_title: employee?.role_title ?? '',
      monthly_salary:
        employee?.monthly_salary !== null && employee?.monthly_salary !== undefined
          ? String(employee.monthly_salary)
          : '',
      joined_date_bs: employee?.joined_date_bs ?? '',
      note: employee?.note ?? '',
    },
  })

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSave(toEmployeeInput(values)))}
      className="flex flex-col gap-4"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="employee-name"
          label={t("employees:name")}
          error={fieldError(errors.name?.message)}
        >
          {(describedBy) => (
            <Input
              id="employee-name"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy}
              {...register("name")}
            />
          )}
        </FormField>

        <FormField
          id="employee-phone"
          label={t("employees:phone")}
          error={fieldError(errors.phone?.message)}
        >
          {(describedBy) => (
            <Input
              id="employee-phone"
              type="tel"
              inputMode="tel"
              placeholder="98XXXXXXXX"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describedBy}
              {...register("phone")}
            />
          )}
        </FormField>

        <FormField
          id="employee-role"
          label={t("employees:roleTitle")}
          error={fieldError(errors.role_title?.message)}
        >
          {(describedBy) => (
            <Input
              id="employee-role"
              placeholder={t("employees:rolePlaceholder")}
              aria-invalid={errors.role_title ? true : undefined}
              aria-describedby={describedBy}
              {...register("role_title")}
            />
          )}
        </FormField>

        <FormField
          id="employee-salary"
          label={t("employees:monthlySalary")}
          error={fieldError(errors.monthly_salary?.message)}
        >
          {(describedBy) => (
            <Input
              id="employee-salary"
              inputMode="decimal"
              placeholder="0.00"
              aria-invalid={errors.monthly_salary ? true : undefined}
              aria-describedby={describedBy}
              {...register("monthly_salary")}
            />
          )}
        </FormField>

        <FormField
          id="employee-joined"
          label={t("employees:joinedDate")}
          hint={t("employees:joinedDateHint")}
          error={fieldError(errors.joined_date_bs?.message)}
        >
          {(describedBy) => (
            <Controller
              control={control}
              name="joined_date_bs"
              render={({ field }) => (
                <BsDatePicker
                  id="employee-joined"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  language={language}
                  openLabel={t("common:pickDate")}
                  placeholder="2083-01-15"
                  invalid={Boolean(errors.joined_date_bs)}
                  describedBy={describedBy}
                />
              )}
            />
          )}
        </FormField>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="employee-note">{t("employees:note")}</Label>
          <textarea
            id="employee-note"
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
          {submitLabel ?? t("common:save")}
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
