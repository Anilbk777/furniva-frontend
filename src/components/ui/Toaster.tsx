import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: '!rounded-lg !border-line !bg-card !font-ui !text-charcoal',
          title: '!font-ui !font-semibold',
          description: '!font-body',
        },
      }}
    />
  )
}
