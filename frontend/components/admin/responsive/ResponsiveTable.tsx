'use client'

import React from 'react'
import { ResponsiveCard } from './ResponsiveCard'

interface Column {
  label: string
  className?: string
}

interface ResponsiveTableProps<T> {
  columns: Column[]
  items: T[]
  renderRow: (item: T, idx: number) => React.ReactNode
  renderCard: (item: T, idx: number) => React.ReactNode
  emptyState?: React.ReactNode
  className?: string
}

export function ResponsiveTable<T>({
  columns,
  items,
  renderRow,
  renderCard,
  emptyState,
  className = ''
}: ResponsiveTableProps<T>) {
  if (!items || items.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop view (>=768px): standard responsive table wrapper */}
      <div className="hidden md:block bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full min-w-[800px] table-auto text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider ${col.className || ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item, idx) => renderRow(item, idx))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view (<768px): card stack */}
      <div className="block md:hidden space-y-3.5 px-0.5">
        {items.map((item, idx) => renderCard(item, idx))}
      </div>
    </div>
  )
}
