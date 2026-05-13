'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Check, Sparkles } from 'lucide-react'
import { ROOM_TYPES } from '@/lib/utils/constants'

interface RoomsSectionProps {
  onBookClick: () => void
}

const ROOM_IMAGES: Record<string, string> = {
  single: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  double: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  triple: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
}

// Memoized room card component to prevent unnecessary re-renders
const RoomCard = memo(function RoomCardComponent({ room, isFeatured, onBookClick, index }: any) {
  return (
    <motion.div
      key={index}
      className={`relative rounded-3xl overflow-hidden group cursor-pointer flex flex-col ${
        isFeatured ? 'md:-mt-4 md:mb-4' : ''
      }`}
      style={{
        background: isFeatured
          ? 'linear-gradient(180deg, rgba(201,168,76,0.08) 0%, rgba(30,41,59,0.95) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: isFeatured
          ? '1.5px solid rgba(201,168,76,0.35)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isFeatured ? '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(201,168,76,0.08)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      variants={itemVariants}
      whileHover={{ y: -12, scale: isFeatured ? 1.02 : 1.01 }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <Image
          src={ROOM_IMAGES[room.id] ?? ROOM_IMAGES.single}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect fill='%23111827' width='600' height='400'/%3E%3C/svg%3E"
        />
        <div className="absolute inset-0 img-overlay" />

        {/* Featured badge */}
        {isFeatured && (
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #dcc9a0)',
              color: '#0a0f1e',
            }}
          >
            <Sparkles size={11} />
            Most Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Room label */}
        <span
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: '#c9a84c' }}
        >
          {room.name}
        </span>

        {/* Description */}
        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
          {room.description}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-6">
          <span
            className="text-3xl font-bold"
            style={{ color: '#c9a84c' }}
          >
            ₹{room.price.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm font-medium">/ month</span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-7 flex-1">
          {room.features.map((feature: any) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-400">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(201,168,76,0.15)' }}
              >
                <Check size={10} style={{ color: '#c9a84c' }} />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          onClick={onBookClick}
          variant={isFeatured ? 'secondary' : 'outline'}
          size="md"
          className={`w-full font-semibold ${
            isFeatured
              ? 'shadow-lg hover:shadow-secondary-500/30 transition-shadow'
              : ''
          }`}
        >
          {isFeatured ? '🏠 Book This Room' : 'Book Now'}
        </Button>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(201,168,76,0.2)' }}
      />
    </motion.div>
  )
})
RoomCard.displayName = 'RoomCard'

function RoomsSection({ onBookClick }: RoomsSectionProps) {
  return (
    <section id="rooms" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.15) 0%, transparent 70%)',
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
          transition={{ duration: 0.65 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Rooms</span>
          <h2 className="font-bold text-white mb-5">
            Choose Your Perfect <span className="gradient-text">Room</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Premium accommodations designed for comfort and productivity
          </p>
        </motion.div>

        {/* Room Cards Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {ROOM_TYPES.map((room, index) => (
            <RoomCard
              key={room.id}
              room={room}
              isFeatured={index === 1} // Middle room featured
              onBookClick={onBookClick}
              index={index}
            />
          ))}
        </motion.div>

        {/* Note */}
        <motion.p
          className="text-center text-sm text-gray-500 mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          💡 All prices include unlimited food, WiFi, electricity & housekeeping.{' '}
          <button
            onClick={onBookClick}
            className="underline underline-offset-2 hover:text-secondary-400 transition-colors"
            style={{ color: '#c9a84c' }}
          >
            Contact us for custom packages.
          </button>
        </motion.p>
      </div>
    </section>
  )
}

// Export as memoized component to prevent unnecessary re-renders
const MemoizedRoomsSection = memo(RoomsSection)
export { MemoizedRoomsSection as RoomsSection }
