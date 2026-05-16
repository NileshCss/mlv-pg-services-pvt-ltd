'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'What is included in the room rent?',
    answer:
      'Room rent includes a fully furnished room, high-speed WiFi, 24/7 electricity with backup, CCTV security, housekeeping, laundry service, and unlimited food (breakfast, lunch & dinner).',
  },
  {
    question: 'Do you provide vegetarian and non-vegetarian food?',
    answer:
      'Yes! We provide both vegetarian and non-vegetarian options. You can choose your food preference during registration, and we also accommodate special dietary needs.',
  },
  {
    question: 'Is there any deposit or advance payment required?',
    answer:
      "We require a one-month refundable security deposit plus the first month's rent in advance. Full details and payment options will be discussed during your site visit.",
  },
  {
    question: 'What is the booking process?',
    answer:
      "Simply fill the pre-registration form → we'll contact you within 24 hours → schedule a visit → finalize your room → and you're all set! The whole process takes as little as 2–3 days.",
  },
  {
    question: 'Are guests allowed?',
    answer:
      "Yes, guests are allowed with prior notice. There are designated visiting hours (9 AM – 9 PM) and sign-in guidelines for guest visits to ensure everyone's comfort and safety.",
  },
  {
    question: 'What is the location and connectivity?',
    answer:
      'We are located directly opposite Acharya Institute of Technology — just a 3-minute walk! The area is well-connected by public transport (metro, bus) and has all essential amenities nearby.',
  },
  {
    question: 'Is the PG safe for girls?',
    answer:
      'Absolutely. We have dedicated women-only floors with 24/7 CCTV, biometric entry, and on-site female staff. Safety is our highest priority.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
}

const FAQSection: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState<number>(0)

  return (
    <section
      id="faq"
      className="relative overflow-hidden"
      style={{
        background: '#F8F6F1',
        padding: 'clamp(40px, 5vw, 72px) 0',
      }}
    >
      {/* Subtle background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-badge mb-5 inline-block">✦ FAQ</span>
          <h2
            className="font-bold mb-5"
            style={{ color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}
          >
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p style={{ color: '#4A4A6A' }}>
            Everything you need to know about living at MLV PG. Can't find your answer?{' '}
            <a
              href="#contact"
              className="underline underline-offset-2 transition-colors"
              style={{ color: '#C9A84C' }}
            >
              Contact us.
            </a>
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {faqs.map((faq, idx) => {
            const isOpen = expandedIdx === idx
            return (
              <motion.div
                key={idx}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isOpen ? 'rgba(201,168,76,0.04)' : '#FFFFFF',
                  border: isOpen ? '1.5px solid rgba(201,168,76,0.3)' : '1px solid #EBEBF0',
                  boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.07)' : '0 1px 8px rgba(0,0,0,0.04)',
                  transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                }}
                variants={itemVariants}
              >
                <button
                  onClick={() => setExpandedIdx(isOpen ? -1 : idx)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left group"
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isOpen ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.06)',
                      border: `1px solid ${isOpen ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.15)'}`,
                    }}
                  >
                    <HelpCircle
                      size={15}
                      style={{ color: '#C9A84C' }}
                    />
                  </div>

                  <h3
                    className="flex-1 text-base font-semibold leading-snug transition-colors duration-300 pr-2"
                    style={{
                      color: isOpen ? '#1A1A2E' : '#4A4A6A',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      size={18}
                      style={{ color: isOpen ? '#C9A84C' : '#8A8AA0' }}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="px-6 pb-6 pl-[4.5rem]"
                        style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}
                      >
                        <p
                          className="leading-relaxed text-sm pt-4"
                          style={{ color: '#4A4A6A' }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export { FAQSection }



