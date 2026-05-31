'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { roomSchema, type RoomFormData } from '@/lib/validations/room.schema'
import { createRoom, updateRoom } from '@/lib/services/rooms.service'
import type { Room, Building, RoomFormMode } from '@/types/room.types'

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'] as const
const AMENITIES = [
  'AC Room',
  'WiFi',
  'Attached Bathroom',
  'Study Table',
  'Wardrobe',
  'Laundry Access',
  'Hot Water Geyser',
  'CCTV',
  'Power Backup',
  'RO Water',
  'Parking'
]

const STATUS_OPTIONS = [
  { value: 'available', label: '🟢 Available' },
  { value: 'occupied', label: '🔴 Occupied' },
  { value: 'maintenance', label: '🟠 Under Maintenance' },
  { value: 'reserved', label: '🔵 Reserved' }
]

interface RoomFormPanelProps {
  mode: RoomFormMode
  room?: Room | null
  buildings: Building[]
  onClose: () => void
  onSuccess: () => void
}

export function RoomFormPanel({ mode, room, buildings, onClose, onSuccess }: RoomFormPanelProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues:
      mode === 'edit' && room
        ? {
            building_id: room.building_id,
            room_number: room.room_number,
            floor: room.floor,
            room_type: room.room_type,
            total_beds: room.total_beds,
            occupied_beds: room.occupied_beds,
            price_per_bed: room.price_per_bed,
            security_deposit: room.security_deposit || 0,
            electricity_charges: room.electricity_charges || 0,
            maintenance_charges: room.maintenance_charges || 0,
            is_ac: room.is_ac,
            has_attached_bathroom: room.has_attached_bathroom,
            status: room.status || 'available',
            amenities: room.amenities || [],
            notes: room.notes || '',
          }
        : {
            building_id: '',
            room_number: '',
            floor: 1,
            room_type: 'double',
            total_beds: 2,
            occupied_beds: 0,
            price_per_bed: 0,
            security_deposit: 0,
            electricity_charges: 0,
            maintenance_charges: 0,
            is_ac: false,
            has_attached_bathroom: false,
            status: 'available',
            amenities: [],
            notes: '',
          },
  })

  const totalBeds = watch('total_beds') || 0
  const occupiedBeds = watch('occupied_beds') || 0
  const selectedAmenities = watch('amenities') || []
  const roomType = watch('room_type')
  const currentStatus = watch('status')

  const availableBeds = Math.max(0, totalBeds - occupiedBeds)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (mode === 'add') {
        const { error } = await createRoom(data)
        if (error) throw error
        toast.success('Room added successfully')
      } else {
        const { error } = await updateRoom(room!.id, data)
        if (error) throw error
        toast.success('Room updated successfully')
      }
      reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    }
  }

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity]
    setValue('amenities', next)
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>
          {mode === 'add' ? 'Add New Room' : `Edit Room ${room?.room_number}`}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
        
        {/* Building & Location Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Building & Floor</h3>
          
          {/* Building Select */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Building *
            </label>
            <select
              {...register('building_id')}
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0F1629]">Select building...</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id} className="bg-[#0F1629]">
                  {b.name} ({b.status})
                </option>
              ))}
            </select>
            {errors.building_id && <p className="text-red-400 text-xs mt-1">{errors.building_id.message}</p>}
          </div>

          {/* Floor & Room Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Floor Number *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                {...register('floor', { valueAsNumber: true })}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
              {errors.floor && <p className="text-red-400 text-xs mt-1">{errors.floor.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Room Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 101, A-202"
                {...register('room_number')}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
              {errors.room_number && <p className="text-red-400 text-xs mt-1">{errors.room_number.message}</p>}
            </div>
          </div>
        </div>

        {/* Room Type */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Room Type *</h3>
          <div className="grid grid-cols-4 gap-2">
            {ROOM_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('room_type', type)}
                className={`py-2 px-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all ${
                  roomType === type
                    ? 'bg-amber-500 text-black border-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.25)]'
                    : 'bg-[#0A0E1A] border-white/10 text-gray-400 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.room_type && <p className="text-red-400 text-xs">{errors.room_type.message}</p>}
        </div>

        {/* Capacity Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Capacity Section</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Total Beds</label>
              <input
                type="number"
                min="1"
                {...register('total_beds', { valueAsNumber: true })}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500/50 outline-none"
              />
              {errors.total_beds && <p className="text-red-400 text-xs mt-1">{errors.total_beds.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Occupied Beds</label>
              <input
                type="number"
                min="0"
                {...register('occupied_beds', { valueAsNumber: true })}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500/50 outline-none"
              />
              {errors.occupied_beds && <p className="text-red-400 text-xs mt-1">{errors.occupied_beds.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Available Beds</label>
              <input
                type="number"
                value={availableBeds}
                readOnly
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pricing Section (₹ INR)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Rent / Bed / Month *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Rent"
                  {...register('price_per_bed', { valueAsNumber: true })}
                  className="w-full pl-6 bg-[#0A0E1A] border border-white/10 rounded-xl py-2 text-white outline-none focus:border-amber-500/50"
                />
              </div>
              {errors.price_per_bed && <p className="text-red-400 text-xs mt-1">{errors.price_per_bed.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Security Deposit *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Deposit"
                  {...register('security_deposit', { valueAsNumber: true })}
                  className="w-full pl-6 bg-[#0A0E1A] border border-white/10 rounded-xl py-2 text-white outline-none focus:border-amber-500/50"
                />
              </div>
              {errors.security_deposit && <p className="text-red-400 text-xs mt-1">{errors.security_deposit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Electricity (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  {...register('electricity_charges', { valueAsNumber: true })}
                  className="w-full pl-6 bg-[#0A0E1A] border border-white/10 rounded-xl py-2 text-white outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Maintenance (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  {...register('maintenance_charges', { valueAsNumber: true })}
                  className="w-full pl-6 bg-[#0A0E1A] border border-white/10 rounded-xl py-2 text-white outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Checklist */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Amenities Section</h3>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map(amenity => {
              const selected = selectedAmenities.includes(amenity)
              return (
                <div
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    selected
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-[#0A0E1A] border-white/5 hover:border-white/15'
                  }`}
                >
                  <span className="text-xs text-gray-300 font-medium">{amenity}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                      selected ? 'bg-amber-500' : 'border border-white/20'
                    }`}
                  >
                    {selected && <Check className="w-2.5 h-2.5 text-black" strokeWidth={4} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Room Status Selector */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Room Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setValue('status', opt.value as any)
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  currentStatus === opt.value
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-[#0A0E1A] border-white/5 text-gray-500 hover:border-white/15'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
            Internal Remarks
          </label>
          <textarea
            placeholder="Room details or remarks..."
            rows={3}
            {...register('notes')}
            className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 outline-none resize-none"
          />
        </div>
      </form>

      {/* Footer */}
      <div className="border-t border-white/8 px-6 py-4 flex gap-3 flex-shrink-0 bg-black/20 backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-400 hover:border-white/30 hover:text-white transition-all text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {mode === 'add' ? 'Save Room' : 'Update Room'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </>
  )
}
