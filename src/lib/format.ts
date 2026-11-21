const localeByLanguage = {
  en: 'en-US',
  ne: 'ne-NP',
} as const

export function formatDate(value: string | null, language: 'en' | 'ne'): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(localeByLanguage[language], {
    calendar: 'gregory',
    dateStyle: 'medium',
  }).format(date)
}

export function formatNumber(
  value: number | string | null,
  language: 'en' | 'ne',
  maximumFractionDigits = 2,
): string {
  if (value === null || value === '') return '—'
  const amount = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat(localeByLanguage[language], {
    maximumFractionDigits,
  }).format(amount)
}

export function formatMoney(value: number | string | null, language: 'en' | 'ne'): string {
  if (value === null || value === '') return '—'
  const amount = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat(localeByLanguage[language], {
    style: 'currency',
    currency: 'NPR',
    // currency: 'रु',
    maximumFractionDigits: 2,
  }).format(amount)
}
