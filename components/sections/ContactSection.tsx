'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'

const ContactSection: React.FC = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 98765 43210',
      link: 'tel:919876543210',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@mlvpg.com',
      link: 'mailto:info@mlvpg.com',
    },
    {
      icon: MapPin,
      title: 'Location',
      content: 'Opposite Acharya Institute, Bangalore',
      link: 'https://maps.google.com',
    },
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
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-secondary-500/10 border border-secondary-500/30 mb-4">
            <span className="text-xs font-semibold text-secondary-400">Contact</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get In<br />
            <span className="gradient-text">Touch With Us</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have any questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ContactForm />
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactInfo.map((info, idx) => (
              <motion.a
                key={idx}
                href={info.link}
                target={info.title === 'Location' ? '_blank' : undefined}
                rel={info.title === 'Location' ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-4 p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-secondary-500/30 hover:bg-gray-800/50 transition-all duration-300 group"
                variants={itemVariants}
              >
                <div className="p-3 rounded-lg bg-secondary-500/10 text-secondary-500 group-hover:bg-secondary-500 group-hover:text-dark-900 transition-colors">
                  <info.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-50 mb-1">
                    {info.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-secondary-400 transition-colors">
                    {info.content}
                  </p>
                </div>
              </motion.a>
            ))}

            {/* Map Placeholder */}
            <motion.div
              className="rounded-xl overflow-hidden border border-gray-800 h-80 bg-gray-900"
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
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export { ContactSection }
