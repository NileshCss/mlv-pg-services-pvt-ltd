'use client'

import React from 'react'

interface TabOption {
  id: string
  label: string
}

interface ResponsiveTabsProps {
  options: TabOption[]
  activeId: string
  onChange: (id: any) => void
  className?: string
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  options,
  activeId,
  onChange,
  className = ''
}) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto scrollbar-none h-[40px] px-1 bg-[#0F1629]/40 border border-white/5 rounded-xl p-1 w-full max-w-full ${className}`}
    >
      {options.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={isActive ? { background: '#F59E0B', color: '#000000' } : {}}
            className={`flex-shrink-0 h-[32px] px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center whitespace-nowrap min-h-unset ${
              isActive 
                ? 'shadow-md shadow-amber-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
