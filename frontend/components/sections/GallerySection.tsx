'use client'

import { useState, useEffect, memo } from 'react'
import { ZoomIn, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GalleryImage {
  id: string
  title: string
  image_url: string
  category: string
  span?: string
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) {
          console.error('Error fetching gallery:', error)
          return
        }

        // Apply masonry spans dynamically
        const formattedImages = (data || []).map((img: any, idx: number) => ({
          ...img,
          span: idx === 0 ? 'col-span-1 md:col-span-2 row-span-2' : 'col-span-1'
        }))

        setImages(formattedImages)
      } catch (err) {
        console.error('Failed to load gallery images', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [])

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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#EBEBF0] border-t-[#C9A84C] rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Check back soon for new gallery images!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
            {images.map((image, idx) => (
              <div
                key={image.id}
                className={`gallery-item group relative rounded-2xl overflow-hidden cursor-pointer ${image.span}`}
                style={{
                  animationDelay: `${idx * 0.07}s`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setSelected(image)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.14)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Gallery image'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                    {image.title || 'MLV PG Services'}
                  </h3>
                  <p
                    className="text-sm font-medium capitalize"
                    style={{ color: '#E8C96B' }}
                  >
                    {image.category}
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
        )}
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
              <img
                src={selected.image_url}
                alt={selected.title || 'Gallery image'}
                className="w-full h-full object-cover"
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
                {selected.title || 'MLV PG Services'}
              </h3>
              <p style={{ color: '#E8C96B', fontSize: '14px', textTransform: 'capitalize' }}>
                {selected.category}
              </p>
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



