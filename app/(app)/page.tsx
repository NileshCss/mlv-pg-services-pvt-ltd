'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { PreRegistrationForm } from '@/components/forms/PreRegistrationForm'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { FacilitiesSection } from '@/components/sections/FacilitiesSection'
import { RoomsSection } from '@/components/sections/RoomsSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { FAQSection } from '@/components/sections/FAQSection'
import { ContactSection } from '@/components/sections/ContactSection'

export default function Home() {
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupShowTime, setPopupShowTime] = useState(false)

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setPopupShowTime(true)
      setPopupOpen(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar onBookClick={() => setPopupOpen(true)} />

      <main>
        <HeroSection
          onBookClick={() => setPopupOpen(true)}
          onContactClick={() => handleScrollTo('contact')}
        />
        <AboutSection />
        <FacilitiesSection />
        <RoomsSection onBookClick={() => setPopupOpen(true)} />
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
