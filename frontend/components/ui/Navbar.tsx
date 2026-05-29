'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, MessageCircle, GraduationCap } from 'lucide-react'
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

const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Scroll effect for navbar shrinking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = navLinks.map(l => l.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 100) {
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
      if (window.innerWidth >= 1280) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  const handleNavClick = useCallback((href: string) => {
    setMobileMenuOpen(false)
    const id = href.replace('#', '')
    if (pathname === '/') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      router.push(`/${href}` as any)
    }
  }, [pathname, router])

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed z-50 w-full overflow-visible min-h-[64px] transition-all duration-300 bg-white/95 backdrop-blur-sm border-b border-[#f0e8d0]`}
        style={{
          top: '38px',
          height: scrolled ? '64px' : '78px',
          minHeight: '64px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo Section */}
            <Link
              href={pathname === '/' ? '#home' : '/'}
              className="flex items-center gap-3 group flex-shrink-0"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault()
                  handleNavClick('#home')
                }
              }}
            >
              {/* Logo Image with Premium Styling */}
              <div className="relative transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(201,162,64,0.3)] overflow-visible">
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -inset-1"
                  style={{
                    boxShadow: '0 0 14px rgba(201,162,64,0.6)',
                  }}
                />
                <div className="relative ring-2 ring-[#C9A240] ring-offset-1 ring-offset-white rounded-full overflow-hidden w-[44px] h-[44px] sm:w-[56px] sm:h-[56px]"
                  style={{
                    boxShadow: '0 0 8px rgba(201,162,64,0.3)',
                  }}
                >
                  <Image
                    src="/images/logo.png"
                    alt={SITE_NAME}
                    width={56}
                    height={56}
                    priority
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <h1
                  className="text-[15px] sm:text-[17px] font-playfair font-black text-[#1C1C3A] leading-tight"
                >
                  MLV PG Services
                </h1>
                <p
                  className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.18em] text-[#C9A240] font-jakarta font-semibold mt-0.5"
                >
                  PREMIUM PG · BANGALORE
                </p>
              </div>
            </Link>

            {/* Nav Links — visible from xl upward to avoid laptop/tablet crowding */}
            <div className="hidden xl:flex items-center gap-6 xl:gap-8 flex-shrink-0 mx-6">
              {navLinks.map((link) => {
                const id = link.href.replace('#', '')
                const isActive = activeSection === id
                return (
                  <Link
                    key={link.label}
                    href={(pathname === '/' ? link.href : `/${link.href}`) as any}
                    onClick={(e) => {
                      if (pathname === '/') {
                        e.preventDefault()
                        handleNavClick(link.href)
                      }
                    }}
                    className="relative text-[12px] lg:text-[13px] font-medium transition-all duration-300 group whitespace-nowrap flex-shrink-0"
                    style={{ color: isActive ? '#C9A240' : '#1C1C3A' }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = '#C9A240'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = '#1C1C3A'
                      }
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: '#C9A240' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side Buttons — visible on xl+ */}
            <div className="hidden xl:flex items-center gap-2.5 flex-shrink-0">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.535 5.877L.057 23.492a.5.5 0 00.614.614l5.725-1.498A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.523-5.222-1.432l-.374-.22-3.898 1.02 1.04-3.8-.242-.382A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </a>

              {/* Pre-Register */}
              <button
                onClick={onBookClick}
                className="h-10 px-4 bg-[#C9A84C] hover:bg-[#b8963e] text-white text-sm font-medium rounded-full inline-flex items-center justify-center whitespace-nowrap transition-all"
              >
                Pre-Register
              </button>

              {/* Student Login */}
              <Link
                href="/student-login"
                className="h-10 px-4 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white bg-transparent text-sm font-medium rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student Login
              </Link>

              {/* Admin */}
              <Link
                href="/admin/login"
                className="h-10 inline-flex items-center text-sm font-medium text-[#1C1C3A] hover:text-[#C9A84C] transition-colors px-1"
              >
                Admin
              </Link>
            </div>

            {/* Tablet & Mobile header right — Pre-Register pill + hamburger */}
            <div className="xl:hidden flex items-center gap-2">
              {/* Mini Pre-Register pill visible on mobile */}
              <button
                onClick={onBookClick}
                className="bg-[#C9A240] hover:bg-[#b8891a] text-white rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 whitespace-nowrap min-h-[36px]"
              >
                Pre-Register
              </button>
              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-[#f0e8d0] transition-colors duration-300 text-[#1C1C3A] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop for outside click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[108px] bg-black/40 xl:hidden z-30"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[108px] left-0 right-0 bg-white border-b-2 border-[#C9A240] xl:hidden z-40 shadow-xl max-h-[calc(100vh-108px)] overflow-y-auto"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
                {/* Mobile Nav Links */}
                {navLinks.map((link) => {
                  const id = link.href.replace('#', '')
                  const isActive = activeSection === id
                  return (
                    <Link
                      key={link.label}
                      href={(pathname === '/' ? link.href : `/${link.href}`) as any}
                      onClick={(e) => {
                        if (pathname === '/') {
                          e.preventDefault()
                          handleNavClick(link.href)
                        } else {
                          setMobileMenuOpen(false)
                        }
                      }}
                      className="w-full text-left px-4 min-h-[48px] h-[48px] flex items-center rounded-lg text-[14px] font-medium transition-all duration-300 active:bg-gray-100"
                      style={{
                        color: isActive ? '#C9A84C' : '#1A1A2E',
                        backgroundColor: isActive ? 'rgba(201,162,64,0.1)' : 'transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                })}

                <div className="border-t border-[#f0e8d0] pt-3 mt-3 space-y-3">
                  {/* Mobile WhatsApp Button */}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#1da851] text-white rounded-lg px-4 min-h-[48px] h-[48px] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <MessageCircle size={18} />
                    WhatsApp Us
                  </a>

                  {/* Mobile Pre-Register Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onBookClick()
                    }}
                    className="w-full bg-[#C9A240] hover:bg-[#b8891a] text-white rounded-lg px-4 min-h-[48px] h-[48px] text-sm font-bold transition-all duration-300"
                  >
                    Pre-Register Now
                  </button>

                  {/* Mobile Student Login */}
                  <Link
                    href="/student-login"
                    className="w-full flex items-center justify-center gap-2 border-2 border-[#C9A240] text-[#C9A240] hover:bg-[#C9A240] hover:text-white rounded-lg px-4 min-h-[48px] h-[48px] text-sm font-bold transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <GraduationCap size={18} />
                    Student Login Portal
                  </Link>

                  {/* Mobile Admin Link */}
                  <Link
                    href="/admin/login"
                    className="w-full text-center bg-gray-100 hover:bg-gray-200 text-[#1C1C3A] rounded-lg px-4 min-h-[48px] h-[48px] flex items-center justify-center text-sm font-medium transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
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

