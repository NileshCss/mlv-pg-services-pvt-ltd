'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { MessageSquare, Plus, X, Upload, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { StudentComplaint, ComplaintCategory } from '@/types/student'

const GOLD = '#C9A84C'
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'food', label: '🍽 Food' },
  { value: 'electricity', label: '⚡ Electricity' },
  { value: 'internet', label: '📶 Internet' },
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'water', label: '💧 Water' },
  { value: 'maintenance', label: '🔧 Maintenance' },
  { value: 'other', label: '📌 Other' },
]

const STATUS_CONFIG = {
  open: { label: 'Open', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  resolved: { label: 'Resolved', color: '#27AE60', bg: 'rgba(46,204,113,0.1)', icon: CheckCircle },
  closed: { label: 'Closed', color: '#8A8AA0', bg: 'rgba(138,138,160,0.1)', icon: CheckCircle },
}

export default function ComplaintsPage() {
  const supabase = createClient()
  const [complaints, setComplaints] = useState<StudentComplaint[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ category: 'food' as ComplaintCategory, subject: '', description: '' })
  const [formErrors, setFormErrors] = useState({ subject: '', description: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: student } = await supabase.from('students').select('id').eq('user_id', session.user.id).single()
      if (!student) return
      setStudentId(student.id)
      const { data } = await supabase.from('student_complaints').select('*').eq('student_id', student.id).order('created_at', { ascending: false })
      setComplaints(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const validate = () => {
    const e = { subject: '', description: '' }
    let ok = true
    if (!form.subject.trim()) { e.subject = 'Subject is required'; ok = false }
    if (!form.description.trim() || form.description.trim().length < 20) { e.description = 'Please describe the issue (min 20 characters)'; ok = false }
    setFormErrors(e)
    return ok
  }

  // Check max 1 active complaint per category
  const hasActiveCategoryComplaint = (category: ComplaintCategory) =>
    complaints.some(c => c.category === category && ['open', 'in_progress'].includes(c.status))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !studentId) return
    if (hasActiveCategoryComplaint(form.category)) {
      toast.error(`You already have an active ${form.category} complaint. Please wait for it to be resolved.`)
      return
    }
    setSubmitting(true)
    try {
      // Fetch student details needed for the admin `complaints` table schema
      const { data: studentData } = await supabase
        .from('students')
        .select('full_name, phone, room_number, rooms(room_number)')
        .eq('id', studentId)
        .single()

      const studentName = studentData?.full_name || 'Student'
      const phone = studentData?.phone || ''
      // room_number may be a direct column or via joined rooms table
      const roomNumber =
        studentData?.room_number ||
        (studentData?.rooms as { room_number?: string } | null)?.room_number ||
        'N/A'

      // Generate complaint ID  (same format as /api/complaints route)
      const year = new Date().getFullYear()
      const ts = Math.floor(Date.now() / 1000).toString(36).toUpperCase()
      const rand = Math.floor(Math.random() * 36).toString(36).toUpperCase()
      const complaintId = `MLV-${year}-${ts}${rand}`

      const now = new Date().toISOString()

      // Map category label to the format admin uses
      const categoryLabel = CATEGORIES.find(c => c.value === form.category)?.label
        .replace(/^[^\s]+ /, '') // strip emoji prefix
        || form.category

      // Write to `complaints` table — the table the admin dashboard reads from
      const { error } = await supabase.from('complaints').insert({
        complaint_id: complaintId,
        student_name: studentName,
        room_number: roomNumber,
        phone,
        category: categoryLabel,
        details: `[${form.subject}]\n\n${form.description}`,
        urgency: 'medium',
        status: 'pending',
        admin_notes: '',
        created_at: now,
        updated_at: now,
      })

      if (error) throw error

      // Also keep a local record in student_complaints for the student's own view
      try {
        await supabase.from('student_complaints').insert({
          student_id: studentId,
          category: form.category,
          subject: form.subject,
          description: form.description,
          status: 'open',
          complaint_ref_id: complaintId,
        })
      } catch {
        // non-critical if this fails
      }

      toast.success('Complaint submitted successfully!')
      setShowForm(false)
      setForm({ category: 'food', subject: '', description: '' })
      // Refresh student's own list from student_complaints
      const { data } = await supabase
        .from('student_complaints')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      setComplaints(data || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit complaint'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const activeCount = complaints.filter(c => ['open', 'in_progress'].includes(c.status)).length

  return (
    <StudentDashboardLayout title="Complaints">
      <div className="space-y-5">
        {/* Header + New Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: '#8A8AA0' }}>
              {activeCount > 0 ? `${activeCount} active complaint${activeCount > 1 ? 's' : ''}` : 'No active complaints'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ background: showForm ? '#F0EEE8' : 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: showForm ? '#8A8AA0' : '#1A1A2E', boxShadow: showForm ? 'none' : '0 4px 16px rgba(201,168,76,0.3)' }}
          >
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Complaint</>}
          </button>
        </div>

        {/* New Complaint Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 sm:p-6"
            style={{ border: `1px solid rgba(201,168,76,0.3)`, boxShadow: '0 4px 24px rgba(201,168,76,0.1)' }}>
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              New Complaint
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(({ value, label }) => (
                    <button key={value} type="button"
                      onClick={() => setForm(p => ({ ...p, category: value }))}
                      className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: form.category === value ? 'rgba(201,168,76,0.15)' : '#F8F6F1',
                        border: form.category === value ? `1.5px solid ${GOLD}` : '1.5px solid transparent',
                        color: form.category === value ? '#1A1A2E' : '#4A4A6A',
                      }}>
                      {label}
                      {hasActiveCategoryComplaint(value) && <span className="ml-1 text-xs text-orange-400">(active)</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A2E' }}>Subject</label>
                <input type="text" placeholder="Brief subject of your complaint" value={form.subject}
                  onChange={e => { setForm(p => ({ ...p, subject: e.target.value })); setFormErrors(p => ({ ...p, subject: '' })) }}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: formErrors.subject ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0', background: '#FAFAFA', color: '#1A1A2E' }}
                  onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = formErrors.subject ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1A1A2E' }}>Description</label>
                <textarea rows={4} placeholder="Describe the issue in detail (minimum 20 characters)…" value={form.description}
                  onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setFormErrors(p => ({ ...p, description: '' })) }}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{ border: formErrors.description ? '1.5px solid #ef4444' : '1.5px solid #EBEBF0', background: '#FAFAFA', color: '#1A1A2E' }}
                  onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = formErrors.description ? '#ef4444' : '#EBEBF0'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>
              <button type="submit" disabled={submitting}
                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}>
                {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : 'Submit Complaint'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Complaints List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EBEBF0' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EBEBF0' }}>
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>My Complaints</h3>
          </div>
          {loading ? (
            <div className="p-10 text-center"><div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin mx-auto" style={{ borderTopColor: GOLD }} /></div>
          ) : complaints.length === 0 ? (
            <div className="p-10 text-center">
              <MessageSquare size={36} className="mx-auto mb-3" style={{ color: '#C4C4D0' }} />
              <p className="font-semibold" style={{ color: '#1A1A2E' }}>No complaints yet</p>
              <p className="text-sm mt-1" style={{ color: '#8A8AA0' }}>Use the button above to raise a new complaint.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EEE8]">
              {complaints.map(c => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open
                const Icon = cfg.icon
                const catLabel = CATEGORIES.find(x => x.value === c.category)?.label || c.category
                return (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>{c.subject}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8A8AA0' }}>{catLabel} · {fmtDate(c.created_at)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#4A4A6A' }}>{c.description}</p>
                    {c.admin_response && (
                      <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: GOLD }}>Admin Response:</p>
                        <p className="text-sm" style={{ color: '#4A4A6A' }}>{c.admin_response}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </StudentDashboardLayout>
  )
}
