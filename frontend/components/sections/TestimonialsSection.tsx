'use client'

import React, { memo, useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { Quote, Star, PenLine } from 'lucide-react'
import { ReviewModal } from '@/components/forms/ReviewModal'

interface Testimonial {
  id: string
  student_name: string
  college?: string
  rating: number
  review: string
  photo_url?: string
  status: string
  is_featured: boolean
  created_at: string
}

// Fallback static testimonials shown while loading or if no featured reviews exist
const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    id: 's1', student_name: 'Rahul Kumar', college: 'B.Tech CSE • Acharya Institute', rating: 5,
    review: 'MLV PG is more than just a place to stay. The food is amazing, the staff treats you like family, and the security is top-notch. Highly recommended!',
    status: 'approved', is_featured: true, created_at: '',
  },
  {
    id: 's2', student_name: 'Priya Singh', college: 'B.Tech ECE • Acharya Institute', rating: 5,
    review: "Safe environment, hygienic food, and helpful staff. My parents are so relieved knowing I'm in such a caring place. Best decision ever!",
    status: 'approved', is_featured: true, created_at: '',
  },
  {
    id: 's3', student_name: 'Arjun Patel', college: 'B.Tech IT • Acharya Institute', rating: 5,
    review: 'The facilities are excellent, WiFi is super fast, and the location is perfect. Walking distance to college is a huge plus!',
    status: 'approved', is_featured: true, created_at: '',
  },
  {
    id: 's4', student_name: 'Shreya Gupta', college: 'B.Tech Mech • Acharya Institute', rating: 5,
    review: "As an international student, I was worried about adjusting. But the MLV PG family made everything so easy. Truly home away from home!",
    status: 'approved', is_featured: true, created_at: '',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as any } },
}

const StarDisplay: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        style={{
          color: i < rating ? '#facc15' : '#374151',
          fill: i < rating ? '#facc15' : 'none',
        }}
      />
    ))}
  </div>
)

const AvatarInitial: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  // Pick a deterministic color from the name
  const colors = ['#c9a84c', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: `${color}22`,
        border: `2px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 700, color,
      }}
    >
      {initials}
    </div>
  )
}

const TestimonialCard = memo(({ testimonial }: { testimonial: Testimonial }) => (
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
    <div className="mb-4">
      <StarDisplay rating={testimonial.rating} size={14} />
    </div>

    {/* Review Text */}
    <p className="text-gray-300 leading-relaxed mb-7 text-[15px] italic">
      "{testimonial.review}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-3">
      <AvatarInitial name={testimonial.student_name} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">{testimonial.student_name}</p>
        {testimonial.college && (
          <p className="text-xs text-gray-500 truncate">{testimonial.college}</p>
        )}
      </div>
    </div>
  </motion.div>
))
TestimonialCard.displayName = 'TestimonialCard'

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [avgRating, setAvgRating] = useState(4.9)

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials?featured=true', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch error')
      const json = await res.json()
      const data: Testimonial[] = json.data || []
      if (data.length > 0) {
        setTestimonials(data)
        const avg = data.reduce((s, t) => s + t.rating, 0) / data.length
        setAvgRating(Math.round(avg * 10) / 10)
      } else {
        setTestimonials(STATIC_TESTIMONIALS)
      }
    } catch {
      setTestimonials(STATIC_TESTIMONIALS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatured()
  }, [fetchFeatured])

  return (
    <>
      <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 30% 50%, rgba(13,27,133,0.3) 0%, transparent 70%)',
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
            {/* Summary bar — live average */}
            <div className="inline-flex items-center gap-4 mt-2 px-6 py-3 rounded-full glass-gold">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{avgRating} / 5</span>
              <span className="text-sm text-gray-400">from 500+ students</span>
            </div>
          </motion.div>

          {/* Testimonials Grid */}
          {loading ? (
            // Skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '200px' }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </motion.div>
          )}

          {/* Write a Review Button */}
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <button
              onClick={() => setReviewOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                borderRadius: '50px',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.35)',
                color: '#c9a84c',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(201,168,76,0.2)'
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 24px rgba(201,168,76,0.2)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(201,168,76,0.1)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <PenLine size={18} />
              Write a Review
            </button>
          </motion.div>
        </div>
      </section>

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </>
  )
}

const MemoizedTestimonialsSection = memo(TestimonialsSection)
export { MemoizedTestimonialsSection as TestimonialsSection }
