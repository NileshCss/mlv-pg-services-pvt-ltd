'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const AboutSection: React.FC = () => {
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
      description: 'Care, safety, hygiene, respect and student satisfaction above all.',
    },
    {
      icon: '🤝',
      title: 'Our Promise',
      description: 'We treat every student like our own family — always.',
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
    <section id="about" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80"
                alt="MLV PG About"
                width={600}
                height={600}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />

              {/* Badge */}
              <motion.div
                className="absolute bottom-6 left-6 bg-gray-900/95 backdrop-blur rounded-xl px-4 py-3 border border-secondary-500/30 glass-effect"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-3xl font-bold text-secondary-500 mb-1">10+</div>
                <div className="text-sm text-gray-300">Years of Excellence</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <div className="inline-block px-3 py-1 rounded-full bg-secondary-500/10 border border-secondary-500/30 mb-4">
                <span className="text-xs font-semibold text-secondary-400">About Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                More Than Just a PG,<br />
                We Are Your <span className="gradient-text">Family</span> in Bangalore
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                MLV PG SERVICES PVT LTD provides a safe, hygienic, and supportive environment for students from across India and abroad, located opposite Acharya Institute of Technology.
              </p>
            </motion.div>

            {/* Values Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-secondary-500/50 hover:bg-gray-800 transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-3xl mb-2">{value.icon}</div>
                  <h4 className="font-bold text-gray-50 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-400">{value.description}</p>
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
