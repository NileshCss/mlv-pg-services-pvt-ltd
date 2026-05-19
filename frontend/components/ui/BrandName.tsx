'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic']
})

export const BrandName = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center md:text-left flex flex-col items-center md:items-start w-full"
    >
      <div className="inline-flex flex-col items-center md:items-start">
        <h2 className="leading-tight">
          <span className={`text-[28px] md:text-[34px] font-bold text-[#C9A240] ${playfair.className} tracking-wide border-b-2 border-[#C9A240] pb-0.5`}>
            MLV PG
          </span>
          <span className={`text-[28px] md:text-[34px] font-bold text-[#1C1C3A] ${playfair.className} tracking-wide`}>
            {' '}Services Pvt Ltd
          </span>
        </h2>
        <div className="text-[10px] md:text-[11px] tracking-[0.2em] text-gray-400 font-sans mt-1 uppercase">
          PREMIUM PG · BANGALORE
        </div>
      </div>
    </motion.div>
  )
}
