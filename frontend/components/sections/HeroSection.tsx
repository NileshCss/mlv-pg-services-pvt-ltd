'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import Image from 'next/image'
import { BrandName } from '../ui/BrandName'

// 1. Configure Google Fonts
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700']
})

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

// Custom Count-Up Animation Hook Component
const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  decimals = 0, 
  suffix = '' 
}: { 
  end: number
  duration?: number
  decimals?: number
  suffix?: string
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // easeOutExpo for smooth deceleration
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(easeOut * end)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }
    
    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, isInView])

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>
}

interface HeroSectionProps {
  onBookClick?: () => void
  onContactClick?: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onContactClick }) => {
  // 8. Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  return (
    // 2. Color Palette: Warm cream bg (#FDF9F3)
    <section id="home" className={`relative bg-[#FDF9F3] text-[#1C1C3A] ${jakarta.className} overflow-hidden pt-10 md:pt-12 pb-16 lg:pb-24`}>
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[600px] h-[600px] bg-[#D4A017] rounded-full blur-[140px] opacity-[0.08] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-[400px] h-[400px] bg-[#D4A017] rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* 10. Fully responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ── Left Content Column ── */}
          <motion.div 
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Brand Name */}
            <motion.div variants={itemVariants} className="w-full">
              <BrandName />
            </motion.div>

            {/* 4. Location Pill (Glass-morphism) */}
            <motion.div variants={itemVariants} className="mb-5 mt-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/40 border border-white/60 backdrop-blur-md shadow-sm">
                <MapPin size={16} className="text-[#D4A017]" />
                <span className="text-xs md:text-sm font-semibold tracking-wide text-[#1C1C3A]">
                  Opp. Acharya Institute · Soladevanahalli, Bangalore
                </span>
              </div>
            </motion.div>

            {/* 3. & 11. H1 Heading (SEO Optimized) */}
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-4 ${playfair.className} text-[#1C1C3A]`}
            >
              <span className="block mb-2">
                <span className="inline-block text-[#D4A017] hover:scale-110 hover:-rotate-6 transition-transform duration-300 drop-shadow-md cursor-default">
                  #1
                </span>{' '}
                PG near Acharya College
              </span>
              <span className="block">
                with Authentic <span className="text-[#D4A017] italic">North Indian Food</span>
              </span>
            </motion.h1>

            {/* 5. Subtext */}
            <motion.p 
              variants={itemVariants}
              className="text-base md:text-lg text-[#1C1C3A]/70 max-w-xl leading-relaxed mb-6"
            >
              Because home is not a place — it is a feeling. We cook, care, and look after you just like your family would.
            </motion.p>

            {/* 6. Feature Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8 max-w-2xl">
              {[
                { icon: '🍛', text: 'North Indian Home-Cooked Food' },
                { icon: '👨‍👩‍👧', text: 'Parent-Like Care' },
                { icon: '🔒', text: 'Safe for Boys & Girls' },
                { icon: '⚡', text: '24/7 Open' },
              ].map((badge, idx) => (
                <div 
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#1C1C3A]/10 bg-white/60 text-[#1C1C3A] text-sm font-semibold hover:scale-105 transition-transform duration-300 cursor-default shadow-sm hover:shadow-md"
                >
                  <span className="text-base">{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </motion.div>

            {/* 7. CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              {/* Primary Button */}
              <button 
                onClick={onBookClick}
                className="bg-[#D4A017] text-white rounded-full px-6 py-3 font-semibold hover:bg-[#B8891A] transition-all duration-300 shadow-xl shadow-[#D4A017]/25 hover:shadow-2xl hover:shadow-[#D4A017]/30 hover:-translate-y-0.5 flex-1 sm:flex-none text-center text-base"
              >
                Pre-Reserve Now
              </button>
              {/* Secondary Button */}
              <button 
                onClick={onContactClick}
                className="border-2 border-[#1C1C3A] text-[#1C1C3A] rounded-full px-6 py-3 font-semibold hover:bg-[#1C1C3A] hover:text-white transition-all duration-300 flex-1 sm:flex-none text-center text-base"
              >
                Book a Visit
              </button>
            </motion.div>

            {/* 9. Stats Section */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-row items-center justify-center lg:justify-start gap-6 sm:gap-12 w-full pt-6 border-t border-[#1C1C3A]/10"
            >
              <div className="flex flex-col items-center lg:items-start">
                <div className={`text-2xl sm:text-3xl font-bold text-[#D4A017] ${playfair.className} tracking-tight`}>
                  <AnimatedCounter end={500} suffix="+" duration={2.5} />
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#1C1C3A]/60 font-bold mt-1">
                  Happy Students
                </div>
              </div>
              
              <div className="w-px h-10 bg-[#1C1C3A]/15"></div>
              
              <div className="flex flex-col items-center lg:items-start">
                <div className={`text-2xl sm:text-3xl font-bold text-[#D4A017] ${playfair.className} tracking-tight`}>
                  <AnimatedCounter end={4.9} decimals={1} suffix="/5" duration={2} />
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#1C1C3A]/60 font-bold mt-1">
                  Average Rating
                </div>
              </div>

              <div className="w-px h-10 bg-[#1C1C3A]/15 hidden sm:block"></div>
              
              <div className="flex flex-col items-center lg:items-start hidden sm:flex">
                <div className={`text-2xl sm:text-3xl font-bold text-[#D4A017] ${playfair.className} tracking-tight`}>
                  <AnimatedCounter end={10} suffix="+" duration={2} />
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#1C1C3A]/60 font-bold mt-1">
                  Years of Trust
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Side Image Column (Visible on Desktop) ── */}
          <motion.div 
            className="hidden lg:block lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-700">
              <Image 
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=85"
                alt="Students enjoying authentic North Indian food at MLV PG near Acharya College"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C3A]/80 via-[#1C1C3A]/20 to-transparent" />
              
              {/* Floating Review Card Overlay */}
              <motion.div 
                className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex text-[#D4A017] text-lg">
                    ★★★★★
                  </div>
                  <span className="text-xs font-bold text-[#1C1C3A]/50 uppercase tracking-widest">Verified Review</span>
                </div>
                <p className="text-sm font-semibold text-[#1C1C3A]/80 italic leading-relaxed">
                  "The only PG where I get real North Indian rotis and dal. It saves me from missing home."
                </p>
              </motion.div>
            </div>
            
            {/* Background Accent Shape */}
            <div className="absolute -z-10 top-1/2 -right-8 -translate-y-1/2 w-full h-4/5 border-2 border-[#D4A017]/30 rounded-[2.5rem] transform -rotate-3" />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
