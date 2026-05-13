'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFoodMenu } from '@/hooks/useFoodMenu'
import { FoodMenuItem } from '@/types/food'

// ─── Constants ────────────────────────────────────────────────────────────────
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' } as const
type MealKey = keyof typeof MEAL_ICONS

const FOOD_TAGS = [
  { icon: '🥗', label: 'Pure Veg Options' },
  { icon: '🍗', label: 'Non-Veg Fri & Sun' },
  { icon: '✅', label: 'Hygienic & Fresh' },
  { icon: '♾️', label: 'Unlimited Quantity' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="animate-pulse flex gap-4 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 rounded flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
      ))}
    </div>
  )
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TableRow({ item, idx }: { item: FoodMenuItem; idx: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.03 }}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,191,36,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Day cell */}
      <td className="px-6 py-4 w-36">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: item.day === 'Sunday' || item.day === 'Saturday'
                ? '#FBBF24'
                : 'rgba(251,191,36,0.4)',
            }}
          />
          <span
            className="font-semibold text-sm"
            style={{
              fontFamily: 'Poppins, sans-serif',
              color: item.day === 'Sunday' ? '#FBBF24' : '#E5E7EB',
            }}
          >
            {item.day}
          </span>
          {item.day === 'Sunday' && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontFamily: 'Poppins, sans-serif' }}
            >
              Special
            </span>
          )}
        </div>
      </td>

      {/* Meal cells */}
      {(['breakfast', 'lunch', 'dinner'] as MealKey[]).map(meal => (
        <td
          key={meal}
          className="px-6 py-4 text-sm"
          style={{ fontFamily: 'Inter, sans-serif', color: '#D1D5DB', lineHeight: 1.6 }}
        >
          {item[meal] || <span style={{ color: '#9CA3AF' }}>—</span>}
        </td>
      ))}
    </motion.tr>
  )
}

