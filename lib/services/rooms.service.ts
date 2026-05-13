import { createClient } from '@/lib/supabase/client'
import type { FilterType, Room } from '@/types/room.types'

export async function fetchRooms(filter: FilterType, building: string) {
  const supabase = createClient()
  let query = supabase
    .from('rooms')
    .select('*')
    .order('building_name', { ascending: true })
    .order('room_number', { ascending: true })

  // Type/status filters
  switch (filter) {
    case 'single':
      query = query.eq('room_type', 'single')
      break
    case 'double':
      query = query.eq('room_type', 'double')
      break
    case 'triple':
      query = query.eq('room_type', 'triple')
      break
    case 'dormitory':
      query = query.eq('room_type', 'dormitory')
      break
    case 'ac':
      query = query.eq('is_ac', true)
      break
    case 'non-ac':
      query = query.eq('is_ac', false)
      break
    case 'maintenance':
      query = query.eq('maintenance_status', true)
      break
  }

  // Building filter
  if (building !== 'all') {
    query = query.eq('building_name', building)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  let filteredData = data as Room[]

  if (filter === 'available') {
    filteredData = filteredData.filter(
      (room) => room.occupied_beds < room.total_beds && !room.maintenance_status
    )
  }

  return { data: filteredData, error: null }
}

export async function fetchBuildings() {
  const supabase = createClient()
  const { data } = await supabase
    .from('rooms')
    .select('building_name')
    .neq('building_name', null)
    .order('building_name')

  const unique = [...new Set(data?.map((r: any) => r.building_name) || [])]
  return unique as string[]
}

export async function createRoom(data: any) {
  const supabase = createClient()
  return supabase.from('rooms').insert([data])
}

export async function updateRoom(id: string, data: any) {
  const supabase = createClient()
  return supabase
    .from('rooms')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
}

export async function deleteRoom(id: string) {
  const supabase = createClient()

  // First delete images from storage
  const { data: room } = await supabase
    .from('rooms')
    .select('images')
    .eq('id', id)
    .single()

  if (room?.images?.length) {
    const paths = room.images.map((url: string) => url.split('/room-images/')[1]).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('room-images').remove(paths)
    }
  }

  return supabase.from('rooms').delete().eq('id', id)
}

export async function toggleMaintenance(id: string, current: boolean) {
  const supabase = createClient()
  return supabase
    .from('rooms')
    .update({ maintenance_status: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
}
