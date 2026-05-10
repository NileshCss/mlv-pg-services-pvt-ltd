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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  closeButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
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
  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Modal wrapper — scrollable */}
          <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-12 overflow-y-auto">
            <motion.div
              className={cn(
                'w-full rounded-2xl shadow-2xl my-auto relative',
                sizeClasses[size]
              )}
              style={{
                background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button — Always visible */}
              {closeButton && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all duration-200"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              )}

              {/* Header */}
              {(title || description) && (
                <div
                  className="relative px-6 pt-6 pb-5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Gold accent line */}
                  <div
                    className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #c9a84c, transparent)' }}
                  />

                  {title && (
                    <h2
                      className="text-xl font-bold pr-8"
                      style={{ color: '#fff' }}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-6">{children}</div>

              {/* Footer */}
              {footer && (
                <div
                  className="px-6 py-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export { Dialog }
export type { DialogProps }
