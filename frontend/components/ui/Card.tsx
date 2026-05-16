import React from 'react'
import { cn } from '@/lib/utils/helpers'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'bordered'
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-300',
        variant === 'default' && 'bg-gray-900 border border-gray-800',
        variant === 'glass' && 'glass-effect',
        variant === 'bordered' && 'border-2 border-secondary-500 bg-transparent',
        hover && 'hover:shadow-xl hover:border-secondary-500 hover:scale-105',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('border-b border-gray-800 px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-6', className)} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('border-t border-gray-800 px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps }

