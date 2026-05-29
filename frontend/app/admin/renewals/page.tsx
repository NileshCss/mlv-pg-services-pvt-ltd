'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCcw, Search, Calendar, CheckCircle, XCircle, Clock, Loader2, FileText, ArrowRight } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'

export default function AdminRenewalsPage() {
  const supabase = createClient()
  const [renewals, setRenewals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // Approve Modal States
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [newEndDate, setNewEndDate] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [submittingApprove, setSubmittingApprove] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('renewals')
        .select('*, students(id, full_name, student_id, agreement_end_date, room_id, rooms(room_number))')
        .order('requested_at', { ascending: false })

      if (error) throw error
      setRenewals(data || [])
    } catch (err) {
      console.error('Error loading renewals:', err)
      toast.error('Failed to load renewal history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest || !newEndDate) return

    setSubmittingApprove(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const nowStr = new Date().toISOString()
      const student = selectedRequest.students

      // 1. Update renewals record
      const { error: renewalError } = await supabase
        .from('renewals')
        .update({
          status: 'approved',
          approved_at: nowStr,
          new_end_date: newEndDate,
          admin_notes: adminNotes || 'Renewal approved by administration.',
          reviewed_by: session?.user ? session.user.id : null,
          slip_url: `/renewals/slip_${selectedRequest.id}.pdf` // Mock renewal slip PDF
        })
        .eq('id', selectedRequest.id)

      if (renewalError) throw renewalError

      // 2. Update student stay contract agreement end date
      const { error: studentError } = await supabase
        .from('students')
        .update({
          agreement_end_date: newEndDate
        })
        .eq('id', student.id)

      if (studentError) throw studentError

      // 3. Optional: append future monthly installments based on new end date extension
      const originalEnd = new Date(student.agreement_end_date || new Date())
      const proposedEnd = new Date(newEndDate)
      
      const { data: fee } = await supabase.from('fees').select('id, monthly_amount').eq('student_id', student.id).single()
      
      if (fee) {
        let instNo = 1
        // Fetch current installment counts
        const { count } = await supabase.from('installments').select('*', { count: 'exact', head: true }).eq('student_id', student.id)
        instNo = (count || 0) + 1

        const installmentsToInsert = []
        const current = new Date(originalEnd)
        
        while (current < proposedEnd) {
          installmentsToInsert.push({
            student_id: student.id,
            fee_id: fee.id,
            installment_no: instNo++,
            due_date: current.toISOString().split('T')[0],
            amount: fee.monthly_amount,
            status: 'pending'
          })
          current.setMonth(current.getMonth() + 1)
        }

        if (installmentsToInsert.length > 0) {
          await supabase.from('installments').insert(installmentsToInsert)
        }
      }

      toast.success('Renewal stay approved and staying contract extended!')
      setApproveModalOpen(false)
      setSelectedRequest(null)
      setNewEndDate('')
      setAdminNotes('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Approval process failed')
    } finally {
      setSubmittingApprove(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this staying extension request?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const { error } = await supabase
        .from('renewals')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          reviewed_by: session?.user ? session.user.id : null,
          admin_notes: 'Renewal request was declined by the administration.'
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Renewal request marked as rejected')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const filteredRenewals = renewals.filter(ren => {
    const name = ren.students?.full_name?.toLowerCase() || ''
    const id = ren.students?.student_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()

    const matchesSearch = name.includes(term) || id.includes(term)
    const matchesStatus = statusFilter === 'all' || ren.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
            <RefreshCcw style={{ color: GOLD }} /> Stay Renewals & Extensions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review student stay extension requests, extend stay schedules, and generate contract slips</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
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
              placeholder="Search stay extension requests…"
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
        ) : filteredRenewals.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
            <RefreshCcw size={38} className="mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-gray-300">No renewals found</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Room Allocation</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Current stays End</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Proposed stays End</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRenewals.map((ren) => (
                    <tr key={ren.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-white">{ren.students?.full_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{ren.students?.student_id || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-300">
                        Room {ren.students?.rooms?.room_number || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {ren.students?.agreement_end_date || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-green-400 font-semibold whitespace-nowrap">
                        {ren.new_end_date || 'Extension Requested'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ren.status === 'approved' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : ren.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {ren.status === 'approved' ? <CheckCircle size={10} /> : ren.status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                          {ren.status.charAt(0).toUpperCase() + ren.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {ren.status === 'pending' ? (
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => {
                                setSelectedRequest(ren);
                                // Default next end date to 11 months from now
                                const d = new Date()
                                d.setMonth(d.getMonth() + 11)
                                setNewEndDate(d.toISOString().split('T')[0])
                                setApproveModalOpen(true)
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-black transition-colors font-bold"
                              style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(ren.id)}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {ren.admin_notes ? <span className="italic">"{ren.admin_notes.slice(0, 30)}…"</span> : 'Processed'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approve renewal modal */}
        <AnimatePresence>
          {approveModalOpen && selectedRequest && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submittingApprove && setApproveModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm flex items-center justify-center p-4"
              />
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md p-6 z-50 overflow-hidden shadow-2xl relative text-gray-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Approve Stay Renewal Contract</h3>
                  <button onClick={() => !submittingApprove && setApproveModalOpen(false)} className="text-gray-400 hover:text-white" disabled={submittingApprove}>✕</button>
                </div>

                <form onSubmit={handleApprove} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Student</label>
                    <input type="text" readOnly value={`${selectedRequest.students?.full_name} (${selectedRequest.students?.student_id || '—'})`} className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1.5">New Staying Contract End Date</label>
                    <input
                      type="date"
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Stay Extension Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Add staying contract details, fee terms, or notes…"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setApproveModalOpen(false)}
                      disabled={submittingApprove}
                      className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApprove}
                      className="flex-1 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(245,166,35,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                    >
                      {submittingApprove ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Extending staying contract…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Confirm Stay Extension
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
