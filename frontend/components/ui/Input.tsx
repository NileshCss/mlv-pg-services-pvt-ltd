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
        <label
          className="block text-sm font-medium"
          style={{ color: '#1A1A2E', fontFamily: 'Inter, sans-serif' }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full rounded-lg font-medium placeholder:text-[#8A8AA0] transition-all duration-300',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none',
          sizeMap[size],
          error
            ? 'border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border border-[#EBEBF0] hover:border-[rgba(201,168,76,0.3)] focus:border-[rgba(201,168,76,0.6)] focus:ring-2 focus:ring-[rgba(201,168,76,0.1)]',
          className
        )}
        style={{
          background: error ? 'rgba(254,242,242,0.8)' : '#FFFFFF',
          color: '#1A1A2E',
          fontFamily: 'Inter, sans-serif',
        }}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs" style={{ color: '#8A8AA0' }}>
          {helperText}
        </p>
      )}
    </div>
  )
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }
