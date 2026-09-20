import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-primary-100 text-primary-700',
        secondary: 'bg-slate-100 text-slate-700',
        success:   'bg-green-100 text-green-700',
        warning:   'bg-amber-100 text-amber-700',
        danger:    'bg-red-100 text-red-700',
        outline:   'border border-slate-200 text-slate-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
)

export { Badge, badgeVariants }
