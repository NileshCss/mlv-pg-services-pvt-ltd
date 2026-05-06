'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FACILITIES } from '@/lib/utils/constants'

const FacilitiesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
    <section
      id="facilities"
      className="py-20 md:py-28 relative"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-transparent" />
      </div>

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
            <span className="text-xs font-semibold text-secondary-400">Facilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need,<br />
            <span className="gradient-text">All in One Place</span>
          </h2>
        </motion.div>

        {/* Facilities Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FACILITIES.map((facility, idx) => (
            <motion.div
              key={idx}
              className="group p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-secondary-500/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {facility.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-50 mb-2 group-hover:text-secondary-400 transition-colors">
                {facility.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {facility.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Food Section */}
        <motion.div
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-secondary-500/10 to-primary-900/10 border border-secondary-500/20 glass-effect"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-50 mb-2">
              Unlimited Food,<br />
              Unlimited Happiness 🍛
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Enjoy delicious, fresh and hygienic meals 3 times a day with unlimited quantity. North Indian, South Indian, and healthy home-cooked options available daily.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { FacilitiesSection }
