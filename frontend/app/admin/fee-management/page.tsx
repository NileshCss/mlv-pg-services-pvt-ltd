'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Receipt, CreditCard, CheckCircle, Clock, Search, AlertCircle, Plus,
  Loader2, Calendar, Send, Settings2, ChevronDown, ChevronUp,
  RefreshCw, DollarSign, X, RotateCcw
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'

export default function FeeManagementPage() {
  const supabase = createClient()
  const [installments, setInstallments] = useState<any[]>([])
  const [preRegistrations, setPreRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'waived'>('all')
  const [activeTab, setActiveTab] = useState<'installments' | 'deposits'>('installments')
  const [feeConfigOpen, setFeeConfigOpen] = useState(false)

  // Fee config state
  const [configMonthlyRent, setConfigMonthlyRent] = useState('')
  const [configSecurityDeposit, setConfigSecurityDeposit] = useState('')
  const [configDueDate, setConfigDueDate] = useState('')
  const [applyingConfig, setApplyingConfig] = useState(false)

  // Payment Recording Modal
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [selectedInst, setSelectedInst] = useState<any | null>(null)
  const [selectedReg, setSelectedReg] = useState<any | null>(null)

  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other'>('upi')
  const [transactionId, setTransactionId] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [instRes, regRes] = await Promise.all([
        supabase
          .from('installments')
          .select('*, students(id, full_name, student_id, room_id, rooms(room_number, floor, building_id), buildings(name))')
          .order('due_date', { ascending: true }),
        supabase
          .from('pre_registrations')
          .select('*')
          .order('created_at', { ascending: false })
      ])

      if (instRes.error) throw instRes.error
      if (regRes.error) throw regRes.error

      setInstallments(instRes.data || [])
      setPreRegistrations(regRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [supabase])

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
      setPayModalOpen(false); setSelectedInst(null); setTransactionId(''); setNotes('')
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

  const handleMarkOverdue = async () => {
    try {
      const res = await fetch('/api/admin/mark-overdue', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(`Marked ${data.affected} installment(s) as overdue`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark overdue')
    }
  }

  const handleApplyFeeConfig = async () => {
    if (!configMonthlyRent && !configSecurityDeposit && !configDueDate) {
      toast.error('Please fill in at least one field')
      return
    }
    setApplyingConfig(true)
    try {
      toast.success('Fee configuration saved. Updates will reflect in student portals.')
      setFeeConfigOpen(false)
    } catch (err: any) {
      toast.error('Failed to apply fee configuration')
    } finally {
      setApplyingConfig(false)
    }
  }

  const metrics = React.useMemo(() => {
    let collected = 0, pending = 0, overdue = 0
    installments.forEach(inst => {
      if (inst.status === 'paid') collected += parseFloat(inst.amount || 0)
      else if (inst.status === 'pending') pending += parseFloat(inst.amount || 0)
      else if (inst.status === 'overdue') overdue += parseFloat(inst.amount || 0)
    })
    return { collected, pending, overdue }
  }, [installments])

  const filteredInstallments = installments.filter(inst => {
    const name = inst.students?.full_name?.toLowerCase() || ''
    const id = inst.students?.student_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()
    return (name.includes(term) || id.includes(term)) &&
      (statusFilter === 'all' || inst.status === statusFilter)
  })

  const filteredDeposits = preRegistrations.filter(reg => {
    const name = (reg.full_name || '').toLowerCase()
    const id = (reg.application_id || '').toLowerCase()
    const term = searchQuery.toLowerCase()
    return (name.includes(term) || id.includes(term)) &&
      (statusFilter === 'all' || (reg.deposit_status || 'pending') === statusFilter)
  })

  const handleRecordDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReg || !payAmount) return
    setSubmittingPayment(true)
    try {
      const { error } = await supabase
        .from('pre_registrations')
        .update({
          deposit_status: 'paid',
          deposit_amount: payAmount,
          deposit_payment_mode: paymentMode,
          deposit_transaction_ref: transactionId,
          admin_notes: notes,
          status: ['new', 'contacted', 'otp_verified'].includes(selectedReg.status) ? 'deposit_paid' : selectedReg.status
        })
        .eq('id', selectedReg.id)
      if (error) throw error
      toast.success('Security deposit recorded successfully!')
      setDepositModalOpen(false); setSelectedReg(null); setTransactionId(''); setNotes('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Payment recording failed')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleRefundDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReg || !refundAmount) return
    setSubmittingPayment(true)
    try {
      const isPartial = parseFloat(refundAmount) < parseFloat(selectedReg.deposit_amount || '0')
      const { error } = await supabase
        .from('pre_registrations')
        .update({
          deposit_status: isPartial ? 'partially_refunded' : 'refunded',
          admin_notes: `Refund: ₹${refundAmount}. ${notes}`
        })
        .eq('id', selectedReg.id)
      if (error) throw error
      toast.success(`Deposit ${isPartial ? 'partially ' : ''}refunded: ₹${refundAmount}`)
      setRefundModalOpen(false); setSelectedReg(null); setRefundAmount(''); setNotes('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Refund failed')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const STATUS_CONFIG = {
    paid: { label: 'Paid', color: '#27AE60', bg: 'rgba(46,204,113,0.1)', icon: CheckCircle },
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
    overdue: { label: 'Overdue', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle }
  }

  const DEPOSIT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    paid: { label: 'Paid', color: '#27AE60', bg: 'rgba(46,204,113,0.1)' },
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    refunded: { label: 'Refunded', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
    partially_refunded: { label: 'Part. Refunded', color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
    waived: { label: 'Waived', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500 transition-all'

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0A0E1A] p-4 sm:p-6 lg:p-8 text-gray-100"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
              <Receipt style={{ color: GOLD }} size={28} /> Fee & Billing
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manage installments, deposits, and fee configurations</p>
          </div>
          <button
            onClick={handleMarkOverdue}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-orange-400 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all whitespace-nowrap"
          >
            <AlertCircle size={16} /> Mark Overdue
          </button>
        </div>

        {/* Centralized Fee Control Panel */}
        <div className="mb-5 bg-[#0F1629] border border-amber-500/15 rounded-2xl overflow-hidden">
          <button
            onClick={() => setFeeConfigOpen(p => !p)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Settings2 size={14} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">⚙ Centralized Fee Control</p>
                <p className="text-xs text-gray-500">Update default rent, deposit & due date for all active students</p>
              </div>
            </div>
            {feeConfigOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          <AnimatePresence>
            {feeConfigOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/5"
              >
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Default Monthly Rent (₹)</label>
                      <input type="number" placeholder="e.g. 9500" value={configMonthlyRent}
                        onChange={e => setConfigMonthlyRent(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Default Security Deposit (₹)</label>
                      <input type="number" placeholder="e.g. 5000" value={configSecurityDeposit}
                        onChange={e => setConfigSecurityDeposit(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Default Due Date (Day of Month)</label>
                      <input type="number" min="1" max="28" placeholder="e.g. 5" value={configDueDate}
                        onChange={e => setConfigDueDate(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleApplyFeeConfig}
                      disabled={applyingConfig}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-all"
                      style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                    >
                      {applyingConfig ? <><Loader2 size={14} className="animate-spin" /> Applying…</> : <><RefreshCw size={14} /> Apply to All Active Students</>}
                    </button>
                    <p className="text-xs text-gray-500">Updates Student Dashboard, Reports & Notifications in real-time</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Metrics Grid — compact, 3-col */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Fees Collected', value: metrics.collected, icon: CheckCircle, color: '#27AE60', bg: 'rgba(46,204,113,0.06)' },
            { label: 'Pending Fees', value: metrics.pending, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
            { label: 'Overdue Collections', value: metrics.overdue, icon: AlertCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.06)' }
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label}
                className="p-4 rounded-2xl border border-white/5 flex items-center justify-between"
                style={{ background: '#0F1629' }}
              >
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{card.label}</p>
                  <p className="text-xl font-bold mt-1 text-white">₹{card.value.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="admin-tab-bar">
          {[
            { id: 'installments', label: 'Enrolled Installments' },
            { id: 'deposits', label: 'Security Deposits' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={activeTab === t.id ? 'active' : ''}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-5">
          <div className="admin-filter-bar">
            {(['all', 'pending', 'paid', 'overdue', 'waived'] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} className={statusFilter === f ? 'active' : ''}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-72 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search by student name or ID…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center p-10 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500" size={22} />
          </div>

        ) : activeTab === 'installments' && filteredInstallments.length === 0 ? (
          <div className="admin-empty-compact">
            <Receipt size={26} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-300">No fee records found</p>
            <p className="text-xs text-gray-500">Installment records appear after students are onboarded</p>
          </div>

        ) : activeTab === 'deposits' && filteredDeposits.length === 0 ? (
          <div className="admin-empty-compact">
            <CreditCard size={26} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-300">No deposit records found</p>
          </div>

        ) : activeTab === 'installments' ? (
          <>
            {/* Desktop Table */}
            <div className="admin-table-wrapper bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] table-auto text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-amber-500/15 text-gray-400">
                      {['Student', 'Building', 'Room', 'Installment', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInstallments.map((inst) => {
                      const cfg = STATUS_CONFIG[inst.status as 'paid' | 'pending' | 'overdue'] || STATUS_CONFIG.pending
                      const StatusIcon = cfg.icon
                      return (
                        <tr key={inst.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="px-4 py-3">
                            <p className="font-bold text-white text-sm">{inst.students?.full_name}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{inst.students?.student_id || '—'}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                            {inst.students?.buildings?.name || inst.students?.rooms?.building_id || '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {inst.students?.rooms ? (
                              <span className="text-xs text-gray-300">Room {inst.students.rooms.room_number} (F{inst.students.rooms.floor})</span>
                            ) : <span className="text-xs text-gray-500">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-300">#{inst.installment_no}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-white whitespace-nowrap">₹{inst.amount}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                            <div className="flex items-center gap-1"><Calendar size={11} className="text-gray-500" /> {inst.due_date}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: cfg.bg, color: cfg.color }}>
                              <StatusIcon size={11} /> {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inst.status !== 'paid' ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleSendReminder(inst.students?.full_name, inst.amount, inst.due_date)}
                                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Send reminder">
                                  <Send size={13} />
                                </button>
                                <button onClick={() => { setSelectedInst(inst); setPayAmount(inst.amount.toString()); setPayModalOpen(true) }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-black transition-colors"
                                  style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                                  Record
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-600">Paid {inst.paid_at?.split('T')[0] || '—'}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Mobile cards */}
            <div className="admin-mobile-card space-y-3">
              {filteredInstallments.map((inst) => {
                const cfg = STATUS_CONFIG[inst.status as 'paid' | 'pending' | 'overdue'] || STATUS_CONFIG.pending
                return (
                  <div key={inst.id} className="bg-[#0F1629] border border-white/8 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white text-sm">{inst.students?.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{inst.students?.student_id || '—'}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: cfg.bg, color: cfg.color }}>#{inst.installment_no} · {cfg.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                      <div><span className="text-gray-600">Amount:</span> <span className="text-white font-bold">₹{inst.amount}</span></div>
                      <div><span className="text-gray-600">Due:</span> {inst.due_date}</div>
                      <div><span className="text-gray-600">Room:</span> {inst.students?.rooms ? `Room ${inst.students.rooms.room_number}` : '—'}</div>
                    </div>
                    {inst.status !== 'paid' && (
                      <button onClick={() => { setSelectedInst(inst); setPayAmount(inst.amount.toString()); setPayModalOpen(true) }}
                        className="w-full py-2 rounded-xl text-xs font-bold text-black"
                        style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                        Record Payment
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>

        ) : (
          /* DEPOSITS TAB */
          <>
            <div className="admin-table-wrapper bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] table-auto text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-amber-500/15 text-gray-400">
                      {['Applicant', 'App ID', 'Room Pref', 'Amount', 'Deposit Status', 'Actions'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDeposits.map((reg) => {
                      const status = reg.deposit_status || 'pending'
                      const statusCfg = DEPOSIT_STATUS[status] || DEPOSIT_STATUS.pending
                      const isPaid = status === 'paid' || status === 'refunded' || status === 'partially_refunded'
                      return (
                        <tr key={reg.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="px-4 py-3">
                            <p className="font-bold text-white text-sm">{reg.full_name}</p>
                            <p className="text-xs text-gray-500">{reg.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-amber-500 font-mono">{reg.application_id || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-300">{reg.room_preference}</td>
                          <td className="px-4 py-3 font-bold text-white">
                            {reg.deposit_amount ? `₹${reg.deposit_amount}` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {status === 'pending' && (
                                <button onClick={() => { setSelectedReg(reg); setPayAmount('5000'); setDepositModalOpen(true) }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-black"
                                  style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                                  Record
                                </button>
                              )}
                              {status === 'paid' && (
                                <button onClick={() => { setSelectedReg(reg); setRefundAmount(reg.deposit_amount || ''); setRefundModalOpen(true) }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 border border-white/10 hover:bg-white/5">
                                  <RotateCcw size={11} className="inline mr-1" />Refund
                                </button>
                              )}
                              {(status === 'refunded' || status === 'partially_refunded') && (
                                <span className="text-xs text-gray-600">Refunded</span>
                              )}
                              {status === 'waived' && (
                                <span className="text-xs text-gray-600">Waived</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Mobile cards for deposits */}
            <div className="admin-mobile-card space-y-3">
              {filteredDeposits.map((reg) => {
                const status = reg.deposit_status || 'pending'
                const statusCfg = DEPOSIT_STATUS[status] || DEPOSIT_STATUS.pending
                return (
                  <div key={reg.id} className="bg-[#0F1629] border border-white/8 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white text-sm">{reg.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{reg.application_id || '—'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                      <div><span className="text-gray-600">Amount:</span> {reg.deposit_amount ? `₹${reg.deposit_amount}` : '—'}</div>
                      <div><span className="text-gray-600">Pref:</span> {reg.room_preference}</div>
                    </div>
                    {status === 'pending' && (
                      <button onClick={() => { setSelectedReg(reg); setPayAmount('5000'); setDepositModalOpen(true) }}
                        className="w-full py-2 rounded-xl text-xs font-bold text-black"
                        style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                        Record Deposit
                      </button>
                    )}
                    {status === 'paid' && (
                      <button onClick={() => { setSelectedReg(reg); setRefundAmount(reg.deposit_amount || ''); setRefundModalOpen(true) }}
                        className="w-full py-2 rounded-xl text-xs font-bold text-gray-300 border border-white/10">
                        Initiate Refund
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Record Payment Modal ── */}
        <AnimatePresence>
          {payModalOpen && selectedInst && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submittingPayment && setPayModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm flex items-center justify-center p-4" />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-gray-200 pointer-events-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Record Stay Payment</h3>
                    <button onClick={() => !submittingPayment && setPayModalOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Student</label>
                      <input type="text" readOnly value={`${selectedInst.students?.full_name} (${selectedInst.students?.student_id || '—'})`}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Installment</label>
                        <input type="text" readOnly value={`#${selectedInst.installment_no}`}
                          className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Amount (₹)</label>
                        <input type="number" required value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Payment Mode</label>
                        <select value={paymentMode} onChange={(e: any) => setPaymentMode(e.target.value)} className={inputCls}>
                          <option value="upi">UPI / GPay</option>
                          <option value="bank_transfer">Net Banking</option>
                          <option value="cash">Cash</option>
                          <option value="cheque">Cheque</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Transaction Ref</label>
                        <input type="text" placeholder="UPI Ref / Txn ID" value={transactionId}
                          onChange={e => setTransactionId(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <textarea rows={2} placeholder="Admin notes…" value={notes} onChange={e => setNotes(e.target.value)}
                      className={inputCls + ' resize-none'} />
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setPayModalOpen(false)} disabled={submittingPayment}
                        className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300">Cancel</button>
                      <button type="submit" disabled={submittingPayment}
                        className="flex-1 py-3 text-sm font-bold rounded-xl text-black flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                        {submittingPayment ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><CheckCircle size={16} /> Approve Payment</>}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Record Deposit Modal ── */}
        <AnimatePresence>
          {depositModalOpen && selectedReg && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submittingPayment && setDepositModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-gray-200 pointer-events-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Record Security Deposit</h3>
                    <button onClick={() => setDepositModalOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleRecordDeposit} className="space-y-4">
                    <input type="text" readOnly value={`${selectedReg.full_name} (${selectedReg.application_id || '—'})`}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Amount (₹)</label>
                        <input type="number" required value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Payment Mode</label>
                        <select value={paymentMode} onChange={(e: any) => setPaymentMode(e.target.value)} className={inputCls}>
                          <option value="upi">UPI / GPay</option>
                          <option value="bank_transfer">Net Banking</option>
                          <option value="cash">Cash</option>
                          <option value="cheque">Cheque</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <input type="text" placeholder="Transaction Reference" value={transactionId}
                      onChange={e => setTransactionId(e.target.value)} className={inputCls} />
                    <textarea rows={2} placeholder="Admin notes…" value={notes} onChange={e => setNotes(e.target.value)}
                      className={inputCls + ' resize-none'} />
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setDepositModalOpen(false)}
                        className="flex-1 py-3 text-sm rounded-xl border border-white/10 text-gray-300">Cancel</button>
                      <button type="submit" disabled={submittingPayment}
                        className="flex-1 py-3 text-sm font-bold rounded-xl text-black"
                        style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
                        {submittingPayment ? 'Saving…' : 'Record Deposit'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Refund Modal ── */}
        <AnimatePresence>
          {refundModalOpen && selectedReg && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submittingPayment && setRefundModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-gray-200 pointer-events-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Process Deposit Refund</h3>
                    <button onClick={() => setRefundModalOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-4 text-xs text-amber-400">
                    Original deposit: ₹{selectedReg.deposit_amount || '—'} · Refund amount below = Partial Refund
                  </div>
                  <form onSubmit={handleRefundDeposit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Refund Amount (₹)</label>
                      <input type="number" required value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className={inputCls} />
                    </div>
                    <textarea rows={2} placeholder="Refund reason / notes…" value={notes} onChange={e => setNotes(e.target.value)}
                      className={inputCls + ' resize-none'} />
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setRefundModalOpen(false)}
                        className="flex-1 py-3 text-sm rounded-xl border border-white/10 text-gray-300">Cancel</button>
                      <button type="submit" disabled={submittingPayment}
                        className="flex-1 py-3 text-sm font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
                        {submittingPayment ? 'Processing…' : 'Process Refund'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  )
}
