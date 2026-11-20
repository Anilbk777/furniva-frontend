import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { X } from 'lucide-react'

import { cn } from 'src/lib/cn'
import { IconButton } from 'src/components/ui/IconButton'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export interface SheetContentProps
  extends Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'title'> {
  title: string
  closeLabel: string
  children: ReactNode
}

export function SheetContent({
  title,
  closeLabel,
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-charcoal-950/50" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-4 border-r border-line bg-card p-5 shadow-xl',
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <DialogPrimitive.Title className="font-heading text-lg font-bold text-charcoal">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <IconButton label={closeLabel} variant="outlined">
              <X aria-hidden="true" className="size-4" />
            </IconButton>
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
