'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'

interface BookingStatusData {
  name: string
  value: number
  color: string
}

interface BookingStatusChartProps {
  data: BookingStatusData[]
}

const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#06B6D4', '#EF4444']

export const BookingStatusChart: React.FC<BookingStatusChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={DESIGN_SYSTEM.components.card.base + ' p-6'}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Booking Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(10, 14, 26, 0.95)',
              border: '1px solid rgba(245, 166, 35, 0.2)',
              borderRadius: '8px',
              color: '#F0F4FF',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
