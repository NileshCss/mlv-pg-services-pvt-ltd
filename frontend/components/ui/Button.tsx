import React from 'react'
import { cn } from '@/lib/utils/helpers'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1A1A2E] text-white hover:bg-[#242440] active:scale-[0.98] shadow-lg hover:shadow-xl',
        secondary:
          'text-[#1A1A2E] font-bold active:scale-[0.97] shadow-lg'
          + ' [background:linear-gradient(135deg,#C9A84C_0%,#E8C96B_50%,#C9A84C_100%)]'
          + ' [background-size:200%_auto] hover:[background-position:right_center]'
          + ' hover:shadow-[0_8px_28px_rgba(201,168,76,0.4)] transition-[background-position,box-shadow] duration-500',
        outline:
          'border-[1.5px] border-[rgba(201,168,76,0.5)] text-[#1A1A2E] bg-white hover:bg-[rgba(201,168,76,0.06)] hover:border-[rgba(201,168,76,0.7)] active:scale-[0.98]',
        ghost:
          'text-[#4A4A6A] hover:text-[#1A1A2E] hover:bg-[rgba(0,0,0,0.04)] active:scale-[0.98]',
        danger:
          'bg-red-500 text-white hover:bg-red-400 active:scale-[0.98] shadow-lg',
        'ghost-gold':
          'text-[#C9A84C] hover:text-[#B8933E] hover:bg-[rgba(201,168,76,0.08)] active:scale-[0.98]',
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-full',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-lg',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-xl',
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
