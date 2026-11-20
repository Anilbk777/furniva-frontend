import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { Toaster } from 'src/components/ui/Toaster'
import { queryClient } from 'src/lib/queryClient'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      {children}
    </QueryClientProvider>
  )
}
