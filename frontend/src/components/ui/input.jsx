import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
        'shadow-sm transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus:ring-danger',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

const InputError = ({ message }) => {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger">{message}</p>
}

const InputLabel = ({ children, required, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-slate-700 mb-1.5"
  >
    {children}
    {required && <span className="text-danger ml-1">*</span>}
  </label>
)

export { Input, InputError, InputLabel }
