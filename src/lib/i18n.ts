import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enCommon from 'src/locales/en/common.json'
import enAuth from 'src/locales/en/auth.json'
import enAttendance from 'src/locales/en/attendance.json'
import enDashboard from 'src/locales/en/dashboard.json'
import enEmployees from 'src/locales/en/employees.json'
import enErrors from 'src/locales/en/errors.json'
import enOrganization from 'src/locales/en/organization.json'
import enParties from 'src/locales/en/parties.json'
import enPartyTransactions from 'src/locales/en/partyTransactions.json'
import enTransactions from 'src/locales/en/transactions.json'
import neCommon from 'src/locales/ne/common.json'
import neAuth from 'src/locales/ne/auth.json'
import neAttendance from 'src/locales/ne/attendance.json'
import neDashboard from 'src/locales/ne/dashboard.json'
import neEmployees from 'src/locales/ne/employees.json'
import neErrors from 'src/locales/ne/errors.json'
import neOrganization from 'src/locales/ne/organization.json'
import neParties from 'src/locales/ne/parties.json'
import nePartyTransactions from 'src/locales/ne/partyTransactions.json'
import neTransactions from 'src/locales/ne/transactions.json'

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    attendance: enAttendance,
    dashboard: enDashboard,
    employees: enEmployees,
    errors: enErrors,
    organization: enOrganization,
    parties: enParties,
    partyTransactions: enPartyTransactions,
    transactions: enTransactions,
  },
  ne: {
    common: neCommon,
    auth: neAuth,
    attendance: neAttendance,
    dashboard: neDashboard,
    employees: neEmployees,
    errors: neErrors,
    organization: neOrganization,
    parties: neParties,
    partyTransactions: nePartyTransactions,
    transactions: neTransactions,
  },
} as const

export type AppResources = (typeof resources)['en']
export const supportedLanguages = ['en', 'ne'] as const
export type AppLanguage = (typeof supportedLanguages)[number]

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: AppResources
  }
}

const detector = new LanguageDetector()

detector.addDetector({
  name: 'furnivaDefault',
  lookup() {
    const language = typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase()
    return language.startsWith('ne') ? 'ne' : 'en'
  },
})

void i18n.use(detector).use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  ns: [
    'common',
    'auth',
    'attendance',
    'dashboard',
    'employees',
    'errors',
    'organization',
    'parties',
    'partyTransactions',
    'transactions',
  ],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'furnivaDefault'],
    lookupLocalStorage: 'lang',
    caches: [],
  },
})

export function syncDocumentLanguage(): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.resolvedLanguage ?? 'en'
  }
}

syncDocumentLanguage()

export function translate(t: (key: never) => unknown, key: string): string {
  const normalizedKey = key.includes(':') ? key : key.replace(/^([^.]+)\./, '$1:')
  return String(t(normalizedKey as never))
}

export default i18n
