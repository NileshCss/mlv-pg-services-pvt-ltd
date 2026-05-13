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
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(201,168,76,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

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
            {/* Decorative frame */}
            <div
              className="absolute -inset-3 rounded-3xl opacity-20"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.4) 0%, rgba(13,27,133,0.4) 100%)' }}
            />

            <div className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '1 / 1.1' }}>
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=85"
                alt="MLV PG – Your Home in Bangalore"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 img-overlay" />

              {/* Badge */}
              <motion.div
                className="absolute bottom-6 left-6 glass-dark rounded-2xl px-5 py-4"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="text-3xl font-bold leading-tight"
                  style={{ color: '#c9a84c' }}
                >
                  10+
                </div>
                <div className="text-sm text-gray-300 font-medium mt-0.5">Years of Excellence</div>
              </motion.div>

              {/* Top highlight */}
              <div className="absolute top-6 right-6 glass-dark rounded-xl px-3 py-2">
                <div className="text-xs text-gray-400">Opposite</div>
                <div className="text-sm font-bold text-white">Acharya Institute</div>
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
              <h2 className="font-bold text-white leading-tight mb-5">
                More Than Just a PG —<br />
                We Are Your{' '}
                <span className="gradient-text">Family in Bangalore</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                MLV PG SERVICES PVT LTD provides a safe, hygienic, and supportive environment
                for students from across India and abroad, located opposite Acharya Institute
                of Technology.
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-300 font-medium">
                  <CheckCircle size={16} style={{ color: '#c9a84c', flexShrink: 0 }} />
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
                  className="group p-5 rounded-2xl cursor-pointer relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                    style={{ background: 'radial-gradient(circle at 20% 20%, rgba(201,168,76,0.1) 0%, transparent 70%)' }}
                  />
                  <div className="relative">
                    <div className="text-3xl mb-3">{value.icon}</div>
                    <h4 className="font-bold text-white mb-1.5 group-hover:text-secondary-400 transition-colors">
                      {value.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
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
