import { Search } from 'lucide-react'

import { cn } from 'src/lib/cn'
import { Input, type InputProps } from 'src/components/ui/Input'

export function SearchInput({ className, ...props }: InputProps) {
  return (
    <div className="relative w-full min-w-0">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400"
      />
      <Input type="search" className={cn('pl-10', className)} {...props} />
    </div>
  )
}
