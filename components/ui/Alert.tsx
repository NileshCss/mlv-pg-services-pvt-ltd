import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { motion } from 'framer-motion'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  closeable?: boolean
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

const alertVariants = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
  success: 'bg-green-500/10 border-green-500/30 text-green-100',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-100',
  error: 'bg-red-500/10 border-red-500/30 text-red-100',
}

const alertIcons = {
  info: <Info size={20} />,
  success: <CheckCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <AlertCircle size={20} />,
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      type = 'info',
      title,
      description,
      closeable = false,
      onClose,
      className,
      children,
      ...props
    }: AlertProps,
    ref: React.Ref<HTMLDivElement>
  ) => (
    <motion.div
      ref={ref as any}
      className={cn(
        'relative flex gap-4 rounded-lg border px-4 py-3',
        alertVariants[type as keyof typeof alertVariants],
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      {...(props as any)}
    >
      <div className="mt-0.5">{alertIcons[type as keyof typeof alertIcons]}</div>
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        {description && <p className="text-sm opacity-90">{description}</p>}
        {children}
      </div>
      {closeable && (
        <button
          onClick={onClose}
          className="rounded p-1 hover:opacity-70 transition-opacity"
        >
          <X size={18} />
        </button>
      )}
    </motion.div>
  )
)
Alert.displayName = 'Alert'

export { Alert }
export type { AlertProps }
