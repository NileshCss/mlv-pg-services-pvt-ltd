'use client'

import React, { useState, useEffect } from 'react'
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
  const [popupShowTime, setPopupShowTime] = useState(false)

  useEffect(() => {
    // Show popup after 10 seconds
    const timer = setTimeout(() => {
      setPopupShowTime(true)
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
      {/* Navbar (fixed, z-50) */}
      <Navbar onBookClick={() => setPopupOpen(true)} />

      {/* Notice Ticker — sits directly below navbar, full width, z-49 */}
      <div
        style={{
          position: 'fixed',
          top: '80px',   /* matches the navbar height (h-20 = 80px; shrinks to h-16 = 64px on scroll, but 80px is fine default) */
          left: 0,
          right: 0,
          zIndex: 49,
        }}
      >
        <NoticeTicker />
      </div>

      {/* Push content down so it doesn't sit under the fixed notice bar */}
      <div style={{ paddingTop: '118px' }} />

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
