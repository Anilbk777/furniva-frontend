import { RouterProvider } from 'react-router-dom'

import { Providers } from 'src/app/providers'
import { router } from 'src/app/router'

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
