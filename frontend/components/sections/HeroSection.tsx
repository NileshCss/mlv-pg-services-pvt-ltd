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
      style={{ background: '#F8F6F1' }}
    >
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-up { animation: float-up 4s ease-in-out infinite; }

        @keyframes float-up-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-up-slow { animation: float-up-slow 3.5s ease-in-out infinite 1s; }

        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .scroll-bounce { animation: scroll-bounce 2s ease-in-out infinite; }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.97); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .fade-in-right { animation: fadeInRight 0.9s ease-out 0.3s both; }

        @keyframes stagger-children {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-item {
          opacity: 0;
          transform: translateY(24px);
          animation: stagger-children 0.65s ease-out forwards;
        }

        /* Gold geometric pattern overlay */
        .hero-pattern {
          background-image:
            radial-gradient(circle at 20% 80%, rgba(201,168,76,0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 40%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 30px,
              rgba(201,168,76,0.03) 30px,
              rgba(201,168,76,0.03) 31px
            );
        }
      `}</style>

      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 hero-pattern" />

      {/* Soft warm blobs */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left Content ─────────────────────────────────────── */}
          <div className="space-y-7">

            {/* Badge */}
            <div
              className="stagger-item inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.35)',
                color: '#C9A84C',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <MapPin size={14} className="flex-shrink-0" />
              <span>{HERO_CONTENT.badge}</span>
            </div>

            {/* Heading — Playfair Display */}
            <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
              <h1
                className="font-bold leading-[1.1]"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A2E' }}
              >
                <span className="block mb-2">
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
              className="stagger-item text-lg leading-relaxed max-w-xl"
              style={{ color: '#4A4A6A', animationDelay: '0.2s' }}
            >
              {HERO_CONTENT.subheading}
            </p>

            {/* Trust Badge Pills */}
            <div className="flex flex-wrap gap-2.5 stagger-item" style={{ animationDelay: '0.3s' }}>
              {HERO_CONTENT.pills.map((pill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(201,168,76,0.4)',
                    color: '#1A1A2E',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <span className="text-base leading-none">{pill.split(' ')[0]}</span>
                  <span>{pill.split(' ').slice(1).join(' ')}</span>
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 stagger-item" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={onBookClick}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
                  color: '#1A1A2E',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                🏠 Pre-Reserve Now
              </button>
              <button
                onClick={onContactClick}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-300 hover:bg-white hover:shadow-md"
                style={{
                  background: '#FFFFFF',
                  color: '#1A1A2E',
                  border: '1.5px solid rgba(201,168,76,0.5)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                📍 Book a Visit
              </button>
            </div>

            {/* Stats Bar */}
            <div
              className="grid grid-cols-3 gap-6 pt-6 mt-2 stagger-item"
              style={{ borderTop: '1px solid rgba(201,168,76,0.2)', animationDelay: '0.5s' }}
            >
              {HERO_CONTENT.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: '#C9A84C', fontFamily: 'Playfair Display, serif' }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: '#4A4A6A', fontFamily: 'Inter, sans-serif' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Image ───────────────────────────────────────── */}
          <div className="hidden lg:block relative fade-in-right">
            <div
              className="relative rounded-2xl overflow-hidden group"
              style={{ aspectRatio: '4/5', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=85"
                alt="MLV PG – Premium Student Accommodation"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 img-overlay" />

              {/* Floating rating card — Zolo-style social proof */}
              <div
                className="absolute bottom-6 right-6 rounded-2xl p-4 text-center min-w-[140px] float-up"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(201,168,76,0.25)',
                }}
              >
                <div
                  className="text-2xl font-bold mb-0.5"
                  style={{ color: '#C9A84C', fontFamily: 'Playfair Display, serif' }}
                >
                  4.9 / 5
                </div>
                <div className="text-yellow-400 text-sm tracking-widest mb-1">★★★★★</div>
                <div
                  className="text-xs font-medium"
                  style={{ color: '#4A4A6A' }}
                >
                  Trusted by 500+ students
                </div>
              </div>

              {/* Top badge */}
              <div
                className="absolute top-6 left-6 rounded-xl px-3 py-2 flex items-center gap-2 float-up-slow"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                <Users size={14} style={{ color: '#C9A84C' }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: '#1A1A2E' }}
                >
                  500+ Happy Students
                </span>
              </div>
            </div>

            {/* Decorative gold corner accent */}
            <div
              className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10"
              style={{ background: 'rgba(201,168,76,0.15)' }}
            />
            <div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full -z-10"
              style={{ background: 'rgba(201,168,76,0.1)' }}
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 transition-colors group scroll-bounce"
          style={{ color: '#8A8AA0' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C9A84C'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#8A8AA0'}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Scroll to explore
          </span>
          <ChevronDown size={18} />
        </button>
      </div>
    </section>
  )
}

const MemoizedHeroSection = memo(HeroSection)
export { MemoizedHeroSection as HeroSection }


