import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { orderKeys } from 'src/features/orders/api/keys'
import {
  changeOrderStatus,
  createOrder,
  deleteOrder,
  updateOrder,
} from 'src/features/orders/api/ordersApi'
import type {
  OrderInput,
  OrderStatus,
  OrderUpdateInput,
} from 'src/features/orders/types'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('orders')

  return useMutation({
    mutationFn: (input: OrderInput) => createOrder(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success(t('createSuccess'))
    },
  })
}

export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('orders')

  return useMutation({
    mutationFn: (input: OrderUpdateInput) => updateOrder(orderId, input),
    onSuccess(response) {
      if (response.data) {
        queryClient.setQueryData(orderKeys.detail(orderId), response.data)
      }
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success(t('updateSuccess'))
    },
  })
}

export function useChangeOrderStatus(orderId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('orders')

  return useMutation({
    mutationFn: (status: OrderStatus) => changeOrderStatus(orderId, status),
    onSuccess(response) {
      if (response.data) {
        queryClient.setQueryData(orderKeys.detail(orderId), response.data)
      }
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success(t('statusSuccess'))
    },
  })
}

export function useDeleteOrder(orderId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('orders')

  return useMutation({
    mutationFn: () => deleteOrder(orderId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success(t('deleteSuccess'))
    },
  })
}
