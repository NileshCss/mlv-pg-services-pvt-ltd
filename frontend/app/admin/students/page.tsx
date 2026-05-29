'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Users, GraduationCap, CheckCircle, XCircle, Search, Eye, Plus, ArrowRight, Home, Calendar, Shield, Trash2, Phone, Mail, Loader2, BookOpen } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'
const GOLD_LIGHT = 'rgba(200,132,10,0.1)'
const GOLD_BORDER = 'rgba(200,132,10,0.2)'

export default function AdminStudentsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'applicants' | 'residents'>('applicants')
  const [loading, setLoading] = useState(true)
  
  // Data lists
  const [applicants, setApplicants] = useState<any[]>([])
  const [residents, setResidents] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [beds, setBeds] = useState<any[]>([])

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Modals / Panels
  const [onboardModalOpen, setOnboardModalOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null)
  const [docPanelOpen, setDocPanelOpen] = useState(false)
  
  // Onboard form states
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
        .eq('status', 'available')
        .order('room_number', { ascending: true })
      setRooms(rms || [])

      // 4. Fetch available beds
      const { data: bds } = await supabase
        .from('beds')
        .select('*')
        .eq('status', 'available')
      setBeds(bds || [])

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

  // Filter beds based on selected room
  const availableBedsForRoom = beds.filter(b => b.room_id === selectedRoomId)

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

      // 2. Free up the bed
      if (bedId) {
        const { error: bedError } = await supabase
          .from('beds')
          .update({ status: 'available' })
          .eq('id', bedId)
        if (bedError) throw bedError
      }

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
      
      // Open credentials details alert
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

  // Filtered applicants/residents list
  const filteredApplicants = applicants.filter(a => {
    const term = searchQuery.toLowerCase()
    return (
      a.status !== 'converted' &&
      a.status !== 'rejected' &&
      (a.full_name?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term) || a.phone?.toLowerCase().includes(term))
    )
  })

  const filteredResidents = residents.filter(r => {
    const term = searchQuery.toLowerCase()
    return (
      r.full_name?.toLowerCase().includes(term) ||
      r.student_id?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term)
    )
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
              <GraduationCap style={{ color: GOLD }} /> Students & Admission
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review registrations, allocate beds, and manage residents</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-white/10 mb-6 gap-6">
          <button
            onClick={() => { setActiveTab('applicants'); setSearchQuery(''); }}
            className="pb-3 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === 'applicants' ? GOLD : '#9CA3AF' }}
          >
            Applicants ({filteredApplicants.length})
            {activeTab === 'applicants' && (
              <motion.div layoutId="adminTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('residents'); setSearchQuery(''); }}
            className="pb-3 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === 'residents' ? GOLD : '#9CA3AF' }}
          >
            Active Residents ({filteredResidents.length})
            {activeTab === 'residents' && (
              <motion.div layoutId="adminTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
            )}
          </button>
        </div>

        {/* Search input */}
        <div className="mb-6 max-w-md relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={activeTab === 'applicants' ? 'Search applicants…' : 'Search residents by name or ID…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-white/8 bg-[#0F1629] text-white outline-none focus:border-[#C8840A] transition-all"
          />
        </div>

        {/* Content Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500 mb-3" size={24} />
            <p className="text-sm text-gray-400">Loading registrations details…</p>
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
                          background: app.status === 'new' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                          color: app.status === 'new' ? '#3B82F6' : '#F59E0B'
                        }}>
                        {app.status === 'new' ? 'New' : app.status}
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
                        // Pre-populate values
                        const joinDate = app.check_in_date || new Date().toISOString().split('T')[0]
                        setJoiningDate(joinDate)
                        const end = new Date(joinDate)
                        end.setMonth(end.getMonth() + 11) // standard 11 months pg agreement
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
        ) : (
          /* RESIDENTS TABLE */
          filteredResidents.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
              <Users size={38} className="mx-auto mb-3 text-gray-600" />
              <p className="font-semibold text-gray-300">No active residents found</p>
            </div>
          ) : (
            <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Resident</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student ID</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Room Allocation</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Stay Schedule</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
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
                        <td className="px-5 py-3.5 font-mono text-xs text-amber-500 whitespace-nowrap">
                          {res.student_id || '—'}
                        </td>
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
                          <div className="flex items-center gap-1.5"><Calendar size={11} className="text-gray-500" /> Join: {res.joining_date}</div>
                          <div className="flex items-center gap-1.5 mt-0.5"><Calendar size={11} className="text-gray-500" /> End: {res.agreement_end_date}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            res.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/10'
                          }`}>
                            {res.is_active ? 'Resident' : 'Checked Out'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {res.is_active ? (
                            <button
                              onClick={() => handleDeactivateResident(res.id, res.bed_id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded-lg text-xs font-bold text-red-400 transition-colors"
                            >
                              Checkout
                            </button>
                          ) : (
                            <span className="text-xs text-gray-600">Archived</span>
                          )}
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
                        {rooms.map(r => (
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
