'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Clock, ExternalLink, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'
import { ComplaintFormModal } from '@/components/forms/ComplaintFormModal'

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    content: '+91 88096 30649',
    sub: 'Mon–Sun, 8 AM – 10 PM',
    link: 'tel:918809630649',
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
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
}

const ContactSection: React.FC = () => {
  const [complaintOpen, setComplaintOpen] = useState(false)

  return (
    <>
    <section
      id="contact"
      className="relative overflow-hidden"
      style={{
        background: '#F8F6F1',
        padding: 'clamp(40px, 5vw, 72px) 0',
      }}
    >
      {/* Gold ambient */}
      <div
        className="absolute -bottom-24 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Contact</span>
          <h2
            className="font-bold mb-5"
            style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
          >
            Get In{' '}
            <span className="gradient-text">Touch With Us</span>
          </h2>
          <p
            className="max-w-2xl mx-auto text-lg leading-relaxed"
            style={{ color: '#4A4A6A' }}
          >
            Have questions? We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form — white card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as any }}
          >
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: '#FFFFFF',
                border: '1px solid #EBEBF0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              <ContactForm />
            </div>
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
                    style={{
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.2)',
                    }}
                  >
                    <info.icon size={20} style={{ color: '#C9A84C' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                      style={{ color: '#8A8AA0', fontFamily: 'Poppins, sans-serif' }}
                    >
                      {info.title}
                    </div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: '#1A1A2E', fontFamily: 'Inter, sans-serif' }}
                    >
                      {info.content}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: '#8A8AA0' }}
                    >
                      {info.sub}
                    </div>
                  </div>
                  {info.external && (
                    <ExternalLink size={14} style={{ color: '#8A8AA0' }} className="flex-shrink-0" />
                  )}
                </>
              )

              const sharedClass = 'flex items-center gap-4 p-5 rounded-2xl group transition-all duration-300'
              const sharedStyle = {
                background: '#FFFFFF',
                border: '1px solid #EBEBF0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }
              const hoverStyle = {
                borderColor: 'rgba(201,168,76,0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }

              return (
                <motion.div key={idx} variants={itemVariants}>
                  {info.link ? (
                    <a
                      href={info.link}
                      target={info.external ? '_blank' : undefined}
                      rel={info.external ? 'noopener noreferrer' : undefined}
                      className={sharedClass}
                      style={sharedStyle}
                      onMouseEnter={e => {
                        Object.assign((e.currentTarget as HTMLElement).style, hoverStyle)
                      }}
                      onMouseLeave={e => {
                        Object.assign((e.currentTarget as HTMLElement).style, sharedStyle)
                      }}
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

            {/* Raise a Complaint CTA */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setComplaintOpen(true)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl group transition-all duration-300 text-left"
                style={{
                  background: 'rgba(231,76,60,0.04)',
                  border: '1.5px solid rgba(231,76,60,0.2)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  Object.assign((e.currentTarget as HTMLElement).style, {
                    borderColor: 'rgba(231,76,60,0.45)',
                    boxShadow: '0 4px 20px rgba(231,76,60,0.12)',
                    background: 'rgba(231,76,60,0.07)',
                  })
                }}
                onMouseLeave={e => {
                  Object.assign((e.currentTarget as HTMLElement).style, {
                    borderColor: 'rgba(231,76,60,0.2)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    background: 'rgba(231,76,60,0.04)',
                  })
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)' }}
                >
                  <MessageSquare size={20} style={{ color: '#E74C3C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#E74C3C', fontFamily: 'Poppins, sans-serif' }}>
                    Have an Issue?
                  </div>
                  <div className="font-semibold text-sm" style={{ color: '#1A1A2E', fontFamily: 'Inter, sans-serif' }}>
                    Raise a Complaint
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#8A8AA0' }}>
                    Resolved within 24 hours · Instant admin alert
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Map */}
            <motion.div
              className="rounded-2xl overflow-hidden"
              style={{ height: '240px', border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              variants={itemVariants}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9833862255305!2d77.61220721161267!3d13.148299912156657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sAcharya%20Institute%20of%20Technology!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
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

    <ComplaintFormModal open={complaintOpen} onOpenChange={setComplaintOpen} />
    </>
  )
}

export { ContactSection }



