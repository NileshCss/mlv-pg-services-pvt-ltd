'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is included in the room rent?',
    answer: 'Room rent includes furnished room, WiFi, 24/7 electricity with backup, CCTV security, housekeeping, laundry service, and unlimited food (breakfast, lunch, dinner).',
  },
  {
    question: 'Do you provide vegetarian and non-vegetarian food?',
    answer: 'Yes, we provide both vegetarian and non-vegetarian options. You can choose your food preference during registration.',
  },
  {
    question: 'Is there any deposit or advance payment required?',
    answer: 'Yes, we require a one-month security deposit and advance payment for the first month. Details will be discussed during booking.',
  },
  {
    question: 'What is the booking process?',
    answer: 'Fill the pre-registration form, we will contact you, schedule a visit, finalize the booking, and you\'re all set!',
  },
  {
    question: 'Are guests allowed?',
    answer: 'Yes, guests are allowed with prior notice. There are designated visiting hours and guidelines for guest visits.',
  },
  {
    question: 'What is the location and connectivity?',
    answer: 'We are located opposite Acharya Institute of Technology. The location is easily accessible by public transport and walking distance to college.',
  },
]

const FAQSection: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState(0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-secondary-500/10 border border-secondary-500/30 mb-4">
            <span className="text-xs font-semibold text-secondary-400">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked<br />
            <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              className="rounded-lg border border-gray-800 overflow-hidden glass-effect hover:border-secondary-500/30 transition-all duration-300"
              variants={itemVariants}
            >
              <button
                onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-50 pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: expandedIdx === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={20} className="text-secondary-500" />
                </motion.div>
              </button>

              {expandedIdx === idx && (
                <motion.div
                  className="border-t border-gray-800 px-6 py-4 bg-gray-800/20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { FAQSection }
