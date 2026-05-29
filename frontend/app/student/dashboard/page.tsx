'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Home, CreditCard, AlertCircle, RefreshCcw, Calendar, TrendingUp } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'

const GOLD = '#C9A84C'

interface SummaryData {
  roomNumber: string
  bedNumber: string
  pendingFee: number
  totalPaid: number
  nextDueDate: string | null
  activeComplaints: number
  renewalStatus: string | null
  daysUntilExpiry: number | null
  agreementEndDate: string | null
  studentName: string
  studentId: string
  joiningDate: string | null
}

function StatCard({
  title, value, sub, icon: Icon, color = GOLD, isAlert = false,
}: {
  title: string; value: string; sub?: string; icon: React.ElementType; color?: string; isAlert?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5"
      style={{ border: `1px solid ${isAlert ? '#FEE2E2' : '#EBEBF0'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isAlert ? 'rgba(239,68,68,0.1)' : `rgba(201,168,76,0.12)` }}
        >
          <Icon size={20} style={{ color: isAlert ? '#EF4444' : color }} />
        </div>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: '#1A1A2E', fontFamily: 'var(--font-playfair), serif' }}>
        {value}
      </p>
      <p className="text-xs font-semibold mb-1" style={{ color: '#8A8AA0' }}>{title}</p>
      {sub && <p className="text-xs" style={{ color: isAlert ? '#EF4444' : '#8A8AA0' }}>{sub}</p>}
    </motion.div>
  )
}

export default function StudentDashboardPage() {
  const supabase = createClient()
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: student } = await supabase
          .from('students')
          .select('*, rooms(room_number), beds(bed_number)')
          .eq('user_id', session.user.id)
          .single()

        if (!student) return

        // Fetch fee + installment summary
        const { data: fee } = await supabase
          .from('fees')
          .select('monthly_amount, security_deposit, security_deposit_paid')
          .eq('student_id', student.id)
          .single()

        const { data: installments } = await supabase
          .from('installments')
          .select('amount, status, due_date')
          .eq('student_id', student.id)
          .order('due_date', { ascending: true })

        const totalPaid = (installments || []).filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
        const pending = (installments || []).filter(i => i.status !== 'paid')
        const pendingFee = pending.reduce((s, i) => s + i.amount, 0)
        const nextDue = pending[0]?.due_date || null

        // Active complaints
        const { count: complaintsCount } = await supabase
          .from('student_complaints')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)
          .in('status', ['open', 'in_progress'])

        // Renewal status
        const { data: renewal } = await supabase
          .from('renewals')
          .select('status')
          .eq('student_id', student.id)
          .order('requested_at', { ascending: false })
          .limit(1)
          .single()

        // Days until expiry
        let daysUntilExpiry: number | null = null
        if (student.agreement_end_date) {
          const diff = new Date(student.agreement_end_date).getTime() - Date.now()
          daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24))
        }

        setData({
          roomNumber: (student as any).rooms?.room_number || '—',
          bedNumber: (student as any).beds?.bed_number || '—',
          pendingFee,
          totalPaid,
          nextDueDate: nextDue,
          activeComplaints: complaintsCount || 0,
          renewalStatus: renewal?.status || null,
          daysUntilExpiry,
          agreementEndDate: student.agreement_end_date,
          studentName: student.full_name,
          studentId: student.student_id || '',
          joiningDate: student.joining_date,
        })
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  if (loading) {
    return (
      <StudentDashboardLayout title="Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-32 animate-pulse" style={{ border: '1px solid #EBEBF0' }}>
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout title="Overview">
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(232,201,107,0.08) 100%)',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: GOLD, color: '#1A1A2E' }}
            >
              {data?.studentName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                Welcome back, {data?.studentName?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm" style={{ color: '#8A8AA0' }}>
                {data?.studentId} · Joined {fmtDate(data?.joiningDate || null)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard
            title="Current Room" icon={Home}
            value={data ? `Room ${data.roomNumber}` : '—'}
            sub={data ? `Bed ${data.bedNumber}` : undefined}
          />
          <StatCard
            title="Pending Fee" icon={CreditCard}
            value={data ? fmtCurrency(data.pendingFee) : '—'}
            sub={data?.nextDueDate ? `Due: ${fmtDate(data.nextDueDate)}` : 'No pending fees'}
            isAlert={(data?.pendingFee || 0) > 0}
          />
          <StatCard
            title="Total Paid" icon={TrendingUp}
            value={data ? fmtCurrency(data.totalPaid) : '—'}
            sub="Cumulative payments"
          />
          <StatCard
            title="Next Due Date" icon={Calendar}
            value={fmtDate(data?.nextDueDate || null)}
            sub={data?.daysUntilExpiry !== null ? `${data!.daysUntilExpiry} days to expiry` : undefined}
          />
          <StatCard
            title="Active Complaints" icon={AlertCircle}
            value={String(data?.activeComplaints ?? 0)}
            sub={data?.activeComplaints ? 'Issues being tracked' : 'No open complaints'}
            isAlert={(data?.activeComplaints || 0) > 0}
          />
          <StatCard
            title="Renewal Status" icon={RefreshCcw}
            value={data?.renewalStatus ? data.renewalStatus.charAt(0).toUpperCase() + data.renewalStatus.slice(1) : 'Not requested'}
            sub={data?.agreementEndDate ? `Expires: ${fmtDate(data.agreementEndDate)}` : undefined}
          />
        </div>

        {/* Expiry Warning */}
        {data?.daysUntilExpiry !== null && data!.daysUntilExpiry <= 30 && data!.daysUntilExpiry > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                Agreement expiring in {data!.daysUntilExpiry} days
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#B45309' }}>
                Please visit the Renewal Requests section to request a renewal before it expires.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </StudentDashboardLayout>
  )
}
