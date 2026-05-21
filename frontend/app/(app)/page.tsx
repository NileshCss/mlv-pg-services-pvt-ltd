'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { NoticeTicker } from '@/components/ui/NoticeTicker'
import { Footer } from '@/components/ui/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { PreRegistrationForm } from '@/components/forms/PreRegistrationForm'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { WhyMLVSection } from '@/components/sections/WhyMLVSection'
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
    const timer = setTimeout(() => setPopupOpen(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  const handleScrollTo = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Notice Ticker — fixed at very top (z-60), above Navbar */}
      <NoticeTicker />

      {/* Navbar — fixed below the notice ticker (z-50) */}
      <Navbar onBookClick={() => setPopupOpen(true)} />

      {/* Spacer to prevent content from going behind fixed headers (38px NoticeTicker + 70px Navbar = 108px) */}
      <div style={{ height: '108px', background: '#FDF9F3' }} />

      <main>
        <HeroSection
          onBookClick={() => setPopupOpen(true)}
          onContactClick={() => handleScrollTo('contact')}
        />
        <AboutSection />
        <WhyMLVSection />
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

