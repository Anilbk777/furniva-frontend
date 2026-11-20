import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm font-ui text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-wood-700 active:bg-wood-800',
        secondary: 'bg-control text-charcoal hover:bg-charcoal-100 active:bg-charcoal-200',
        inverted: 'bg-charcoal text-white hover:bg-charcoal-700',
        outlined: 'border border-outline bg-transparent text-charcoal hover:bg-charcoal-50',
        destructive: 'bg-danger text-white hover:bg-danger-700',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-11 px-3 text-xs',
        icon: 'h-11 w-11 px-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)
