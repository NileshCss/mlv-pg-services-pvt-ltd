'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, Search, Plus, Loader2, CheckCircle, Clock, Eye, Download, Calendar, User, Shield, PenTool } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'
const GOLD_LIGHT = 'rgba(200,132,10,0.1)'
const GOLD_BORDER = 'rgba(200,132,10,0.2)'

export default function AgreementsPage() {
  const supabase = createClient()
  const [agreements, setAgreements] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Generate Agreement Modal
  const [genModalOpen, setGenModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch agreements
      const { data: agrs, error: agrError } = await supabase
        .from('agreements')
        .select('*, students(full_name, student_id, email, room_id, rooms(room_number))')
        .order('created_at', { ascending: false })

      if (agrError) throw agrError
      setAgreements(agrs || [])

      // 2. Fetch active students to generate agreements for
      const { data: stds } = await supabase
        .from('students')
        .select('id, full_name, student_id, agreement_end_date, room_id, rooms(room_number, monthly_rent)')
        .eq('is_active', true)
      setStudents(stds || [])

    } catch (err) {
      console.error('Error fetching agreements details:', err)
      toast.error('Failed to load agreement list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const handleGenerateAgreement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !startDate || !endDate) return

    setSubmitting(true)
    try {
      const student = students.find(s => s.id === selectedStudentId)
      const mockAgreementUrl = `/agreements/mock_contract_${selectedStudentId}.pdf`

      const { error } = await supabase
        .from('agreements')
        .insert({
          student_id: selectedStudentId,
          start_date: startDate,
          end_date: endDate,
          file_url: mockAgreementUrl,
          signed: false
        })

      if (error) throw error

      // Update student agreement dates
      await supabase
        .from('students')
        .update({
          joining_date: startDate,
          agreement_end_date: endDate
        })
        .eq('id', selectedStudentId)

      toast.success('Rental stay agreement generated successfully!')
      setGenModalOpen(false)
      setSelectedStudentId('')
      setStartDate('')
      setEndDate('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate agreement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id)
    const student = students.find(s => s.id === id)
    if (student && student.agreement_end_date) {
      const start = new Date()
      setStartDate(start.toISOString().split('T')[0])
      const end = new Date(student.agreement_end_date)
      setEndDate(end.toISOString().split('T')[0])
    } else {
      const start = new Date()
      setStartDate(start.toISOString().split('T')[0])
      const end = new Date()
      end.setMonth(end.getMonth() + 11)
      setEndDate(end.toISOString().split('T')[0])
    }
  }

  const filteredAgreements = agreements.filter(agr => {
    const name = agr.students?.full_name?.toLowerCase() || ''
    const id = agr.students?.student_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()
    return name.includes(term) || id.includes(term)
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
              <FileText style={{ color: GOLD }} /> Rental Agreements
            </h1>
            <p className="text-sm text-gray-500 mt-1">Generate rental agreements, track digital signatures, and audit staying contracts</p>
          </div>
          <button
            onClick={() => setGenModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C8840A] hover:bg-[#F5A623] text-black font-bold text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Generate Contract
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search agreements by student name or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500"
          />
        </div>

        {/* Table list */}
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        ) : filteredAgreements.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
            <FileText size={38} className="mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-gray-300">No staying contracts found</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Room Allocation</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Stay Duration</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Signature</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Signed Details</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAgreements.map((agr) => (
                    <tr key={agr.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-white">{agr.students?.full_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{agr.students?.student_id || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {agr.students?.rooms ? (
                          <span className="text-xs text-gray-300">Room {agr.students.rooms.room_number}</span>
                        ) : (
                          <span className="text-xs text-gray-500">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-400">
                        <div className="flex items-center gap-1"><Calendar size={11} className="text-gray-500" /> Start: {agr.start_date}</div>
                        <div className="flex items-center gap-1.5 mt-0.5"><Calendar size={11} className="text-gray-500" /> End: {agr.end_date}</div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          agr.signed 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {agr.signed ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {agr.signed ? 'Signed & Locked' : 'Pending Signature'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-300 whitespace-nowrap">
                        {agr.signed ? (
                          <div>
                            <p className="font-semibold flex items-center gap-1 text-gray-200"><PenTool size={11} className="text-amber-500" /> "{agr.signature_data}"</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{agr.signed_at?.split('T')[0]}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex justify-end gap-1">
                          <a href={agr.file_url || '#'} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            title="View Agreement"
                          >
                            <Eye size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Generate Agreement Modal */}
        <AnimatePresence>
          {genModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submitting && setGenModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm flex items-center justify-center p-4"
              />
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-md p-6 z-50 overflow-hidden shadow-2xl relative text-gray-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Generate Rental Staying Contract</h3>
                  <button onClick={() => !submitting && setGenModalOpen(false)} className="text-gray-400 hover:text-white" disabled={submitting}>✕</button>
                </div>

                <form onSubmit={handleGenerateAgreement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1.5">Select Resident</label>
                    <select
                      required
                      value={selectedStudentId}
                      onChange={(e) => handleStudentChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                    >
                      <option value="">-- Choose Resident --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.student_id || 'Pending'} - Room {s.rooms?.room_number || '—'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Contract Start Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Contract End Date</label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setGenModalOpen(false)}
                      disabled={submitting}
                      className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(245,166,35,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Publishing stays Contract…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Generate stays PDF
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