// ─── Mobile Meal Cards ────────────────────────────────────────────────────────
function MealCards({ item }: { item: FoodMenuItem }) {
  return (
    <div className="px-4 pb-4 grid gap-3">
      {(['breakfast', 'lunch', 'dinner'] as MealKey[]).map(meal => (
        <div
          key={meal}
          className="p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(251,191,36,0.1)' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(251,191,36,0.7)' }}
          >
            {MEAL_ICONS[meal]} {meal}
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', color: '#D1D5DB' }}
          >
            {item[meal] || '—'}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FoodMenuSection() {
  const { menu, loading, usingFallback } = useFoodMenu()
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [view, setView] = useState<'table' | 'cards'>('table')

  return (
    <section
      id="food-menu"
      className="relative py-24 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #071120 0%, #0B1D34 50%, #071120 100%)' }}
    >
      {/* Background glow orb */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* ── Section Header ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Cinzel label */}
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'Cinzel, serif', color: '#FBBF24' }}
          >
            Our Daily Menu
          </p>

          <h2
            className="text-4xl md:text-5xl font-semibold text-white mb-4"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.5px' }}
          >
            Unlimited Food,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FBBF24, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Unlimited Happiness
            </span>
          </h2>

          <p
            className="max-w-xl mx-auto text-base"
            style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}
          >
            Fresh, hygienic, home-style meals served 3× daily — every single day of the week.
          </p>

          {/* View toggle */}
          <div className="flex items-center justify-center gap-2 mt-8" role="group" aria-label="Menu view toggle">
            {(['table', 'cards'] as const).map(v => (
              <button
                key={v}
                id={`food-view-${v}`}
                onClick={() => setView(v)}
                className="px-5 py-2 rounded-full text-sm transition-all duration-200"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  background: view === v ? 'linear-gradient(135deg,#FBBF24,#D4AF37)' : 'rgba(255,255,255,0.04)',
                  color: view === v ? '#071120' : '#9CA3AF',
                  border: view === v ? 'none' : '1px solid rgba(251,191,36,0.2)',
                  fontWeight: view === v ? 600 : 400,
                }}
              >
                {v === 'table' ? '📋 Weekly Table' : '📅 Day Cards'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Offline notice ──────────────────────────────────────── */}
        {usingFallback && (
          <div
            className="mb-6 mx-auto max-w-md text-center py-2 px-4 rounded-full text-xs"
            style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: '#FBBF24',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ⚠️ Showing default menu — connect Supabase to manage live data
          </div>
        )}

        {/* ── TABLE VIEW ─────────────────────────────────────────── */}
        {view === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(11,29,52,0.8)',
              border: '1px solid rgba(251,191,36,0.15)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.15), rgba(212,175,55,0.08))' }}>
                    {[
                      'Day',
                      `${MEAL_ICONS.breakfast} Breakfast`,
                      `${MEAL_ICONS.lunch} Lunch`,
                      `${MEAL_ICONS.dinner} Dinner`,
                    ].map(col => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-sm font-semibold"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: '#FBBF24',
                          borderBottom: '1px solid rgba(251,191,36,0.15)',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(7)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={4}>
                            <SkeletonRow />
                          </td>
                        </tr>
                      ))
                    : menu.map((item, idx) => <TableRow key={item.id} item={item} idx={idx} />)}
                </tbody>
              </table>
            </div>

            {/* Mobile accordion */}
            <div className="md:hidden">
              {loading
                ? [...Array(7)].map((_, i) => <SkeletonRow key={i} />)
                : DAYS.map(day => {
                    const item = menu.find(m => m.day === day)
                    if (!item) return null
                    const isOpen = activeDay === day
                    return (
                      <div key={day} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          id={`food-day-${day.toLowerCase()}`}
                          className="w-full flex items-center justify-between px-4 py-4"
                          onClick={() => setActiveDay(isOpen ? null : day)}
                          aria-expanded={isOpen}
                        >
                          <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FBBF24', fontWeight: 600 }}>
                            {day}
                          </span>
                          <span style={{ color: '#9CA3AF', fontSize: '18px' }}>{isOpen ? '−' : '+'}</span>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <MealCards item={item} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
            </div>
          </motion.div>
        )}

        {/* ── CARDS VIEW ─────────────────────────────────────────── */}
        {view === 'cards' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {loading
              ? [...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl h-52"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                ))
              : menu.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl p-5 transition-all duration-300 cursor-default"
                    style={{
                      background: 'rgba(11,29,52,0.8)',
                      border: '1px solid rgba(251,191,36,0.2)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {/* Day header */}
                    <div
                      className="text-sm font-semibold mb-4 pb-2 flex items-center justify-between"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#FBBF24',
                        borderBottom: '1px solid rgba(251,191,36,0.15)',
                      }}
                    >
                      <span>{item.day}</span>
                      {item.day === 'Sunday' && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}
                        >
                          Special
                        </span>
                      )}
                    </div>

                    {/* Meals */}
                    {(['breakfast', 'lunch', 'dinner'] as MealKey[]).map(meal => (
                      <div key={meal} className="mb-3">
                        <p
                          className="text-xs uppercase tracking-wider mb-1"
                          style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(251,191,36,0.6)' }}
                        >
                          {MEAL_ICONS[meal]} {meal}
                        </p>
                        <p
                          className="text-sm leading-snug"
                          style={{ fontFamily: 'Inter, sans-serif', color: '#D1D5DB' }}
                        >
                          {item[meal] || '—'}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                ))}
          </motion.div>
        )}

        {/* ── Food Tags ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {FOOD_TAGS.map(tag => (
            <span
              key={tag.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#FBBF24',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.25)',
              }}
            >
              {tag.icon} {tag.label}
            </span>
          ))}
        </motion.div>

        {/* ── CTA Note ────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm"
          style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}
        >
          Menu may vary slightly on special occasions.{' '}
          <span style={{ color: '#FBBF24' }}>Special Sunday meals</span> every week! 🎉
        </motion.p>
      </div>
    </section>
  )
}
