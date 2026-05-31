'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchRooms, fetchBuildings } from '@/lib/services/rooms.service'
import type { Room, Building, FilterType } from '@/types/room.types'

export function useRooms(filter: FilterType = 'all', buildingId: string = 'all') {
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: err } = await fetchRooms(filter, buildingId)

      if (err) {
        setError('Failed to fetch rooms')
        setRooms([])
      } else {
        setRooms(data || [])
      }
    } catch (err) {
      setError('Something went wrong')
      setRooms([])
    } finally {
      setIsLoading(false)
    }
  }, [filter, buildingId])

  const fetchBuildingsList = useCallback(async () => {
    try {
      const data = await fetchBuildings()
      setBuildings(data as Building[])
    } catch (err) {
      console.error('Failed to fetch buildings:', err)
      setBuildings([])
    }
  }, [])

  // Fetch buildings list on mount
  useEffect(() => {
    fetchBuildingsList()
  }, [fetchBuildingsList])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { 
    rooms, 
    buildings, 
    isLoading, 
    error, 
    refetch, 
    refetchBuildings: fetchBuildingsList 
  }
}
