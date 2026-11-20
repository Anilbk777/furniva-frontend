export interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface PartyType {
  id: string
  name: string
}

export interface PartyTypeInput {
  name: string
}

export interface Party {
  id: string
  name: string
  phone: string | null
  address: string | null
  party_type: PartyType
  is_active: boolean
  note: string | null
  created_at: string
  updated_at: string
}

export interface PartyInput {
  name: string
  phone?: string | null
  address?: string | null
  party_type_id: string
  note?: string | null
}

export interface PartyUpdateInput extends Partial<PartyInput> {
  is_active?: boolean
}

export interface PartyListFilters {
  search?: string
  party_type_id?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export interface PartyListResult {
  parties: Party[]
  pagination: Pagination
}

export interface PartyOverview {
  total: number
  active: number
  inactive: number
}

export type PartyTxKind =
  | 'credit_sale'
  | 'credit_purchase'
  | 'payment_received'
  | 'payment_made'
  | 'loan_given'
  | 'loan_taken'
  | 'advance_received'

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'esewa'
  | 'khalti'
  | 'cheque'
  | 'other'

/** Backend rule for each party kind: does the entry need a payment method? */
export type PaymentRule = 'required' | 'optional' | 'forbidden'

export const partyTxKinds: PartyTxKind[] = [
  'credit_sale',
  'credit_purchase',
  'payment_received',
  'payment_made',
  'loan_given',
  'loan_taken',
  'advance_received',
]

export const partyPaymentRule: Record<PartyTxKind, PaymentRule> = {
  credit_sale: 'forbidden',
  credit_purchase: 'forbidden',
  payment_received: 'required',
  payment_made: 'required',
  loan_given: 'optional',
  loan_taken: 'optional',
  advance_received: 'required',
}

export const paymentMethods: PaymentMethod[] = [
  'cash',
  'bank_transfer',
  'esewa',
  'khalti',
  'cheque',
  'other',
]

export interface PartyBrief {
  id: string
  name: string
}

export interface Transaction {
  id: string
  bs_date: string
  kind: string
  amount: number | string
  payment_method: string | null
  note: string | null
  party: PartyBrief | null
  created_at: string
  updated_at: string
}

export interface TransactionTotals {
  count: number
  amounts: Record<string, number | string>
}

export interface TransactionListResult {
  transactions: Transaction[]
  pagination: Pagination
  totals: TransactionTotals
}

export interface PartyTransactionInput {
  kind: PartyTxKind
  bs_date: string
  amount: number
  payment_method: PaymentMethod | null
  party_id: string
  note?: string | null
}

export type PartyTransactionUpdateInput = Partial<PartyTransactionInput>

export interface PartyTransactionListFilters {
  partyId: string
  dateFrom?: string
  dateTo?: string
  kind?: PartyTxKind
  page?: number
  limit?: number
}
