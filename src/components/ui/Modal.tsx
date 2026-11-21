import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { IconButton } from 'src/components/ui/IconButton'
import { cn } from 'src/lib/cn'

export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose = DialogPrimitive.Close

export interface ModalContentProps {
  title: string
  description?: string
  closeLabel: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function ModalContent({
  title,
  description,
  closeLabel,
  children,
  footer,
  className,
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-charcoal-950/50" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-lg border border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-xl',
          'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85dvh] sm:w-[min(40rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:pb-0',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div className="min-w-0">
            <DialogPrimitive.Title className="font-heading text-lg font-bold text-charcoal [overflow-wrap:anywhere]">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-charcoal-500 [overflow-wrap:anywhere]">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton label={closeLabel} variant="outlined" className="shrink-0">
              <X aria-hidden="true" className="size-4" />
            </IconButton>
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line p-5">
            {footer}
          </div>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
