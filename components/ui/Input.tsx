import React from 'react'
import { cn } from '@/lib/utils/helpers'
import { cva, type VariantProps } from 'class-variance-authority'

const inputVariants = cva(
  'w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-50 placeholder:text-gray-500 transition-all duration-300 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'py-1 text-sm',
        md: 'py-3 text-base',
        lg: 'py-4 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, label, error, helperText, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-100">
          {label}
        </label>
      )}
      <input
        className={cn(
          inputVariants({ size, className }),
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  )
)
Input.displayName = 'Input'

export { Input, inputVariants }
export type { InputProps }
