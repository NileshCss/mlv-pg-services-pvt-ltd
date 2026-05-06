'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'
import { HERO_CONTENT, WHATSAPP_NUMBER } from '@/lib/utils/constants'

interface HeroSectionProps {
  onBookClick: () => void
  onContactClick?: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onContactClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const pillVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-20 md:pt-0"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 to-dark-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6 lg:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/10 border border-secondary-500/30 w-fit"
              variants={itemVariants}
            >
              <span className="text-lg">🏛️</span>
              <span className="text-sm font-medium text-secondary-400">
                {HERO_CONTENT.badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block text-gray-50">{HERO_CONTENT.heading.split('\n')[0]}</span>
                <span className="block">
                  Near <span className="gradient-text">{HERO_CONTENT.heading.split('\n')[1].split(' ').slice(-2).join(' ')}</span>
                </span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p
              className="text-lg text-gray-300 leading-relaxed max-w-lg"
              variants={itemVariants}
            >
              {HERO_CONTENT.subheading}
            </motion.p>

            {/* Pills */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 flex-wrap"
              variants={containerVariants}
            >
              {HERO_CONTENT.pills.map((pill, idx) => (
                <motion.div
                  key={idx}
                  className="px-4 py-2 rounded-full bg-gray-800 text-sm font-medium text-gray-200 flex items-center gap-2"
                  variants={pillVariants}
                >
                  <span>{pill.split(' ')[0]}</span>
                  <span>{pill.split(' ').slice(1).join(' ')}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
            >
              <Button
                onClick={onBookClick}
                variant="secondary"
                size="lg"
                className="sm:w-auto"
              >
                Pre-Reserve Now
              </Button>
              <Button
                onClick={onContactClick}
                variant="outline"
                size="lg"
                className="sm:w-auto"
              >
                Book a Visit
              </Button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="sm:w-auto"
                >
                  💬 WhatsApp
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-800"
              variants={containerVariants}
            >
              {HERO_CONTENT.stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="space-y-1"
                  variants={itemVariants}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-500">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80"
                alt="MLV PG Building"
                width={600}
                height={600}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />

              {/* Floating Card */}
              <motion.div
                className="absolute bottom-6 right-6 bg-gray-900/95 backdrop-blur rounded-xl p-4 border border-gray-800 glass-effect"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-2xl font-bold text-secondary-500 mb-1">4.9/5</div>
                <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
                <div className="text-xs text-gray-400">Trusted by 500+ students</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 text-gray-400 hover:text-secondary-500 transition-colors"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown size={20} />
        </button>
      </motion.div>
    </section>
  )
}

export { HeroSection }
