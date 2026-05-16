'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
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

const GallerySection = () => {
  const [selected, setSelected] = useState<(typeof galleries)[0] | null>(null)

  return (
    <section
      id="gallery"
      className="relative overflow-hidden"
      style={{
        background: '#FFFFFF',
        padding: 'clamp(40px, 5vw, 72px) 0',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.65s ease-out forwards;
        }
        .gallery-item {
          animation: fadeInUp 0.55s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: scale(0.85) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .lightbox-enter {
          animation: slideUp 0.3s ease-out forwards;
        }
        .overlay-backdrop {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Subtle warm background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12 animate-fade-in-up">
          <span className="section-badge mb-5 inline-block">✦ Gallery</span>
          <h2
            className="font-bold mb-5"
            style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
          >
            Explore Our{' '}
            <span className="gradient-text">Beautiful Spaces</span>
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{ color: '#4A4A6A' }}
          >
            A glimpse into the comfortable living experience awaiting you at MLV PG.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
          {galleries.map((gallery, idx) => (
            <div
              key={gallery.id}
              className={`gallery-item group relative rounded-2xl overflow-hidden cursor-pointer ${gallery.span}`}
              style={{
                animationDelay: `${idx * 0.07}s`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setSelected(gallery)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.14)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Image
                src={gallery.image}
                alt={gallery.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gold overlay on hover */}
              <div
                className="absolute inset-0 transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(to top, rgba(26,26,46,0.85) 0%, rgba(201,168,76,0.15) 50%, transparent 100%)',
                }}
              />

              {/* Info on hover */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                <h3
                  className="font-bold text-lg leading-tight mb-1 text-white"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {gallery.title}
                </h3>
                <p
                  className="text-sm font-medium"
                  style={{ color: '#E8C96B' }}
                >
                  {gallery.count} photos
                </p>
              </div>

              {/* Zoom icon */}
              <div
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <ZoomIn size={16} style={{ color: '#C9A84C' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overlay-backdrop"
          style={{ background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden lightbox-enter"
            style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
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
            <div
              className="absolute bottom-0 left-0 right-0 p-6"
              style={{ background: 'linear-gradient(to top, rgba(26,26,46,0.95), transparent)' }}
            >
              <h3
                className="font-bold text-xl text-white"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {selected.title}
              </h3>
              <p style={{ color: '#E8C96B', fontSize: '14px' }}>{selected.count} photos</p>
            </div>
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

const MemoizedGallerySection = memo(GallerySection)
export { MemoizedGallerySection as GallerySection }


