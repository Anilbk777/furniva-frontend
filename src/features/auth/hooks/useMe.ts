import { useQuery } from '@tanstack/react-query'

import { getMe } from 'src/features/auth/api/authApi'
import { authKeys } from 'src/features/auth/api/keys'

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => (await getMe()).data,
    retry: false,
  })
}
