'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, MessageSquareWarning } from 'lucide-react'
import { motion } from 'motion/react'
import { WHATSAPP_NUMBER, SITE_NAME } from '@/lib/utils/constants'
import { ComplaintFormModal } from '@/components/forms/ComplaintFormModal'

const Footer: React.FC = () => {
  const [complaintOpen, setComplaintOpen] = useState(false)
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
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
        background: '#1A1A2E',
        borderTop: '3px solid',
        borderImage: 'linear-gradient(90deg, transparent, #C9A84C 30%, #E8C96B 50%, #C9A84C 70%, transparent) 1',
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-1">
            {/* Gold Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96B 100%)',
                  color: '#1A1A2E',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                MLV
              </div>
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ color: '#ffffff', fontFamily: 'Playfair Display, serif' }}
                >
                  {SITE_NAME}
                </div>
                <div
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: '#C9A84C', fontFamily: 'Poppins, sans-serif' }}
                >
                  Premium PG · Bangalore
                </div>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Your home away from home. Premium student PG near Acharya Institute with unlimited
              food, safety, and parent-like care since 2014.
            </p>
            {/* Social icons — gold on hover */}
            <div className="flex gap-2.5">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  title={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(201,168,76,0.15)'
                    el.style.borderColor = 'rgba(201,168,76,0.4)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.05)'
                    el.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  <social.icon
                    size={16}
                    className="transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Poppins, sans-serif' }}
            >
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-sm font-medium transition-colors duration-300 flex items-center gap-2 group"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C9A84C'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0 transition-colors"
                      style={{ background: 'rgba(201,168,76,0.4)' }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Poppins, sans-serif' }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:918809630649"
                  className="flex items-start gap-3 group"
                >
                  <Phone
                    size={15}
                    className="mt-0.5 flex-shrink-0 transition-colors"
                    style={{ color: '#C9A84C' }}
                  />
                  <span
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}
                  >
                    +91 88096 30649
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@mlvpg.com"
                  className="flex items-start gap-3 group"
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <span
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}
                  >
                    info@mlvpg.com
                  </span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}
                  >
                    Opposite Acharya Institute,<br />
                    Bangalore, Karnataka 560107
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Poppins, sans-serif' }}
            >
              Quick Enquiry
            </h4>
            <p
              className="text-sm mb-5 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Chat with us instantly on WhatsApp for the fastest response.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I'm interested in booking a room at MLV PG.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: '#ffffff',
                boxShadow: '0 4px 20px rgba(37,211,102,0.25)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <span className="text-xl">💬</span>
              WhatsApp Us
            </a>

            <div
              className="mt-5 flex items-center gap-2 text-xs"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)' }}
              />
              <span>Usually replies within minutes</span>
            </div>

            {/* Raise a Complaint */}
            <button
              onClick={() => setComplaintOpen(true)}
              className="mt-5 inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(231,76,60,0.15)',
                border: '1.5px solid rgba(231,76,60,0.35)',
                color: '#ff8070',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(231,76,60,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(231,76,60,0.15)')}
            >
              <MessageSquareWarning size={16} />
              Raise a Complaint
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Made with ❤️ for students across India
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="#"
              className="transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C9A84C'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}
            >
              Privacy Policy
            </a>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <a
              href="#"
              className="transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C9A84C'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>

    <ComplaintFormModal open={complaintOpen} onOpenChange={setComplaintOpen} />
  )
}

export { Footer }
