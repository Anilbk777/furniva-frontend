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
import { Time12Picker } from 'src/features/attendance/components/Time12Picker'
import {
  attendanceSchema,
  toAttendanceFormOutput,
  type AttendanceFormOutput,
  type AttendanceValues,
} from 'src/features/attendance/schemas/attendance.schemas'
import {
  attendanceStatuses,
  noWorkStatuses,
  type AttendanceRecord,
  type AttendanceStatus,
} from 'src/features/attendance/types'
import { translate } from 'src/lib/i18n'

export interface AttendanceFormProps {
  employeeName: string
  defaultDate: string
  record?: AttendanceRecord
  pending?: boolean
  error?: string
  submitLabel?: string
  onSave: (input: AttendanceFormOutput) => void
  onCancel?: () => void
}

function recordStatus(record?: AttendanceRecord): AttendanceStatus {
  const status = record?.status as AttendanceStatus | undefined
  return status && attendanceStatuses.includes(status) ? status : 'present'
}

export function AttendanceForm({
  employeeName,
  defaultDate,
  record,
  pending = false,
  error,
  submitLabel,
  onSave,
  onCancel,
}: AttendanceFormProps) {
  const { t, i18n } = useTranslation(['attendance', 'errors', 'common'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      bs_date: record?.bs_date ?? defaultDate,
      status: recordStatus(record),
      check_in: record?.check_in ?? '',
      check_out: record?.check_out ?? '',
      overtime_hours: record ? String(record.overtime_hours ?? 0) : '0',
      note: record?.note ?? '',
    },
  })

  const status = useWatch({ control, name: 'status' })
  const isNoWork = noWorkStatuses.includes(status as AttendanceStatus)

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSave(toAttendanceFormOutput(values)))}
      className="flex flex-col gap-4"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <p className="text-sm text-charcoal-500">
        {t('attendance:formEmployee', { name: employeeName })}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="attendance-date"
          label={t('attendance:bsDate')}
          hint={t('attendance:bsDateHint')}
          error={fieldError(errors.bs_date?.message)}
        >
          {(describedBy) => (
            <Controller
              control={control}
              name="bs_date"
              render={({ field }) => (
                <BsDatePicker
                  id="attendance-date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  language={language}
                  openLabel={t('common:pickDate')}
                  placeholder="2083-08-15"
                  invalid={Boolean(errors.bs_date)}
                  describedBy={describedBy}
                />
              )}
            />
          )}
        </FormField>

        <FormField
          id="attendance-status"
          label={t('attendance:statusLabel')}
          error={fieldError(errors.status?.message)}
        >
          {(describedBy) => (
            <Select
              id="attendance-status"
              aria-describedby={describedBy}
              aria-invalid={errors.status ? true : undefined}
              {...register('status')}
            >
              {attendanceStatuses.map((value) => (
                <option key={value} value={value}>
                  {translate(t, `attendance.status.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        {!isNoWork ? (
          <>
            <FormField
              id="attendance-check-in"
              label={t('attendance:checkIn')}
              error={fieldError(errors.check_in?.message)}
            >
              {(describedBy) => (
                <Controller
                  control={control}
                  name="check_in"
                  render={({ field }) => (
                    <Time12Picker
                      id="attendance-check-in"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      invalid={Boolean(errors.check_in)}
                      describedBy={describedBy}
                    />
                  )}
                />
              )}
            </FormField>

            <FormField
              id="attendance-check-out"
              label={t('attendance:checkOut')}
              error={fieldError(errors.check_out?.message)}
            >
              {(describedBy) => (
                <Controller
                  control={control}
                  name="check_out"
                  render={({ field }) => (
                    <Time12Picker
                      id="attendance-check-out"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      invalid={Boolean(errors.check_out)}
                      describedBy={describedBy}
                    />
                  )}
                />
              )}
            </FormField>

            <FormField
              id="attendance-overtime"
              label={t('attendance:overtimeHours')}
              error={fieldError(errors.overtime_hours?.message)}
            >
              {(describedBy) => (
                <Input
                  id="attendance-overtime"
                  inputMode="decimal"
                  placeholder="0"
                  aria-invalid={errors.overtime_hours ? true : undefined}
                  aria-describedby={describedBy}
                  {...register('overtime_hours')}
                />
              )}
            </FormField>
          </>
        ) : (
          <p className="self-end rounded-sm bg-canvas-alt p-3 text-sm text-charcoal-500 sm:col-span-2">
            {t('attendance:noWorkHint')}
          </p>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="attendance-note">{t('attendance:note')}</Label>
          <textarea
            id="attendance-note"
            rows={3}
            maxLength={500}
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
          {submitLabel ?? t('attendance:create')}
        </Button>
        {onCancel ? (
          <Button
            type="button"
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
