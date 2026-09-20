import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-white shadow hover:bg-primary-600 focus-visible:ring-primary-500 active:scale-[0.98]',
        destructive:
          'bg-danger text-white shadow hover:opacity-90 focus-visible:ring-danger active:scale-[0.98]',
        outline:
          'border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-primary-500',
        secondary:
          'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 focus-visible:ring-slate-400',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
        link:
          'text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
