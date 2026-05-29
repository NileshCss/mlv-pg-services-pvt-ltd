'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CreditCard, DollarSign, Search, Calendar, Eye, Download, User, ArrowUpRight, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'

export default function AdminPaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'monthly' | 'security_deposit' | 'renewal' | 'other'>('all')

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, students(full_name, student_id)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      toast.error('Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const totalCollected = React.useMemo(() => {
    return payments.reduce((acc, pay) => acc + parseFloat(pay.amount || 0), 0)
  }, [payments])

  const filteredPayments = payments.filter(pay => {
    const name = pay.students?.full_name?.toLowerCase() || ''
    const id = pay.students?.student_id?.toLowerCase() || ''
    const txn = pay.transaction_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()

    const matchesSearch = name.includes(term) || id.includes(term) || txn.includes(term)
    const matchesType = typeFilter === 'all' || pay.type === typeFilter

    return matchesSearch && matchesType
  })

  const TYPE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
    monthly: { label: 'Monthly Rent', bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
    security_deposit: { label: 'Security Deposit', bg: 'rgba(39,174,96,0.1)', color: '#27AE60' },
    renewal: { label: 'Stay Renewal', bg: 'rgba(155,89,182,0.1)', color: '#9B59B6' },
    late_fee: { label: 'Late Fee Charge', bg: 'rgba(231,76,60,0.1)', color: '#E74C3C' },
    other: { label: 'Other stay charge', bg: 'rgba(127,140,141,0.1)', color: '#7F8C8D' }
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
              <CreditCard style={{ color: GOLD }} /> Transaction History
            </h1>
            <p className="text-sm text-gray-500 mt-1">Audit log of all student financial collections and deposit clearances</p>
          </div>
          <div className="bg-[#0F1629] px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Gross Collections</p>
              <p className="text-xl font-bold text-white">₹{totalCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10">
              <ArrowUpRight size={18} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            {(['all', 'monthly', 'security_deposit', 'renewal', 'other'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  typeFilter === f
                    ? 'bg-[#C8840A] text-[#F5A623] border-[#F5A623]/30'
                    : 'bg-[#0F1629] text-gray-400 border-white/5 hover:border-amber-500/20'
                }`}
              >
                {f === 'all' ? 'All Transactions' : f === 'monthly' ? 'Rent' : f === 'security_deposit' ? 'Deposits' : f === 'renewal' ? 'Renewals' : 'Others'}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-80 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by student name or Transaction ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table list */}
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
            <CreditCard size={38} className="mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-gray-300">No payment logs found</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Txn Type</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Mode</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Transaction ID</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Date Recorded</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.map((pay) => {
                    const badge = TYPE_BADGES[pay.type] || TYPE_BADGES.other
                    return (
                      <tr key={pay.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-white">{pay.students?.full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{pay.students?.student_id || '—'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-300 uppercase">
                          {pay.payment_mode || '—'}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-white">
                          ₹{pay.amount}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                          {pay.transaction_id || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Calendar size={11} className="text-gray-500" /> {pay.created_at?.split('T')[0]}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                          <div className="flex justify-end gap-1">
                            <a href={pay.receipt_url || '#'} target="_blank" rel="noreferrer"
                              className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                              title="Download Receipt"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
