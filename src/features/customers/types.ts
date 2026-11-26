export interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export type CustomerType = 'individual' | 'business' | 'contractor'

export const customerTypes: CustomerType[] = ['individual', 'business', 'contractor']

export interface Customer {
  id: string
  customer_type: CustomerType
  name: string
  mobile: string
  alt_phone: string | null
  city_area: string
  landmark: string | null
  opening_balance: number | string
  khata_note: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface CustomerInput {
  customer_type: CustomerType
  name: string
  mobile: string
  alt_phone?: string | null
  city_area: string
  landmark?: string | null
  opening_balance?: number
  khata_note?: string | null
}

export interface CustomerUpdateInput extends Partial<CustomerInput> {
  is_active?: boolean
}

export interface CustomerListFilters {
  search?: string
  customer_type?: CustomerType
  is_active?: boolean
  page?: number
  limit?: number
}

export interface CustomerListResult {
  customers: Customer[]
  pagination: Pagination
}

export interface CustomerOverview {
  total: number
  active: number
  inactive: number
}
