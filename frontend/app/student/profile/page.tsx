'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { User, Phone, Mail, GraduationCap, Home, Calendar, Shield } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import type { Student } from '@/types/student'
import { DashboardInstallBanner } from '@/components/pwa/DashboardInstallBanner'

const GOLD = '#C9A84C'

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #F0EEE8' }}>
      {Icon && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(201,168,76,0.1)' }}>
          <Icon size={14} style={{ color: GOLD }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#8A8AA0' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: value === '—' ? '#C4C4D0' : '#1A1A2E' }}>{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <h3 className="text-base font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>{title}</h3>
      <div>{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const supabase = createClient()
  const [student, setStudent] = useState<Student & { room_number?: string; bed_number?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('students')
        .select('*, rooms(room_number), beds(bed_number)')
        .eq('user_id', session.user.id)
        .single()
      if (data) setStudent({ ...data, room_number: (data as any).rooms?.room_number, bed_number: (data as any).beds?.bed_number })
      setLoading(false)
    }
    load()
  }, [supabase])

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

  if (loading) {
    return (
      <StudentDashboardLayout title="My Profile">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse" style={{ border: '1px solid #EBEBF0' }} />
          ))}
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout title="My Profile">
      <div className="space-y-5">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 flex items-center gap-5"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: GOLD, color: '#1A1A2E' }}
          >
            {student?.full_name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              {student?.full_name || '—'}
            </h2>
            <p className="text-sm" style={{ color: '#8A8AA0' }}>{student?.student_id || '—'}</p>
            <span
              className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.12)', color: GOLD, border: '1px solid rgba(201,168,76,0.25)' }}
            >
              {student?.is_active ? 'Active Resident' : 'Inactive'}
            </span>
          </div>
        </motion.div>

        {/* PWA Install Banner */}
        <DashboardInstallBanner />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Section title="Personal Information">
              <InfoRow label="Full Name" value={student?.full_name || '—'} icon={User} />
              <InfoRow label="Mobile" value={student?.mobile || '—'} icon={Phone} />
              <InfoRow label="Email" value={student?.email || '—'} icon={Mail} />
              <InfoRow label="Gender" value={student?.gender || '—'} />
              <InfoRow label="Nationality" value={student?.nationality || '—'} />
            </Section>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Section title="Academic Information">
              <InfoRow label="College" value={student?.college_name || '—'} icon={GraduationCap} />
              <InfoRow label="Course" value={student?.course || '—'} />
              <InfoRow label="Year of Study" value={student?.year_of_study || '—'} />
            </Section>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Section title="Guardian Information">
              <InfoRow label="Parent / Guardian Name" value={student?.parent_name || '—'} icon={User} />
              <InfoRow label="Parent Contact" value={student?.parent_contact || '—'} icon={Phone} />
              <InfoRow label="Emergency Contact" value={student?.emergency_contact || '—'} icon={Phone} />
              <InfoRow label="Permanent Address" value={student?.permanent_address || '—'} />
            </Section>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Section title="Stay Information">
              <InfoRow label="Room Number" value={(student as any)?.room_number ? `Room ${(student as any).room_number}` : '—'} icon={Home} />
              <InfoRow label="Bed Number" value={(student as any)?.bed_number ? `Bed ${(student as any).bed_number}` : '—'} />
              <InfoRow label="Joining Date" value={fmtDate(student?.joining_date || null)} icon={Calendar} />
              <InfoRow label="Agreement End Date" value={fmtDate(student?.agreement_end_date || null)} icon={Calendar} />
              <InfoRow label="Student ID" value={student?.student_id || '—'} icon={Shield} />
            </Section>
          </motion.div>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}
