import React from 'react'
import { cn } from '@/lib/utils/helpers'

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  helperText?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, helperText, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-100">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-50 transition-all duration-300 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        ref={ref}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  )
)
Select.displayName = 'Select'

export { Select }
export type { SelectProps }
