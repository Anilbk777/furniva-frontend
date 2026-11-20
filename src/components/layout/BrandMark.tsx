import furnivaLogo from 'src/assets/furniva-logo.svg'

import { brand } from 'src/lib/brand'
import { cn } from 'src/lib/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={furnivaLogo}
      alt={brand.name}
      width={1672}
      height={941}
      decoding="async"
      className={cn('h-auto w-36 object-contain', className)}
    />
  )
}
