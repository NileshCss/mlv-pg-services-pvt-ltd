import React from 'react'
import { cn } from '@/lib/utils/helpers'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-800 text-white hover:bg-primary-700 active:scale-[0.98] shadow-lg hover:shadow-xl',
        secondary:
          'text-dark-900 font-bold active:scale-[0.97] shadow-lg'
          + ' [background:linear-gradient(135deg,#c9a84c_0%,#dcc9a0_50%,#c9a84c_100%)]'
          + ' [background-size:200%_auto] hover:[background-position:right_center]'
          + ' hover:shadow-yellow-600/30 transition-[background-position,box-shadow] duration-500',
        outline:
          'border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 active:scale-[0.98] backdrop-blur-sm',
        ghost:
          'text-gray-300 hover:text-white hover:bg-white/8 active:scale-[0.98]',
        danger:
          'bg-red-600 text-white hover:bg-red-500 active:scale-[0.98] shadow-lg',
        'ghost-gold':
          'text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 active:scale-[0.98]',
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-lg',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
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
