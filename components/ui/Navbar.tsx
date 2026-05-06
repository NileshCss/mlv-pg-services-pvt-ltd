'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { WHATSAPP_NUMBER, SITE_NAME } from '@/lib/utils/constants'

interface NavbarProps {
  onBookClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav className="sticky top-0 z-40 glass-effect border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 text-dark-900 font-bold text-lg group-hover:shadow-lg transition-shadow">
              MLV
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-50">{SITE_NAME}</div>
              <div className="text-xs text-secondary-400">Pvt Ltd</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-secondary-400 transition-colors rounded-lg hover:bg-gray-800/50"
                whileHover={{ x: 2 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-400 hover:text-secondary-300 transition-colors"
            >
              💬 WhatsApp
            </a>
            <Button
              onClick={onBookClick}
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Book Now
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 hover:bg-gray-800 transition-colors text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Book Button */}
            <Button
              onClick={onBookClick}
              variant="secondary"
              size="sm"
              className="md:hidden"
            >
              Book
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-gray-800 py-4 space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium text-gray-300 hover:text-secondary-400 hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm font-medium text-secondary-400 hover:text-secondary-300 transition-colors"
            >
              💬 WhatsApp
            </a>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export { Navbar }
