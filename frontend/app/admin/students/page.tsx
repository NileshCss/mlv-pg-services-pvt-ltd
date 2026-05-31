'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, GraduationCap, CheckCircle, XCircle, Search, Eye, Plus, 
  ArrowRight, Home, Calendar, Trash2, Phone, Mail, Loader2, BookOpen, 
  Building, UserCheck, UserX, AlertCircle, FileText, Send, UserCheck2
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'
const GOLD_LIGHT = 'rgba(200,132,10,0.1)'
const GOLD_BORDER = 'rgba(200,132,10,0.2)'

export default function AdminStudentsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'residents' | 'applicants' | 'invitations' | 'archived'>('residents')
  const [loading, setLoading] = useState(true)
  
  // Data lists
  const [applicants, setApplicants] = useState<any[]>([])
  const [residents, setResidents] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [beds, setBeds] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Modals / Panels
  const [onboardModalOpen, setOnboardModalOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null)
  const [docPanelOpen, setDocPanelOpen] = useState(false)
  
  // Existing Resident Invitation Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteBuildingId, setInviteBuildingId] = useState('')
  const [inviteRoomId, setInviteRoomId] = useState('')
  const [inviteFloor, setInviteFloor] = useState('1')
  const [inviteJoinDate, setInviteJoinDate] = useState('')
  const [inviting, setInviting] = useState(false)

  // Invitation Review / Details Modal
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<any | null>(null)
  const [actioning, setActioning] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  
  // Onboard form states (for applicants / new students)
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedBedId, setSelectedBedId] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('5000')
  const [planType, setPlanType] = useState<'monthly' | 'bi_monthly' | 'quarterly'>('monthly')
  const [joiningDate, setJoiningDate] = useState('')
  const [agreementEndDate, setAgreementEndDate] = useState('')
  const [onboarding, setOnboarding] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch pre-registrations (applicants)
      const { data: apps } = await supabase
        .from('pre_registrations')
        .select('*')
        .order('created_at', { ascending: false })
      setApplicants(apps || [])

      // 2. Fetch active students (residents)
      const { data: res } = await supabase
        .from('students')
        .select('*, rooms(room_number, floor, type), beds(bed_number)')
        .order('created_at', { ascending: false })
      setResidents(res || [])

      // 3. Fetch all rooms
      const { data: rms } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true })
      setRooms(rms || [])

      // 4. Fetch available beds
      const { data: bds } = await supabase
        .from('beds')
        .select('*')
      setBeds(bds || [])

      // 5. Fetch buildings
      const { data: bldgs } = await supabase
        .from('buildings')
        .select('*')
        .order('name', { ascending: true })
      setBuildings(bldgs || [])

      // 6. Fetch resident invitations
      const resInv = await fetch('/api/admin/invitations')
      const dataInv = await resInv.json()
      setInvitations(dataInv.data || [])

    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load portal data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  // Filter rooms based on selected building for invitation modal
  const filteredRoomsForBuilding = rooms.filter(r => r.building_id === inviteBuildingId && r.status === 'available')

  // Filter beds based on selected room
  const availableBedsForRoom = beds.filter(b => b.room_id === selectedRoomId && b.status === 'available')

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    setSelectedBedId('')
    const room = rooms.find(r => r.id === roomId)
    if (room && room.monthly_rent) {
      setMonthlyAmount(room.monthly_rent.toString())
    }
  }

  const handleRejectApplicant = async (appId: string) => {
    if (!confirm('Are you sure you want to reject this applicant?')) return
    try {
      const { error } = await supabase
        .from('pre_registrations')
        .update({ status: 'rejected' })
        .eq('id', appId)

      if (error) throw error
      toast.success('Applicant marked as rejected')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update applicant')
    }
  }

  const handleDeactivateResident = async (studentId: string, bedId: string) => {
    if (!confirm('Are you sure you want to checkout and deactivate this resident? This will free up their bed.')) return
    try {
      // 1. Mark student as inactive
      const { error: studentError } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', studentId)

      if (studentError) throw studentError

      // Note: Trigger update_bed_room_on_student_change now handles setting the bed to available and occupied_beds count automatically.
      toast.success('Resident checked out successfully!')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to checkout resident')
    }
  }

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApplicant || !selectedRoomId || !selectedBedId || !monthlyAmount || !joiningDate || !agreementEndDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setOnboarding(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preRegistrationId: selectedApplicant.id,
          roomId: selectedRoomId,
          bedId: selectedBedId,
          monthlyAmount,
          securityDeposit,
          planType,
          joiningDate,
          agreementEndDate
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to onboard resident')

      toast.success(`Resident onboarding complete! student ID: ${data.studentId}`)
      alert(`STUDENT PORTAL ACCESS CREATED!\n\nEmail: ${data.email}\nTemp Password: ${data.temporaryPassword}\n\nPlease share these credentials with the student.`)
      
      setOnboardModalOpen(false)
      setSelectedApplicant(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to onboard resident')
    } finally {
      setOnboarding(false)
    }
  }

  // Handle Invitation Modal Submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName || !invitePhone || !inviteEmail || !inviteBuildingId || !inviteRoomId || !inviteJoinDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setInviting(true)
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: inviteName,
          phone: invitePhone,
          email: inviteEmail,
          buildingId: inviteBuildingId,
          roomId: inviteRoomId,
          floorNumber: inviteFloor,
          joiningDate: inviteJoinDate
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation')

      toast.success('Invitation generated and sent successfully!')
      
      // Copy to clipboard notification
      if (data.registrationLink) {
        navigator.clipboard.writeText(data.registrationLink)
        toast.info('Invitation registration link copied to clipboard!')
      }

      setInviteModalOpen(false)
      // Reset form
      setInviteName('')
      setInvitePhone('')
      setInviteEmail('')
      setInviteBuildingId('')
      setInviteRoomId('')
      setInviteFloor('1')
      setInviteJoinDate('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite resident')
    } finally {
      setInviting(false)
    }
  }

  // Handle Invitation Approval Actions (Approve / Reject / Changes)
  const handleInvitationAction = async (action: 'approve' | 'reject' | 'request_changes') => {
    if (!selectedInvitation) return
    if (action === 'approve' && !confirm(`Are you sure you want to approve ${selectedInvitation.full_name}'s registration? This will activate their account immediately.`)) return
    if (action === 'reject' && !confirm('Are you sure you want to reject this registration?')) return

    setActioning(true)
    try {
      const res = await fetch('/api/admin/invitations/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: selectedInvitation.id,
          action,
          notes: rejectNotes
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process action')

      toast.success(data.message || `Invitation action ${action} completed successfully!`)
      if (action === 'approve') {
        alert(`PORTAL ACTIVATED SUCCESS!\n\nEmail: ${data.email}\nStudent ID: ${data.studentId}\n\nLogin credentials and link have been dispatched via WhatsApp & Email.`)
      }

      setReviewPanelOpen(false)
      setSelectedInvitation(null)
      setRejectNotes('')
      setShowRejectForm(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete action')
    } finally {
      setActioning(false)
    }
  }

  // Filter lists based on tab & search query
  const term = searchQuery.toLowerCase()

  const filteredApplicants = applicants.filter(a => {
    return (
      a.status === 'new' &&
      (a.full_name?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term) || a.phone?.toLowerCase().includes(term))
    )
  })

  const filteredResidents = residents.filter(r => {
    return (
      r.is_active === true &&
      (r.full_name?.toLowerCase().includes(term) || r.student_id?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term) || r.mobile?.includes(term))
    )
  })

  const filteredArchived = residents.filter(r => {
    return (
      r.is_active === false &&
      (r.full_name?.toLowerCase().includes(term) || r.student_id?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term))
    )
  })

  const filteredInvitations = invitations.filter(i => {
    return (
      i.full_name?.toLowerCase().includes(term) || i.email?.toLowerCase().includes(term) || i.phone?.includes(term)
    )
  })

  // Statistics calculations
  const stats = {
    activeResidents: residents.filter(r => r.is_active === true).length,
    pendingRegistrations: applicants.filter(a => a.status === 'new').length,
    invitedResidents: invitations.filter(i => i.status === 'invited').length,
    pendingSubmissions: invitations.filter(i => i.status === 'profile_submitted').length,
    rejectedInvites: invitations.filter(i => i.status === 'rejected').length
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
              <GraduationCap style={{ color: GOLD }} /> Students & Admission
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review registrations, allocate beds, and manage residents</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="py-2.5 px-5 text-xs font-bold rounded-xl text-black transition-all flex items-center gap-1.5 hover:shadow-[0_2px_8px_rgba(245,166,35,0.25)]"
              style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
            >
              <Plus size={14} /> Invite Existing Student
            </button>
          </div>
        </div>

        {/* Dynamic statistics ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Active Residents', val: stats.activeResidents, border: 'border-green-500/10', text: 'text-green-400' },
            { label: 'Pending Registrations', val: stats.pendingRegistrations, border: 'border-blue-500/10', text: 'text-blue-400' },
            { label: 'Invited Residents', val: stats.invitedResidents, border: 'border-amber-500/10', text: 'text-amber-400' },
            { label: 'Pending Approvals', val: stats.pendingSubmissions, border: 'border-purple-500/10', text: 'text-purple-400' },
            { label: 'Rejected Invites', val: stats.rejectedInvites, border: 'border-red-500/10', text: 'text-red-400' },
          ].map((s, idx) => (
            <div key={idx} className={`bg-[#0F1629] border ${s.border} rounded-xl p-3.5 flex flex-col justify-center`}>
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">{s.label}</span>
              <span className={`text-xl font-bold mt-1 ${s.text}`}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-white/10 mb-6 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: 'residents', label: 'Active Students', count: filteredResidents.length },
            { id: 'applicants', label: 'Pending Registrations', count: filteredApplicants.length },
            { id: 'invitations', label: 'Existing Resident Invitations', count: filteredInvitations.length },
            { id: 'archived', label: 'Archived Students', count: filteredArchived.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setSearchQuery(''); }}
              className="pb-3 text-sm font-semibold transition-all relative flex items-center gap-1.5"
              style={{ color: activeTab === t.id ? GOLD : '#9CA3AF' }}
            >
              {t.label} ({t.count})
              {activeTab === t.id && (
                <motion.div layoutId="adminTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
              )}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="mb-6 max-w-md relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'residents' ? 'Search active residents…' : 
              activeTab === 'applicants' ? 'Search pending registrations…' : 
              activeTab === 'invitations' ? 'Search resident invitations…' : 
              'Search archived students…'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0F1629] text-white outline-none focus:border-[#C8840A] transition-all"
          />
        </div>

        {/* Content Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500 mb-3" size={24} />
            <p className="text-sm text-gray-400">Loading portal details…</p>
          </div>
        ) : activeTab === 'applicants' ? (
          /* APPLICANTS GRID */
          filteredApplicants.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
              <Users size={38} className="mx-auto mb-3 text-gray-600" />
              <p className="font-semibold text-gray-300">No applicants pending</p>
              <p className="text-sm text-gray-500 mt-1">New registrations from the public page will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplicants.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0F1629] border border-white/8 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-white text-base">{app.full_name}</h4>
                        <span className="text-xs text-gray-500">{app.gender} · {app.food_preference}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ 
                          background: 'rgba(59,130,246,0.1)',
                          color: '#3B82F6'
                        }}>
                        New
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-t border-b border-white/5 text-xs text-gray-400">
                      <div className="flex items-center gap-2"><Phone size={12} className="text-gray-500" /> {app.phone}</div>
                      <div className="flex items-center gap-2"><Mail size={12} className="text-gray-500" /> {app.email}</div>
                      <div className="flex items-center gap-2"><BookOpen size={12} className="text-gray-500" /> {app.college_name}</div>
                      <div className="flex items-center gap-2"><Home size={12} className="text-gray-500" /> Pref: {app.room_preference}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={() => { setSelectedApplicant(app); setDocPanelOpen(true); }}
                      className="flex-1 py-2 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Eye size={12} /> View Docs
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApplicant(app);
                        setOnboardModalOpen(true);
                        const joinDate = app.check_in_date || new Date().toISOString().split('T')[0]
                        setJoiningDate(joinDate)
                        const end = new Date(joinDate)
                        end.setMonth(end.getMonth() + 11)
                        setAgreementEndDate(end.toISOString().split('T')[0])
                      }}
                      className="flex-1 py-2 text-xs font-bold rounded-xl text-black transition-all flex items-center justify-center gap-1 hover:shadow-[0_2px_8px_rgba(245,166,35,0.25)]"
                      style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                    >
                      Onboard <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleRejectApplicant(app.id)}
                      className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Reject Applicant"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : activeTab === 'residents' ? (
          /* ACTIVE STUDENTS TABLE */
          filteredResidents.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
              <Users size={38} className="mx-auto mb-3 text-gray-600" />
              <p className="font-semibold text-gray-300">No active students found</p>
            </div>
          ) : (
            <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto text-left border-collapse">
                  <thead className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-b border-amber-500/15">
                    <tr>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">👤 Student</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85"># ID</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">🏠 Room Allocation</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">📅 Stay Schedule</th>
                      <th className="px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">🔰 Status</th>
                      <th className="px-5 py-4 text-right text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">⚙ Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredResidents.map((res) => (
                      <tr key={res.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-500">
                              {res.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white">{res.full_name}</p>
                              <p className="text-xs text-gray-500">{res.college_name} · {res.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-amber-500 whitespace-nowrap">{res.student_id || '—'}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {res.rooms ? (
                            <div>
                              <p className="font-semibold text-gray-200">Room {res.rooms.room_number}</p>
                              <p className="text-xs text-gray-500">Bed {res.beds?.bed_number || '—'} · {res.rooms.type}</p>
                            </div>
                          ) : (
                            <span className="text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          <div>Join: {res.joining_date}</div>
                          <div className="mt-0.5">End: {res.agreement_end_date}</div>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            Active
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeactivateResident(res.id, res.bed_id)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded-lg text-xs font-bold text-red-400 transition-colors"
                          >
                            Checkout
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : activeTab === 'archived' ? (
          /* ARCHIVED STUDENTS TABLE */
          filteredArchived.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
              <Users size={38} className="mx-auto mb-3 text-gray-600" />
              <p className="font-semibold text-gray-300">No archived (checked-out) residents found</p>
            </div>
          ) : (
            <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto text-left border-collapse">
                  <thead className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-b border-amber-500/15">
                    <tr>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">👤 Student</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85"># ID</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">🏠 Historical Room</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">📅 Stay Schedule</th>
                      <th className="px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">🔰 Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredArchived.map((res) => (
                      <tr key={res.id} className="hover:bg-white/2 transition-colors opacity-75">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-gray-400">
                              {res.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-300">{res.full_name}</p>
                              <p className="text-xs text-gray-500">{res.college_name} · {res.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">{res.student_id || '—'}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-400">Room {res.rooms?.room_number || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          <div>Join: {res.joining_date}</div>
                          <div>End: {res.agreement_end_date}</div>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/10">
                            Checked Out
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* EXISTING RESIDENT INVITATIONS TABLE */
          filteredInvitations.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
              <Send size={38} className="mx-auto mb-3 text-gray-600" />
              <p className="font-semibold text-gray-300">No resident invitations found</p>
              <p className="text-sm text-gray-500 mt-1">Generate a dashboard invitation to existing residents using the button at the top-right.</p>
            </div>
          ) : (
            <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto text-left border-collapse">
                  <thead className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-b border-amber-500/15">
                    <tr>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">👤 Invitee Details</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">🏠 Room Allocation</th>
                      <th className="px-5 py-4 text-left text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">📅 Invitation Dates</th>
                      <th className="px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">🔰 Status</th>
                      <th className="px-5 py-4 text-right text-[13px] font-bold uppercase tracking-[0.5px] text-white/85">⚙ Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredInvitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-white">{invite.full_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <Phone size={10} /> {invite.phone} · <Mail size={10} /> {invite.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-gray-200">{invite.buildings?.name || 'Main Building'}</p>
                          <p className="text-xs text-gray-500">Room {invite.rooms?.room_number || '—'} · Floor {invite.floor_number || 1}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          <div>Join Date: {invite.joining_date}</div>
                          <div className="mt-0.5 text-gray-500">Expires: {new Date(invite.expires_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            invite.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            invite.status === 'profile_submitted' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse' :
                            invite.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {invite.status === 'invited' ? 'Invited' :
                             invite.status === 'profile_submitted' ? 'Submitted' :
                             invite.status === 'active' ? 'Active' :
                             invite.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {invite.status === 'profile_submitted' ? (
                              <>
                                <button
                                  onClick={() => { setSelectedInvitation(invite); setReviewPanelOpen(true); }}
                                  className="px-2.5 py-1.5 bg-[#C8840A]/10 hover:bg-[#C8840A]/20 border border-[#C8840A]/25 rounded-lg text-xs font-bold text-[#C8840A] transition-colors flex items-center gap-1"
                                >
                                  <Eye size={12} /> Review Profile
                                </button>
                                <button
                                  onClick={() => { setSelectedInvitation(invite); handleInvitationAction('approve'); }}
                                  className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 rounded-lg text-xs font-bold text-green-400 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle size={12} /> Quick Approve
                                </button>
                              </>
                            ) : invite.status === 'invited' ? (
                              <button
                                onClick={() => {
                                  const origin = window.location.origin
                                  const registrationLink = `${origin}/existing-resident-registration?token=${invite.token}`
                                  navigator.clipboard.writeText(registrationLink)
                                  toast.success('Registration link copied to clipboard!')
                                }}
                                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 transition-colors"
                              >
                                Copy Invite Link
                              </button>
                            ) : (
                              <span className="text-xs text-gray-600">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* View Documents Panel */}
        <AnimatePresence>
          {docPanelOpen && selectedApplicant && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDocPanelOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="fixed top-0 right-0 h-screen w-full sm:w-[460px] bg-[#0F1629] border-l border-white/10 z-50 flex flex-col p-6 shadow-2xl overflow-y-auto text-gray-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Verification Documents</h3>
                  <button onClick={() => setDocPanelOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{selectedApplicant.full_name}</h4>
                    <p className="text-xs text-gray-500">Applicant ID: {selectedApplicant.application_id || 'Pending'}</p>
                  </div>
                  
                  {/* Aadhaar Link */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Aadhaar Card Proof</h5>
                    {selectedApplicant.aadhar_url ? (
                      <a href={selectedApplicant.aadhar_url} target="_blank" rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-500 transition-colors">
                        <Eye size={15} /> View Aadhaar Card Document
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><XCircle size={13} /> Aadhaar proof not uploaded during registration</p>
                    )}
                  </div>

                  {/* College ID Link */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">College ID Proof</h5>
                    {selectedApplicant.college_id_url ? (
                      <a href={selectedApplicant.college_id_url} target="_blank" rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-500 transition-colors">
                        <Eye size={15} /> View College ID Card
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><XCircle size={13} /> College ID not uploaded</p>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Passport Photo</h5>
                    {selectedApplicant.photo_url ? (
                      <a href={selectedApplicant.photo_url} target="_blank" rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-500 transition-colors">
                        <Eye size={15} /> View Full Profile Photo
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><XCircle size={13} /> Profile photo not uploaded</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Existing Resident Review Profile Panel */}
        <AnimatePresence>
          {reviewPanelOpen && selectedInvitation && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !actioning && setReviewPanelOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-[#0F1629] border-l border-white/10 z-50 flex flex-col p-6 shadow-2xl overflow-y-auto text-gray-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Review Resident Profile</h3>
                  <button onClick={() => !actioning && setReviewPanelOpen(false)} className="text-gray-400 hover:text-white" disabled={actioning}>✕</button>
                </div>
                
                <div className="space-y-6 pb-20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border border-amber-500/20 overflow-hidden bg-amber-500/10 flex items-center justify-center font-bold text-lg text-amber-500">
                      {selectedInvitation.profile_data?.photoUrl ? (
                        <img src={selectedInvitation.profile_data.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : selectedInvitation.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{selectedInvitation.full_name}</h4>
                      <p className="text-xs text-[#C8840A]">Activation Registration Review</p>
                    </div>
                  </div>

                  {/* Room Allocation */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">PG Stay Info</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">PG Block:</span> <span className="text-gray-300 font-semibold">{selectedInvitation.buildings?.name || 'Main Building'}</span></div>
                      <div><span className="text-gray-500">Room:</span> <span className="text-gray-300 font-semibold">Room {selectedInvitation.rooms?.room_number || '—'}</span></div>
                      <div><span className="text-gray-500">Floor:</span> <span className="text-gray-300 font-semibold">Floor {selectedInvitation.floor_number || 1}</span></div>
                      <div><span className="text-gray-500">Joining Date:</span> <span className="text-gray-300 font-semibold">{selectedInvitation.joining_date}</span></div>
                    </div>
                  </div>

                  {/* Submission details */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Submitted Details</h5>
                    
                    <div className="space-y-2 text-xs">
                      <div><span className="text-gray-500 block">Date of Birth</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.dob || '—'}</span></div>
                      <div><span className="text-gray-500 block">Aadhaar Number</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.aadharNumber || '—'}</span></div>
                      <div><span className="text-gray-500 block">Permanent Address</span> <span className="text-gray-200 font-medium leading-relaxed">{selectedInvitation.profile_data?.permanentAddress || '—'}</span></div>
                      <div><span className="text-gray-500 block">College / Company</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.collegeName || '—'}</span></div>
                      <div><span className="text-gray-500 block">Course / Designation</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.course || '—'}</span></div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2.5">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Emergency Contact</h5>
                    <div className="space-y-1.5 text-xs">
                      <div><span className="text-gray-500">Name:</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.emergencyName || '—'}</span></div>
                      <div><span className="text-gray-500">Mobile:</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.emergencyPhone || '—'}</span></div>
                      <div><span className="text-gray-500">Relationship:</span> <span className="text-gray-200 font-medium">{selectedInvitation.profile_data?.emergencyRelationship || '—'}</span></div>
                    </div>
                  </div>

                  {/* Documents link */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Verification Uploads</h5>
                    <div className="space-y-2 text-xs">
                      {selectedInvitation.profile_data?.aadharUrl ? (
                        <a href={selectedInvitation.profile_data.aadharUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white hover:text-amber-500 transition-colors font-medium">
                          <Eye size={12} /> Preview Aadhaar / ID Proof Document
                        </a>
                      ) : <p className="text-gray-500">No ID Proof uploaded</p>}
                      
                      {selectedInvitation.profile_data?.photoUrl ? (
                        <a href={selectedInvitation.profile_data.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white hover:text-amber-500 transition-colors font-medium">
                          <Eye size={12} /> Preview Full Passport Photo
                        </a>
                      ) : <p className="text-gray-500">No Photo uploaded</p>}
                    </div>
                  </div>

                  {/* Action Box */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    {!showRejectForm ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInvitationAction('approve')}
                          disabled={actioning}
                          className="flex-1 py-3 text-xs font-bold rounded-xl text-black transition-all flex items-center justify-center gap-1 hover:shadow-[0_2px_8px_rgba(34,197,94,0.25)]"
                          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                        >
                          <UserCheck2 size={13} /> Approve Registration
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          disabled={actioning}
                          className="py-3 px-4 text-xs font-bold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <UserX size={13} /> Reject
                        </button>
                        <button
                          onClick={() => handleInvitationAction('request_changes')}
                          disabled={actioning}
                          className="py-3 px-4 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                        >
                          Request Changes
                        </button>
                      </div>
                    ) : (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-3">
                        <label className="block text-xs font-semibold text-gray-400 uppercase">Reason / Feedback Notes *</label>
                        <textarea
                          rows={3}
                          required
                          value={rejectNotes}
                          onChange={e => setRejectNotes(e.target.value)}
                          placeholder="Explain what needs to be changed or why this was rejected..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#0A0E1A] border border-white/5 text-white outline-none focus:border-red-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInvitationAction('reject')}
                            disabled={actioning || !rejectNotes.trim()}
                            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => setShowRejectForm(false)}
                            disabled={actioning}
                            className="py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Invite Existing Student Modal */}
        <AnimatePresence>
          {inviteModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !inviting && setInviteModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-xl p-6 overflow-hidden shadow-2xl text-gray-200 pointer-events-auto"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Invite Existing Resident</h3>
                    <button onClick={() => !inviting && setInviteModalOpen(false)} className="text-gray-400 hover:text-white" disabled={inviting}>✕</button>
                  </div>

                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Student Name *</label>
                        <input
                          type="text"
                          required
                          value={inviteName}
                          onChange={e => setInviteName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/3 border border-white/5 text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={invitePhone}
                          onChange={e => {
                            if (/^\d*$/.test(e.target.value)) setInvitePhone(e.target.value)
                          }}
                          placeholder="10-digit mobile number"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/3 border border-white/5 text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/3 border border-white/5 text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#C8840A] uppercase mb-1">PG Building *</label>
                        <select
                          required
                          value={inviteBuildingId}
                          onChange={e => {
                            setInviteBuildingId(e.target.value)
                            setInviteRoomId('')
                          }}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                        >
                          <option value="">-- Building --</option>
                          {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Floor *</label>
                        <input
                          type="number"
                          required
                          value={inviteFloor}
                          onChange={e => setInviteFloor(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/3 border border-white/5 text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#C8840A] uppercase mb-1">Room Number *</label>
                        <select
                          required
                          value={inviteRoomId}
                          disabled={!inviteBuildingId}
                          onChange={e => setInviteRoomId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500 disabled:opacity-50"
                        >
                          <option value="">-- Room --</option>
                          {filteredRoomsForBuilding.map(r => (
                            <option key={r.id} value={r.id}>Room {r.room_number} ({r.type})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Joining Date *</label>
                      <input
                        type="date"
                        required
                        value={inviteJoinDate}
                        onChange={e => setInviteJoinDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/3 border border-white/5 text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setInviteModalOpen(false)}
                        disabled={inviting}
                        className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={inviting}
                        className="flex-1 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(245,166,35,0.3)]"
                        style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                      >
                        {inviting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending Invitation…
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Invitation Link
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Onboarding Stay Allocation Modal */}
        <AnimatePresence>
          {onboardModalOpen && selectedApplicant && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !onboarding && setOnboardModalOpen(false)}
                className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-xl p-6 overflow-hidden shadow-2xl text-gray-200 pointer-events-auto"
                >
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display' }}>Onboard Resident & Allocate Room</h3>
                  <button onClick={() => !onboarding && setOnboardModalOpen(false)} className="text-gray-400 hover:text-white" disabled={onboarding}>✕</button>
                </div>

                <form onSubmit={handleOnboardSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Full Name</label>
                      <input type="text" readOnly value={selectedApplicant.full_name} className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Gender</label>
                      <input type="text" readOnly value={selectedApplicant.gender} className="w-full px-3 py-2 rounded-xl text-sm bg-white/3 border border-white/5 text-gray-400 outline-none" />
                    </div>
                  </div>

                  {/* Room & Bed Allocation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-500 uppercase mb-1.5">Select Room</label>
                      <select
                        required
                        value={selectedRoomId}
                        onChange={(e) => handleRoomChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      >
                        <option value="">-- Choose Room --</option>
                        {rooms.filter(r => r.status === 'available').map(r => (
                          <option key={r.id} value={r.id}>
                            Room {r.room_number} ({r.type} sharing - rent: ₹{r.monthly_rent})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-500 uppercase mb-1.5">Select Bed</label>
                      <select
                        required
                        value={selectedBedId}
                        onChange={(e) => setSelectedBedId(e.target.value)}
                        disabled={!selectedRoomId}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500 disabled:opacity-50"
                      >
                        <option value="">-- Choose Bed --</option>
                        {availableBedsForRoom.map(b => (
                          <option key={b.id} value={b.id}>
                            Bed {b.bed_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rent & Security Deposit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Monthly Stay Rent (₹)</label>
                      <input
                        type="number"
                        required
                        value={monthlyAmount}
                        onChange={(e) => setMonthlyAmount(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        required
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Installments Plan & Stay Schedule */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Bill Cycle</label>
                      <select
                        value={planType}
                        onChange={(e: any) => setPlanType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="bi_monthly">Bi-Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Joining Date</label>
                      <input
                        type="date"
                        required
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Agreement End</label>
                      <input
                        type="date"
                        required
                        value={agreementEndDate}
                        onChange={(e) => setAgreementEndDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0A0E1A] text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOnboardModalOpen(false)}
                      disabled={onboarding}
                      className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={onboarding}
                      className="flex-1 py-3 text-sm font-bold rounded-xl text-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(245,166,35,0.3)]"
                      style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}
                    >
                      {onboarding ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing Stay Onboarding…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Confirm Onboard Stay
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  )
}
