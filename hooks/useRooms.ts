'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchRooms, fetchBuildings } from '@/lib/services/rooms.service'
import type { Room, FilterType } from '@/types/room.types'

export function useRooms(filter: FilterType = 'all', building: string = 'all') {
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const query = await fetchRooms(filter, building)
      const { data, error: err } = await query

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
  }, [filter, building])

  const fetchBuildingsList = useCallback(async () => {
    try {
      const data = await fetchBuildings()
      setBuildings(data)
    } catch (err) {
      setBuildings([])
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    fetchBuildingsList()
  }, [fetchBuildingsList])

  return { rooms, buildings, isLoading, error, refetch }
}
