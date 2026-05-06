'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/utils/constants'

const WhatsAppButton: React.FC = () => {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 group"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50 group-hover:opacity-75 animate-pulse" />
        <button className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white group-hover:scale-110">
          <MessageCircle size={24} />
        </button>
      </div>
    </motion.a>
  )
}

export { WhatsAppButton }
