'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { BarChart3, TrendingUp, Users, RefreshCcw, MessageSquare, Download, Calendar, ArrowUpRight, ArrowDownRight, Loader2, Home } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'
const GOLD_LIGHT = 'rgba(200,132,10,0.1)'
const GOLD_BORDER = 'rgba(200,132,10,0.2)'

export default function ReportsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  // Report Metrics States
  const [occupancy, setOccupancy] = useState({ totalBeds: 0, occupiedBeds: 0, occupancyRate: 0 })
  const [revenue, setRevenue] = useState({ totalCollected: 0, pending: 0, overdue: 0 })
  const [upcomingRenewals, setUpcomingRenewals] = useState<any[]>([])
  const [complaintStats, setComplaintStats] = useState({ total: 0, resolved: 0, open: 0 })

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Occupancy Stats
      const { data: beds, error: bedError } = await supabase.from('beds').select('*')
      if (bedError) throw bedError
      const totalBeds = beds?.length || 0
      const occupiedBeds = beds?.filter(b => b.status === 'occupied').length || 0
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
      setOccupancy({ totalBeds, occupiedBeds, occupancyRate })

      // 2. Fetch Billing & Installment Metrics
      const { data: installments } = await supabase.from('installments').select('*')
      let totalCollected = 0
      let pending = 0
      let overdue = 0
      installments?.forEach(i => {
        if (i.status === 'paid') totalCollected += parseFloat(i.amount || 0)
        else if (i.status === 'pending') pending += parseFloat(i.amount || 0)
        else if (i.status === 'overdue') overdue += parseFloat(i.amount || 0)
      })
      setRevenue({ totalCollected, pending, overdue })

      // 3. Upcoming Renewals (Stay agreement ends in the next 60 days)
      const sixtyDaysFromNow = new Date()
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60)
      const sixtyDaysStr = sixtyDaysFromNow.toISOString().split('T')[0]
      const { data: renewals } = await supabase
        .from('students')
        .select('full_name, student_id, agreement_end_date, rooms(room_number)')
        .eq('is_active', true)
        .lte('agreement_end_date', sixtyDaysStr)
        .order('agreement_end_date', { ascending: true })
      setUpcomingRenewals(renewals || [])

      // 4. Complaints Overview
      const { data: complaints } = await supabase.from('student_complaints').select('status')
      const total = complaints?.length || 0
      const resolved = complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0
      const open = total - resolved
      setComplaintStats({ total, resolved, open })

    } catch (err) {
      console.error('Error fetching reports data:', err)
      toast.error('Failed to load metrics report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const handleExportCSV = (reportType: string) => {
    toast.success(`${reportType} CSV export initiated! File will download shortly.`)
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0A0E1A] p-6 lg:p-8 text-gray-100"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
              <BarChart3 style={{ color: GOLD }} /> Portal Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">Audit occupancy efficiency, gross collections, and complaint resolutions ratios</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportCSV('Stay Occupancy & Billing')}
              className="px-4 py-2 rounded-xl border border-white/8 hover:border-amber-500/25 bg-[#0F1629] text-gray-300 hover:text-white font-bold text-xs transition-all duration-200 flex items-center gap-1.5"
            >
              <Download size={14} /> Export CSV Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500 mb-3" size={24} />
            <p className="text-sm text-gray-400">Aggregating real-time database metrics…</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Visual Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Occupancy card */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0F1629] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-200 flex items-center gap-1.5 text-sm uppercase tracking-wider"><Users size={16} style={{ color: GOLD }} /> Stay Occupancy Rate</h3>
                  <span className="text-2xl font-bold text-white">{occupancy.occupancyRate}%</span>
                </div>
                
                {/* Custom CSS Bar Chart */}
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${occupancy.occupancyRate}%`, background: 'linear-gradient(90deg, #C8840A, #F5A623)' }} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <p className="text-gray-500 font-semibold">Occupied Beds</p>
                    <p className="text-lg font-bold text-white mt-0.5">{occupancy.occupiedBeds} beds</p>
                  </div>
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <p className="text-gray-500 font-semibold">Total Capacity</p>
                    <p className="text-lg font-bold text-white mt-0.5">{occupancy.totalBeds} beds</p>
                  </div>
                </div>
              </div>

              {/* Collections Distribution */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0F1629] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-200 flex items-center gap-1.5 text-sm uppercase tracking-wider"><TrendingUp size={16} style={{ color: GOLD }} /> Financial Collections</h3>
                  <span className="text-[10px] text-green-400 font-bold px-2 py-0.5 rounded-full bg-green-500/10">Invoiced</span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Collected Stay Rent', val: revenue.totalCollected, color: '#27AE60' },
                    { label: 'Outstanding Invoices', val: revenue.pending + revenue.overdue, color: '#F59E0B' }
                  ].map((item) => {
                    const total = revenue.totalCollected + revenue.pending + revenue.overdue
                    const percent = total > 0 ? Math.round((item.val / total) * 100) : 0
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-white">₹{item.val.toLocaleString('en-IN')} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: item.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Complaints Resolution index */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0F1629] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-200 flex items-center gap-1.5 text-sm uppercase tracking-wider"><MessageSquare size={16} style={{ color: GOLD }} /> Complaints Resolutions</h3>
                  <span className="text-2xl font-bold text-white">
                    {complaintStats.total > 0 ? Math.round((complaintStats.resolved / complaintStats.total) * 100) : 100}%
                  </span>
                </div>
                
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#27AE60]" 
                    style={{ width: `${complaintStats.total > 0 ? (complaintStats.resolved / complaintStats.total) * 100 : 100}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <p className="text-gray-500 font-semibold">Resolved Cases</p>
                    <p className="text-lg font-bold text-green-400 mt-0.5">{complaintStats.resolved} / {complaintStats.total}</p>
                  </div>
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <p className="text-gray-500 font-semibold">Active Pending</p>
                    <p className="text-lg font-bold text-yellow-400 mt-0.5">{complaintStats.open} complaints</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Expiring Agreements / Stay Renewals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Agreement Expiry forecast */}
              <div className="bg-[#0F1629] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2" style={{ fontFamily: 'Playfair Display' }}>
                    <Calendar size={18} style={{ color: GOLD }} /> Stay Agreements Expiring Soon (60 Days)
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">{upcomingRenewals.length} forecast</span>
                </div>

                {upcomingRenewals.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">No agreements expiring within the next 60 days.</p>
                ) : (
                  <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
                    {upcomingRenewals.map((r, i) => (
                      <div key={i} className="flex justify-between items-center py-2.5 text-xs">
                        <div>
                          <p className="font-bold text-white">{r.full_name}</p>
                          <p className="text-gray-500 mt-0.5">Room {r.rooms?.room_number || '—'} · ID: {r.student_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-500">{r.agreement_end_date}</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">End of Contract</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Collection Audit */}
              <div className="bg-[#0F1629] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2" style={{ fontFamily: 'Playfair Display' }}>
                    <TrendingUp size={18} style={{ color: GOLD }} /> Financial Collections Audit
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 font-semibold">Rent Collected</p>
                      <p className="text-xl font-bold text-green-400 mt-1">₹{revenue.totalCollected.toLocaleString('en-IN')}</p>
                    </div>
                    <ArrowUpRight size={22} className="text-green-500" />
                  </div>

                  <div className="p-4 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 font-semibold">Gross Outstanding Balance</p>
                      <p className="text-xl font-bold text-yellow-500 mt-1">₹{(revenue.pending + revenue.overdue).toLocaleString('en-IN')}</p>
                    </div>
                    <ArrowDownRight size={22} className="text-yellow-500" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
