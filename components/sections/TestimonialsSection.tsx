'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

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
    text: 'Safe environment, hygienic food, and helpful staff. My parents are so relieved knowing I\'m in such a caring place. Best decision ever!',
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
    text: 'As an international student, I was worried about adjusting. But the MLV PG family made everything so easy. Truly home away from home!',
    image: 'https://images.unsplash.com/photo-1517070213202-75cf588b3e7d?w=150&q=80',
  },
]

const TestimonialsSection: React.FC = () => {
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
    <section id="testimonials" className="py-20 md:py-28">
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
            <span className="text-xs font-semibold text-secondary-400">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Students<br />
            <span className="gradient-text">Say About Us</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-secondary-500/30 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-secondary-500 text-secondary-500"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-gray-50">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.course} • {testimonial.college}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { TestimonialsSection }
