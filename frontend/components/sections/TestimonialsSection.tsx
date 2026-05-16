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
          color: i < rating ? '#F59E0B' : '#D1D5DB',
          fill: i < rating ? '#F59E0B' : 'none',
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
  const colors = ['#C9A84C', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: `${color}18`,
        border: `2px solid ${color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 700, color,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {initials}
    </div>
  )
}

// Google G badge
const GoogleBadge = () => (
  <div
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
    style={{
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.15)',
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins, sans-serif' }}>
      Google Verified
    </span>
  </div>
)

const TestimonialCard = memo(({ testimonial }: { testimonial: Testimonial }) => (
  <motion.div
    className="group relative p-7 rounded-2xl overflow-hidden"
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
    }}
    variants={itemVariants}
    whileHover={{ y: -6 }}
    onHoverStart={(e: any) => {
      const el = e.currentTarget
      if (el) el.style.borderColor = 'rgba(201,168,76,0.3)'
    }}
    onHoverEnd={(e: any) => {
      const el = e.currentTarget
      if (el) el.style.borderColor = 'rgba(255,255,255,0.1)'
    }}
  >
    {/* Quote icon */}
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
      style={{ background: 'rgba(201,168,76,0.15)' }}
    >
      <Quote size={18} style={{ color: '#C9A84C' }} />
    </div>

    {/* Stars */}
    <div className="mb-4">
      <StarDisplay rating={testimonial.rating} size={14} />
    </div>

    {/* Review Text */}
    <p
      className="leading-relaxed mb-7 text-[15px] italic"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      "{testimonial.review}"
    </p>

    {/* Author row */}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <AvatarInitial name={testimonial.student_name} />
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}
          >
            {testimonial.student_name}
          </p>
          {testimonial.college && (
            <p
              className="text-xs truncate"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {testimonial.college}
            </p>
          )}
        </div>
      </div>
      <GoogleBadge />
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
      <section
        id="testimonials"
        className="relative overflow-hidden"
        style={{
          background: '#1A1A2E',
          padding: 'clamp(40px, 5vw, 72px) 0',
        }}
      >
        {/* Gold top border accent */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #E8C96B 50%, #C9A84C 70%, transparent)' }}
        />

        {/* Background ambient orbs */}
        <div
          className="absolute -top-32 left-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)' }}
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
            <span className="section-badge mb-5 inline-block">✦ Testimonials</span>
            <h2
              className="font-bold mb-5"
              style={{ color: '#ffffff', fontFamily: 'Playfair Display, serif' }}
            >
              What Our Students{' '}
              <span className="gradient-text">Say</span>
            </h2>
            {/* Rating summary bar */}
            <div
              className="inline-flex items-center gap-4 mt-2 px-6 py-3 rounded-full"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                ))}
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif' }}
              >
                {avgRating} / 5
              </span>
              <span
                className="text-sm"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                from 500+ students
              </span>
            </div>
          </motion.div>

          {/* Testimonials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl animate-pulse"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minHeight: '200px',
                  }}
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
                borderRadius: '999px',
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.35)',
                color: '#C9A84C',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.25s',
                fontFamily: 'Poppins, sans-serif',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(201,168,76,0.2)'
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 24px rgba(201,168,76,0.2)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(201,168,76,0.12)'
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


