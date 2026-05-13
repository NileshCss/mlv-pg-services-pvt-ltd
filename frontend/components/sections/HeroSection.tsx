'use client'

import { useEffect, useRef, memo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ChevronDown, MapPin, Star, Users } from 'lucide-react'
import { HERO_CONTENT, WHATSAPP_NUMBER } from '@/lib/utils/constants'

interface HeroSectionProps {
  onBookClick: () => void
  onContactClick?: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onContactClick }) => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-up {
          animation: float-up 4s ease-in-out infinite;
        }
        @keyframes float-up-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-up-slow {
          animation: float-up-slow 3.5s ease-in-out infinite 1s;
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .scroll-bounce {
          animation: scroll-bounce 2s ease-in-out infinite;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateX(60px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .fade-in-scale {
          animation: fadeInScale 0.9s ease-out 0.3s both;
        }
        @keyframes stagger-children {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-item {
          opacity: 0;
          transform: translateY(24px);
          animation: stagger-children 0.65s ease-out forwards;
        }
      `}</style>

      {/* ── Layered Background ─────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        {/* Deep dark base */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1b40 50%, #0a0f1e 100%)' }} />

        {/* Ambient orbs - GPU accelerated with will-change */}
        <div
          className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-xl"
          style={{ 
            background: 'radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)',
          }}
          suppressHydrationWarning
        />
        <div
          className="absolute bottom-0 -left-24 w-[500px] h-[500px] rounded-full opacity-15 blur-xl"
          style={{ 
            background: 'radial-gradient(circle, rgba(13,27,133,0.5) 0%, transparent 70%)',
          }}
          suppressHydrationWarning
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-5 blur-xl"
          style={{ 
            background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
          }}
          suppressHydrationWarning
        />

        {/* Subtle grid - made static to reduce re-paints */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          suppressHydrationWarning
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left Content ──────────────────────────────────── */}
          <div className="space-y-7">
            {/* Badge */}
            <div
              className="stagger-item inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.35)',
                color: '#c9a84c',
              }}
            >
              <MapPin size={14} className="flex-shrink-0" />
              <span>{HERO_CONTENT.badge}</span>
            </div>

            {/* Heading */}
            <div className="stagger-item">
              <h1 className="font-bold leading-[1.1]">
                <span className="block text-white mb-2">
                  {HERO_CONTENT.heading.split('\n')[0]}
                </span>
                <span className="block">
                  Near{' '}
                  <span className="gradient-text">
                    {HERO_CONTENT.heading.split('\n')[1]?.split(' ').slice(-2).join(' ') ?? 'Acharya Institute'}
                  </span>
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p
              className="stagger-item text-lg text-gray-300 leading-relaxed max-w-xl"
            >
              {HERO_CONTENT.subheading}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 stagger-item">
              {HERO_CONTENT.pills.map((pill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-200"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="text-base leading-none">{pill.split(' ')[0]}</span>
                  <span>{pill.split(' ').slice(1).join(' ')}</span>
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap gap-3 pt-2 stagger-item"
            >
              <Button
                onClick={onBookClick}
                variant="secondary"
                size="lg"
                className="font-bold tracking-wide shadow-xl hover:shadow-secondary-500/30 transition-shadow"
              >
                🏠 Pre-Reserve Now
              </Button>
              <Button
                onClick={onContactClick}
                variant="outline"
                size="lg"
              >
                📍 Book a Visit
              </Button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="lg">
                  💬 WhatsApp
                </Button>
              </a>
            </div>

            {/* Stats Row */}
            <div
              className="grid grid-cols-3 gap-6 pt-6 mt-2 stagger-item"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              {HERO_CONTENT.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: '#c9a84c' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Image ───────────────────────────────────── */}
          <div
            className="hidden lg:block relative fade-in-scale"
          >
            {/* Decorative ring */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-30 spin-slow"
              style={{ background: 'conic-gradient(from 0deg, #c9a84c22, #0d1b8522, #c9a84c22)' }}
            />

            <div className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '4/5' }}>
              <Image
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=85"
                alt="MLV PG – Premium Student Accommodation"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 img-overlay" />

              {/* Floating rating card */}
              <div
                className="absolute bottom-6 right-6 glass-dark rounded-2xl p-4 text-center min-w-[130px] float-up"
              >
                <div className="text-2xl font-bold mb-0.5" style={{ color: '#c9a84c' }}>4.9 / 5</div>
                <div className="text-yellow-400 text-sm tracking-widest mb-1">★★★★★</div>
                <div className="text-xs text-gray-400 font-medium">Trusted by 500+ students</div>
              </div>

              {/* Top badge */}
              <div
                className="absolute top-6 left-6 glass-dark rounded-xl px-3 py-2 flex items-center gap-2 float-up-slow"
              >
                <Users size={14} style={{ color: '#c9a84c' }} />
                <span className="text-xs font-semibold text-white">500+ Happy Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll Indicator ──────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-100 transition-opacity duration-500"
      >
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-secondary-400 transition-colors group scroll-bounce"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest group-hover:text-secondary-400 transition-colors">
            Scroll to explore
          </span>
          <ChevronDown size={18} />
        </button>
      </div>
    </section>
  )
}

// Export as memoized component to prevent unnecessary re-renders
const MemoizedHeroSection = memo(HeroSection)
export { MemoizedHeroSection as HeroSection }
