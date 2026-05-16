import React from 'react'
import { cn } from '@/lib/utils/helpers'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  helperText?: string
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, helperText, placeholder = 'Select an option', ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium" style={{ color: '#d1d5db' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            'w-full h-11 rounded-xl px-4 pr-10 text-sm font-medium appearance-none cursor-pointer',
            'text-white transition-all duration-300',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus:outline-none',
            error
              ? 'border border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
              : 'border border-white/8 hover:border-white/12 focus:border-secondary-500/60 focus:ring-2 focus:ring-secondary-500/20',
            className
          )}
          style={{
            background: error ? 'rgba(127,29,29,0.12)' : 'rgba(255,255,255,0.05)',
          }}
          ref={ref}
          {...props}
        >
          <option value="" style={{ background: '#1f2937', color: '#9ca3af' }}>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: '#1f2937', color: '#fff' }}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#6b7280' }}
        />
      </div>
      {error && (
        <p className="text-xs font-medium" style={{ color: '#f87171' }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
)
Select.displayName = 'Select'

export { Select }
export type { SelectProps }

