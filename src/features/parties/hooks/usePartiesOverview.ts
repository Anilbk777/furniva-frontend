import { useQuery } from '@tanstack/react-query'

import { getPartiesOverview } from 'src/features/parties/api/partiesApi'
import { partyKeys } from 'src/features/parties/api/keys'

export function usePartiesOverview() {
  return useQuery({
    queryKey: partyKeys.overview,
    queryFn: async () => (await getPartiesOverview()).data,
  })
}
