'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, X } from 'lucide-react'

const galleries = [
  {
    id: 1,
    title: 'Common Areas',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
    count: 12,
    span: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    id: 2,
    title: 'Rooms',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80',
    count: 18,
    span: 'col-span-1',
  },
  {
    id: 3,
    title: 'Dining Hall',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=700&q=80',
    count: 8,
    span: 'col-span-1',
  },
  {
    id: 4,
    title: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80',
    count: 10,
    span: 'col-span-1',
  },
  {
    id: 5,
    title: 'Study Area',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80',
    count: 6,
    span: 'col-span-1',
  },
  {
    id: 6,
    title: 'Recreation',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80',
    count: 14,
    span: 'col-span-1',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const GallerySection: React.FC = () => {
  const [selected, setSelected] = useState<(typeof galleries)[0] | null>(null)

  return (
    <section id="gallery" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 70% 50%, rgba(201,168,76,0.15) 0%, transparent 70%)',
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
          <span className="section-badge mb-5 inline-block">✦ Gallery</span>
          <h2 className="font-bold text-white mb-5">
            Explore Our{' '}
            <span className="gradient-text">Beautiful Spaces</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A glimpse into the comfortable living experience awaiting you at MLV PG.
          </p>
        </motion.div>

        {/* Masonry-style Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {galleries.map((gallery, idx) => (
            <motion.div
              key={gallery.id}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${gallery.span}`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelected(gallery)}
            >
              <Image
                src={gallery.image}
                alt={gallery.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.9) 0%, rgba(10,15,30,0.3) 50%, transparent 100%)' }}
              />

              {/* Info on hover */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-white font-bold text-lg leading-tight mb-1">{gallery.title}</h3>
                <p className="text-secondary-400 text-sm font-medium">{gallery.count} photos</p>
              </div>

              {/* Zoom icon */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)' }}
              >
                <ZoomIn size={16} style={{ color: '#c9a84c' }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(10,15,30,0.95)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative" style={{ aspectRatio: '16/10' }}>
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-xl">{selected.title}</h3>
                <p className="text-secondary-400 text-sm">{selected.count} photos</p>
              </div>
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export { GallerySection }
