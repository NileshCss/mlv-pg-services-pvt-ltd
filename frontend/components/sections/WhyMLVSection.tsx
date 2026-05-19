'use client'

import React from 'react'
import { motion } from 'motion/react'

const benefits = [
  {
    icon: '🍲',
    title: 'Authentic North Indian Food',
    description:
      'Dal, roti, sabzi, and steamed rice prepared fresh every day — exactly like home. We are one of the only PGs near Acharya College that serves genuine North Indian meals, not canteen fare.',
    tag: 'Our Signature',
  },
  {
    icon: '🧼',
    title: 'Hygienic Kitchen, Always',
    description:
      'Our kitchen is cleaned and sanitised daily. Ingredients are sourced fresh every morning. No stale food, no shortcuts — just wholesome meals cooked the way your mother would.',
    tag: 'Hygiene First',
  },
  {
    icon: '🤗',
    title: 'Parent-Like Care',
    description:
      'Our staff knows every resident by name. We check in if you miss a meal, celebrate your birthday, and stand by you through exam stress. This is not just a PG — it is your family in Bangalore.',
    tag: 'Feel at Home',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure for All',
    description:
      '24/7 CCTV surveillance, biometric entry, gated premises, and on-site female staff for girl residents. Parents of our students call us the safest PG near Acharya Institute of Technology.',
    tag: 'Boys & Girls',
  },
  {
    icon: '🚶',
    title: 'Walking Distance from Acharya',
    description:
      'Just a 2-minute walk from Acharya Institute of Technology (AIT). Students from Acharya Institute of Graduate Studies (AIGS) and Acharya College are also within easy walking distance.',
    tag: '2 Min Walk',
  },
  {
    icon: '💰',
    title: 'Honest, Affordable Pricing',
    description:
      'Triple sharing from ₹7,500/month. Single rooms from ₹13,000/month. Everything included — North Indian food, WiFi, power backup, housekeeping, laundry, and CCTV. No hidden charges, ever.',
    tag: 'From ₹7,500/mo',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
}

const WhyMLVSection: React.FC = () => {
  return (
    <section
      id="why-mlv"
      className="relative overflow-hidden"
      style={{
        background: '#FFFFFF',
        padding: 'clamp(48px, 6vw, 80px) 0',
      }}
    >
      {/* Subtle background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Why Choose Us</span>
          <h2
            className="font-bold mb-4 leading-tight"
            style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
          >
            Why Students Near Acharya Choose{' '}
            <span className="gradient-text">MLV PG</span>
          </h2>
          <p
            className="max-w-2xl mx-auto text-base leading-relaxed"
            style={{ color: '#4A4A6A', fontFamily: 'Inter, sans-serif' }}
          >
            From authentic North Indian food to parent-like care — here is what makes MLV PG
            the top choice for students at Acharya Institute of Technology, AIGS, and
            Acharya College.
          </p>
        </motion.div>

        {/* Benefit Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              className="group relative rounded-2xl p-7 cursor-default overflow-hidden card-hover"
              style={{
                background: '#FAFAF8',
                border: '1px solid #EBEBF0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
            >
              {/* Hover gold glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background:
                    'radial-gradient(circle at 15% 20%, rgba(201,168,76,0.07) 0%, transparent 65%)',
                }}
              />

              {/* Top row: icon + tag */}
              <div className="relative flex items-start justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.2)',
                  }}
                >
                  {benefit.icon}
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.2)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {benefit.tag}
                </span>
              </div>

              {/* Text */}
              <div className="relative">
                <h3
                  className="font-bold mb-2.5 text-base leading-snug"
                  style={{ color: '#1A1A2E', fontFamily: 'Poppins, sans-serif' }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#6A6A8A', fontFamily: 'Inter, sans-serif' }}
                >
                  {benefit.description}
                </p>
              </div>

              {/* Bottom gold accent line on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C96B)' }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Location callout */}
        <motion.div
          className="mt-12 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)',
            border: '1px solid rgba(201,168,76,0.22)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-3xl">📍</div>
          <div className="flex-1 text-center sm:text-left">
            <p
              className="font-semibold text-base mb-1"
              style={{ color: '#1A1A2E', fontFamily: 'Poppins, sans-serif' }}
            >
              MLV PG Services Pvt Ltd
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#4A4A6A', fontFamily: 'Inter, sans-serif' }}
            >
              Opp. Acharya Institute of Technology, Soladevanahalli (K.G. Tammenahalli),
              Hesaraghatta Road, Bangalore – 560107.{' '}
              <span style={{ color: '#6A6A8A' }}>
                Convenient for students at Acharya Institute of Technology (AIT), Acharya
                Institute of Graduate Studies (AIGS), and Acharya College.
              </span>
            </p>
          </div>
          <a
            href="https://www.google.com/maps?q=13.0834,77.4837"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 hover:scale-105 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
              color: '#1A1A2E',
              boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            🗺️ View on Map
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export { WhyMLVSection }
