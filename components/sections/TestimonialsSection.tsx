'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Rahul Kumar',
    college: 'Acharya Institute',
    course: 'B.Tech CSE',
    rating: 5,
    text: 'MLV PG is more than just a place to stay. The food is amazing, the staff treats you like family, and the security is top-notch. Highly recommended!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: 2,
    name: 'Priya Singh',
    college: 'Acharya Institute',
    course: 'B.Tech ECE',
    rating: 5,
    text: "Safe environment, hygienic food, and helpful staff. My parents are so relieved knowing I'm in such a caring place. Best decision ever!",
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  {
    id: 3,
    name: 'Arjun Patel',
    college: 'Acharya Institute',
    course: 'B.Tech IT',
    rating: 5,
    text: 'The facilities are excellent, WiFi is super fast, and the location is perfect. Walking distance to college is a huge plus!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  },
  {
    id: 4,
    name: 'Shreya Gupta',
    college: 'Acharya Institute',
    course: 'B.Tech Mech',
    rating: 5,
    text: "As an international student, I was worried about adjusting. But the MLV PG family made everything so easy. Truly home away from home!",
    image: 'https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=150&q=80',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
}

// Memoized testimonial card to prevent unnecessary re-renders
const TestimonialCard = memo(({ testimonial, index }: any) => (
  <motion.div
    className="group relative p-7 rounded-2xl overflow-hidden"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}
    variants={itemVariants}
    whileHover={{ y: -6 }}
  >
    {/* Hover border glow */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
      style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.2)' }}
    />

    {/* Quote icon */}
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
      style={{ background: 'rgba(201,168,76,0.1)' }}
    >
      <Quote size={18} style={{ color: '#c9a84c' }} />
    </div>

    {/* Stars */}
    <div className="flex gap-1 mb-4">
      {Array.from({ length: testimonial.rating }).map((_, i) => (
        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>

    {/* Text */}
    <p className="text-gray-300 leading-relaxed mb-7 text-[15px] italic">
      "{testimonial.text}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">{testimonial.name}</p>
        <p className="text-xs text-gray-500 truncate">
          {testimonial.course} • {testimonial.college}
        </p>
      </div>
    </div>
  </motion.div>
))
TestimonialCard.displayName = 'TestimonialCard'

const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 30% 50%, rgba(13,27,133,0.3) 0%, transparent 70%)',
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
          <span className="section-badge mb-5 inline-block">✦ Testimonials</span>
          <h2 className="font-bold text-white mb-5">
            What Our Students{' '}
            <span className="gradient-text">Say About Us</span>
          </h2>
          {/* Summary bar */}
          <div className="inline-flex items-center gap-4 mt-2 px-6 py-3 rounded-full glass-gold">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-white">4.9 / 5</span>
            <span className="text-sm text-gray-400">from 500+ students</span>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { TestimonialsSection: memo(TestimonialsSection) }
