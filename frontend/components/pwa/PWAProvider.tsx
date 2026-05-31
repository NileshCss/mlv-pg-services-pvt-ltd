'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

interface PWAContextType {
  deferredPrompt: any
  isInstallable: boolean
  isInstalled: boolean
  showVisitorPrompt: boolean
  showStudentPrompt: boolean
  installApp: (role?: 'visitor' | 'student' | 'resident' | 'admin') => Promise<void>
  dismissStudentPrompt: (dontShowAgain: boolean) => void
  triggerPreRegistrationInstall: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Visitor prompt rules
  const [showVisitorPrompt, setShowVisitorPrompt] = useState(false)
  
  // Student prompt rules
  const [showStudentPrompt, setShowStudentPrompt] = useState(false)

  useEffect(() => {
    // 1. Detect standalone installed mode
    const checkInstalledMode = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://')
      setIsInstalled(isStandalone)
      if (isStandalone) {
        setIsInstallable(false)
      }
    }

    checkInstalledMode()

    // 2. Listen for native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('[PWA] beforeinstallprompt event intercepted successfully.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('[PWA] Analytics Log: App Installed Successfully.')
    })

    // 3. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('[PWA] Service Worker registered with scope:', reg.scope))
        .catch((err) => console.error('[PWA] Service Worker registration failed:', err))
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // 4. Visitor Activation Rules
  useEffect(() => {
    if (isInstalled || !isInstallable) return

    const isUserDashboard = pathname.startsWith('/student') || pathname.startsWith('/admin')
    if (isUserDashboard) return

    // Visitor Page Visits counter
    let visits = parseInt(localStorage.getItem('pwa_page_visits') || '0')
    visits += 1
    localStorage.setItem('pwa_page_visits', visits.toString())

    // Condition A: 3+ Page Visits
    if (visits >= 3) {
      setShowVisitorPrompt(true)
      logAnalytics('Prompt Displayed', 'visitor', '3+ page visits')
    }

    // Condition B: 20 seconds on site
    const visitorTimer = setTimeout(() => {
      setShowVisitorPrompt(true)
      logAnalytics('Prompt Displayed', 'visitor', '20s on-site timer')
    }, 20000)

    return () => clearTimeout(visitorTimer)
  }, [pathname, isInstallable, isInstalled])

  // 5. Student Dashboard Activation Rules (Trigger after 5s)
  useEffect(() => {
    if (isInstalled || !isInstallable) return

    const isStudentDashboard = pathname.startsWith('/student/dashboard')
    if (!isStudentDashboard) {
      setShowStudentPrompt(false)
      return
    }

    // Check suppression cookie/localStorage
    const dismissedUntil = localStorage.getItem('pwa_student_dismissed_until')
    if (dismissedUntil && new Date().getTime() < parseInt(dismissedUntil)) {
      console.log('[PWA] Student install prompt suppressed due to active 30-day dismissal.')
      return
    }

    const studentTimer = setTimeout(() => {
      setShowStudentPrompt(true)
      logAnalytics('Prompt Displayed', 'student', '5s student dashboard trigger')
    }, 5000)

    return () => clearTimeout(studentTimer)
  }, [pathname, isInstallable, isInstalled])

  // 6. Pre-Registration instant trigger helper
  const triggerPreRegistrationInstall = () => {
    if (!isInstallable || isInstalled) return
    setShowVisitorPrompt(true)
    logAnalytics('Prompt Displayed', 'visitor', 'pre-registration submission')
  }

  // Helper to log analytics to console as requested
  const logAnalytics = (action: string, role: string, trigger: string) => {
    const platform = typeof window !== 'undefined' ? (navigator as any).userAgentData?.platform || navigator.platform : 'Unknown'
    console.log('\n=== PWA ANALYTICS LOG ===')
    console.log(`Event     : ${action}`)
    console.log(`User Role : ${role}`)
    console.log(`Trigger   : ${trigger}`)
    console.log(`Platform  : ${platform}`)
    console.log(`Timestamp : ${new Date().toISOString()}`)
    console.log('===========================\n')
  }

  // 7. Install execution function
  const installApp = async (role: 'visitor' | 'student' | 'resident' | 'admin' = 'visitor') => {
    if (!deferredPrompt) {
      console.log('[PWA] Install prompt called but no deferredPrompt available.')
      return
    }

    logAnalytics('Prompt Interacted', role, 'install click')
    deferredPrompt.prompt()

    try {
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        logAnalytics('App Installed', role, 'user accepted native prompt')
        setIsInstalled(true)
        setIsInstallable(false)
      } else {
        logAnalytics('Prompt Dismissed', role, 'user rejected native prompt')
      }
    } catch (err) {
      console.error('[PWA] Native prompt error:', err)
    } finally {
      setDeferredPrompt(null)
      setShowVisitorPrompt(false)
      setShowStudentPrompt(false)
    }
  }

  // 8. Dismiss student prompt
  const dismissStudentPrompt = (dontShowAgain: boolean) => {
    setShowStudentPrompt(false)
    logAnalytics('Prompt Dismissed', 'student', 'dismiss banner click')

    if (dontShowAgain) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      const suppressUntil = new Date().getTime() + thirtyDays
      localStorage.setItem('pwa_student_dismissed_until', suppressUntil.toString())
      toast.success('Preference saved! We will not remind you again for 30 days.')
    }
  }

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstallable,
        isInstalled,
        showVisitorPrompt,
        showStudentPrompt,
        installApp,
        dismissStudentPrompt,
        triggerPreRegistrationInstall
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}
