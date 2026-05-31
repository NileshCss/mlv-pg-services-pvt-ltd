'use client'

import React from 'react'

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent) => void
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  style = {},
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-[#0F1629]/95 border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl transition-all ${className}`}
    >
      {children}
    </div>
  )
}
