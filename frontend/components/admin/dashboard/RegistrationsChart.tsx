'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { motion } from 'motion/react'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'

interface MonthlyData {
  month: string
  registrations: number
  bookings: number
}

interface RegistrationsChartProps {
  data: MonthlyData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl p-3 text-sm"
        style={{
          background: 'rgba(10, 14, 26, 0.95)',
          border: `1px solid rgba(245, 166, 35, 0.2)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <p className="text-amber-400 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const RegistrationsChart: React.FC<RegistrationsChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={DESIGN_SYSTEM.components.card.base + ' p-6'}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Monthly Registrations</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#8892AA"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#8892AA"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="square"
          />
          <Bar
            dataKey="registrations"
            fill="#F5A623"
            radius={[4, 4, 0, 0]}
            name="Registrations"
          />
          <Bar
            dataKey="bookings"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            name="Bookings"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
