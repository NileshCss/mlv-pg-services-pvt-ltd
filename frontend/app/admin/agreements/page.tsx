'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { FileText, Search, Plus, Loader2, CheckCircle, Clock, Eye, Calendar, PenTool } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Shared responsive components
import { MobileContainer } from '@/components/admin/responsive/MobileContainer'
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal'
import { ResponsiveTable } from '@/components/admin/responsive/ResponsiveTable'
import { ResponsiveCard } from '@/components/admin/responsive/ResponsiveCard'

const GOLD = '#C8840A'

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
      <MobileContainer className="min-h-screen bg-[#0A0E1A] text-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="pl-12 sm:pl-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3 font-serif">
                <FileText style={{ color: GOLD }} size={24} /> Rental Agreements
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Generate rental agreements, track digital signatures, and audit staying contracts</p>
            </div>
            <button
              onClick={() => setGenModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#C8840A] hover:bg-[#F5A623] text-black font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(245,166,35,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Generate Contract
            </button>
          </div>

          {/* Search */}
          <div className="max-w-md relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search agreements by student name or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500"
            />
          </div>

          {/* Table / Card List */}
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
              <Loader2 className="animate-spin text-amber-500" size={22} />
            </div>
          ) : (
            <ResponsiveTable
              columns={[
                { label: 'Student' },
                { label: 'Room Allocation' },
                { label: 'Stay Duration' },
                { label: 'Signature' },
                { label: 'Signed Details' },
                { label: 'Actions', className: 'text-right' }
              ]}
              items={filteredAgreements}
              emptyState={
                <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6 max-w-md mx-auto">
                  <FileText size={32} className="mx-auto mb-3 text-gray-600" />
                  <p className="font-semibold text-gray-300 text-sm">No staying contracts found</p>
                </div>
              }
              renderRow={(agr) => (
                <tr key={agr.id} className="hover:bg-white/[0.02] transition-colors">
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
                        className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors inline-block"
                        title="View Agreement"
                      >
                        <Eye size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              )}
              renderCard={(agr) => (
                <ResponsiveCard key={agr.id} className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{agr.students?.full_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{agr.students?.student_id || '—'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      agr.signed 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {agr.signed ? 'Signed' : 'Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div><span className="text-gray-600">Room:</span> {agr.students?.rooms?.room_number || 'Unassigned'}</div>
                    <div><span className="text-gray-600">Start:</span> {agr.start_date}</div>
                    <div className="col-span-2"><span className="text-gray-600">End Date:</span> {agr.end_date}</div>
                    {agr.signed && (
                      <div className="col-span-2 text-[10px] text-gray-500 mt-1 border-t border-white/5 pt-1.5">
                        ✍️ Key: <strong className="text-gray-300">"{agr.signature_data}"</strong> ({agr.signed_at?.split('T')[0]})
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <a href={agr.file_url || '#'} target="_blank" rel="noreferrer"
                      className="w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold transition-all text-center block"
                    >
                      View stays PDF
                    </a>
                  </div>
                </ResponsiveCard>
              )}
            />
          )}
        </motion.div>

        {/* Generate Agreement Modal using unified ResponsiveModal */}
        <ResponsiveModal
          isOpen={genModalOpen}
          onClose={() => setGenModalOpen(false)}
          title="Generate Rental Staying Contract"
          submitting={submitting}
        >
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
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Contract Start</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Contract End</label>
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
                className="flex-1 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center justify-center gap-2"
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
        </ResponsiveModal>
      </MobileContainer>
    </DashboardLayout>
  )
}
