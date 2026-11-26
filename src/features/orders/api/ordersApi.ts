import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  Order,
  OrderInput,
  OrderListFilters,
  OrderListResult,
  OrderOverview,
  OrderStatus,
  OrderUpdateInput,
} from 'src/features/orders/types'

export function getOrdersOverview(): Promise<ApiResponse<OrderOverview>> {
  return http.get<ApiResponse<OrderOverview>>('/orders/overview').then((r) => r.data)
}

export function listOrders(
  filters: OrderListFilters = {},
): Promise<ApiResponse<OrderListResult>> {
  return http
    .get<ApiResponse<OrderListResult>>('/orders', {
      params: {
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        handover_type: filters.handover_type || undefined,
        category: filters.category || undefined,
        customer_id: filters.customer_id || undefined,
        delivery_from: filters.delivery_from || undefined,
        delivery_to: filters.delivery_to || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    })
    .then((r) => r.data)
}

export function getOrder(orderId: string): Promise<ApiResponse<Order>> {
  return http.get<ApiResponse<Order>>(`/orders/${orderId}`).then((r) => r.data)
}

export function createOrder(input: OrderInput): Promise<ApiResponse<Order>> {
  return http.post<ApiResponse<Order>>('/orders', input).then((r) => r.data)
}

export function updateOrder(
  orderId: string,
  input: OrderUpdateInput,
): Promise<ApiResponse<Order>> {
  return http.patch<ApiResponse<Order>>(`/orders/${orderId}`, input).then((r) => r.data)
}

export function changeOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ApiResponse<Order>> {
  return http
    .post<ApiResponse<Order>>(`/orders/${orderId}/status`, { status })
    .then((r) => r.data)
}

export function deleteOrder(orderId: string): Promise<ApiResponse<null>> {
  return http.delete<ApiResponse<null>>(`/orders/${orderId}`).then((r) => r.data)
}
