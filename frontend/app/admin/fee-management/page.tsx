'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Receipt, CreditCard, DollarSign, Clock, CheckCircle, Search, AlertCircle, Plus, Loader2, Calendar, FileText, Send } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'
const GOLD_LIGHT = 'rgba(200,132,10,0.1)'
const GOLD_BORDER = 'rgba(200,132,10,0.2)'

export default function FeeManagementPage() {
  const supabase = createClient()
  const [installments, setInstallments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')

  // Payment Recording Modal
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedInst, setSelectedInst] = useState<any | null>(null)
  
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other'>('upi')
  const [transactionId, setTransactionId] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('installments')
        .select('*, students(id, full_name, student_id, room_id, rooms(room_number, floor))')
        .order('due_date', { ascending: true })

      if (error) throw error
      setInstallments(data || [])
    } catch (err) {
      console.error('Error fetching installments:', err)
      toast.error('Failed to load installments details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInst || !payAmount) return

    setSubmittingPayment(true)
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedInst.students.id,
          installmentId: selectedInst.id,
          amount: payAmount,
          paymentMode,
          transactionId,
          type: 'monthly',
          notes
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to record payment')

      toast.success('Payment recorded and installment resolved!')
      setPayModalOpen(false)
      setSelectedInst(null)
      setTransactionId('')
      setNotes('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Payment recording failed')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleSendReminder = (studentName: string, amount: number, dueDate: string) => {
    toast.success(`Reminder sent to ${studentName} for ₹${amount} due on ${dueDate}`)
  }

  // Calculate Metrics
  const metrics = React.useMemo(() => {
    let collected = 0
    let pending = 0
    let overdue = 0
    
    installments.forEach(inst => {
      if (inst.status === 'paid') collected += parseFloat(inst.amount || 0)
      else if (inst.status === 'pending') pending += parseFloat(inst.amount || 0)
      else if (inst.status === 'overdue') overdue += parseFloat(inst.amount || 0)
    })

    return { collected, pending, overdue }
  }, [installments])

  // Filter list
  const filteredInstallments = installments.filter(inst => {
    const name = inst.students?.full_name?.toLowerCase() || ''
    const id = inst.students?.student_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()
    
    const matchesSearch = name.includes(term) || id.includes(term)
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const STATUS_CONFIG = {
    paid: { label: 'Paid', color: '#27AE60', bg: 'rgba(46,204,113,0.1)', icon: CheckCircle },
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
    overdue: { label: 'Overdue', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle }
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
            <Receipt style={{ color: GOLD }} /> Fee & Billing Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure student installment calendars and record payment resolutions</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Fees Collected', value: metrics.collected, icon: CheckCircle, color: '#27AE60', bg: 'rgba(46,204,113,0.06)' },
            { label: 'Pending Fees', value: metrics.pending, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
            { label: 'Overdue Collections', value: metrics.overdue, icon: AlertCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.06)' }
          ].map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="p-5 rounded-2xl border border-white/5 flex items-center justify-between"
                style={{ background: '#0F1629' }}
              >
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold mt-1.5 text-white">₹{card.value.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                  <Icon size={20} style={{ color: card.color }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            {(['all', 'pending', 'paid', 'overdue'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  statusFilter === f
                    ? 'bg-[#C8840A] text-[#F5A623] border-[#F5A623]/30'
                    : 'bg-[#0F1629] text-gray-400 border-white/5 hover:border-amber-500/20'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-80 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by student name or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Main Installments Table */}
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        ) : filteredInstallments.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
            <Receipt size={38} className="mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-gray-300">No installments found</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Room Allocation</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Installment</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Due Date</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInstallments.map((inst) => {
                    const cfg = STATUS_CONFIG[inst.status as 'paid'|'pending'|'overdue'] || STATUS_CONFIG.pending
                    const StatusIcon = cfg.icon

                    return (
                      <tr key={inst.id} className="hover:bg-white/2 transition-all">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-white">{inst.students?.full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{inst.students?.student_id || '—'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {inst.students?.rooms ? (
                            <span className="text-xs text-gray-300">Room {inst.students.rooms.room_number} (Floor {inst.students.rooms.floor})</span>
                          ) : (
                            <span className="text-xs text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                            Installment #{inst.installment_no}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-white">
                          ₹{inst.amount}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1"><Calendar size={11} className="text-gray-500" /> {inst.due_date}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            <StatusIcon size={11} /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {inst.status !== 'paid' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSendReminder(inst.students?.full_name, inst.amount, inst.due_date)}
                                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                title="Send reminder notification"
                              >
                                <Send size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInst(inst);
                                  setPayAmount(inst.amount.toString());
                                  setPayModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-black transition-colors"
                                style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                              >
                                Record Payment
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">Paid on {inst.paid_at?.split('T')[0] || '—'}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Payment Dialog */}
        <AnimatePresence>
          {payModalOpen && selectedInst && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submittingPayment && setPayModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm flex items-center justify-center p-4"
              />
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md p-6 z-50 overflow-hidden shadow-2xl relative text-gray-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Record Stay Payment</h3>
                  <button onClick={() => !submittingPayment && setPayModalOpen(false)} className="text-gray-400 hover:text-white" disabled={submittingPayment}>✕</button>
                </div>

                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Student</label>
                    <input type="text" readOnly value={`${selectedInst.students?.full_name} (${selectedInst.students?.student_id || '—'})`} className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Installment</label>
                      <input type="text" readOnly value={`Installment #${selectedInst.installment_no}`} className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Amount Paid (₹)</label>
                      <input
                        type="number"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Payment Mode</label>
                      <select
                        value={paymentMode}
                        onChange={(e: any) => setPaymentMode(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      >
                        <option value="upi">UPI / GPay / PhonePe</option>
                        <option value="bank_transfer">Net Banking / IMPS</option>
                        <option value="cash">Cash Payment</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Transaction Ref ID</label>
                      <input
                        type="text"
                        placeholder="UPI Ref / Txn ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Administrative Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Any notes about this payment resolution…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPayModalOpen(false)}
                      disabled={submittingPayment}
                      className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="flex-1 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(245,166,35,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                    >
                      {submittingPayment ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving Payment…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Approve Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  )
}
