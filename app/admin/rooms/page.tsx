'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomFormPanel } from '@/components/rooms/RoomFormPanel'
import { RoomCardSkeleton } from '@/components/rooms/RoomCardSkeleton'
import { RoomsEmptyState } from '@/components/rooms/RoomsEmptyState'
import { useRooms } from '@/hooks/useRooms'
import type { Room, FilterType } from '@/types/room.types'

const FILTER_TABS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Single', value: 'single' },
  { label: 'Double', value: 'double' },
  { label: 'Triple', value: 'triple' },
  { label: 'Dormitory', value: 'dormitory' },
  { label: 'AC', value: 'ac' },
  { label: 'Non-AC', value: 'non-ac' },
  { label: 'Available', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
]

export default function RoomsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [activeBuilding, setActiveBuilding] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  const { rooms, buildings, isLoading, refetch } = useRooms(activeFilter, activeBuilding)

  const openAddForm = () => {
    setEditingRoom(null)
    setFormOpen(true)
  }

  const openEditForm = (room: Room) => {
    setEditingRoom(room)
    setFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingRoom(null)
  }, [])

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0A0E1A] p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display' }}
            >
              Rooms
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage room availability and details</p>
          </div>
          <button
            onClick={openAddForm}
            className="px-4 py-2.5 rounded-xl bg-[#C8840A] hover:bg-[#F5A623] text-black font-bold text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {/* Filter Tabs - Row 1: Type/Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 -mx-2 px-2 scrollbar-hide">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFilter === tab.value
                  ? 'bg-[#C8840A] text-[#F5A623] border border-[#F5A623]/40'
                  : 'bg-[#0F1629] text-gray-400 border border-white/8 hover:border-amber-500/30 hover:text-amber-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Tabs - Row 2: Building */}
        {buildings.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 -mx-2 px-2 scrollbar-hide">
            <button
              onClick={() => setActiveBuilding('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeBuilding === 'all'
                  ? 'bg-[#C8840A] text-[#F5A623] border border-[#F5A623]/40'
                  : 'bg-[#0F1629] text-gray-400 border border-white/8 hover:border-amber-500/30 hover:text-amber-400'
              }`}
            >
              🏢 All Buildings
            </button>
            {buildings.map(building => (
              <button
                key={building}
                onClick={() => setActiveBuilding(building)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeBuilding === building
                    ? 'bg-[#C8840A] text-[#F5A623] border border-[#F5A623]/40'
                    : 'bg-[#0F1629] text-gray-400 border border-white/8 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                {building}
              </button>
            ))}
          </div>
        )}

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <RoomsEmptyState filter={activeFilter} onAddRoom={openAddForm} />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {rooms.map(room => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <RoomCard room={room} onEdit={openEditForm} onRefetch={refetch} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Fixed Slide-Over Form Panel */}
      <AnimatePresence>
        {formOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#0F1629] border-l border-white/8 z-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
            >
              <RoomFormPanel
                mode={editingRoom ? 'edit' : 'add'}
                room={editingRoom}
                buildings={buildings}
                onClose={closeForm}
                onSuccess={() => {
                  closeForm()
                  refetch()
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
