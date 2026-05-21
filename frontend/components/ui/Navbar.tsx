'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, MessageCircle } from 'lucide-react'
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
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
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
        className={`fixed z-50 w-full overflow-visible min-h-[68px] transition-all duration-300 bg-white/95 backdrop-blur-sm border-b border-[#f0e8d0]`}
        style={{
          top: '38px',
          height: scrolled ? '58px' : '70px',
          minHeight: '68px',
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

              {/* Brand Name - Hidden on Mobile */}
              <div className="hidden sm:block">
                <h1
                  className="text-[17px] font-playfair font-black text-[#1C1C3A] leading-tight"
                >
                  MLV PG Services
                </h1>
                <p
                  className="text-[9px] tracking-[0.18em] text-[#C9A240] font-jakarta font-semibold mt-0.5"
                >
                  PREMIUM PG · BANGALORE
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-3 lg:gap-5 flex-1 mx-4 lg:mx-8 overflow-hidden">
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
                    style={{
                      color: isActive ? '#C9A240' : '#1C1C3A',
                    }}
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

            {/* Right Side Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1da851] text-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all duration-300 hover:shadow-md whitespace-nowrap"
              >
                <MessageCircle size={14} />
                <span className="hidden lg:inline">WhatsApp</span>
              </a>

              {/* Pre-Register Button */}
              <button
                onClick={onBookClick}
                className="bg-[#C9A240] hover:bg-[#b8891a] text-white rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:shadow-md whitespace-nowrap"
              >
                Pre-Register
              </button>

              {/* Admin Link */}
              <Link
                href="/admin/login"
                className="text-[12px] font-medium text-[#1C1C3A] hover:text-[#C9A240] transition-colors duration-300 px-2 py-1.5 whitespace-nowrap"
              >
                Admin
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-[#f0e8d0] transition-colors duration-300 text-[#1C1C3A]"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[108px] left-0 right-0 bg-white border-b border-[#f0e8d0] md:hidden z-40 shadow-lg"
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
                    className="w-full text-left px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-300 block"
                    style={{
                      color: isActive ? '#C9A84C' : '#1C1C3A',
                      backgroundColor: isActive ? 'rgba(201,162,64,0.1)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className="border-t border-[#f0e8d0] pt-3 mt-3 space-y-2">
                {/* Mobile WhatsApp Button */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1da851] text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-300"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>

                {/* Mobile Pre-Register Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onBookClick()
                  }}
                  className="w-full bg-[#C9A240] hover:bg-[#b8891a] text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                >
                  Pre-Register
                </button>

                {/* Mobile Admin Link */}
                <Link
                  href="/admin/login"
                  className="w-full text-center bg-[#f0e8d0] hover:bg-[#e8dfc0] text-[#1C1C3A] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar

