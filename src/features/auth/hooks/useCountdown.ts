import { useEffect, useState } from 'react'

export function useCountdown(until: number | null): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!until || until <= Date.now()) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [until])

  if (!until) return 0
  return Math.max(0, Math.ceil((until - now) / 1000))
}
