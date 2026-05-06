import React from 'react'
import { cn } from '@/lib/utils/helpers'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-lg hover:shadow-xl',
        secondary:
          'bg-secondary-500 text-dark-900 hover:bg-secondary-600 active:bg-secondary-700 shadow-lg hover:shadow-xl font-semibold',
        outline:
          'border-2 border-primary-700 text-primary-100 hover:bg-primary-700 hover:text-white active:bg-primary-800',
        ghost: 'text-gray-50 hover:bg-gray-700 active:bg-gray-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-12 px-8 text-lg',
        xl: 'h-14 px-10 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
