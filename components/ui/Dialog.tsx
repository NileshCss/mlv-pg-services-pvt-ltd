import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { motion, AnimatePresence } from 'framer-motion'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeButton = true,
}) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={cn(
                'w-full rounded-2xl bg-gray-900 shadow-2xl glass-effect',
                sizeClasses[size]
              )}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="relative">
                {closeButton && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-50 transition-colors"
                  >
                    <X size={24} />
                  </button>
                )}

                {(title || description) && (
                  <div className="border-b border-gray-800 px-6 py-6">
                    {title && (
                      <h2 className="text-2xl font-bold text-gray-50">{title}</h2>
                    )}
                    {description && (
                      <p className="mt-2 text-gray-400">{description}</p>
                    )}
                  </div>
                )}

                <div className="px-6 py-6">{children}</div>

                {footer && (
                  <div className="border-t border-gray-800 px-6 py-4">
                    {footer}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export { Dialog }
export type { DialogProps }
