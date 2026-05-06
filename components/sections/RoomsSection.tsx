'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import { ROOM_TYPES } from '@/lib/utils/constants'

interface RoomsSectionProps {
  onBookClick: () => void
}

const RoomsSection: React.FC<RoomsSectionProps> = ({ onBookClick }) => {
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
    <section id="rooms" className="py-20 md:py-28">
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
            <span className="text-xs font-semibold text-secondary-400">Rooms</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-2">
            Choose Your <span className="gradient-text">Comfort</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            All rooms are fully furnished with WiFi and 24/7 Power Backup
          </p>
        </motion.div>

        {/* Rooms Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {ROOM_TYPES.map((room, idx) => (
            <motion.div
              key={idx}
              className={`rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer ${
                room.id === 'double'
                  ? 'md:scale-105 border-secondary-500/50 bg-gray-800/50 shadow-2xl'
                  : 'border-gray-800 bg-gray-900 hover:border-secondary-500/30'
              }`}
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-gray-800">
                <Image
                  src={`https://images.unsplash.com/photo-${
                    room.id === 'single'
                      ? '1631049307264-da0ec9d70304'
                      : room.id === 'double'
                      ? '1555041469-a586c61ea9bc'
                      : '1540932239986-6c6cb0ad8e73'
                  }?w=500&q=80`}
                  alt={room.name}
                  width={500}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {room.id === 'double' && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-secondary-500 text-dark-900 rounded-full text-sm font-bold">
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                  {room.name}
                </span>
                <h3 className="text-2xl font-bold text-gray-50 mt-2 mb-1">
                  {room.description}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-secondary-500">₹{room.price.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">/Month</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {room.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-gray-300 text-sm">
                      <Check size={16} className="text-secondary-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={onBookClick}
                  variant={room.id === 'double' ? 'secondary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  Book Now
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { RoomsSection }
