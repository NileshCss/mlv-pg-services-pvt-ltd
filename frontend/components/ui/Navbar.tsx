'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, MessageCircle, GraduationCap, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { WHATSAPP_NUMBER, SITE_NAME } from '@/lib/utils/constants'

interface NavbarProps {
  onBookClick: () => void
}

const navLinks = [
  { label: 'Home',         href: '#home' },
  { label: 'About',        href: '#about' },
  { label: 'Facilities',   href: '#facilities' },
  { label: 'Rooms',        href: '#rooms' },
  { label: 'Food Menu',    href: '#food-menu' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact',      href: '#contact' },
]

/* ─── Shared CTA button height (all 4 buttons locked to 44 px) ─── */
const BTN_H = '44px'
const BTN_BASE: React.CSSProperties = {
  height: BTN_H,
  minHeight: BTN_H,
  lineHeight: '1',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const pathname       = usePathname()
  const router         = useRouter()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  /* ── scroll: detect shadow & active section ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const ids = navLinks.map(l => l.href.replace('#', ''))
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= 110) {
          setActiveSection(ids[i])
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── close mobile menu at lg+ ── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ── body scroll lock + Escape key ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    if (mobileOpen) window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [mobileOpen])

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false)
    const id = href.replace('#', '')
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      router.push(`/${href}` as any)
    }
  }, [pathname, router])

  /* announcement bar is 38px; navbar slides from that offset */
  const ANNOUNCEMENT_H = 38
  const navbarH        = scrolled ? 72 : 80      /* px — tighter when scrolled */
  const mobileMenuTop  = `${ANNOUNCEMENT_H + navbarH}px`

  const waHref = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`

  return (
    <>
      {/* ════════════════════════════════════════
          MAIN NAVBAR
      ════════════════════════════════════════ */}
      <nav
        className="fixed z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-[#f0e8d0]"
        style={{
          top:       `${ANNOUNCEMENT_H}px`,
          height:    `${navbarH}px`,
          boxShadow: scrolled
            ? '0 4px 20px rgba(0,0,0,0.10)'
            : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8 h-full flex items-center justify-between gap-6">

          {/* ── LEFT — Logo ── */}
          <Link
            href={pathname === '/' ? '#home' : '/'}
            className="flex items-center gap-3 flex-shrink-0 group"
            onClick={e => {
              if (pathname === '/') { e.preventDefault(); handleNavClick('#home') }
            }}
          >
            {/* Logo ring + glow */}
            <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <div
                className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 16px rgba(201,162,64,0.55)' }}
              />
              <div
                className="relative rounded-full overflow-hidden ring-2 ring-[#C9A240] ring-offset-1 ring-offset-white"
                style={{ width: 52, height: 52, boxShadow: '0 0 8px rgba(201,162,64,0.25)' }}
              >
                <Image
                  src="/images/logo.png"
                  alt={SITE_NAME}
                  width={52}
                  height={52}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Brand text */}
            <div className="leading-none">
              <p className="text-[15px] font-bold text-[#1C1C3A] tracking-tight whitespace-nowrap">
                MLV PG Services
              </p>
              <p className="text-[9px] font-semibold text-[#C9A240] tracking-[0.18em] uppercase whitespace-nowrap mt-[3px]">
                Premium PG&nbsp;•&nbsp;Bangalore
              </p>
            </div>
          </Link>

          {/* ── CENTER — Nav links (desktop only) ── */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => {
              const id       = link.href.replace('#', '')
              const isActive = activeSection === id
              return (
                <Link
                  key={link.label}
                  href={(pathname === '/' ? link.href : `/${link.href}`) as any}
                  onClick={e => {
                    if (pathname === '/') { e.preventDefault(); handleNavClick(link.href) }
                  }}
                  className="relative px-3 py-2 text-[13px] font-medium whitespace-nowrap rounded-md transition-colors duration-200 hover:bg-amber-50/70"
                  style={{ color: isActive ? '#C9A240' : '#374151' }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#C9A240' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#374151' }}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="gold-underline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D4AF37, #C89B2B)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── RIGHT — CTA buttons (desktop only) ── */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">

            {/* WhatsApp */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...BTN_BASE, paddingLeft: 20, paddingRight: 20 }}
              className="gap-2 bg-[#25D366] text-white text-[13px] font-semibold rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:bg-[#1ebe5d] hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(37,211,102,0.35)] no-underline"
            >
              <svg style={{ width: 15, height: 15, flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.535 5.877L.057 23.492a.5.5 0 00.614.614l5.725-1.498A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.523-5.222-1.432l-.374-.22-3.898 1.02 1.04-3.8-.242-.382A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>

            {/* Pre-Register — primary CTA with gold gradient */}
            <button
              onClick={onBookClick}
              style={{
                ...BTN_BASE,
                paddingLeft: 20,
                paddingRight: 20,
                background: 'linear-gradient(135deg, #D4AF37 0%, #C89B2B 100%)',
                border: 'none',
              }}
              className="gap-1.5 text-white text-[13px] font-semibold rounded-full whitespace-nowrap flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_16px_rgba(201,162,64,0.45)]"
            >
              Pre-Register
            </button>

            {/* Student Login — secondary CTA */}
            <Link
              href="/student-login"
              style={{ ...BTN_BASE, paddingLeft: 18, paddingRight: 18 }}
              className="gap-1.5 bg-white border border-[#C9A84C] text-[#C9A84C] text-[13px] font-semibold rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:bg-[#C9A84C] hover:text-white hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(201,168,76,0.30)] no-underline"
            >
              <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Student Login
            </Link>

            {/* Admin — minimal outlined link */}
            <Link
              href="/admin/login"
              style={{
                ...BTN_BASE,
                height: '40px',
                minHeight: '40px',
                paddingLeft: 14,
                paddingRight: 14,
              }}
              className="border border-gray-200 bg-transparent text-[12px] font-medium text-[#555] rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:border-[#C9A84C] hover:text-[#C9A84C] hover:bg-amber-50/60 no-underline"
            >
              Admin
            </Link>

          </div>

          {/* ── MOBILE — WhatsApp + Hamburger ── */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white transition-colors hover:bg-[#1ebe5d] no-underline"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-10 w-10 rounded-lg flex items-center justify-center text-[#1C1C3A] hover:bg-amber-50 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* ════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              style={{ top: mobileMenuTop }}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed left-0 right-0 z-40 lg:hidden bg-white shadow-2xl border-b-2 border-[#C9A240] overflow-y-auto"
              style={{ top: mobileMenuTop, maxHeight: `calc(100vh - ${mobileMenuTop})` }}
            >
              <div className="max-w-7xl mx-auto px-4 py-5">

                {/* Nav links */}
                <nav className="space-y-1">
                  {navLinks.map(link => {
                    const id       = link.href.replace('#', '')
                    const isActive = activeSection === id
                    return (
                      <Link
                        key={link.label}
                        href={(pathname === '/' ? link.href : `/${link.href}`) as any}
                        onClick={e => {
                          if (pathname === '/') { e.preventDefault(); handleNavClick(link.href) }
                          else setMobileOpen(false)
                        }}
                        className="flex items-center px-4 h-12 rounded-xl text-[14px] font-medium transition-all duration-200 no-underline"
                        style={{
                          color:           isActive ? '#C9A84C' : '#1A1A2E',
                          backgroundColor: isActive ? 'rgba(201,168,76,0.10)' : 'transparent',
                        }}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>

                {/* CTA section */}
                <div className="mt-5 pt-5 border-t border-[#f0e8d0] space-y-3">

                  {/* WhatsApp */}
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all no-underline"
                  >
                    <MessageCircle size={18} />
                    WhatsApp Us
                  </a>

                  {/* Pre-Register */}
                  <button
                    onClick={() => { setMobileOpen(false); onBookClick() }}
                    className="w-full h-12 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 border-0 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C89B2B 100%)' }}
                  >
                    Pre-Register Now
                  </button>

                  {/* Student Login */}
                  <Link
                    href="/student-login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full h-12 rounded-xl border-2 border-[#C9A240] text-[#C9A240] hover:bg-[#C9A240] hover:text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all no-underline"
                  >
                    <GraduationCap size={18} />
                    Student Login
                  </Link>

                  {/* Admin */}
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#555] text-[13px] font-medium flex items-center justify-center gap-2 transition-all no-underline"
                  >
                    <ShieldCheck size={15} className="text-gray-400" />
                    Admin Area
                  </Link>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
