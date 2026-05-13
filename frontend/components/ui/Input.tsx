import React from 'react'
import { cn } from '@/lib/utils/helpers'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-8 text-sm px-3',
  md: 'h-11 text-sm px-4',
  lg: 'h-12 text-base px-4',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', label, error, helperText, type = 'text', ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium" style={{ color: '#d1d5db' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full rounded-xl font-medium text-white placeholder:text-gray-600 transition-all duration-300',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none',
          sizeMap[size],
          error
            ? 'border border-red-500/70 bg-red-950/20 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
            : 'border border-white/8 bg-white/5 hover:border-white/12 focus:border-secondary-500/60 focus:ring-2 focus:ring-secondary-500/20',
          className
        )}
        style={{
          background: error ? 'rgba(127,29,29,0.12)' : 'rgba(255,255,255,0.05)',
        }}
        {...props}
      />
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
Input.displayName = 'Input'

export { Input }
export type { InputProps }
