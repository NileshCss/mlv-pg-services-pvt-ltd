'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    content: '+91 98765 43210',
    sub: 'Mon–Sun, 8 AM – 10 PM',
    link: 'tel:919876543210',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@mlvpg.com',
    sub: 'We reply within 24 hours',
    link: 'mailto:info@mlvpg.com',
  },
  {
    icon: MapPin,
    title: 'Location',
    content: 'Opposite Acharya Institute',
    sub: 'Bangalore, Karnataka 560107',
    link: 'https://maps.google.com',
    external: true,
  },
  {
    icon: Clock,
    title: 'Visiting Hours',
    content: '9 AM – 6 PM',
    sub: 'Monday to Saturday',
    link: null,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 80% 80%, rgba(201,168,76,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Contact</span>
          <h2 className="font-bold text-white mb-5">
            Get In{' '}
            <span className="gradient-text">Touch With Us</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Have questions? We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ContactForm />
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Info Cards */}
            {contactInfo.map((info, idx) => {
              const Inner = (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
                  >
                    <info.icon size={20} style={{ color: '#c9a84c' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
                      {info.title}
                    </div>
                    <div className="font-semibold text-white text-sm">{info.content}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{info.sub}</div>
                  </div>
                  {info.external && (
                    <ExternalLink size={14} className="text-gray-600 flex-shrink-0" />
                  )}
                </>
              )

              const sharedClass =
                'flex items-center gap-4 p-5 rounded-2xl group transition-all duration-300'
              const sharedStyle = {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }

              return (
                <motion.div key={idx} variants={itemVariants}>
                  {info.link ? (
                    <a
                      href={info.link}
                      target={info.external ? '_blank' : undefined}
                      rel={info.external ? 'noopener noreferrer' : undefined}
                      className={`${sharedClass} hover:border-secondary-500/25 hover:bg-secondary-500/5 cursor-pointer`}
                      style={sharedStyle}
                    >
                      {Inner}
                    </a>
                  ) : (
                    <div className={sharedClass} style={sharedStyle}>
                      {Inner}
                    </div>
                  )}
                </motion.div>
              )
            })}

            {/* Map */}
            <motion.div
              className="rounded-2xl overflow-hidden"
              style={{ height: '240px', border: '1px solid rgba(255,255,255,0.07)' }}
              variants={itemVariants}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9833862255305!2d77.61220721161267!3d13.148299912156657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sAcharya%20Institute%20of%20Technology!2s"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.3) brightness(0.85)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MLV PG Location Map"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export { ContactSection }
