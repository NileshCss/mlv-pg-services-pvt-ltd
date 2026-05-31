'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, Sparkles } from 'lucide-react'
import { usePWA } from './PWAProvider'
import { usePathname } from 'next/navigation'

export const DashboardInstallBanner: React.FC = () => {
  const pathname = usePathname()
  const { isInstallable, isInstalled, installApp } = usePWA()

  const shouldShow = isInstallable && !isInstalled

  if (!shouldShow) return null

  const isAdmin = pathname.startsWith('/admin')
  const title = isAdmin ? 'MLV PG Admin App' : 'MLV PG Resident App'
  const message = isAdmin
    ? 'Install the MLV PG Admin App for faster management of students, rooms, fees, complaints, and reports.'
    : 'Install the MLV PG App for easier access to your room details, fee records, complaints, and announcements.'

  const handleInstall = () => {
    installApp(isAdmin ? 'admin' : 'resident')
  }

  return (
    <div className="mb-6">
      <div
        className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border"
        style={{
          background: 'linear-gradient(135deg, rgba(200, 132, 10, 0.08) 0%, rgba(200, 132, 10, 0.03) 100%)',
          borderColor: 'rgba(200, 132, 10, 0.15)'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              {title}
            </h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-2xl">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={handleInstall}
          className="py-2.5 px-5 text-xs font-bold rounded-xl text-black transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_2px_8px_rgba(200,132,10,0.25)] flex-shrink-0 w-full sm:w-auto"
          style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
        >
          <Download size={13} />
          Install App
        </button>
      </div>
    </div>
  )
}
