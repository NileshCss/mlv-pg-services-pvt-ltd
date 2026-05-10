'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WHATSAPP_NUMBER, SITE_NAME } from '@/lib/utils/constants'

interface NavbarProps {
  onBookClick: () => void
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Rooms', href: '#rooms' },
  { label: 'Food Menu', href: '#food-menu' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)

      // Detect active section
      const sections = navLinks.map(l => l.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleNavClick = useCallback((href: string) => {
    setMobileMenuOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? 'h-16' : 'h-20'
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group flex-shrink-0"
              onClick={() => handleNavClick('#home')}
            >
              <div className="relative">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm text-dark-900 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c 0%, #dcc9a0 50%, #c9a84c 100%)',
                    boxShadow: '0 4px 15px rgba(201,168,76,0.35)',
                  }}
                >
                  MLV
                </div>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-xl ring-2 ring-secondary-400/30 animate-ping opacity-0 group-hover:opacity-100" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white leading-tight">{SITE_NAME}</div>
                <div
                  className="text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: '#c9a84c' }}
                >
                  Premium PG · Bangalore
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((link) => {
                const id = link.href.replace('#', '')
                const isActive = activeSection === id
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className={`relative px-2.5 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'text-secondary-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #c9a84c, #dcc9a0)' }}
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── CTA Buttons ──────────────────────────────────── */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* WhatsApp — green pill (hidden on small screens) */}
              <a
                id="navbar-whatsapp-btn"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  boxShadow: '0 2px 12px rgba(37,211,102,0.35)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {/* WhatsApp SVG icon */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>

              {/* Pre-Register — gold pill */}
              <button
                id="navbar-preregister-btn"
                onClick={onBookClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #D4AF37 100%)',
                  color: '#0a0f1e',
                  boxShadow: '0 2px 12px rgba(251,191,36,0.4)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Pre-Register
              </button>

              {/* Admin — dark ghost pill */}
              <Link
                id="navbar-admin-btn"
                href="/admin/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#E5E7EB',
                  border: '1px solid rgba(255,255,255,0.18)',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Admin
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={22} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col"
              style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div>
                  <div className="text-sm font-bold text-white">{SITE_NAME}</div>
                  <div className="text-[10px] text-secondary-400 uppercase tracking-widest font-semibold">Premium PG</div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navLinks.map((link, idx) => {
                  const id = link.href.replace('#', '')
                  const isActive = activeSection === id
                  return (
                    <motion.button
                      key={link.label}
                      onClick={() => handleNavClick(link.href)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left ${
                        isActive
                          ? 'bg-secondary-500/15 text-secondary-400 border border-secondary-500/25'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 flex-shrink-0" />
                      )}
                      {link.label}
                    </motion.button>
                  )
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="px-4 pb-8 pt-4 border-t border-white/5 space-y-3">
                {/* Pre-Register — gold */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onBookClick() }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #FBBF24 0%, #D4AF37 100%)',
                    color: '#0a0f1e',
                    boxShadow: '0 4px 16px rgba(251,191,36,0.4)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Pre-Register
                </button>

                {/* WhatsApp — green */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95"
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>

                {/* Admin */}
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-full text-sm font-semibold transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#E5E7EB',
                    border: '1px solid rgba(255,255,255,0.18)',
                    fontFamily: 'Poppins, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Admin
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  )
}

export { Navbar }
