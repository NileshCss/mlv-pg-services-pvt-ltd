'use client'

import React from 'react'
import { motion } from 'framer-motion'
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
    <section id="facilities" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(13,27,133,0.3) 0%, transparent 70%)',
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
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Facilities</span>
          <h2 className="font-bold text-white mb-5">
            Everything You Need,{' '}
            <span className="gradient-text">All in One Place</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            We've thought of everything so you can focus on what matters — your studies and your growth.
          </p>
        </motion.div>

        {/* Facilities Grid */}
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
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
              />

              {/* Border glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.25)' }}
              />

              {/* Icon */}
              <div
                className="text-4xl mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 inline-block"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(201,168,76,0.3))' }}
              >
                {facility.icon}
              </div>

              <h3
                className="text-base font-bold text-white mb-2 group-hover:text-secondary-400 transition-colors duration-300"
              >
                {facility.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                {facility.description}
              </p>

              {/* Corner accent */}
              <div
                className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 100% 100%, rgba(201,168,76,0.15) 0%, transparent 70%)',
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Food Feature Banner */}
        <motion.div
          className="mt-14 rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(13,27,133,0.12) 100%)',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {/* Decorative orb */}
          <div
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 px-8 md:px-16 py-10 md:py-12 text-center">
            <div className="text-5xl mb-4">🍛</div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Unlimited Food, Unlimited Happiness
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
              Enjoy delicious, fresh & hygienic meals 3× a day with unlimited quantity.
              North Indian, South Indian, and healthy home-cooked options every day.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {['🌅 Breakfast', '☀️ Lunch', '🌙 Dinner'].map((meal) => (
                <span
                  key={meal}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-secondary-300"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
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
