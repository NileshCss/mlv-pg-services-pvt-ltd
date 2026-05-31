'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { buildingSchema, type BuildingFormData } from '@/lib/validations/room.schema'
import { createBuilding, updateBuilding } from '@/lib/services/rooms.service'
import type { Building } from '@/types/room.types'

interface BuildingFormPanelProps {
  mode: 'add' | 'edit'
  building?: Building | null
  onClose: () => void
  onSuccess: () => void
}

export function BuildingFormPanel({ mode, building, onClose, onSuccess }: BuildingFormPanelProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues:
      mode === 'edit' && building
        ? {
            name: building.name,
            code: building.code,
            address: building.address,
            description: building.description || '',
            status: building.status,
          }
        : {
            name: '',
            code: '',
            address: '',
            description: '',
            status: 'Boys PG',
          },
  })

  const buildingStatus = watch('status')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const onSubmit = async (data: BuildingFormData) => {
    try {
      if (mode === 'add') {
        const { error } = await createBuilding(data)
        if (error) throw error
        toast.success('Building added successfully')
      } else {
        const { error } = await updateBuilding(building!.id, data)
        if (error) throw error
        toast.success('Building updated successfully')
      }
      reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>
          {mode === 'add' ? 'Add New Building' : `Edit Building ${building?.name}`}
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
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Building Name *
            </label>
            <input
              type="text"
              placeholder="e.g. MLV PG Building A"
              {...register('name')}
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 outline-none transition-all"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Building Code *
            </label>
            <input
              type="text"
              placeholder="e.g. BLDG-A"
              {...register('code')}
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 outline-none transition-all"
            />
            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
          </div>
        </div>

        {/* Building Gender Status */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Building Type (PG Status) *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'Boys PG', label: '♂ Boys PG' },
              { value: 'Girls PG', label: '♀ Girls PG' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('status', opt.value as any)}
                className={`py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all ${
                  buildingStatus === opt.value
                    ? 'bg-amber-500 text-black border-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.25)]'
                    : 'bg-[#0A0E1A] border-white/10 text-gray-400 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
            Address *
          </label>
          <textarea
            placeholder="Complete building address..."
            rows={3}
            {...register('address')}
            className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500/50 outline-none resize-none"
          />
          {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            placeholder="Optional descriptive text..."
            rows={3}
            {...register('description')}
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
              {mode === 'add' ? 'Save Building' : 'Update Building'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </>
  )
}
