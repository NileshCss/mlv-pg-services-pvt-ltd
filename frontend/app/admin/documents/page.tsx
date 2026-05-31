'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  FolderOpen, Search, Eye, Download, CheckCircle, Clock, Loader2, 
  Trash2, X, User, AlertTriangle, RefreshCw, Check, AlertCircle, 
  Building2, DoorOpen, Calendar, ChevronRight
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { MobileContainer } from '@/components/admin/responsive/MobileContainer'
import { ResponsiveTabs } from '@/components/admin/responsive/ResponsiveTabs'

const GOLD = '#F59E0B'

export default function AdminDocumentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Custom Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  
  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(25)

  // Drawer and Dialog States
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null)
  const [rejectionInput, setRejectionInput] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      // Query students as the primary source, joining their uploaded documents and room info
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          rooms (
            id,
            room_number,
            building_name
          ),
          documents (
            id,
            doc_type,
            file_url,
            file_name,
            status,
            verified,
            rejection_reason,
            uploaded_at
          )
        `)
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setStudents(data || [])
    } catch (err) {
      console.error('Error fetching students and documents:', err)
      toast.error('Failed to load documents vault')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  // Helper function to calculate a student's verification status
  const getStudentStatus = (student: any): 'verified' | 'pending' | 'rejected' => {
    const docs = student.documents || []
    if (docs.length === 0) return 'pending' // pending upload / review
    if (docs.some((d: any) => d.status === 'rejected')) return 'rejected'
    if (docs.some((d: any) => d.status === 'pending')) return 'pending'
    if (docs.every((d: any) => d.status === 'verified')) return 'verified'
    return 'pending'
  }

  // Single resident Actions
  const handleVerifyAll = async (studentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'verified',
          verified: true,
          verified_at: new Date().toISOString(),
          verified_by: session?.user?.id || null,
          rejection_reason: null
        })
        .eq('student_id', studentId)

      if (error) throw error
      toast.success('All resident documents verified successfully!')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Verification failed')
    }
  }

  const handleRevokeAll = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'pending',
          verified: false,
          verified_at: null,
          verified_by: null,
          rejection_reason: null
        })
        .eq('student_id', studentId)

      if (error) throw error
      toast.success('Verification status revoked successfully')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Revocation failed')
    }
  }

  const handleRejectAllSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingStudentId || !rejectionInput.trim()) return

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'rejected',
          verified: false,
          rejection_reason: rejectionInput.trim()
        })
        .eq('student_id', rejectingStudentId)

      if (error) throw error
      toast.success('Resident documents rejected.')
      setRejectingStudentId(null)
      setRejectionInput('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const handleDownloadAll = (student: any) => {
    const docs = student.documents || []
    if (docs.length === 0) {
      toast.error('No documents uploaded yet to download!')
      return
    }
    docs.forEach((d: any) => {
      if (d.file_url) window.open(d.file_url, '_blank')
    })
    toast.success(`Downloading ${docs.length} documents...`)
  }

  // Filter, Search, and Pagination Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const room = student.rooms || {}
      
      const studentName = student.full_name?.toLowerCase() || ''
      const studentId = student.student_id?.toLowerCase() || ''
      const building = room.building_name?.toLowerCase() || ''
      const roomNo = room.room_number?.toLowerCase() || ''
      const term = searchQuery.toLowerCase()

      const matchesSearch = 
        studentName.includes(term) || 
        studentId.includes(term) || 
        building.includes(term) || 
        roomNo.includes(term)

      const calcStatus = getStudentStatus(student)
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === calcStatus)

      return matchesSearch && matchesStatus
    })
  }, [students, searchQuery, statusFilter])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredStudents.slice(start, start + rowsPerPage)
  }, [filteredStudents, currentPage, rowsPerPage])

  // Statistics counters (Student-centric!)
  const stats = useMemo(() => {
    const total = students.length
    const pending = students.filter(s => getStudentStatus(s) === 'pending').length
    const verified = students.filter(s => getStudentStatus(s) === 'verified').length
    const rejected = students.filter(s => getStudentStatus(s) === 'rejected').length
    return { total, pending, verified, rejected }
  }, [students])

  const tabOptions = [
    { id: 'all', label: 'All Students' },
    { id: 'pending', label: 'Pending Verification' },
    { id: 'verified', label: 'Verified' },
    { id: 'rejected', label: 'Rejected' }
  ]

  const DOC_TYPES = [
    { key: 'aadhar', label: 'Aadhaar Card' },
    { key: 'college_id', label: 'College ID' },
    { key: 'photo', label: 'Passport Photo' },
    { key: 'agreement', label: 'Address Proof' }
  ]

  return (
    <DashboardLayout>
      <MobileContainer className="min-h-screen bg-[#0A0E1A] text-gray-100 pb-8 pt-1">
        <div className="space-y-2.5 max-w-5xl mx-auto">

          {/* Header */}
          <div className="pt-1 pb-2">
            <div className="flex items-center justify-between gap-3 pl-10 sm:pl-0">
              <h1 className="text-[24px] sm:text-[28px] font-bold text-white flex items-center gap-2 tracking-tight whitespace-nowrap">
                📁 Student Documents
              </h1>
              <button
                onClick={loadData}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 hover:border-amber-500/30 text-gray-400 hover:text-white transition-all text-[12px] font-semibold flex-shrink-0"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5 pl-10 sm:pl-0">
              Manage and verify resident documents.
            </p>
            {/* Mobile-only refresh button */}
            <button
              onClick={loadData}
              className="sm:hidden flex items-center gap-1.5 mt-1.5 ml-10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-[12px] font-semibold"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Statistics Section (compact cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3 py-2 flex flex-col justify-center h-[64px] shadow-sm">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Total Students</span>
              <span className="text-base font-bold text-white mt-0.5">{stats.total}</span>
            </div>
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3 py-2 flex flex-col justify-center h-[64px] shadow-sm">
              <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">Pending</span>
              <span className="text-base font-bold text-[#F59E0B] mt-0.5">{stats.pending}</span>
            </div>
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3 py-2 flex flex-col justify-center h-[64px] shadow-sm">
              <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider">Verified</span>
              <span className="text-base font-bold text-green-400 mt-0.5">{stats.verified}</span>
            </div>
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3 py-2 flex flex-col justify-center h-[64px] shadow-sm">
              <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">Rejected</span>
              <span className="text-base font-bold text-red-400 mt-0.5">{stats.rejected}</span>
            </div>
          </div>

          {/* Scrollable Segmented Tabs */}
          <div className="w-full flex items-center justify-start h-[34px] border-b border-white/5">
            <ResponsiveTabs
              options={tabOptions}
              activeId={statusFilter}
              onChange={(id) => {
                setStatusFilter(id)
                setCurrentPage(1)
              }}
              className="!h-[30px] !p-0.5"
            />
          </div>

          {/* Search & Rows-per-page */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search resident, student ID, room, building..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-8 pr-3 h-[34px] rounded-[10px] text-[13px] border border-white/10 bg-[#0A0E1A] text-white outline-none focus:border-amber-500/50 transition-colors placeholder:text-gray-600"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[12px] text-gray-500 font-medium hidden sm:inline">Show:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-[70px] h-[34px] rounded-[10px] border border-white/10 bg-[#0A0E1A] text-white text-[14px] font-medium outline-none focus:border-amber-500/50 px-2.5 cursor-pointer appearance-none transition-colors"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Loader or Empty state or Student Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-[#0F1629]/20 border border-white/5 rounded-xl">
              <Loader2 className="animate-spin text-amber-500" size={20} />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 bg-[#0F1629]/50 border border-white/5 rounded-xl p-4 max-w-sm mx-auto shadow-sm">
              <FolderOpen size={28} className="mx-auto mb-2 text-gray-600" />
              <p className="font-semibold text-gray-300 text-xs">No Students Found</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Documents uploaded by residents will appear here.</p>
              <button 
                onClick={loadData}
                className="mt-3 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Responsive Cards Stack (No Tables, No duplicates, One card per Student) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {paginatedStudents.map((student) => {
                  const room = student.rooms || {}
                  const docs = student.documents || []
                  const calcStatus = getStudentStatus(student)
                  
                  let badge = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  let badgeLabel = 'Pending Review'
                  if (calcStatus === 'verified') {
                    badge = 'bg-green-500/10 text-green-400 border border-green-500/20'
                    badgeLabel = 'Verified'
                  } else if (calcStatus === 'rejected') {
                    badge = 'bg-red-500/10 text-red-400 border border-red-500/20'
                    badgeLabel = 'Rejected'
                  }

                  return (
                    <div 
                      key={student.id}
                      className="bg-[#0F1629] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* 1. Header Section: Name, ID, Overall Status */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setIsDrawerOpen(true)
                            }}
                            className="text-left font-bold text-white hover:text-amber-500 hover:underline outline-none text-base truncate block"
                          >
                            {student.full_name || '—'}
                          </button>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{student.student_id || '—'}</p>
                        </div>
                        <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge}`}>
                          {badgeLabel.toUpperCase()}
                        </span>
                      </div>

                      {/* 2. Allocation Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2 text-gray-400">
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-bold tracking-wider">Placement</span>
                          <span className="text-gray-300 font-medium truncate block mt-0.5 flex items-center gap-1">
                            <Building2 size={10} className="text-gray-500" />
                            {room.building_name || 'Unassigned'} / {room.room_number ? `Room ${room.room_number}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-bold tracking-wider">Registration Date</span>
                          <span className="text-gray-300 block mt-0.5 font-mono flex items-center gap-1">
                            <Calendar size={10} className="text-gray-500" />
                            {student.joining_date || '—'}
                          </span>
                        </div>
                      </div>

                      {/* 3. Documents Checklist Section */}
                      <div className="border-t border-white/5 pt-2.5 space-y-2">
                        <span className="text-gray-600 block text-[9px] uppercase font-bold tracking-wider">Documents Checklist</span>
                        <div className="grid grid-cols-2 gap-2">
                          {DOC_TYPES.map((type) => {
                            const matchingDoc = docs.find((d: any) => d.doc_type === type.key)
                            let docStatus: 'verified' | 'pending' | 'rejected' | 'missing' = 'missing'
                            
                            if (matchingDoc) {
                              docStatus = matchingDoc.status || 'pending'
                            }

                            let docColor = 'text-gray-600'
                            let DocIcon = Clock
                            if (docStatus === 'verified') {
                              docColor = 'text-green-500'
                              DocIcon = Check
                            } else if (docStatus === 'rejected') {
                              docColor = 'text-red-500'
                              DocIcon = X
                            } else if (docStatus === 'pending') {
                              docColor = 'text-amber-500'
                              DocIcon = Clock
                            } else {
                              docColor = 'text-gray-600'
                              DocIcon = AlertCircle
                            }

                            return (
                              <div key={type.key} className="flex items-center justify-between p-1.5 rounded-lg bg-[#0A0E1A]/40 border border-white/5">
                                <span className="text-[10px] text-gray-300 font-semibold truncate max-w-[100px]">{type.label}</span>
                                <div className="flex items-center gap-1">
                                  {matchingDoc?.file_url ? (
                                    <a 
                                      href={matchingDoc.file_url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="p-0.5 rounded hover:bg-white/5 text-gray-500 hover:text-white"
                                      title={`View ${type.label}`}
                                    >
                                      <Eye size={10} />
                                    </a>
                                  ) : null}
                                  <DocIcon size={11} className={`${docColor} flex-shrink-0`} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* 4. Actions Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setIsDrawerOpen(true)
                            }}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-[10px] flex items-center gap-1 font-bold"
                            title="View Student Profile"
                          >
                            <User size={11} /> Profile
                          </button>
                          <button
                            onClick={() => handleDownloadAll(student)}
                            disabled={docs.length === 0}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-[10px] flex items-center gap-1 font-bold disabled:opacity-30"
                            title="Download All Files"
                          >
                            <Download size={11} /> Files
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {calcStatus !== 'verified' ? (
                            <button
                              onClick={() => handleVerifyAll(student.id)}
                              disabled={docs.length === 0}
                              className="px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] font-bold disabled:opacity-30 transition-colors"
                            >
                              Verify All
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRevokeAll(student.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-[10px] font-semibold transition-colors"
                            >
                              Revoke
                            </button>
                          )}

                          {calcStatus !== 'rejected' && (
                            <button
                              onClick={() => setRejectingStudentId(student.id)}
                              disabled={docs.length === 0}
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold disabled:opacity-30 transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>

              {/* Compact Pagination */}
              <div className="flex items-center justify-between text-[12px] text-gray-500 bg-[#0F1629]/40 border border-white/5 rounded-[10px] px-3 py-1.5">
                <span className="tabular-nums">
                  <span className="text-gray-300 font-medium">{(currentPage - 1) * rowsPerPage + 1}</span>
                  <span className="mx-0.5">–</span>
                  <span className="text-gray-300 font-medium">{Math.min(currentPage * rowsPerPage, filteredStudents.length)}</span>
                  <span className="mx-1">of</span>
                  <span className="text-gray-300 font-medium">{filteredStudents.length}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-0.5 rounded-md border border-white/5 bg-[#0A0E1A] hover:bg-white/5 hover:border-amber-500/30 text-gray-400 hover:text-white disabled:opacity-25 disabled:hover:bg-[#0A0E1A] disabled:hover:border-white/5 disabled:hover:text-gray-400 transition-all text-[11px] font-semibold"
                  >
                    ‹ Prev
                  </button>
                  <span className="w-6 text-center text-[12px] font-bold text-amber-500">{currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / rowsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredStudents.length / rowsPerPage) || filteredStudents.length === 0}
                    className="px-2 py-0.5 rounded-md border border-white/5 bg-[#0A0E1A] hover:bg-white/5 hover:border-amber-500/30 text-gray-400 hover:text-white disabled:opacity-25 disabled:hover:bg-[#0A0E1A] disabled:hover:border-white/5 disabled:hover:text-gray-400 transition-all text-[11px] font-semibold"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MobileContainer>

      {/* Slide-out Student Details Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[90vw] max-w-[440px] bg-[#0F1629] border-l border-white/10 z-[60] shadow-2xl p-4 overflow-y-auto text-gray-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <User style={{ color: GOLD }} size={15} />
                  <h3 className="text-sm font-bold font-serif text-white">Resident Profile</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Body Info */}
              <div className="space-y-5 text-xs">
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0A0E1A] flex-shrink-0 border border-white/10 flex items-center justify-center">
                    {selectedStudent.profile_photo_url ? (
                      <img src={selectedStudent.profile_photo_url} alt={selectedStudent.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white truncate">{selectedStudent.full_name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{selectedStudent.student_id || '—'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Contacts</span>
                  <div className="bg-[#0A0E1A]/80 rounded-xl p-3 space-y-2 border border-white/5">
                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="text-gray-300 font-semibold">{selectedStudent.email || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="text-gray-300 font-semibold">{selectedStudent.mobile || '—'}</span></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Stay & Allocation</span>
                  <div className="bg-[#0A0E1A]/80 rounded-xl p-3 space-y-2 border border-white/5">
                    <div className="flex justify-between"><span className="text-gray-500">Building:</span> <span className="text-gray-200 font-bold">{selectedStudent.rooms?.building_name || 'Unassigned'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Room:</span> <span className="text-gray-200 font-bold">{selectedStudent.rooms?.room_number ? `Room ${selectedStudent.rooms.room_number}` : '—'}</span></div>
                    <div className="flex justify-between pt-1.5 border-t border-white/5"><span className="text-gray-500">Joined:</span> <span className="text-gray-300">{selectedStudent.joining_date || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Agreement End:</span> <span className="text-gray-300">{selectedStudent.agreement_end_date || '—'}</span></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">All Uploaded Files</span>
                  <div className="space-y-1.5">
                    {(selectedStudent.documents || []).map((otherDoc: any) => {
                      const stat = otherDoc.status || 'pending'
                      let stClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      if (stat === 'verified') stClass = 'bg-green-500/10 text-green-400 border border-green-500/20'
                      else if (stat === 'rejected') stClass = 'bg-red-500/10 text-red-400 border border-red-500/20'

                      return (
                        <div key={otherDoc.id} className="bg-[#0A0E1A]/80 border border-white/5 rounded-lg p-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{otherDoc.file_name || otherDoc.doc_type}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">Uploaded on {otherDoc.uploaded_at?.split('T')[0]}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${stClass}`}>
                              {stat.toUpperCase()}
                            </span>
                            <a href={otherDoc.file_url} target="_blank" rel="noreferrer" className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300">
                              <Eye size={11} />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                    {(selectedStudent.documents || []).length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-2">No files uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for entering Rejection Reason */}
      <AnimatePresence>
        {rejectingStudentId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRejectingStudentId(null)
                setRejectionInput('')
              }}
              className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#0F1629] border border-white/10 rounded-2xl p-4.5 z-[60] text-gray-200 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3.5">
                <h3 className="text-xs font-bold text-white font-serif flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-500" /> Reject Documents
                </h3>
                <button
                  onClick={() => {
                    setRejectingStudentId(null)
                    setRejectionInput('')
                  }}
                  className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>

              <form onSubmit={handleRejectAllSubmit} className="space-y-3">
                <div>
                  <textarea
                    required
                    placeholder="Enter the rejection comment for this resident's documents..."
                    value={rejectionInput}
                    onChange={(e) => setRejectionInput(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-[#0A0E1A] text-white outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingStudentId(null)
                      setRejectionInput('')
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
