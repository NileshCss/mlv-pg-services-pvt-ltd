import { createClient } from '@/lib/supabase/client'
import type { FilterType } from '@/types/room.types'

// ── BUILDINGS SERVICE ────────────────────────────────────────

export async function fetchBuildings() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch buildings:', error)
    return []
  }
  return data || []
}

export async function createBuilding(data: any) {
  const supabase = createClient()
  return supabase.from('buildings').insert([data])
}

export async function updateBuilding(id: string, data: any) {
  const supabase = createClient()
  return supabase
    .from('buildings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
}

export async function deleteBuilding(id: string) {
  const supabase = createClient()

  // Verify if any rooms are assigned to this building before deleting
  const { data: rooms, error: roomCheckError } = await supabase
    .from('rooms')
    .select('id, room_number')
    .eq('building_id', id)
    .limit(1)

  if (roomCheckError) return { error: roomCheckError }
  if (rooms && rooms.length > 0) {
    return { error: new Error('Cannot delete building. There are rooms assigned to this building. Please reassign or delete the rooms first.') }
  }

  const { error } = await supabase.from('buildings').delete().eq('id', id)
  return { error }
}

// ── ROOMS SERVICE ───────────────────────────────────────────

export async function fetchRooms(filter: FilterType, buildingId: string) {
  const supabase = createClient()
  let query = supabase
    .from('rooms')
    .select('*, buildings(name, code, status)')
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
    case 'available':
      query = query.eq('status', 'available')
      break
    case 'occupied':
      query = query.eq('status', 'occupied')
      break
    case 'maintenance':
      query = query.eq('status', 'maintenance')
      break
    case 'reserved':
      query = query.eq('status', 'reserved')
      break
  }

  // Building filter
  if (buildingId !== 'all') {
    query = query.eq('building_id', buildingId)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  // Map joined building data into helper properties
  const roomsWithBuildings = (data || []).map((r: any) => ({
    ...r,
    building_name: r.buildings?.name || 'Unassigned',
  }))

  return { data: roomsWithBuildings, error: null }
}

export async function createRoom(data: any) {
  const supabase = createClient()
  
  // Available beds auto-calculation
  const payload = {
    ...data,
    status: data.status || 'available',
  }
  
  return supabase.from('rooms').insert([payload])
}

export async function updateRoom(id: string, data: any) {
  const supabase = createClient()
  
  // Make sure we calculate status based on bed assignment if requested
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  return supabase
    .from('rooms')
    .update(payload)
    .eq('id', id)
}

export async function deleteRoom(id: string) {
  const supabase = createClient()

  // 1. Check if there are active residents in the room
  const { data: students, error: studentCheckError } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('room_id', id)
    .eq('is_active', true)

  if (studentCheckError) return { error: studentCheckError }
  if (students && students.length > 0) {
    const list = students.map(s => s.full_name).join(', ')
    return { error: new Error(`Cannot delete room. Active residents currently assigned: ${list}`) }
  }

  // 2. Check if there are bookings or pending applications
  const { data: roomData } = await supabase
    .from('rooms')
    .select('room_number')
    .eq('id', id)
    .single()

  if (roomData?.room_number) {
    const { data: preRegs, error: preRegCheckError } = await supabase
      .from('pre_registrations')
      .select('id, full_name')
      .eq('room_preference', `Room ${roomData.room_number}`)
      .in('status', ['new', 'otp_verified', 'deposit_paid', 'under_review'])

    if (preRegCheckError) return { error: preRegCheckError }
    if (preRegs && preRegs.length > 0) {
      const list = preRegs.map(p => p.full_name).join(', ')
      return { error: new Error(`Cannot delete room. Pending booking applications are referencing it: ${list}`) }
    }
  }

  const { error } = await supabase.from('rooms').delete().eq('id', id)
  return { error }
}
