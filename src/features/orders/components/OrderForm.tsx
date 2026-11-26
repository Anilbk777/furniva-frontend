import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { BsDatePicker } from 'src/components/ui/BsDatePicker'
import { Button } from 'src/components/ui/Button'
import { FormField } from 'src/components/ui/FormField'
import { IconButton } from 'src/components/ui/IconButton'
import { Input } from 'src/components/ui/Input'
import { Label } from 'src/components/ui/Label'
import { SearchInput } from 'src/components/ui/SearchInput'
import { Select } from 'src/components/ui/Select'
import { Skeleton } from 'src/components/ui/Skeleton'
import { Time12Picker } from 'src/components/ui/Time12Picker'
import { useCustomer, useCustomers } from 'src/features/customers'
import {
  orderSchema,
  toOrderInput,
  type OrderValues,
} from 'src/features/orders/schemas/order.schemas'
import {
  MAX_ORDER_PHOTOS,
  handoverTypes,
  orderPaymentMethods,
  orderPriorities,
  type Order,
  type OrderInput,
} from 'src/features/orders/types'
import { cn } from 'src/lib/cn'
import { formatMoney } from 'src/lib/format'
import { translate } from 'src/lib/i18n'

type CustomerMode = 'existing' | 'walk-in'

function defaults(order?: Order): OrderValues {
  return {
    title: order?.title ?? '',
    category: order?.category ?? '',
    description: order?.description ?? '',
    hardwood_species: order?.hardwood_species ?? '',
    total_amount: order ? String(order.total_amount) : '',
    advance_amount: order ? String(order.advance_amount) : '0',
    payment_method: order?.payment_method ?? '',
    delivery_bs_date: order?.delivery_bs_date ?? '',
    delivery_time: order?.delivery_time ?? '',
    priority: order?.priority ?? 'standard',
    handover_type: order?.handover_type ?? 'site_delivery',
    delivery_address: order?.delivery_address ?? '',
    customer_id: order?.customer_id ?? '',
    customer_name: order?.customer_name ?? '',
    customer_type: order?.customer_type ?? 'individual',
    customer_mobile: order?.customer_mobile ?? '',
    customer_city_area: order?.customer_city_area ?? '',
    customer_landmark: order?.customer_landmark ?? '',
  }
}

export interface OrderFormProps {
  order?: Order
  defaultCustomerId?: string
  pending?: boolean
  error?: string
  onSave: (input: OrderInput) => void
  onCancel?: () => void
  submitLabel?: string
}

