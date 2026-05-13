'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import { motion } from 'motion/react'
import { WHATSAPP_NUMBER, SITE_NAME } from '@/lib/utils/constants'

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: '#E1306C' },
    { icon: Facebook, href: '#', label: 'Facebook', color: '#1877F2' },
    { icon: Youtube, href: '#', label: 'YouTube', color: '#FF0000' },
  ]

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <footer
      className="relative overflow-hidden pt-16 pb-8"
      style={{
        background: 'linear-gradient(180deg, #0a0f1e 0%, #050810 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm text-dark-900"
                style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #dcc9a0 100%)' }}
              >
                MLV
              </div>
              <div>
                <div className="text-sm font-bold text-white">{SITE_NAME}</div>
                <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#c9a84c' }}>
                  Premium PG · Bangalore
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your home away from home. Premium student PG near Acharya Institute with unlimited
              food, safety, and parent-like care since 2014.
            </p>
            {/* Socials */}
            <div className="flex gap-2.5">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  title={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <social.icon
                    size={16}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-gray-500 hover:text-secondary-400 text-sm font-medium transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-secondary-600 group-hover:bg-secondary-400 transition-colors flex-shrink-0"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:919876543210"
                  className="flex items-start gap-3 group"
                >
                  <Phone size={15} className="text-secondary-600 mt-0.5 flex-shrink-0 group-hover:text-secondary-400 transition-colors" />
                  <span className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors">
                    +91 98765 43210
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@mlvpg.com"
                  className="flex items-start gap-3 group"
                >
                  <Mail size={15} className="text-secondary-600 mt-0.5 flex-shrink-0 group-hover:text-secondary-400 transition-colors" />
                  <span className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors">
                    info@mlvpg.com
                  </span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-secondary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500 text-sm leading-relaxed">
                    Opposite Acharya Institute,<br />
                    Bangalore, Karnataka 560107
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Quick Enquiry
            </h4>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Chat with us instantly on WhatsApp for the fastest response.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I'm interested in booking a room at MLV PG.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm text-dark-900 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                boxShadow: '0 4px 20px rgba(37,211,102,0.25)',
              }}
            >
              <span className="text-xl">💬</span>
              WhatsApp Us
            </a>

            <div className="mt-5 flex items-center gap-2 text-xs text-gray-600">
              <span
                className="w-2 h-2 rounded-full bg-green-500"
                style={{ boxShadow: '0 0 8px rgba(34,197,94,0.8)' }}
              />
              <span>Usually replies within minutes</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Made with ❤️ for students across India
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="text-gray-600 hover:text-secondary-400 transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-700">·</span>
            <a href="#" className="text-gray-600 hover:text-secondary-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
