import { BedDouble, Plus } from 'lucide-react'
import type { FilterType } from '@/types/room.types'

interface RoomsEmptyStateProps {
  filter: FilterType
  onAddRoom: () => void
}

export function RoomsEmptyState({ filter, onAddRoom }: RoomsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
        <BedDouble className="w-8 h-8 text-amber-500/60" />
      </div>
      <p className="text-amber-500/70 text-base font-medium">No rooms found</p>
      <p className="text-gray-600 text-sm max-w-sm text-center">
        {filter !== 'all'
          ? 'Try a different filter or add a new room'
          : 'Get started by adding your first room'}
      </p>
      <button
        onClick={onAddRoom}
        className="mt-2 px-4 py-2.5 rounded-xl bg-[#C8840A] hover:bg-[#F5A623] text-black font-bold text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4" />
        Add Room
      </button>
    </div>
  )
}

