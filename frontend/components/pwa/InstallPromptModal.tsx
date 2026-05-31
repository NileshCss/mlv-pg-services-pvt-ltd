'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, X } from 'lucide-react'
import { usePWA } from './PWAProvider'

export const InstallPromptModal: React.FC = () => {
  const { showVisitorPrompt, installApp } = usePWA()
  const [closed, setClosed] = React.useState(false)

  const isVisible = showVisitorPrompt && !closed

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setClosed(true)}
            className="fixed inset-0 bg-black/60 z-[1000] backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-gray-200 pointer-events-auto relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setClosed(true)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="text-center pt-2">
                {/* Brand Logo or Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(200, 132, 10, 0.1)', border: '1px solid rgba(200, 132, 10, 0.2)' }}
                >
                  <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.src = '/favicon.png' }} />
                </div>

                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Install MLV PG App
                </h3>
                
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Get quick access to room bookings, admissions, and support directly from your home screen.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => installApp('visitor')}
                    className="w-full py-3 rounded-xl text-black font-bold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-[0_4px_16px_rgba(200,132,10,0.25)]"
                    style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                  >
                    <Download size={14} />
                    Install App
                  </button>
                  <button
                    onClick={() => setClosed(true)}
                    className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
