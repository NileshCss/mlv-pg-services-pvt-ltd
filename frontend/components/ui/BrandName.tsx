'use client'

import React from 'react'
import { motion } from 'framer-motion'

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
          <span className="font-jakarta font-extrabold text-[24px] md:text-[28px] text-[#C9A240] tracking-[-0.02em] border-b-2 border-[#C9A240] pb-0.5">
            MLV PG
          </span>
          <span className="font-jakarta font-extrabold text-[24px] md:text-[28px] text-[#1C1C3A] tracking-[-0.02em]">
            {' '}Services Pvt Ltd
          </span>
        </h2>
        <div className="text-[10px] md:text-[11px] tracking-[0.2em] text-gray-400 font-jakarta font-semibold mt-1 uppercase">
          PREMIUM PG · BANGALORE
        </div>
      </div>
    </motion.div>
  )
}
