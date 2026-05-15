'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { NoticeTicker } from '@/components/ui/NoticeTicker'
import { Footer } from '@/components/ui/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { PreRegistrationForm } from '@/components/forms/PreRegistrationForm'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { FacilitiesSection } from '@/components/sections/FacilitiesSection'
import { RoomsSection } from '@/components/sections/RoomsSection'
import FoodMenuSection from '@/components/food/FoodMenuSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { FAQSection } from '@/components/sections/FAQSection'
import { ContactSection } from '@/components/sections/ContactSection'

export default function Home() {
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    // Show popup after 10 seconds
    const timer = setTimeout(() => {
      setPopupOpen(true)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Navbar — fixed at top (z-50) */}
      <Navbar onBookClick={() => setPopupOpen(true)} />

      {/* Spacer to push content below the fixed navbar (h-20 = 80px) */}
      <div style={{ height: '80px' }} />

      {/* Notice Ticker — flows with the page, NOT fixed */}
      <NoticeTicker />

      <main>
        <HeroSection
          onBookClick={() => setPopupOpen(true)}
          onContactClick={() => handleScrollTo('contact')}
        />
        <AboutSection />
        <FacilitiesSection />
        <RoomsSection onBookClick={() => setPopupOpen(true)} />
        <FoodMenuSection />
        <TestimonialsSection />
        <GallerySection />
        <FAQSection />
        <ContactSection />
      </main>

      <Footer />
      <WhatsAppButton />

      <PreRegistrationForm
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </>
  )
}
