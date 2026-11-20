import type { ReactNode } from 'react'

import { Button, type ButtonProps } from 'src/components/ui/Button'

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, ...props }: IconButtonProps) {
  return (
    <Button size="icon" aria-label={label} {...props}>
      {children}
    </Button>
  )
}
