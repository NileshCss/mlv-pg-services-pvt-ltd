'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload, Loader2, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { roomSchema, type RoomFormData } from '@/lib/validations/room.schema'
import { createRoom, updateRoom } from '@/lib/services/rooms.service'
import { createClient } from '@/lib/supabase/client'
import type { Room, RoomFormMode } from '@/types/room.types'

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory']
const AMENITIES = ['AC Room', 'Attached Bathroom', 'WiFi', 'Study Table', 'Wardrobe', 'Hot Water Geyser', 'Laundry Access', 'CCTV']

interface RoomFormPanelProps {
  mode: RoomFormMode
  room?: Room | null
  buildings: string[]
  onClose: () => void
  onSuccess: () => void
}

export function RoomFormPanel({ mode, room, buildings, onClose, onSuccess }: RoomFormPanelProps) {
  const supabase = createClient()
  const [uploadedImages, setUploadedImages] = useState<string[]>(room?.images || [])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues:
      mode === 'edit' && room
        ? {
            building_name: room.building_name,
            room_number: room.room_number,
            floor: room.floor,
            room_type: room.room_type,
            total_beds: room.total_beds,
            occupied_beds: room.occupied_beds,
            price_per_bed: room.price_per_bed,
            is_ac: room.is_ac,
            has_attached_bathroom: room.has_attached_bathroom,
            maintenance_status: room.maintenance_status,
            amenities: room.amenities || [],
            notes: room.notes,
          }
        : {
            building_name: '',
            room_number: '',
            room_type: 'double',
            total_beds: 2,
            occupied_beds: 0,
            price_per_bed: 0,
            is_ac: false,
            has_attached_bathroom: false,
            maintenance_status: false,
            amenities: [],
          },
  })

  const totalBeds = watch('total_beds') || 0
  const occupiedBeds = watch('occupied_beds') || 0
  const selectedAmenities = watch('amenities') || []
  const roomType = watch('room_type')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    try {
      setUploading(true)
      const newImages = [...uploadedImages]

      for (const file of files) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })

        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${crypto.randomUUID()}.${ext}`
        const storagePath = `room-images/${filename}`

        const { error: uploadError } = await supabase.storage.from('room-images').upload(storagePath, compressed)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('room-images').getPublicUrl(storagePath)
        newImages.push(data.publicUrl)
      }

      setUploadedImages(newImages)
      setValue('images', newImages)
      toast.success('Images uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    setValue('images', newImages)
  }

  const onSubmit = async (data: RoomFormData) => {
    try {
      data.images = uploadedImages

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
      setUploadedImages([])
      onSuccess()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-white">
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
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Information</h3>

          {/* Building Name */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Building Name *
            </label>
            <select
              {...register('building_name')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white appearance-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
            >
              <option value="">Select building...</option>
              {buildings.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.building_name && <p className="text-red-400 text-xs mt-1">{errors.building_name.message}</p>}
          </div>

          {/* Room Number & Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Room Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 101, A-202"
                {...register('room_number')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
              {errors.room_number && <p className="text-red-400 text-xs mt-1">{errors.room_number.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Floor
              </label>
              <input
                type="number"
                placeholder="e.g. 1"
                {...register('floor')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Room Type */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Room Type *</h3>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('room_type', type as any)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  roomType === type
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                {type === 'dormitory' ? 'Dorm' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          {errors.room_type && <p className="text-red-400 text-xs">{errors.room_type.message}</p>}
        </div>

        {/* Capacity & Pricing */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity & Pricing</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Total Beds *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                {...register('total_beds', { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
              {errors.total_beds && <p className="text-red-400 text-xs mt-1">{errors.total_beds.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Occupied Beds
              </label>
              <input
                type="number"
                min="0"
                {...register('occupied_beds', { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
              {errors.occupied_beds && <p className="text-red-400 text-xs mt-1">{errors.occupied_beds.message}</p>}
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Price per Bed / Month *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-500 text-lg">₹</span>
              <input
                type="number"
                min="0"
                {...register('price_per_bed', { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-7 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all"
              />
            </div>
            {errors.price_per_bed && <p className="text-red-400 text-xs mt-1">{errors.price_per_bed.message}</p>}
          </div>

          <p className="text-xs text-amber-500/70">Available beds: {Math.max(0, totalBeds - occupiedBeds)} of {totalBeds}</p>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.map(amenity => (
              <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-white/20 group-hover:border-amber-500/50'
                }`}>
                  {selectedAmenities.includes(amenity) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                </div>
                <span className="text-sm text-gray-300">{amenity}</span>
                <input
                  type="checkbox"
                  value={amenity}
                  {...register('amenities')}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        {/* AC & Bathroom Toggle */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
            <input
              type="checkbox"
              {...register('is_ac')}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-300">AC Room</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
            <input
              type="checkbox"
              {...register('has_attached_bathroom')}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-300">Attached Bathroom</span>
          </label>
        </div>

        {/* Maintenance Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <p className="text-sm font-medium text-white">Under Maintenance</p>
            <p className="text-xs text-gray-500">Room unavailable for booking</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('maintenance_status')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Room Images</h3>
          <label className="border-2 border-dashed border-white/15 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer text-center group block">
            <Upload className="mx-auto text-gray-600 group-hover:text-amber-500/60 w-6 h-6" />
            <p className="text-sm text-gray-500 mt-2">Drop images or click to upload</p>
            <p className="text-xs text-gray-600">JPG, PNG, WebP up to 5MB each</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square group">
                  <img src={url} alt="Room preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
            Notes
          </label>
          <textarea
            placeholder="Any additional notes about this room..."
            rows={3}
            {...register('notes')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all resize-none"
          />
          {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>}
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
        <motion.button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || uploading}
          whileHover={{ scale: 0.98 }}
          className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(245,166,35,0.35)]"
        >
          {isSubmitting || uploading ? (
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
        </motion.button>
      </div>
    </>
  )
}
