'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
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

const RoomCard = memo(function RoomCardComponent({ room, isFeatured, onBookClick, index }: any) {
  return (
    <motion.div
      key={index}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer flex flex-col ${isFeatured ? 'md:-mt-4 md:mb-4' : ''}`}
      style={{
        background: '#FFFFFF',
        border: isFeatured ? '2px solid rgba(201,168,76,0.5)' : '1px solid #EBEBF0',
        boxShadow: isFeatured
          ? '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(201,168,76,0.1)'
          : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
      }}
      variants={itemVariants}
      whileHover={{ y: -8 }}
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
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect fill='%23F8F6F1' width='600' height='400'/%3E%3C/svg%3E"
        />
        <div className="absolute inset-0 img-overlay" />

        {/* Featured "Most Popular" badge — gold ribbon top-right */}
        {isFeatured && (
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
              color: '#1A1A2E',
              boxShadow: '0 4px 12px rgba(201,168,76,0.4)',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <Sparkles size={11} />
            Most Popular
          </div>
        )}

        {/* Gold price badge bottom-left */}
        <div
          className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            color: '#C9A84C',
            fontFamily: 'Playfair Display, serif',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          ₹{room.price.toLocaleString()}/mo
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Room label */}
        <span
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: '#C9A84C', fontFamily: 'Poppins, sans-serif' }}
        >
          {room.name}
        </span>

        {/* Description */}
        <h3
          className="text-xl font-bold mb-4 leading-tight"
          style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
        >
          {room.description}
        </h3>

        {/* Features */}
        <ul className="space-y-2.5 mb-7 flex-1">
          {room.features.map((feature: any) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm"
              style={{ color: '#4A4A6A' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                <Check size={10} style={{ color: '#C9A84C' }} />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA — gold button with hover glow */}
        <button
          onClick={onBookClick}
          className="w-full py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: isFeatured
              ? 'linear-gradient(135deg, #C9A84C, #E8C96B)'
              : '#FFFFFF',
            color: isFeatured ? '#1A1A2E' : '#C9A84C',
            border: isFeatured ? 'none' : '1.5px solid rgba(201,168,76,0.5)',
            boxShadow: isFeatured
              ? '0 4px 20px rgba(201,168,76,0.35)'
              : '0 2px 8px rgba(0,0,0,0.06)',
            fontFamily: 'Poppins, sans-serif',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            if (isFeatured) {
              el.style.boxShadow = '0 8px 28px rgba(201,168,76,0.5)'
            } else {
              el.style.background = 'rgba(201,168,76,0.06)'
            }
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            if (isFeatured) {
              el.style.boxShadow = '0 4px 20px rgba(201,168,76,0.35)'
            } else {
              el.style.background = '#FFFFFF'
            }
          }}
        >
          {isFeatured ? '🏠 Book This Room' : 'Book Now'}
        </button>
      </div>
    </motion.div>
  )
})
RoomCard.displayName = 'RoomCard'

function RoomsSection({ onBookClick }: RoomsSectionProps) {
  return (
    <section
      id="rooms"
      className="relative overflow-hidden"
      style={{
        background: '#FFFFFF',
        padding: 'clamp(40px, 5vw, 72px) 0',
      }}
    >
      {/* Subtle warm ambient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-badge mb-5 inline-block">✦ Rooms</span>
          <h2
            className="font-bold mb-5"
            style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
          >
            Choose Your Perfect{' '}
            <span className="gradient-text">Room</span>
          </h2>
          <p
            className="max-w-2xl mx-auto"
            style={{ color: '#4A4A6A' }}
          >
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
              isFeatured={index === 1}
              onBookClick={onBookClick}
              index={index}
            />
          ))}
        </motion.div>

        {/* Note */}
        <motion.p
          className="text-center text-sm mt-10"
          style={{ color: '#8A8AA0' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          💡 All prices include unlimited food, WiFi, electricity & housekeeping.{' '}
          <button
            onClick={onBookClick}
            className="underline underline-offset-2 transition-colors"
            style={{ color: '#C9A84C' }}
          >
            Contact us for custom packages.
          </button>
        </motion.p>
      </div>
    </section>
  )
}

const MemoizedRoomsSection = memo(RoomsSection)
export { MemoizedRoomsSection as RoomsSection }



