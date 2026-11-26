export { CustomersPage } from 'src/features/customers/pages/CustomersPage'
export { CustomerDetailPage } from 'src/features/customers/pages/CustomerDetailPage'

export { useCustomers } from 'src/features/customers/hooks/useCustomers'
export { useCustomer } from 'src/features/customers/hooks/useCustomer'
export { useCustomersOverview } from 'src/features/customers/hooks/useCustomersOverview'
export {
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from 'src/features/customers/hooks/useCustomerMutations'

export { customerKeys } from 'src/features/customers/api/keys'

export { customerTypes } from 'src/features/customers/types'
export type {
  Customer,
  CustomerInput,
  CustomerListFilters,
  CustomerListResult,
  CustomerOverview,
  CustomerType,
  CustomerUpdateInput,
  Pagination,
} from 'src/features/customers/types'
