'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  FolderOpen, Search, Eye, Download, CheckCircle, Clock, Loader2, 
  Trash2, X, ChevronRight, ChevronDown, User, Layers, Info, Filter,
  Building2, DoorOpen, Calendar, AlertTriangle, RefreshCw
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { MobileContainer } from '@/components/admin/responsive/MobileContainer'
import { ResponsiveTabs } from '@/components/admin/responsive/ResponsiveTabs'

const GOLD = '#F59E0B'

export default function AdminDocumentsPage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Custom Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'expired'>('all')
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all')
  
  // Dynamic Grouping & Pagination
  const [selectedGroup, setSelectedGroup] = useState<'none' | 'building' | 'room' | 'student' | 'status'>('none')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(25)
  const [sortField, setSortField] = useState<string>('uploaded_at')
  const [sortAsc, setSortAsc] = useState(false)
  
  // Bulk Selection
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [submittingBulk, setSubmittingBulk] = useState(false)

  // Drawer & Detail View States
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Single Rejection State
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null)
  const [rejectionInput, setRejectionInput] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          students (
            id,
            full_name,
            student_id,
            mobile,
            email,
            joining_date,
            agreement_end_date,
            profile_photo_url,
            room_id,
            rooms (
              id,
              room_number,
              building_name
            )
          )
        `)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      console.error('Error fetching documents details:', err)
      toast.error('Failed to load documents vault log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  // Verification operations
  const handleVerify = async (docId: string, status: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const { error } = await supabase
        .from('documents')
        .update({
          status: status ? 'verified' : 'pending',
          verified: status,
          verified_at: status ? new Date().toISOString() : null,
          verified_by: status && session?.user ? session.user.id : null,
          rejection_reason: null
        })
        .eq('id', docId)

      if (error) throw error
      toast.success(status ? 'Document verified successfully!' : 'Verification revoked')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const handleSingleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingDocId || !rejectionInput.trim()) return

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'rejected',
          verified: false,
          rejection_reason: rejectionInput.trim()
        })
        .eq('id', rejectingDocId)

      if (error) throw error
      toast.success('Document marked as Rejected')
      setRejectingDocId(null)
      setRejectionInput('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject document')
    }
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to permanently delete this document record and file?')) return

    try {
      const pathParts = fileUrl.split('/student-documents/')
      if (pathParts.length > 1) {
        const storagePath = decodeURIComponent(pathParts[1])
        await supabase.storage.from('student-documents').remove([storagePath])
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error
      toast.success('Document deleted successfully')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document')
    }
  }

  // Bulk Operations
  const handleBulkVerify = async () => {
    if (selectedDocs.length === 0) return
    setSubmittingBulk(true)
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'verified',
          verified: true,
          verified_at: new Date().toISOString(),
          rejection_reason: null
        })
        .in('id', selectedDocs)

      if (error) throw error
      toast.success(`Successfully verified ${selectedDocs.length} documents!`)
      setSelectedDocs([])
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Bulk verification failed')
    } finally {
      setSubmittingBulk(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedDocs.length === 0) return
    const reason = prompt('Enter rejection reason for selected documents:')
    if (reason === null) return
    if (!reason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    setSubmittingBulk(true)
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'rejected',
          verified: false,
          rejection_reason: reason.trim()
        })
        .in('id', selectedDocs)

      if (error) throw error
      toast.success(`Successfully rejected ${selectedDocs.length} documents!`)
      setSelectedDocs([])
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Bulk rejection failed')
    } finally {
      setSubmittingBulk(false)
    }
  }

  const handleBulkDownload = () => {
    if (selectedDocs.length === 0) return
    selectedDocs.forEach(id => {
      const doc = documents.find(d => d.id === id)
      if (doc?.file_url) {
        window.open(doc.file_url, '_blank')
      }
    })
    toast.success(`Opening ${selectedDocs.length} files for download...`)
  }

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return
    if (!confirm(`Are you sure you want to permanently delete these ${selectedDocs.length} selected documents from the database?`)) return

    setSubmittingBulk(true)
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', selectedDocs)

      if (error) throw error
      toast.success(`Successfully deleted ${selectedDocs.length} documents!`)
      setSelectedDocs([])
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Bulk deletion failed')
    } finally {
      setSubmittingBulk(false)
    }
  }

  // Filter & Search Logic
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const student = doc.students || {}
      const room = student.rooms || {}
      
      const studentName = student.full_name?.toLowerCase() || ''
      const studentId = student.student_id?.toLowerCase() || ''
      const building = room.building_name?.toLowerCase() || ''
      const roomNo = room.room_number?.toLowerCase() || ''
      const docType = doc.doc_type?.toLowerCase() || ''
      const term = searchQuery.toLowerCase()

      const matchesSearch = 
        studentName.includes(term) || 
        studentId.includes(term) || 
        building.includes(term) || 
        roomNo.includes(term) || 
        docType.includes(term)

      // Tab Filtering
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'verified' && doc.status === 'verified') || 
        (statusFilter === 'pending' && doc.status === 'pending') || 
        (statusFilter === 'rejected' && doc.status === 'rejected') || 
        (statusFilter === 'expired' && doc.status === 'expired')

      // Dropdown type filter
      const matchesDocType = 
        docTypeFilter === 'all' || 
        doc.doc_type === docTypeFilter

      return matchesSearch && matchesStatus && matchesDocType
    }).sort((a, b) => {
      let fieldA = a[sortField]
      let fieldB = b[sortField]

      if (sortField === 'student_name') {
        fieldA = a.students?.full_name || ''
        fieldB = b.students?.full_name || ''
      } else if (sortField === 'student_id') {
        fieldA = a.students?.student_id || ''
        fieldB = b.students?.student_id || ''
      }

      if (fieldA < fieldB) return sortAsc ? -1 : 1
      if (fieldA > fieldB) return sortAsc ? 1 : -1
      return 0
    })
  }, [documents, searchQuery, statusFilter, docTypeFilter, sortField, sortAsc])

  // Flat Slice for current page
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredDocs.slice(start, start + rowsPerPage)
  }, [filteredDocs, currentPage, rowsPerPage])

  // Group rows based on chosen selector
  const groupedDocs = useMemo(() => {
    if (selectedGroup === 'none') {
      return { 'All Documents': paginatedDocs }
    }
    
    const grouped: Record<string, any[]> = {}
    paginatedDocs.forEach(doc => {
      let key = 'Unassigned'
      if (selectedGroup === 'building') {
        key = doc.students?.rooms?.building_name || 'Unassigned Building'
      } else if (selectedGroup === 'room') {
        key = doc.students?.rooms?.room_number ? `Room ${doc.students.rooms.room_number}` : 'Unassigned Room'
      } else if (selectedGroup === 'student') {
        key = doc.students?.full_name || 'Unknown Resident'
      } else if (selectedGroup === 'status') {
        const s = doc.status || 'pending'
        key = s.toUpperCase()
      }
      
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(doc)
    })
    return grouped
  }, [paginatedDocs, selectedGroup])

  // Statistics summaries
  const stats = useMemo(() => {
    const total = documents.length
    const pending = documents.filter(d => d.status === 'pending').length
    const verified = documents.filter(d => d.status === 'verified').length
    const rejected = documents.filter(d => d.status === 'rejected').length
    return { total, pending, verified, rejected }
  }, [documents])

  const DOC_LABELS: Record<string, string> = {
    aadhar: 'Aadhaar Card',
    college_id: 'College ID Card',
    photo: 'Passport Photo',
    agreement: 'Rental Contract',
    renewal_slip: 'Renewal Slip',
    receipt: 'Payment Receipt',
    other: 'Supporting File'
  }

  const tabOptions = [
    { id: 'all', label: 'All Documents' },
    { id: 'pending', label: 'Pending Audit' },
    { id: 'verified', label: 'Verified' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'expired', label: 'Expired' }
  ]

  const handleRowSelect = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (docsOnPage: any[]) => {
    const idsOnPage = docsOnPage.map(d => d.id)
    const allSelected = idsOnPage.every(id => selectedDocs.includes(id))
    if (allSelected) {
      setSelectedDocs(prev => prev.filter(id => !idsOnPage.includes(id)))
    } else {
      setSelectedDocs(prev => [...new Set([...prev, ...idsOnPage])])
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  // Quick lookup other uploaded documents for side drawer
  const getOtherStudentDocs = (studentId: string) => {
    return documents.filter(d => d.student_id === studentId)
  }

  return (
    <DashboardLayout>
      <MobileContainer className="min-h-screen bg-[#0A0E1A] text-gray-100 pb-12">
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-12 sm:pl-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3 font-serif">
                <FolderOpen style={{ color: GOLD }} size={24} /> Student Document Audit
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Review, verify and manage resident documents.
              </p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs font-semibold self-start sm:self-auto"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Reload Logs
            </button>
          </div>

          {/* Stats Summaries - Compact Rows */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F1629]/65 border border-white/5 rounded-xl p-3 flex flex-col justify-between h-[80px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-500">Total Documents</span>
              <span className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.total}</span>
            </div>
            <div className="bg-[#0F1629]/65 border border-white/5 rounded-xl p-3 flex flex-col justify-between h-[80px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-amber-500">Pending Verification</span>
              <span className="text-xl sm:text-2xl font-bold text-[#F59E0B] mt-1">{stats.pending}</span>
            </div>
            <div className="bg-[#0F1629]/65 border border-white/5 rounded-xl p-3 flex flex-col justify-between h-[80px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-green-500">Verified Documents</span>
              <span className="text-xl sm:text-2xl font-bold text-green-400 mt-1">{stats.verified}</span>
            </div>
            <div className="bg-[#0F1629]/65 border border-white/5 rounded-xl p-3 flex flex-col justify-between h-[80px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-red-500">Rejected Documents</span>
              <span className="text-xl sm:text-2xl font-bold text-red-400 mt-1">{stats.rejected}</span>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="w-full">
            <ResponsiveTabs
              options={tabOptions}
              activeId={statusFilter}
              onChange={(id) => {
                setStatusFilter(id)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Filters, Grouping and Search Block */}
          <div className="bg-[#0F1629]/40 border border-white/5 rounded-xl p-4 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Text Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search Name, ID, Room, Building..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border border-white/5 bg-[#0A0E1A] text-white outline-none focus:border-amber-500/40"
                />
              </div>

              {/* Document Type Dropdown */}
              <div>
                <select
                  value={docTypeFilter}
                  onChange={(e) => {
                    setDocTypeFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-white/5 bg-[#0A0E1A] text-white outline-none focus:border-amber-500/40"
                >
                  <option value="all">-- All Document Types --</option>
                  {Object.entries(DOC_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Grouping */}
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-gray-400 flex-shrink-0" />
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-white/5 bg-[#0A0E1A] text-white outline-none focus:border-amber-500/40"
                >
                  <option value="none">No Row Grouping</option>
                  <option value="building">Group by Building</option>
                  <option value="room">Group by Room</option>
                  <option value="student">Group by Resident</option>
                  <option value="status">Group by Status</option>
                </select>
              </div>

              {/* Rows Per Page */}
              <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                <span>Rows:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 rounded-lg border border-white/5 bg-[#0A0E1A] text-white text-xs outline-none focus:border-amber-500/40"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {selectedDocs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs"
              >
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Info size={14} /> Selected {selectedDocs.length} items
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleBulkVerify}
                    disabled={submittingBulk}
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold transition-all disabled:opacity-40"
                  >
                    Verify Selected
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={submittingBulk}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold transition-all disabled:opacity-40"
                  >
                    Reject Selected
                  </button>
                  <button
                    onClick={handleBulkDownload}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold transition-all"
                  >
                    Open Selected Files
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={submittingBulk}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 transition-all disabled:opacity-40"
                  >
                    Permanently Delete
                  </button>
                  <button
                    onClick={() => setSelectedDocs([])}
                    className="px-2 py-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main List Table */}
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-[#0F1629]/40 border border-white/5 rounded-2xl">
              <Loader2 className="animate-spin text-amber-500" size={24} />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1629]/40 border border-white/5 rounded-2xl p-6 max-w-md mx-auto">
              <FolderOpen size={36} className="mx-auto mb-3 text-gray-600" />
              <p className="font-semibold text-gray-300 text-sm">No matching documents found</p>
              <p className="text-xs text-gray-500 mt-1">Adjust search parameters or filter tab selection</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#0F1629] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/5">
                  <table className="w-full min-w-[1000px] table-auto text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                        {/* Checkbox */}
                        <th className="px-4 py-3 w-[45px] text-center">
                          <input
                            type="checkbox"
                            className="accent-amber-500 w-3.5 h-3.5 cursor-pointer rounded"
                            checked={
                              paginatedDocs.length > 0 &&
                              paginatedDocs.every(d => selectedDocs.includes(d.id))
                            }
                            onChange={() => handleSelectAll(paginatedDocs)}
                          />
                        </th>
                        {/* Sortable headers */}
                        {[
                          { label: 'Student ID', key: 'student_id' },
                          { label: 'Student Name', key: 'student_name' },
                          { label: 'Building', key: 'building' },
                          { label: 'Room', key: 'room' },
                          { label: 'Document Type', key: 'doc_type' },
                          { label: 'File Name', key: 'file_name' },
                          { label: 'Upload Date', key: 'uploaded_at' },
                          { label: 'Status', key: 'status' }
                        ].map(col => (
                          <th
                            key={col.key}
                            onClick={() => handleSort(col.key)}
                            className="px-4 py-3 font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/[0.03] select-none text-[10px] whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1">
                              {col.label}
                              {sortField === col.key && (
                                <span className="text-[8px] text-amber-500">
                                  {sortAsc ? '▲' : '▼'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-[10px] w-[140px] whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(groupedDocs).map(([groupTitle, docs]) => (
                        <React.Fragment key={groupTitle}>
                          {/* Group Header */}
                          {selectedGroup !== 'none' && (
                            <tr className="bg-white/[0.02] border-b border-white/5">
                              <td colSpan={10} className="px-4 py-2 font-serif font-bold text-amber-400 text-xs tracking-wide">
                                <div className="flex items-center gap-2">
                                  <Layers size={11} className="text-amber-500" />
                                  {groupTitle} <span className="text-[10px] font-mono text-gray-500 font-normal">({docs.length} documents)</span>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Rows */}
                          {docs.map((doc) => {
                            const isSelected = selectedDocs.includes(doc.id)
                            const student = doc.students || {}
                            const room = student.rooms || {}
                            
                            const statStr = doc.status || 'pending'
                            let badgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            if (statStr === 'verified') badgeClass = 'bg-green-500/10 text-green-400 border border-green-500/20'
                            else if (statStr === 'rejected') badgeClass = 'bg-red-500/10 text-red-400 border border-red-500/20'
                            else if (statStr === 'expired') badgeClass = 'bg-orange-500/10 text-orange-400 border border-orange-500/20'

                            return (
                              <tr 
                                key={doc.id} 
                                className={`hover:bg-white/[0.01] transition-colors ${isSelected ? 'bg-amber-500/[0.02]' : ''}`}
                              >
                                {/* Checkbox cell */}
                                <td className="px-4 py-2 text-center align-middle">
                                  <input
                                    type="checkbox"
                                    className="accent-amber-500 w-3.5 h-3.5 cursor-pointer rounded"
                                    checked={isSelected}
                                    onChange={() => handleRowSelect(doc.id)}
                                  />
                                </td>

                                {/* Student ID */}
                                <td className="px-4 py-2 whitespace-nowrap font-mono text-gray-400">
                                  {student.student_id || '—'}
                                </td>

                                {/* Student Name */}
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(student)
                                      setIsDrawerOpen(true)
                                    }}
                                    className="text-left font-bold text-amber-500 hover:text-amber-400 hover:underline transition-all outline-none"
                                  >
                                    {student.full_name || '—'}
                                  </button>
                                </td>

                                {/* Building */}
                                <td className="px-4 py-2 whitespace-nowrap text-gray-300">
                                  {room.building_name || 'Unassigned'}
                                </td>

                                {/* Room */}
                                <td className="px-4 py-2 whitespace-nowrap text-gray-300">
                                  {room.room_number ? `Room ${room.room_number}` : '—'}
                                </td>

                                {/* Document Type */}
                                <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-300">
                                  {DOC_LABELS[doc.doc_type] || doc.doc_type}
                                </td>

                                {/* Document Name */}
                                <td className="px-4 py-2 max-w-[200px] truncate text-gray-400" title={doc.file_name}>
                                  {doc.file_name || 'Unnamed Document'}
                                </td>

                                {/* Upload Date */}
                                <td className="px-4 py-2 whitespace-nowrap text-gray-400">
                                  {doc.uploaded_at?.split('T')[0]}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                                    {statStr === 'verified' && <CheckCircle size={9} />}
                                    {statStr === 'pending' && <Clock size={9} />}
                                    {statStr === 'rejected' && <X size={9} />}
                                    {statStr === 'expired' && <AlertTriangle size={9} />}
                                    {statStr.toUpperCase()}
                                  </span>
                                </td>

                                {/* Actions row */}
                                <td className="px-4 py-2 whitespace-nowrap text-right">
                                  <div className="flex justify-end items-center gap-1">
                                    <a 
                                      href={doc.file_url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors" 
                                      title="View File"
                                    >
                                      <Eye size={12} />
                                    </a>
                                    <a 
                                      href={doc.file_url} 
                                      download={doc.file_name || 'document'}
                                      className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors" 
                                      title="Download File"
                                    >
                                      <Download size={12} />
                                    </a>

                                    {/* Verification CTAs */}
                                    {statStr !== 'verified' ? (
                                      <button
                                        onClick={() => handleVerify(doc.id, true)}
                                        className="ml-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 font-bold text-[10px] transition-colors"
                                      >
                                        Verify
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleVerify(doc.id, false)}
                                        className="ml-1 px-1.5 py-0.5 rounded border border-white/10 hover:bg-white/5 text-gray-400 font-semibold text-[10px] transition-colors"
                                      >
                                        Revoke
                                      </button>
                                    )}

                                    {statStr !== 'rejected' && (
                                      <button
                                        onClick={() => setRejectingDocId(doc.id)}
                                        className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold text-[10px] transition-colors"
                                      >
                                        Reject
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDelete(doc.id, doc.file_url)}
                                      className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                      title="Delete Record"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table Pagination Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 mt-2 bg-[#0F1629]/40 border border-white/5 rounded-xl p-3.5">
                <div>
                  Showing <span className="font-semibold text-gray-300">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                  <span className="font-semibold text-gray-300">
                    {Math.min(currentPage * rowsPerPage, filteredDocs.length)}
                  </span>{' '}
                  of <span className="font-semibold text-gray-300">{filteredDocs.length}</span> documents
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-white/5 hover:bg-white/5 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all font-semibold"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredDocs.length / rowsPerPage) }).map((_, i) => {
                    const pageNo = i + 1
                    const isCurrent = pageNo === currentPage
                    return (
                      <button
                        key={pageNo}
                        onClick={() => setCurrentPage(pageNo)}
                        className={`w-6 h-6 rounded font-semibold transition-all ${
                          isCurrent 
                            ? 'bg-amber-500 text-black font-bold' 
                            : 'border border-white/5 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {pageNo}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDocs.length / rowsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredDocs.length / rowsPerPage)}
                    className="px-2.5 py-1 rounded border border-white/5 hover:bg-white/5 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all font-semibold"
                  >
                    Next
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
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />
            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[90vw] max-w-[460px] bg-[#0F1629] border-l border-white/10 z-[60] shadow-2xl p-5 overflow-y-auto text-gray-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <User style={{ color: GOLD }} size={16} />
                  <h3 className="text-base font-bold font-serif text-white">Resident Profile</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-6">
                {/* Profile Card Header */}
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0A0E1A] flex-shrink-0 border border-white/10 flex items-center justify-center">
                    {selectedStudent.profile_photo_url ? (
                      <img 
                        src={selectedStudent.profile_photo_url} 
                        alt={selectedStudent.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{selectedStudent.full_name}</h4>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedStudent.student_id || '—'}</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full mt-1.5">
                      Active Resident
                    </span>
                  </div>
                </div>

                {/* Account details */}
                <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Contact Information</h5>
                  <div className="bg-[#0A0E1A]/80 rounded-xl p-3 text-xs space-y-2 border border-white/5">
                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="text-gray-300 font-semibold">{selectedStudent.email || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="text-gray-300 font-semibold">{selectedStudent.mobile || '—'}</span></div>
                  </div>
                </div>

                {/* Stay Placement Details */}
                <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Room Allocation</h5>
                  <div className="bg-[#0A0E1A]/80 rounded-xl p-3 text-xs space-y-2 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1"><Building2 size={11} /> Building:</span> 
                      <span className="text-gray-300 font-bold">{selectedStudent.rooms?.building_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1"><DoorOpen size={11} /> Room Assigned:</span> 
                      <span className="text-gray-300 font-bold">{selectedStudent.rooms?.room_number ? `Room ${selectedStudent.rooms.room_number}` : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-gray-500 flex items-center gap-1"><Calendar size={11} /> Start Date:</span> 
                      <span className="text-gray-300">{selectedStudent.joining_date || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1"><Calendar size={11} /> Agreement End:</span> 
                      <span className="text-gray-300">{selectedStudent.agreement_end_date || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Document Checklist</h5>
                  <div className="space-y-2">
                    {getOtherStudentDocs(selectedStudent.id).map(otherDoc => {
                      const stat = otherDoc.status || 'pending'
                      let stClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      if (stat === 'verified') stClass = 'bg-green-500/10 text-green-400 border border-green-500/20'
                      else if (stat === 'rejected') stClass = 'bg-red-500/10 text-red-400 border border-red-500/20'

                      return (
                        <div 
                          key={otherDoc.id} 
                          className="bg-[#0A0E1A]/80 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{DOC_LABELS[otherDoc.doc_type] || otherDoc.doc_type}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]">{otherDoc.file_name}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${stClass}`}>
                              {stat.toUpperCase()}
                            </span>
                            <a 
                              href={otherDoc.file_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                            >
                              <Eye size={12} />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                    {getOtherStudentDocs(selectedStudent.id).length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-2">No uploaded files on record.</p>
                    )}
                  </div>
                </div>

                {/* Audit logs / Verification History */}
                <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Audit Log History</h5>
                  <div className="bg-[#0A0E1A]/80 border border-white/5 rounded-xl p-3.5 text-xs space-y-3">
                    {getOtherStudentDocs(selectedStudent.id).map(otherDoc => {
                      if (otherDoc.status === 'verified') {
                        return (
                          <div key={otherDoc.id} className="border-l-2 border-green-500 pl-2.5 py-0.5">
                            <p className="font-semibold text-gray-300">Verified: {DOC_LABELS[otherDoc.doc_type] || otherDoc.doc_type}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Approved on {otherDoc.verified_at?.split('T')[0] || 'N/A'}</p>
                          </div>
                        )
                      } else if (otherDoc.status === 'rejected') {
                        return (
                          <div key={otherDoc.id} className="border-l-2 border-red-500 pl-2.5 py-0.5">
                            <p className="font-semibold text-gray-300">Rejected: {DOC_LABELS[otherDoc.doc_type] || otherDoc.doc_type}</p>
                            <p className="text-[10px] text-red-300 mt-0.5">Reason: "{otherDoc.rejection_reason || 'No comments'}"</p>
                          </div>
                        )
                      }
                      return null
                    })}
                    {!getOtherStudentDocs(selectedStudent.id).some(d => d.status === 'verified' || d.status === 'rejected') && (
                      <p className="text-xs text-gray-500 text-center py-2">No verification logs recorded yet.</p>
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
        {rejectingDocId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRejectingDocId(null)
                setRejectionInput('')
              }}
              className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0F1629] border border-white/10 rounded-2xl p-5 z-[60] text-gray-200 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-red-500" /> Reject Document
                </h3>
                <button
                  onClick={() => {
                    setRejectingDocId(null)
                    setRejectionInput('')
                  }}
                  className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSingleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Rejection Reason</label>
                  <textarea
                    required
                    placeholder="Enter the reason why this Aadhaar or College ID is being rejected..."
                    value={rejectionInput}
                    onChange={(e) => setRejectionInput(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-white/10 bg-[#0A0E1A] text-white outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingDocId(null)
                      setRejectionInput('')
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_2px_10px_rgba(239,68,68,0.2)]"
                  >
                    Confirm Rejection
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
