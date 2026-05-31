'use client'

import React from 'react'

interface MobileContainerProps {
  children: React.ReactNode
  className?: string
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full overflow-x-hidden pt-[72px] sm:pt-4 pb-[env(safe-area-inset-bottom,16px)] px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  )
}
