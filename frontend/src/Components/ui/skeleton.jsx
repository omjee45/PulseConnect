import { cn } from '@/lib/utils'

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-slate-200',
      className
    )}
    {...props}
  />
)

export { Skeleton }
