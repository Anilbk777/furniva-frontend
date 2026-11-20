import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { setSessionRedirectHandler } from 'src/lib/http'

export function SessionRedirectSync() {
  const navigate = useNavigate()

  useEffect(() => {
    setSessionRedirectHandler((to) => {
      navigate(to, { replace: true })
    })
  }, [navigate])

  return <Outlet />
}
