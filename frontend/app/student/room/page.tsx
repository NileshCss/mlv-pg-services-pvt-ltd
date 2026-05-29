'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Home, Users, Calendar, Wifi, Zap, Wind, BookOpen, Layers } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'

const GOLD = '#C9A84C'

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi, Electricity: Zap, AC: Wind, Fan: Wind, 'Study Table': BookOpen,
}

export default function RoomPage() {
  const supabase = createClient()
  const [roomData, setRoomData] = useState<any>(null)
  const [roommates, setRoomates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: student } = await supabase
        .from('students')
        .select('room_id, bed_id, joining_date, agreement_end_date, rooms(*), beds(*)')
        .eq('user_id', session.user.id)
        .single()

      if (student?.room_id) {
        setRoomData({ room: (student as any).rooms, bed: (student as any).beds, joining_date: student.joining_date, end_date: student.agreement_end_date })
        // Get roommates
        const { data: mates } = await supabase
          .from('students')
          .select('full_name, student_id, bed_id, beds(bed_number)')
          .eq('room_id', student.room_id)
          .eq('is_active', true)
          .neq('user_id', session.user.id)
        setRoomates(mates || [])
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

  const TYPE_LABEL: Record<string, string> = { single: 'Single Sharing', double: 'Double Sharing', triple: 'Triple Sharing' }

  if (loading) {
    return (
      <StudentDashboardLayout title="Room Information">
        <div className="bg-white rounded-2xl p-6 h-64 animate-pulse" style={{ border: '1px solid #EBEBF0' }} />
      </StudentDashboardLayout>
    )
  }

  if (!roomData?.room) {
    return (
      <StudentDashboardLayout title="Room Information">
        <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #EBEBF0' }}>
          <Home size={40} className="mx-auto mb-3" style={{ color: '#C4C4D0' }} />
          <p className="font-semibold" style={{ color: '#1A1A2E' }}>No room assigned yet</p>
          <p className="text-sm mt-1" style={{ color: '#8A8AA0' }}>Your room details will appear here once assigned by the admin.</p>
        </div>
      </StudentDashboardLayout>
    )
  }

  const { room, bed, joining_date, end_date } = roomData

  return (
    <StudentDashboardLayout title="Room Information">
      <div className="space-y-5">
        {/* Room Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              <Home size={28} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                    Room {room.room_number}
                  </h2>
                  <p className="text-sm" style={{ color: '#8A8AA0' }}>Floor {room.floor} · {TYPE_LABEL[room.type] || room.type}</p>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(46,204,113,0.1)', color: '#27AE60', border: '1px solid rgba(46,204,113,0.2)' }}
                >
                  {room.status === 'occupied' ? 'Occupied' : room.status}
                </span>
              </div>
              <p className="text-sm mt-2 font-semibold" style={{ color: GOLD }}>
                Your Bed: Bed {bed?.bed_number || '—'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EBEBF0' }}>
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              Stay Details
            </h3>
            {[
              { label: 'Check-in Date', value: fmtDate(joining_date), icon: Calendar },
              { label: 'Agreement End', value: fmtDate(end_date), icon: Calendar },
              { label: 'Room Capacity', value: `${room.capacity} students`, icon: Users },
              { label: 'Floor', value: `Floor ${room.floor}`, icon: Layers },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F0EEE8' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <Icon size={14} style={{ color: GOLD }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8A8AA0' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Amenities + Roommates */}
          <div className="space-y-5">
            {room.amenities?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EBEBF0' }}>
                <h3 className="text-base font-bold mb-3" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                  Room Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((a: string) => (
                    <span key={a}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                      style={{ background: 'rgba(201,168,76,0.1)', color: '#1A1A2E', border: '1px solid rgba(201,168,76,0.2)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EBEBF0' }}>
              <h3 className="text-base font-bold mb-3" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                Roommates
              </h3>
              {roommates.length === 0 ? (
                <p className="text-sm" style={{ color: '#8A8AA0' }}>You have no roommates in this room.</p>
              ) : (
                <div className="space-y-2">
                  {roommates.map((rm) => (
                    <div key={rm.student_id} className="flex items-center gap-3 py-2 rounded-xl px-3"
                      style={{ background: '#F8F6F1' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: GOLD, color: '#1A1A2E' }}>
                        {rm.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>{rm.full_name}</p>
                        <p className="text-xs" style={{ color: '#8A8AA0' }}>Bed {(rm as any).beds?.bed_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}
