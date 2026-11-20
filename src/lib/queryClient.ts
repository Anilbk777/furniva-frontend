import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return false
        return failureCount < 2
      },
    },
  },
})

export function clearSessionCache(): void {
  queryClient.clear()
}
