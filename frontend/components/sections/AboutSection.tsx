'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { CheckCircle } from 'lucide-react'

const values = [
  {
    icon: '🎯',
    title: 'Our Mission',
    description: 'Safe, comfortable, and nourishing home for students far from family.',
  },
  {
    icon: '👁️',
    title: 'Our Vision',
    description: 'To be the most trusted PG brand in Bangalore for students.',
  },
  {
    icon: '💛',
    title: 'Our Value',
    description: 'Care, safety, hygiene, respect, and student satisfaction above all.',
  },
  {
    icon: '🤝',
    title: 'Our Promise',
    description: 'We treat every student like our own family — always.',
  },
]

const highlights = [
  'CCTV surveillance 24/7',
  'Housekeeping & laundry',
  'Peaceful study environment',
  'Parent-like care',
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

const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative overflow-hidden"
      style={{
        background: '#FFFFFF',
        padding: 'clamp(40px, 5vw, 72px) 0',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Image Column ──────────────────────────────────── */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] as any }}
          >
            {/* Decorative gold left-border accent */}
            <div
              className="absolute -left-4 top-12 bottom-12 w-1 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #C9A84C, transparent)' }}
            />

            <div
              className="relative rounded-2xl overflow-hidden group"
              style={{
                aspectRatio: '1 / 1.1',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=85"
                alt="MLV PG Services Bangalore – Student PG with food near Hesaraghatta Road"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 img-overlay" />

              {/* Badge — years of excellence */}
              <motion.div
                className="absolute bottom-6 left-6 rounded-2xl px-5 py-4"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(201,168,76,0.25)',
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="text-3xl font-bold leading-tight"
                  style={{ color: '#C9A84C', fontFamily: 'Playfair Display, serif' }}
                >
                  10+
                </div>
                <div
                  className="text-sm font-medium mt-0.5"
                  style={{ color: '#4A4A6A' }}
                >
                  Years of Excellence
                </div>
              </motion.div>

              {/* Top badge */}
              <div
                className="absolute top-6 right-6 rounded-xl px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                <div
                  className="text-xs"
                  style={{ color: '#8A8AA0', fontFamily: 'Inter, sans-serif' }}
                >
                  Opposite
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: '#1A1A2E' }}
                >
                  Acharya Institute
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Content Column ────────────────────────────────── */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={itemVariants}>
              <span className="section-badge mb-5 inline-block">✦ About Us</span>
              <h2
                className="font-bold leading-tight mb-5"
                style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
              >
                More Than Just a PG —<br />
                We Are Your{' '}
                <span className="gradient-text">Family in Bangalore</span>
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: '#4A4A6A' }}
              >
                MLV PG Services Pvt Ltd is Bangalore's most-loved North Indian PG, situated
                directly opposite <strong style={{ color: '#1A1A2E' }}>Acharya Institute of
                Technology (AIT)</strong> in Soladevanahalli. Students from{' '}
                <strong style={{ color: '#1A1A2E' }}>Acharya Institute of Graduate Studies
                (AIGS)</strong> and <strong style={{ color: '#1A1A2E' }}>Acharya College</strong>{' '}
                choose us because we offer something rare — authentic North Indian home-cooked
                meals (dal, roti, sabzi, rice) served fresh every day, a hygienically maintained
                kitchen, and staff who treat every resident like their own child. Safe
                accommodation for both boys and girls, starting at just ₹7,500/month.
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
              {highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-sm font-medium"
                  style={{ color: '#4A4A6A' }}
                >
                  <CheckCircle
                    size={16}
                    style={{ color: '#C9A84C', flexShrink: 0 }}
                  />
                  <span>{h}</span>
                </div>
              ))}
            </motion.div>

            {/* Values Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
              variants={containerVariants}
            >
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  className="group p-5 rounded-2xl cursor-pointer relative overflow-hidden card-hover"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #EBEBF0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                >
                  {/* Hover gold glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                    style={{ background: 'radial-gradient(circle at 20% 20%, rgba(201,168,76,0.06) 0%, transparent 70%)' }}
                  />
                  <div className="relative">
                    <div className="text-3xl mb-3">{value.icon}</div>
                    <h4
                      className="font-bold mb-1.5"
                      style={{
                        color: '#1A1A2E',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '15px',
                      }}
                    >
                      {value.title}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#8A8AA0' }}
                    >
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export { AboutSection }



