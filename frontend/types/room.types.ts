export interface Room {
  id: string
  building_id: string
  building_name?: string
  room_number: string
  floor: number
  room_type: 'single' | 'double' | 'triple' | 'dormitory'
  total_beds: number
  occupied_beds: number
  available_beds?: number
  price_per_bed: number
  security_deposit: number
  electricity_charges?: number
  maintenance_charges?: number
  is_ac: boolean
  has_attached_bathroom: boolean
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  amenities: string[]
  notes?: string
  created_at: string
  updated_at: string
  buildings?: {
    name: string
    code: string
    status: 'Boys PG' | 'Girls PG'
  }
}

export interface Building {
  id: string
  name: string
  code: string
  address: string
  description?: string
  status: 'Boys PG' | 'Girls PG'
  created_at: string
  updated_at: string
}

export type FilterType =
  | 'all'
  | 'single'
  | 'double'
  | 'triple'
  | 'dormitory'
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'reserved'

export type RoomFormMode = 'add' | 'edit'