export function OrderForm({
  order,
  defaultCustomerId,
  pending = false,
  error,
  onSave,
  onCancel,
  submitLabel,
}: OrderFormProps) {
  const { t, i18n } = useTranslation(['orders', 'customers', 'errors', 'common'])
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  const [photos, setPhotos] = useState<string[]>(order?.photos ?? [])
  const [photoInput, setPhotoInput] = useState('')
  const [photoError, setPhotoError] = useState<string | undefined>()
  const [customerMode, setCustomerMode] = useState<CustomerMode>(() =>
    order?.customer_id || defaultCustomerId ? 'existing' : 'walk-in',
  )

  const {
    control,
    register,
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      ...defaults(order),
      customer_id: order?.customer_id ?? defaultCustomerId ?? '',
    },
  })

  const advance = Number(useWatch({ control, name: 'advance_amount' }) || 0)
  const total = Number(useWatch({ control, name: 'total_amount' }) || 0)
  const handover = useWatch({ control, name: 'handover_type' })
  const remaining = Number.isFinite(total - advance) ? total - advance : 0

  function fieldError(message?: string): string | undefined {
    return message ? translate(t, message) : undefined
  }

  function addPhoto(): void {
    const value = photoInput.trim()
    if (!value) return
    if (value.length > 500) {
      setPhotoError(translate(t, 'errors.orderPhotoInvalid'))
      return
    }
    if (photos.includes(value)) {
      setPhotoError(translate(t, 'errors.orderPhotoDuplicate'))
      return
    }
    if (photos.length >= MAX_ORDER_PHOTOS) {
      setPhotoError(translate(t, 'errors.orderPhotoLimit'))
      return
    }
    setPhotos((current) => [...current, value])
    setPhotoInput('')
    setPhotoError(undefined)
  }

  function changeCustomerMode(mode: CustomerMode): void {
    setCustomerMode(mode)
    clearErrors(['customer_id', 'customer_name', 'customer_type', 'customer_mobile'])
    if (mode === 'walk-in') setValue('customer_id', '')
  }

  function submit(values: OrderValues): void {
    onSave(toOrderInput(values, photos))
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        if (customerMode === 'existing' && !getValues('customer_id').trim()) {
          event.preventDefault()
          setError('customer_id', {
            type: 'manual',
            message: 'errors.orderCustomerRequired',
          })
          return
        }
        void handleSubmit(submit)(event)
      }}
      className="flex flex-col gap-6"
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
          {t('orders:sections.item')}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="order-title"
            label={t('orders:itemTitle')}
            error={fieldError(errors.title?.message)}
          >
            {(describedBy) => (
              <Input
                id="order-title"
                placeholder={t('orders:titlePlaceholder')}
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={describedBy}
                {...register('title')}
              />
            )}
          </FormField>

          <FormField
            id="order-category"
            label={t('orders:category')}
            error={fieldError(errors.category?.message)}
          >
            {(describedBy) => (
              <Input
                id="order-category"
                placeholder={t('orders:categoryPlaceholder')}
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={describedBy}
                {...register('category')}
              />
            )}
          </FormField>

          <FormField
            id="order-hardwood"
            label={t('orders:hardwoodSpecies')}
            error={fieldError(errors.hardwood_species?.message)}
          >
            {(describedBy) => (
              <Input
                id="order-hardwood"
                placeholder={t('orders:hardwoodPlaceholder')}
                aria-invalid={errors.hardwood_species ? true : undefined}
                aria-describedby={describedBy}
                {...register('hardwood_species')}
              />
            )}
          </FormField>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="order-description">{t('orders:description')}</Label>
            <textarea
              id="order-description"
              rows={3}
              placeholder={t('orders:descriptionPlaceholder')}
              aria-invalid={errors.description ? true : undefined}
              className="w-full rounded-sm border border-line bg-card-alt px-3 py-2 text-base text-charcoal placeholder:text-charcoal-400 aria-invalid:border-danger"
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="order-photo-input">{t('orders:photos')}</Label>
          <p className="font-ui text-xs text-charcoal-500">
            {t('orders:photosHint', { max: MAX_ORDER_PHOTOS })}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="order-photo-input"
              value={photoInput}
              onChange={(event) => {
                setPhotoInput(event.target.value)
                if (photoError) setPhotoError(undefined)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addPhoto()
                }
              }}
              placeholder={t('orders:photoPlaceholder')}
              aria-invalid={photoError ? true : undefined}
              aria-describedby={photoError ? 'order-photo-error' : undefined}
              className="sm:flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addPhoto}
              disabled={photos.length >= MAX_ORDER_PHOTOS}
            >
              <Plus aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{t('orders:addPhoto')}</span>
            </Button>
          </div>
          {photoError ? (
            <p id="order-photo-error" role="alert" className="font-ui text-sm text-danger-700">
              {photoError}
            </p>
          ) : null}
          {photos.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {photos.map((photo, index) => (
                <li
                  key={`${photo}-${index}`}
                  className="flex items-center gap-2 rounded-sm border border-line bg-card-alt px-3 py-1.5"
                >
                  <span className="min-w-0 flex-1 truncate font-ui text-xs text-charcoal-500">
                    {photo}
                  </span>
                  <IconButton
                    label={t('orders:removePhoto', { number: index + 1 })}
                    variant="outlined"
                    size="icon"
                    className="size-9 min-h-9 shrink-0"
                    onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-5">
        <legend className="mb-1 font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
          {t('orders:sections.money')}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="order-total"
            label={t('orders:totalAmount')}
            error={fieldError(errors.total_amount?.message)}
          >
            {(describedBy) => (
              <Input
                id="order-total"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={errors.total_amount ? true : undefined}
                aria-describedby={describedBy}
                {...register('total_amount')}
              />
            )}
          </FormField>

          <FormField
            id="order-advance"
            label={t('orders:advanceAmount')}
            error={fieldError(errors.advance_amount?.message)}
            hint={
              total > 0 && remaining >= 0
                ? t('orders:remainingHint', {
                    amount: formatMoney(remaining, language),
                  })
                : undefined
            }
          >
            {(describedBy) => (
              <Input
                id="order-advance"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={errors.advance_amount ? true : undefined}
                aria-describedby={describedBy}
                {...register('advance_amount')}
              />
            )}
          </FormField>

          {advance > 0 ? (
            <FormField
              id="order-payment-method"
              label={t('orders:paymentMethod')}
              error={fieldError(errors.payment_method?.message)}
            >
              {(describedBy) => (
                <Controller
                  control={control}
                  name="payment_method"
                  render={({ field }) => (
                    <Select
                      id="order-payment-method"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={errors.payment_method ? true : undefined}
                      aria-describedby={describedBy}
                    >
                      <option value="">{t('orders:paymentMethodPlaceholder')}</option>
                      {orderPaymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {translate(t, `orders.paymentMethods.${method}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </FormField>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-5">
        <legend className="mb-1 font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
          {t('orders:sections.delivery')}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="order-delivery-date"
            label={t('orders:deliveryDate')}
            error={fieldError(errors.delivery_bs_date?.message)}
          >
            {(describedBy) => (
              <Controller
                control={control}
                name="delivery_bs_date"
                render={({ field }) => (
                  <BsDatePicker
                    id="order-delivery-date"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    language={language}
                    openLabel={t('common:pickDate')}
                    placeholder="2083-08-15"
                    invalid={Boolean(errors.delivery_bs_date)}
                    describedBy={describedBy}
                  />
                )}
              />
            )}
          </FormField>

          <FormField
            id="order-delivery-time"
            label={t('orders:deliveryTime')}
            error={fieldError(errors.delivery_time?.message)}
          >
            {(describedBy) => (
              <Controller
                control={control}
                name="delivery_time"
                render={({ field }) => (
                  <Time12Picker
                    id="order-delivery-time"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={Boolean(errors.delivery_time)}
                    describedBy={describedBy}
                  />
                )}
              />
            )}
          </FormField>

          <FormField
            id="order-priority"
            label={t('orders:priority')}
            error={fieldError(errors.priority?.message)}
          >
            {(describedBy) => (
              <Select
                id="order-priority"
                aria-invalid={errors.priority ? true : undefined}
                aria-describedby={describedBy}
                {...register('priority')}
              >
                {orderPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {translate(t, `orders.priorities.${priority}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField
            id="order-handover"
            label={t('orders:handoverType')}
            error={fieldError(errors.handover_type?.message)}
          >
            {(describedBy) => (
              <Select
                id="order-handover"
                aria-invalid={errors.handover_type ? true : undefined}
                aria-describedby={describedBy}
                {...register('handover_type')}
              >
                {handoverTypes.map((type) => (
                  <option key={type} value={type}>
                    {translate(t, `orders.handovers.${type}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          {handover === 'site_delivery' ? (
            <div className="sm:col-span-2">
              <FormField
                id="order-delivery-address"
                label={t('orders:deliveryAddress')}
                error={fieldError(errors.delivery_address?.message)}
              >
                {(describedBy) => (
                  <Input
                    id="order-delivery-address"
                    placeholder={t('orders:deliveryAddressPlaceholder')}
                    aria-invalid={errors.delivery_address ? true : undefined}
                    aria-describedby={describedBy}
                    {...register('delivery_address')}
                  />
                )}
              </FormField>
            </div>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-5">
        <legend className="mb-1 font-ui text-xs font-semibold uppercase tracking-wide text-charcoal-400">
          {t('orders:sections.customer')}
        </legend>

        <div
          role="group"
          aria-label={t('orders:customerSection')}
          className="grid grid-cols-2 rounded-sm border border-line bg-card-alt p-0.5"
        >
          {(['existing', 'walk-in'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={customerMode === mode}
              onClick={() => changeCustomerMode(mode)}
              className={cn(
                'min-h-11 whitespace-nowrap rounded-[3px] px-2 font-ui text-xs font-semibold transition-colors',
                customerMode === mode
                  ? 'bg-primary text-white'
                  : 'text-charcoal hover:bg-charcoal-100',
              )}
            >
              {mode === 'existing' ? t('orders:existingCustomer') : t('orders:walkIn')}
            </button>
          ))}
        </div>

        {customerMode === 'existing' ? (
          <Controller
            control={control}
            name="customer_id"
            render={({ field }) => (
              <CustomerPicker
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  if (value) clearErrors('customer_id')
                }}
                invalid={Boolean(errors.customer_id)}
                describedBy={errors.customer_id ? 'order-customer-error' : undefined}
              />
            )}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="order-customer-name"
              label={t('orders:customerName')}
              error={fieldError(errors.customer_name?.message)}
            >
              {(describedBy) => (
                <Input
                  id="order-customer-name"
                  aria-invalid={errors.customer_name ? true : undefined}
                  aria-describedby={describedBy}
                  {...register('customer_name')}
                />
              )}
            </FormField>

            <FormField
              id="order-customer-type"
              label={t('orders:customerType')}
              error={fieldError(errors.customer_type?.message)}
            >
              {(describedBy) => (
                <Select
                  id="order-customer-type"
                  aria-invalid={errors.customer_type ? true : undefined}
                  aria-describedby={describedBy}
                  {...register('customer_type')}
                >
                  {(['individual', 'business', 'contractor'] as const).map((type) => (
                    <option key={type} value={type}>
                      {translate(t, `customers.types.${type}`)}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField
              id="order-customer-mobile"
              label={t('orders:customerMobile')}
              error={fieldError(errors.customer_mobile?.message)}
            >
              {(describedBy) => (
                <Input
                  id="order-customer-mobile"
                  type="tel"
                  inputMode="tel"
                  placeholder="98XXXXXXXX"
                  aria-invalid={errors.customer_mobile ? true : undefined}
                  aria-describedby={describedBy}
                  {...register('customer_mobile')}
                />
              )}
            </FormField>

            <FormField
              id="order-customer-area"
              label={t('orders:customerCityArea')}
              error={fieldError(errors.customer_city_area?.message)}
            >
              {(describedBy) => (
                <Input
                  id="order-customer-area"
                  aria-invalid={errors.customer_city_area ? true : undefined}
                  aria-describedby={describedBy}
                  {...register('customer_city_area')}
                />
              )}
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                id="order-customer-landmark"
                label={t('orders:customerLandmark')}
                error={fieldError(errors.customer_landmark?.message)}
              >
                {(describedBy) => (
                  <Input
                    id="order-customer-landmark"
                    aria-invalid={errors.customer_landmark ? true : undefined}
                    aria-describedby={describedBy}
                    {...register('customer_landmark')}
                  />
                )}
              </FormField>
            </div>
          </div>
        )}

        {errors.customer_id?.message ? (
          <p id="order-customer-error" role="alert" className="font-ui text-sm text-danger-700">
            {fieldError(errors.customer_id.message)}
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button type="submit" loading={pending}>
          {submitLabel ?? t('orders:create')}
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

function CustomerPicker({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
}) {
  const { t } = useTranslation(['orders', 'customers'])
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const customers = useCustomers({ search: debounced || undefined, page: 1, limit: 20 })
  const selected = useCustomer(value || undefined)
  const rows = customers.data?.customers ?? []

  if (value) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 rounded-sm border border-line bg-card-alt p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-ui text-sm font-semibold text-charcoal">
              {selected.data?.name ?? '…'}
            </p>
            {selected.data ? (
              <p className="mt-0.5 truncate font-ui text-xs text-charcoal-500">
                {selected.data.mobile} ·{' '}
                {translate(t, `customers.types.${selected.data.customer_type}`)}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => onChange('')}
          >
            {t('orders:changeCustomer')}
          </Button>
        </div>
        {invalid ? (
          <p
            id="order-customer-error"
            role="alert"
            className="font-ui text-sm text-danger-700"
          >
            {t('orders:selectCustomer')}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('orders:searchCustomer')}
        aria-label={t('orders:searchCustomer')}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
      />
      {customers.isLoading ? (
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-sm border border-line bg-card-alt p-3 font-ui text-sm text-charcoal-500">
          {t('orders:noCustomersFound')}
        </p>
      ) : (
        <ul className="max-h-56 divide-y divide-line overflow-y-auto rounded-sm border border-line">
          {rows.map((customer) => (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => onChange(customer.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-card-alt focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
              >
                <span className="min-w-0">
                  <span className="block truncate font-ui text-sm font-semibold text-charcoal">
                    {customer.name}
                  </span>
                  <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-500">
                    {customer.mobile}
                    {customer.city_area ? ` · ${customer.city_area}` : ''}
                  </span>
                </span>
                <span className="shrink-0 rounded-pill bg-canvas-alt px-2 py-0.5 font-ui text-[10px] font-semibold text-charcoal-500">
                  {translate(t, `customers.types.${customer.customer_type}`)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
