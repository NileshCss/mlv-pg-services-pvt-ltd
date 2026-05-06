'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const galleries = [
  {
    id: 1,
    title: 'Common Areas',
    image: 'https://images.unsplash.com/photo-1544367567-0d6fcffe7f1f?w=600&q=80',
    count: 12,
  },
  {
    id: 2,
    title: 'Rooms',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    count: 18,
  },
  {
    id: 3,
    title: 'Dining Hall',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
    count: 8,
  },
  {
    id: 4,
    title: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    count: 10,
  },
  {
    id: 5,
    title: 'Study Area',
    image: 'https://images.unsplash.com/photo-1522184212e361b87dd6a1f4eb1ee3aacf4b0eda?w=600&q=80',
    count: 6,
  },
  {
    id: 6,
    title: 'Recreation',
    image: 'https://images.unsplash.com/photo-1552092081-721a135fb3c7?w=600&q=80',
    count: 14,
  },
]

const GallerySection: React.FC = () => {
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="gallery" className="py-20 md:py-28">
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
            <span className="text-xs font-semibold text-secondary-400">Gallery</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our<br />
            <span className="gradient-text">Facilities</span>
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {galleries.map((gallery, idx) => (
            <motion.div
              key={idx}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <Image
                src={gallery.image}
                alt={gallery.title}
                width={600}
                height={600}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Overlay Info */}
              <motion.div
                className="absolute inset-0 flex items-end p-6"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {gallery.title}
                  </h3>
                  <p className="text-secondary-400 text-sm">
                    {gallery.count} photos
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { GallerySection }
