'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Is there a PG near Acharya Institute with North Indian food?',
    answer:
      'Yes — MLV PG is located directly opposite Acharya Institute of Technology, just a 2-minute walk away. We are one of the very few PGs in Soladevanahalli that serve authentic North Indian home-cooked food — dal, roti, sabzi, and rice prepared fresh every day in a hygienic kitchen.',
  },
  {
    question: 'Which PG near Acharya College serves home-cooked food?',
    answer:
      'MLV PG Services is known for its warm, home-style North Indian meals. Students from Acharya College (Soladevanahalli) and Acharya Institute of Graduate Studies (AIGS) regularly choose us because our food tastes just like what their parents cook — no mess food, no tiffin boxes, just real meals made with care.',
  },
  {
    question: 'Best PG for girls near Acharya Institute Bangalore?',
    answer:
      'MLV PG offers secure, dedicated accommodation for girls with 24/7 CCTV surveillance, on-site female staff, biometric entry, and gated premises. Located a short walk from Acharya Institute of Technology (AIT) and AIGS, it is widely regarded as one of the safest and most comfortable PGs for girls in the area.',
  },
  {
    question: 'Is MLV PG safe for girls?',
    answer:
      'Absolutely. Safety is our highest priority. MLV PG has 24/7 CCTV cameras covering all common areas, a biometric access system, gated entry, and dedicated female staff on duty at all times. Parents of our girl residents regularly tell us they sleep peacefully knowing their daughters are with us.',
  },
  {
    question: 'Is there a PG with parent-like care near Acharya Institute?',
    answer:
      'MLV PG is built on the belief that every student deserves a family-like environment away from home. Our staff knows each resident by name, checks on their well-being, and ensures no one skips meals. Students from Acharya Institute of Technology and Acharya College consistently call it the most caring PG they have lived in.',
  },
  {
    question: 'How far is MLV PG from Acharya Institute of Technology?',
    answer:
      'MLV PG is located directly opposite Acharya Institute of Technology (AIT) on Hesaraghatta Road, Soladevanahalli — roughly a 2-minute walk from the campus gate. Students from Acharya Institute of Graduate Studies (AIGS) and Acharya College are also within comfortable walking distance from our facility.',
  },
  {
    question: 'What type of food is served at MLV PG?',
    answer:
      'We serve authentic North Indian home-cooked meals: dal (arhar/chana), fresh rotis, seasonal sabzi, steamed rice, and curd. Meals are prepared daily in a hygienically maintained kitchen using fresh ingredients. Both vegetarian and non-vegetarian options are available. There are no shortcuts — it tastes exactly like food made at home.',
  },
  {
    question: 'What are the room charges and what is included?',
    answer:
      'Room rent starts at ₹7,500/month (triple sharing) and goes up to ₹13,000/month (single room). All plans include North Indian home-cooked meals (breakfast, lunch & dinner), high-speed WiFi, 24/7 electricity with backup, CCTV security, housekeeping, and self-use washing machine. A refundable one-month security deposit is required at move-in.',
  },
  {
    question: 'Is there a washing machine at MLV PG?',
    answer:
      'Yes, self-use washing machines are available for all residents on the premises. You can do your laundry at your convenience — no waiting, no extra charges.',
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



