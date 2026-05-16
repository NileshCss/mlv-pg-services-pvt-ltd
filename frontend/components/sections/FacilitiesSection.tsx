'use client'

import React from 'react'
import { motion } from 'motion/react'
import { FACILITIES } from '@/lib/utils/constants'

const FacilitiesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as any },
    },
  }

  return (
    <section
      id="facilities"
      className="relative overflow-hidden"
      style={{
        background: '#F8F6F1',
        padding: 'clamp(40px, 5vw, 72px) 0',
      }}
    >
      {/* Subtle gold ambient */}
      <div
        className="absolute -top-32 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.35) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Facilities</span>
          <h2
            className="font-bold mb-5"
            style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
          >
            Everything You Need,{' '}
            <span className="gradient-text">All in One Place</span>
          </h2>
          <p
            className="max-w-2xl mx-auto text-lg leading-relaxed"
            style={{ color: '#4A4A6A' }}
          >
            We've thought of everything so you can focus on what matters — your studies and your growth.
          </p>
        </motion.div>

        {/* Facilities Grid — 4-col desktop, 2-col tablet, 1-col mobile */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {FACILITIES.map((facility, idx) => (
            <motion.div
              key={idx}
              className="group relative p-6 rounded-2xl cursor-pointer overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1px solid #EBEBF0',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
              }}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              onHoverStart={(e: any) => {
                const el = e.currentTarget
                if (el) {
                  el.style.borderColor = 'rgba(201,168,76,0.4)'
                  el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'
                }
              }}
              onHoverEnd={(e: any) => {
                const el = e.currentTarget
                if (el) {
                  el.style.borderColor = '#EBEBF0'
                  el.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'
                }
              }}
            >
              {/* Gold top accent bar on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C96B)' }}
              />

              {/* Gold ambient on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)' }}
              />

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                <span
                  className="text-2xl"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.3))' }}
                >
                  {facility.icon}
                </span>
              </div>

              <h3
                className="text-base font-bold mb-2 transition-colors duration-300"
                style={{
                  color: '#1A1A2E',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {facility.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#8A8AA0' }}
              >
                {facility.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Food Feature Banner */}
        <motion.div
          className="mt-14 rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(245,230,192,0.15) 100%)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {/* Decorative orb */}
          <div
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 px-8 md:px-16 py-10 md:py-12 text-center">
            <div className="text-5xl mb-4">🍛</div>
            <h3
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
            >
              Unlimited Food, Unlimited Happiness
            </h3>
            <p
              className="max-w-xl mx-auto leading-relaxed"
              style={{ color: '#4A4A6A' }}
            >
              Enjoy delicious, fresh & hygienic meals 3× a day with unlimited quantity.
              North Indian, South Indian, and healthy home-cooked options every day.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {['🌅 Breakfast', '☀️ Lunch', '🌙 Dinner'].map((meal) => (
                <span
                  key={meal}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(201,168,76,0.35)',
                    color: '#C9A84C',
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {meal}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { FacilitiesSection }



