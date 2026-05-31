'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download } from 'lucide-react'
import { usePWA } from './PWAProvider'
import { usePathname } from 'next/navigation'

export const FloatingInstallButton: React.FC = () => {
  const pathname = usePathname()
  const { isInstallable, isInstalled, installApp } = usePWA()

  // Hide on dashboard pages
  const isDashboard = pathname.startsWith('/student') || pathname.startsWith('/admin')
  const shouldShow = isInstallable && !isInstalled && !isDashboard

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => installApp('visitor')}
          className="fixed bottom-6 right-6 z-[999] h-12 pl-4 pr-5 rounded-full text-black font-bold text-sm flex items-center gap-2 shadow-[0_4px_24px_rgba(200,132,10,0.4)] transition-all cursor-pointer border border-amber-500/20"
          style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
        >
          <Download size={16} />
          <span>Install App</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
