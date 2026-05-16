'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, X, RefreshCw, Loader2, Phone, GraduationCap, Calendar, MessageCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Booking {
  id: string
  name: string
  phone: string
  email?: string
  college?: string
  room_number?: string
  check_in_date?: string
  check_out_date?: string
  status: 'new' | 'interested' | 'contacted' | 'confirmed' | 'checked_in' | 'cancelled'
  amount_total?: number
  amount_paid?: number
  notes?: string
  source?: string
  created_at: string
  updated_at: string
}

const STATUS_ORDER = ['new', 'interested', 'contacted', 'confirmed', 'checked_in', 'cancelled'] as const
const STATUS_CONFIG: Record<string, { label: string; color: string; countColor: string }> = {
  new:        { label: 'New',        color: 'text-blue-400',   countColor: 'text-blue-400' },
  interested: { label: 'Interested', color: 'text-yellow-400', countColor: 'text-yellow-400' },
  contacted:  { label: 'Contacted',  color: 'text-purple-400', countColor: 'text-purple-400' },
  confirmed:  { label: 'Confirmed',  color: 'text-green-400',  countColor: 'text-green-400' },
  checked_in: { label: 'Checked In', color: 'text-cyan-400',   countColor: 'text-cyan-400' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',    countColor: 'text-red-400' },
}

export default function BookingsPage() {
  const supabase = createClient()
  const [columns, setColumns] = useState<Record<string, Booking[]>>({})
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [tableMissing, setTableMissing] = useState(false)

  // Initialize empty columns
  const initColumns = (): Record<string, Booking[]> => {
    const cols: Record<string, Booking[]> = {}
    STATUS_ORDER.forEach(s => { cols[s] = [] })
    return cols
  }

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Bookings] Supabase error:', error.message)
        if (error.message.includes('Could not find the table')) {
          setTableMissing(true)
        } else {
          toast.error('Failed to load bookings: ' + error.message)
        }
        setColumns(initColumns())
        return
      }

      console.log('[Bookings] Fetched:', data?.length, 'rows')
      const grouped = initColumns()
      data?.forEach((booking: Booking) => {
        if (grouped[booking.status]) {
          grouped[booking.status].push(booking)
        }
      })
      setColumns(grouped)
    } catch (error: any) {
      console.error('[Bookings] Fetch error:', error)
      toast.error('Failed to connect to database')
      setColumns(initColumns())
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchBookings])

  // Drag and drop handler
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcStatus = source.droppableId
    const dstStatus = destination.droppableId

    // Optimistic update
    setColumns(prev => {
      const next = { ...prev }
      next[srcStatus] = [...prev[srcStatus]]
      next[dstStatus] = srcStatus === dstStatus ? next[srcStatus] : [...prev[dstStatus]]

      const [moved] = next[srcStatus].splice(source.index, 1)
      moved.status = dstStatus as Booking['status']
      next[dstStatus].splice(destination.index, 0, moved)
      return next
    })

    // Persist to Supabase
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: dstStatus, updated_at: new Date().toISOString() })
        .eq('id', draggableId)

      if (error) throw error
      toast.success(`Moved to ${STATUS_CONFIG[dstStatus]?.label}`)
    } catch {
      toast.error('Failed to update status')
      fetchBookings()
    }
  }

  // Delete booking
  const handleDelete = async (bookingId: string, status: string, name: string) => {
    if (!window.confirm(`Delete ${name}'s booking?`)) return
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
      if (error) throw error
      setColumns(prev => ({
        ...prev,
        [status]: prev[status].filter(b => b.id !== bookingId),
      }))
      toast.success(`${name}'s booking deleted`)
    } catch {
      toast.error('Failed to delete booking')
    }
  }

  // WhatsApp
  const openWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
    const msg = encodeURIComponent(`Hi ${name}, this is from MLV PG Services. Following up on your booking enquiry.`)
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank')
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bookings Pipeline</h1>
            <p className="text-gray-400">Drag cards to update booking status</p>
          </div>
          <button
            onClick={fetchBookings}
            className="p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Setup Banner */}
        {tableMissing && (
          <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-5">
            <h3 className="text-amber-400 font-semibold mb-2">⚠️ Bookings table not found</h3>
            <p className="text-gray-400 text-sm mb-3">
              The <code className="text-amber-400/80 bg-white/5 px-1.5 py-0.5 rounded">bookings</code> table doesn't exist in your Supabase yet.
              Run the SQL from <code className="text-amber-400/80 bg-white/5 px-1.5 py-0.5 rounded">supabase_bookings_fix.sql</code> in your Supabase SQL Editor to create it.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm rounded-lg transition-all"
            >
              Open Supabase Dashboard →
            </a>
          </div>
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-gray-500 text-sm">Loading bookings...</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {STATUS_ORDER.map(status => (
                  <Droppable key={status} droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-shrink-0 w-72 xl:w-80 rounded-2xl transition-all ${
                          snapshot.isDraggingOver
                            ? 'bg-white/10 border border-amber-500/30'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        {/* Column Header */}
                        <div className="p-4 pb-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">
                              {STATUS_CONFIG[status].label}
                            </h3>
                            <span className={`text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center bg-white/5 ${STATUS_CONFIG[status].countColor}`}>
                              {columns[status]?.length || 0}
                            </span>
                          </div>
                          <div className="h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
                        </div>

                        {/* Cards */}
                        <div className="space-y-3 min-h-[400px] p-3 pt-0">
                          {columns[status]?.map((booking, index) => (
                            <Draggable key={booking.id} draggableId={booking.id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`p-4 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-all ${
                                    dragSnapshot.isDragging
                                      ? 'shadow-lg border-amber-500/50 bg-[#0F1629] scale-105 rotate-1'
                                      : 'border-white/10 bg-[#0A0E1A] hover:bg-white/[0.03] hover:border-amber-500/20'
                                  }`}
                                >
                                  {/* Card Header */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-white text-sm truncate">{booking.name}</p>
                                      {booking.source && (
                                        <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                                          via {booking.source}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-0.5 ml-2">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); openWhatsApp(booking.phone, booking.name) }}
                                        className="p-1 hover:bg-green-500/20 rounded transition-colors text-gray-600 hover:text-green-400"
                                        title="WhatsApp"
                                      >
                                        <MessageCircle size={14} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(booking.id, status, booking.name) }}
                                        className="p-1 hover:bg-red-500/20 rounded transition-colors text-gray-600 hover:text-red-400"
                                        title="Delete"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Card Details */}
                                  <div className="space-y-1.5">
                                    {booking.phone && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3 h-3 shrink-0" />
                                        <span className="font-mono">{booking.phone}</span>
                                      </div>
                                    )}
                                    {booking.college && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <GraduationCap className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{booking.college}</span>
                                      </div>
                                    )}
                                    {booking.check_in_date && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        <span>{new Date(booking.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                      </div>
                                    )}
                                    {(booking.amount_total ?? 0) > 0 && (
                                      <div className="flex items-center gap-2 text-xs text-amber-400/80">
                                        <span>₹{(booking.amount_paid ?? 0).toLocaleString('en-IN')}</span>
                                        <span className="text-gray-600">/ ₹{(booking.amount_total ?? 0).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Room badge */}
                                  {booking.room_number && (
                                    <div className="mt-3 pt-2 border-t border-white/5">
                                      <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400/80 border border-amber-500/20">
                                        Room {booking.room_number}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {columns[status]?.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 mt-4 text-center">
                              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-2">
                                <Plus className="w-4 h-4 text-gray-700" />
                              </div>
                              <p className="text-gray-700 text-xs">Drop cards here</p>
                            </div>
                          )}

                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </DragDropContext>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
// Trigger rebuild

