'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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

const WA_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = navLinks.map(l => l.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) { setActiveSection(sections[i]); break }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleNavClick = useCallback((href: string) => {
    setMobileMenuOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-400`}
        style={{
          top: '38px',
          background: scrolled
            ? 'rgba(255,255,255,0.97)'
            : '#ffffff',
          borderBottom: `1px solid ${scrolled ? '#EBEBF0' : '#EBEBF0'}`,
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : '0 1px 0 #EBEBF0',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-400 ${scrolled ? 'h-16' : 'h-20'}`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group flex-shrink-0"
              onClick={() => handleNavClick('#home')}
            >
              <div className="relative">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96B 50%, #C9A84C 100%)',
                    color: '#1A1A2E',
                    boxShadow: '0 4px 15px rgba(201,168,76,0.35)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  MLV
                </div>
              </div>
              <div className="hidden sm:block">
                <div
                  className="text-sm font-bold leading-tight"
                  style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
                >
                  {SITE_NAME}
                </div>
                <div
                  className="text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: '#C9A84C', fontFamily: 'Poppins, sans-serif' }}
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
                    className="relative px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap"
                    style={{
                      color: isActive ? '#C9A84C' : '#1A1A2E',
                      fontFamily: 'Inter, sans-serif',
                      background: isActive ? 'rgba(201,168,76,0.06)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = '#C9A84C'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = '#1A1A2E'
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C96B)' }}
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* WhatsApp — green pill */}
              <a
                id="navbar-whatsapp-btn"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  boxShadow: '0 2px 12px rgba(37,211,102,0.35)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {WA_ICON}
                WhatsApp
              </a>

              {/* Pre-Register — gold pill */}
              <button
                id="navbar-preregister-btn"
                onClick={onBookClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96B 100%)',
                  color: '#1A1A2E',
                  boxShadow: '0 2px 12px rgba(201,168,76,0.35)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Pre-Register
              </button>

              {/* Admin — ghost outlined */}
              <Link
                id="navbar-admin-btn"
                href="/admin/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-gray-50"
                style={{
                  background: 'transparent',
                  color: '#4A4A6A',
                  border: '1px solid #EBEBF0',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Admin
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
                style={{ color: '#1A1A2E', background: 'rgba(0,0,0,0.04)' }}
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col"
              style={{ background: '#FFFFFF', borderLeft: '1px solid #EBEBF0', boxShadow: '-4px 0 40px rgba(0,0,0,0.1)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Drawer Header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: '1px solid #EBEBF0' }}
              >
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
                  >
                    {SITE_NAME}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: '#C9A84C', fontFamily: 'Poppins, sans-serif' }}
                  >
                    Premium PG
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ color: '#4A4A6A', background: '#F8F6F1' }}
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
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left"
                      style={{
                        color: isActive ? '#C9A84C' : '#1A1A2E',
                        background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                        border: isActive ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C9A84C' }} />}
                      {link.label}
                    </motion.button>
                  )
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="px-4 pb-8 pt-4 space-y-3" style={{ borderTop: '1px solid #EBEBF0' }}>
                {/* Pre-Register */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onBookClick() }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96B 100%)',
                    color: '#1A1A2E',
                    boxShadow: '0 4px 16px rgba(201,168,76,0.35)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Pre-Register
                </button>

                {/* WhatsApp */}
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
                  {WA_ICON}
                  WhatsApp
                </a>

                {/* Admin */}
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-full text-sm font-semibold transition-all duration-300"
                  style={{
                    background: 'transparent',
                    color: '#4A4A6A',
                    border: '1px solid #EBEBF0',
                    fontFamily: 'Poppins, sans-serif',
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
