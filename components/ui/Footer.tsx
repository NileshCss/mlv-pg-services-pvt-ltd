'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import { WHATSAPP_NUMBER, SITE_NAME } from '@/lib/utils/constants'

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ]

  const footerLinks = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <footer className="border-t border-gray-800 bg-gradient-to-b from-gray-900 to-dark-900 pt-20 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-gray-50 mb-4">{SITE_NAME}</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your home away from home. Premium student PG near Acharya Institute with unlimited food, safety, and parent-like care.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-secondary-500 text-gray-400 hover:text-dark-900 transition-all duration-300 group"
                  title={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-bold text-gray-50 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-secondary-400 text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-bold text-gray-50 uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-secondary-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  <a href="tel:919876543210" className="hover:text-secondary-400 transition-colors">
                    +91 98765 43210
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-secondary-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  <a href="mailto:info@mlvpg.com" className="hover:text-secondary-400 transition-colors">
                    info@mlvpg.com
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-secondary-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Opposite Acharya Institute<br />
                  Bangalore, Karnataka 560107
                </span>
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-bold text-gray-50 uppercase tracking-wider mb-4">
              Get In Touch
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Have questions? Chat with us on WhatsApp or drop us an email.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-dark-900 rounded-lg font-semibold hover:bg-secondary-600 transition-colors text-sm"
            >
              💬 WhatsApp Us
            </a>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-gray-500 text-sm">
            © 2024 {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with ❤️ for students
          </p>
          <p className="text-gray-500 text-sm">
            <a href="#" className="hover:text-secondary-400 transition-colors">
              Privacy
            </a>
            {' '} • {' '}
            <a href="#" className="hover:text-secondary-400 transition-colors">
              Terms
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export { Footer }
