'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { Edit2, Trash2, Zap, MoreVertical, BedDouble, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { deleteRoom, toggleMaintenance } from '@/lib/services/rooms.service'
import type { Room } from '@/types/room.types'

interface RoomCardProps {
  room: Room
  onEdit: (room: Room) => void
  onRefetch: () => void
}

const RoomCard = memo(function RoomCardComponent({ room, onEdit, onRefetch }: RoomCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const occupancyPercent = Math.round((room.occupied_beds / room.total_beds) * 100)
  const occupancyColor = () => {
    if (occupancyPercent < 50) return 'bg-green-500'
    if (occupancyPercent <= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getFloorSuffix = (n?: number) => {
    if (!n) return 'Ground'
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete Room ${room.room_number}?`)) return

    try {
      setIsDeleting(true)
      const { error } = await deleteRoom(room.id)
      if (error) throw error
      toast.success(`Room ${room.room_number} deleted`)
      onRefetch()
    } catch {
      toast.error('Failed to delete room')
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  const handleToggleMaintenance = async () => {
    try {
      const { error } = await toggleMaintenance(room.id, room.maintenance_status)
      if (error) throw error
      toast.success(`Maintenance ${room.maintenance_status ? 'disabled' : 'enabled'}`)
      onRefetch()
      setShowMenu(false)
    } catch {
      toast.error('Failed to update maintenance status')
    }
  }

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden bg-[#0F1629] border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(245,166,35,0.1)] flex flex-col h-full group"
    >
      {/* Image Container */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-white/5 to-white/0">
        {room.images && room.images.length > 0 ? (
          <Image
            src={room.images[0]}
            alt={`Room ${room.room_number}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BedDouble className="w-12 h-12 text-amber-500/20" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute inset-0 flex items-start justify-between p-3 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
              {room.room_type === 'dormitory' ? 'Dorm' : room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
            </span>
          </div>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
              room.is_ac
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}
          >
            {room.is_ac ? 'AC' : 'Non-AC'}
          </span>
        </div>

        {/* Maintenance Badge */}
        {room.maintenance_status && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Maintenance
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Room {room.room_number}</h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-500/60" />
              <span className="text-amber-500/80 font-medium">{room.building_name}</span>
              <span className="text-gray-600">·</span>
              <span>{getFloorSuffix(room.floor)} Floor</span>
              <span className="text-gray-600">·</span>
              <span className="capitalize">{room.room_type}</span>
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute right-0 mt-1 bg-[#0A0E1A] border border-white/10 rounded-xl shadow-lg z-10 min-w-max"
                >
                  <button
                    onClick={() => {
                      onEdit(room)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleToggleMaintenance}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {room.maintenance_status ? 'End Maintenance' : 'Start Maintenance'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full transition-colors duration-300 ${occupancyColor()}`}
            />
          </div>
          <p className="text-xs text-gray-500">
            {room.occupied_beds} / {room.total_beds} beds
          </p>
        </div>

        {/* Price */}
        <p className="text-sm font-semibold text-amber-400">
          ₹{room.price_per_bed?.toLocaleString('en-IN') || 0} / bed / month
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          <button
            onClick={() => onEdit(room)}
            className="flex-1 py-2 px-2 rounded-xl bg-white/5 hover:bg-amber-500/15 text-gray-400 hover:text-amber-400 text-xs font-medium transition-colors border border-white/10 hover:border-amber-500/30 flex items-center justify-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={handleToggleMaintenance}
            className="flex-1 py-2 px-2 rounded-xl bg-white/5 hover:bg-yellow-500/15 text-gray-400 hover:text-yellow-400 text-xs font-medium transition-colors border border-white/10 hover:border-yellow-500/30 flex items-center justify-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" />
            {room.maintenance_status ? 'Active' : 'Off'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2 px-2 rounded-xl bg-white/5 hover:bg-red-500/15 text-gray-400 hover:text-red-400 text-xs font-medium transition-colors border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </motion.div>
  )
})

RoomCard.displayName = 'RoomCard'
export { RoomCard }

