'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'

interface StatCardProps {
  title: string
  value: number
  trend: number
  icon: LucideIcon
  color: 'gold' | 'blue' | 'green' | 'red'
  prefix?: string
  suffix?: string
}

const colorMap = {
  gold: { primary: '#F5A623', bg: 'rgba(245, 166, 35, 0.1)', text: 'text-amber-400' },
  blue: { primary: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', text: 'text-blue-400' },
  green: { primary: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', text: 'text-green-400' },
  red: { primary: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'text-red-400' },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const colorConfig = colorMap[color]
  const isTrendPositive = trend >= 0

  // Animated counter
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 800
    const steps = 60
    const stepDuration = duration / steps
    const increment = end / steps

    const counter = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(Math.floor(end))
        clearInterval(counter)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, stepDuration)

    return () => clearInterval(counter)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden group cursor-pointer`}
      style={{
        background: `linear-gradient(135deg, rgba(15, 22, 41, 0.8) 0%, ${colorConfig.bg} 100%)`,
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, ${colorConfig.primary}20, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div
            className="p-2.5 rounded-lg"
            style={{ background: colorConfig.bg }}
          >
            <Icon size={20} style={{ color: colorConfig.primary }} />
          </div>
        </div>

        {/* Value */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {prefix}
              {displayValue.toLocaleString()}
              {suffix}
            </span>
          </div>

          {/* Trend */}
          <div className="flex items-center gap-1">
            {isTrendPositive ? (
              <>
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">
                  ↑ {Math.abs(trend)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium">
                  ↓ {Math.abs(trend)}%
                </span>
              </>
            )}
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

