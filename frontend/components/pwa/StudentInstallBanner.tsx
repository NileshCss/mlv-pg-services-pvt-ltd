'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Download, X } from 'lucide-react'
import { usePWA } from './PWAProvider'

export const StudentInstallBanner: React.FC = () => {
  const { showStudentPrompt, installApp, dismissStudentPrompt } = usePWA()

  const benefits = [
    'Quick Dashboard Access',
    'Fee Status Checking',
    'Complaint Tracking',
    'Instant Push Notifications',
    'Faster Performance'
  ]

  return (
    <AnimatePresence>
      {showStudentPrompt && (
        <div className="fixed bottom-6 left-6 z-[1001] max-w-sm w-full p-1 pointer-events-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.95, opacity: 0, x: -50 }}
            className="bg-[#0F1629] border border-white/10 rounded-2xl p-5 shadow-2xl text-gray-200 pointer-events-auto relative overflow-hidden"
          >
            <button
              onClick={() => dismissStudentPrompt(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            <div className="pt-1">
              <span className="text-[9px] uppercase font-bold text-[#C8840A] tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/15">
                ⚡ Premium Upgrade
              </span>

              <h3 className="text-base font-bold text-white mt-3 mb-2" style={{ fontFamily: 'Playfair Display' }}>
                Install MLV PG Student App
              </h3>
              
              <p className="text-xs text-gray-400 mb-4">
                Unlock instant access and enhanced premium features:
              </p>

              {/* Benefits list */}
              <ul className="space-y-2 mb-5">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-4 h-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-[9px] flex-shrink-0">
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button
                  onClick={() => installApp('student')}
                  className="w-full py-2.5 rounded-xl text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:shadow-[0_4px_12px_rgba(200,132,10,0.25)]"
                  style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                >
                  <Download size={13} />
                  Install Now
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => dismissStudentPrompt(false)}
                    className="py-2 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-[10px] font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={() => dismissStudentPrompt(true)}
                    className="py-2 rounded-xl border border-amber-500/10 hover:border-amber-500/20 text-[10px] font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Do Not Remind Me
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
