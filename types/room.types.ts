export interface Room {
  id: string
  building_name: string
  building_id?: string
  room_number: string
  floor?: number
  room_type: 'single' | 'double' | 'triple' | 'dormitory'
  total_beds: number
  occupied_beds: number
  price_per_bed: number
  is_ac: boolean
  has_attached_bathroom: boolean
  maintenance_status: boolean
  amenities: string[]
  images: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface Building {
  id: string
  name: string
  floors: number
  description?: string
  is_active: boolean
  created_at: string
}

export type FilterType =
  | 'all'
  | 'single'
  | 'double'
  | 'triple'
  | 'dormitory'
  | 'ac'
  | 'non-ac'
  | 'available'
  | 'maintenance'

export type RoomFormMode = 'add' | 'edit'
