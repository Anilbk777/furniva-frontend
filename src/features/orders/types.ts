import type { CustomerType } from 'src/features/customers/types'

export interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export type OrderStatus = 'new' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'

export const orderStatuses: OrderStatus[] = [
  'new',
  'in_progress',
  'ready',
  'delivered',
  'cancelled',
]

export type OrderPriority = 'standard' | 'urgent' | 'special_order'

export const orderPriorities: OrderPriority[] = ['standard', 'urgent', 'special_order']

export type HandoverType = 'workshop_pickup' | 'site_delivery'

export const handoverTypes: HandoverType[] = ['workshop_pickup', 'site_delivery']

export type OrderPaymentMethod = 'cash' | 'bank' | 'esewa' | 'khalti' | 'fonepay'

export const orderPaymentMethods: OrderPaymentMethod[] = [
  'cash',
  'bank',
  'esewa',
  'khalti',
  'fonepay',
]

export const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  new: ['in_progress', 'ready', 'cancelled'],
  in_progress: ['ready', 'cancelled'],
  ready: ['in_progress', 'delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export const lockedStatuses: OrderStatus[] = ['delivered', 'cancelled']
export const deletableStatuses: OrderStatus[] = ['new', 'cancelled']

/** The backend stores image URLs / storage keys, so this is the most a single order may carry. */
export const MAX_ORDER_PHOTOS = 10

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus)
}

export interface Order {
  id: string
  order_number: number
  title: string
  category: string
  description: string | null
  hardwood_species: string | null
  photos: string[]
  total_amount: number | string
  advance_amount: number | string
  remaining_amount: number | string
  payment_method: string | null
  delivery_bs_date: string
  delivery_time: string | null
  priority: string
  handover_type: string
  delivery_address: string | null
  status: string
  customer_id: string | null
  customer_name: string
  customer_type: string
  customer_mobile: string
  customer_city_area: string | null
  customer_landmark: string | null
  created_by_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface OrderListItem {
  id: string
  order_number: number
  title: string
  category: string
  hardwood_species: string | null
  total_amount: number | string
  advance_amount: number | string
  remaining_amount: number | string
  delivery_bs_date: string
  delivery_time: string | null
  priority: string
  handover_type: string
  status: string
  customer_id: string | null
  customer_name: string
  customer_mobile: string
  created_at: string | null
  cover_photo: string | null
  photo_count: number
}

export interface OrderInput {
  title: string
  category: string
  description?: string | null
  hardwood_species?: string | null
  photos?: string[]
  total_amount: number
  advance_amount: number
  payment_method?: OrderPaymentMethod | null
  delivery_bs_date: string
  delivery_time?: string | null
  priority: OrderPriority
  handover_type: HandoverType
  delivery_address?: string | null
  customer_id?: string | null
  customer_name?: string | null
  customer_type?: CustomerType | null
  customer_mobile?: string | null
  customer_city_area?: string | null
  customer_landmark?: string | null
}

export type OrderUpdateInput = Partial<OrderInput>

export interface OrderListFilters {
  search?: string
  status?: OrderStatus
  priority?: OrderPriority
  handover_type?: HandoverType
  category?: string
  customer_id?: string
  delivery_from?: string
  delivery_to?: string
  page?: number
  limit?: number
}

export interface OrderListResult {
  orders: OrderListItem[]
  pagination: Pagination
}

export interface OrderOverview {
  total: number
  new: number
  in_progress: number
  ready: number
  delivered: number
  cancelled: number
}
