import React from 'react'
import { cn } from '@/lib/utils/helpers'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
}

const sizeMap = {
  sm: 'h-8 text-sm px-3',
  md: 'h-11 text-sm px-4',
  lg: 'h-12 text-base px-4',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', label, error, helperText, type = 'text', theme = 'light', ...props }, ref) => {
    const isDark = theme === 'dark'
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            className="block text-sm font-medium"
            style={{ color: isDark ? '#d1d5db' : '#1A1A2E', fontFamily: 'Inter, sans-serif' }}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded-lg font-medium transition-all duration-300 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isDark ? 'placeholder:text-gray-500' : 'placeholder:text-[#8A8AA0]',
            sizeMap[size],
            error
              ? (isDark ? 'border border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' : 'border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200')
              : (isDark ? 'border border-white/10 hover:border-white/20 focus:border-[rgba(201,168,76,0.6)] focus:ring-2 focus:ring-[rgba(201,168,76,0.1)]' : 'border border-[#EBEBF0] hover:border-[rgba(201,168,76,0.3)] focus:border-[rgba(201,168,76,0.6)] focus:ring-2 focus:ring-[rgba(201,168,76,0.1)]'),
            className
          )}
          style={{
            background: error ? (isDark ? 'rgba(127,29,29,0.12)' : 'rgba(254,242,242,0.8)') : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
            color: isDark ? '#ffffff' : '#1A1A2E',
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
        <p className="text-xs" style={{ color: isDark ? '#9ca3af' : '#8A8AA0' }}>
          {helperText}
        </p>
      )}
    </div>
  )
})
Input.displayName = 'Input'

export { Input }
export type { InputProps }

