'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  FolderOpen, Search, Eye, Download, CheckCircle, Clock, Loader2, 
  Trash2, X, User, Layers, Info, AlertTriangle, RefreshCw
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all')
  
  // Sorting, Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(25)
  const [sortField, setSortField] = useState<string>('uploaded_at')
  const [sortAsc, setSortAsc] = useState(false)
  
  // Drawer and Dialog States
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
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
    if (!confirm('Are you sure you want to permanently delete this document?')) return

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

  // Filter & Search logic
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

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'verified' && doc.status === 'verified') || 
        (statusFilter === 'pending' && doc.status === 'pending') || 
        (statusFilter === 'rejected' && doc.status === 'rejected')

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

  // Statistics summaries (Compact heights)
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
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
    { id: 'rejected', label: 'Rejected' }
  ]

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const getOtherStudentDocs = (studentId: string) => {
    return documents.filter(d => d.student_id === studentId)
  }

  return (
    <DashboardLayout>
      <MobileContainer className="min-h-screen bg-[#0A0E1A] text-gray-100 pb-8 pt-4">
        <div className="space-y-4 max-w-7xl mx-auto">
          
          {/* Header (Reduced height, tight padding) */}
          <div className="flex items-center justify-between pl-12 sm:pl-0 border-b border-white/5 pb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-serif tracking-tight">
                <FolderOpen style={{ color: GOLD }} size={20} /> Student Documents
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Manage and verify resident documents.
              </p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all text-[11px] font-semibold"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Statistics Section (80px high compact cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3.5 py-2.5 flex flex-col justify-center h-[80px] shadow-sm relative overflow-hidden">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Total Documents</span>
              <span className="text-xl font-bold text-white mt-0.5 font-mono">{stats.total}</span>
            </div>
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3.5 py-2.5 flex flex-col justify-center h-[80px] shadow-sm relative overflow-hidden">
              <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">Pending</span>
              <span className="text-xl font-bold text-[#F59E0B] mt-0.5 font-mono">{stats.pending}</span>
            </div>
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3.5 py-2.5 flex flex-col justify-center h-[80px] shadow-sm relative overflow-hidden">
              <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider">Verified</span>
              <span className="text-xl font-bold text-green-400 mt-0.5 font-mono">{stats.verified}</span>
            </div>
            <div className="bg-[#0F1629]/75 border border-white/5 rounded-xl px-3.5 py-2.5 flex flex-col justify-center h-[80px] shadow-sm relative overflow-hidden">
              <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">Rejected</span>
              <span className="text-xl font-bold text-red-400 mt-0.5 font-mono">{stats.rejected}</span>
            </div>
          </div>

          {/* Segmented Scrollable Tabs (38px High) */}
          <div className="w-full flex items-center justify-start h-[38px] border-b border-white/5 pb-1">
            <ResponsiveTabs
              options={tabOptions}
              activeId={statusFilter}
              onChange={(id) => {
                setStatusFilter(id)
                setCurrentPage(1)
              }}
              className="!h-[34px] !p-0.5"
            />
          </div>

          {/* Compact Unified Filters Block (Search | Type | Rows) */}
          <div className="bg-[#0F1629]/30 border border-white/5 rounded-xl p-2.5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-2 justify-between items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-full md:max-w-md">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search student, room, type..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[11px] border border-white/5 bg-[#0A0E1A] text-white outline-none focus:border-amber-500/40"
                />
              </div>

              {/* Type and Rows Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={docTypeFilter}
                  onChange={(e) => {
                    setDocTypeFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] border border-white/5 bg-[#0A0E1A] text-white outline-none focus:border-amber-500/40"
                >
                  <option value="all">All Document Types</option>
                  {Object.entries(DOC_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span>Show:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-1.5 py-1.5 rounded-lg border border-white/5 bg-[#0A0E1A] text-white text-[11px] outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loader or Empty State or Document List */}
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-[#0F1629]/20 border border-white/5 rounded-xl">
              <Loader2 className="animate-spin text-amber-500" size={20} />
            </div>
          ) : filteredDocs.length === 0 ? (
            /* Compact Empty State card */
            <div className="text-center py-8 bg-[#0F1629]/50 border border-white/5 rounded-xl p-4 max-w-sm mx-auto shadow-sm">
              <FolderOpen size={28} className="mx-auto mb-2 text-gray-600" />
              <p className="font-semibold text-gray-300 text-xs">No Documents Found</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Documents uploaded by residents will appear here.</p>
              <button 
                onClick={loadData}
                className="mt-3.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold transition-all"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* DESKTOP VIEW (>=768px): Clean ERP Table */}
              <div className="hidden md:block bg-[#0F1629] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full table-auto text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                      {['Student', 'Building', 'Room', 'Document', 'Status', 'Uploaded Date', 'Actions'].map((h, i) => (
                        <th 
                          key={i} 
                          onClick={() => h === 'Student' && handleSort('student_name')}
                          className={`px-4 py-2 font-semibold uppercase tracking-wider text-[10px] select-none ${h === 'Student' ? 'cursor-pointer hover:bg-white/[0.03]' : ''} ${h === 'Actions' ? 'text-right' : ''}`}
                        >
                          {h} {h === 'Student' && sortField === 'student_name' && (sortAsc ? '▲' : '▼')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedDocs.map((doc) => {
                      const student = doc.students || {}
                      const room = student.rooms || {}
                      const statStr = doc.status || 'pending'
                      
                      let badge = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      if (statStr === 'verified') badge = 'bg-green-500/10 text-green-400 border border-green-500/20'
                      else if (statStr === 'rejected') badge = 'bg-red-500/10 text-red-400 border border-red-500/20'

                      return (
                        <tr key={doc.id} className="hover:bg-white/[0.01] transition-colors">
                          {/* Student */}
                          <td className="px-4 py-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsDrawerOpen(true)
                              }}
                              className="text-left font-bold text-amber-500 hover:underline outline-none"
                            >
                              {student.full_name || '—'}
                            </button>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{student.student_id || '—'}</p>
                          </td>

                          {/* Building */}
                          <td className="px-4 py-2 whitespace-nowrap text-gray-300">
                            {room.building_name || 'Unassigned'}
                          </td>

                          {/* Room */}
                          <td className="px-4 py-2 whitespace-nowrap text-gray-300">
                            {room.room_number ? `Room ${room.room_number}` : '—'}
                          </td>

                          {/* Document */}
                          <td className="px-4 py-2">
                            <span className="font-semibold text-gray-200 block">{DOC_LABELS[doc.doc_type] || doc.doc_type}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[160px] block mt-0.5">{doc.file_name}</span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                              {statStr.toUpperCase()}
                            </span>
                          </td>

                          {/* Upload Date */}
                          <td className="px-4 py-2 whitespace-nowrap text-gray-400">
                            {doc.uploaded_at?.split('T')[0]}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2 whitespace-nowrap text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white" title="View">
                                <Eye size={12} />
                              </a>
                              <a href={doc.file_url} download={doc.file_name || 'document'} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white" title="Download">
                                <Download size={12} />
                              </a>

                              {statStr !== 'verified' ? (
                                <button
                                  onClick={() => handleVerify(doc.id, true)}
                                  className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 font-bold text-[10px]"
                                >
                                  Verify
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerify(doc.id, false)}
                                  className="px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 text-gray-400 font-semibold text-[10px]"
                                >
                                  Revoke
                                </button>
                              )}

                              {statStr !== 'rejected' && (
                                <button
                                  onClick={() => setRejectingDocId(doc.id)}
                                  className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold text-[10px]"
                                >
                                  Reject
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(doc.id, doc.file_url)}
                                className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW (<768px): Compact ERP List Cards (No scroll table) */}
              <div className="md:hidden space-y-2.5">
                {paginatedDocs.map((doc) => {
                  const student = doc.students || {}
                  const room = student.rooms || {}
                  const statStr = doc.status || 'pending'
                  
                  let badge = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  if (statStr === 'verified') badge = 'bg-green-500/10 text-green-400 border border-green-500/20'
                  else if (statStr === 'rejected') badge = 'bg-red-500/10 text-red-400 border border-red-500/20'

                  return (
                    <div 
                      key={doc.id}
                      className="bg-[#0F1629] border border-white/5 rounded-xl p-3.5 space-y-2.5 shadow-sm"
                    >
                      {/* Name & ID Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setIsDrawerOpen(true)
                            }}
                            className="text-left font-bold text-amber-500 hover:underline outline-none text-sm"
                          >
                            {student.full_name || '—'}
                          </button>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{student.student_id || '—'}</p>
                        </div>
                        <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                          {statStr.toUpperCase()}
                        </span>
                      </div>

                      {/* Location details */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2 text-gray-400">
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-bold">Allocation</span>
                          <span className="text-gray-300 font-medium truncate block mt-0.5">
                            {room.building_name || 'Unassigned'} / {room.room_number ? `Rm ${room.room_number}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-bold">Document Type</span>
                          <span className="text-gray-200 font-semibold truncate block mt-0.5">
                            {DOC_LABELS[doc.doc_type] || doc.doc_type}
                          </span>
                        </div>
                      </div>

                      {/* Footer dates & actions */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-white/5 gap-2">
                        <span className="text-[10px] text-gray-500">{doc.uploaded_at?.split('T')[0]}</span>
                        <div className="flex items-center gap-1.5">
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white" title="View">
                            <Eye size={13} />
                          </a>
                          <a href={doc.file_url} download={doc.file_name || 'document'} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white" title="Download">
                            <Download size={13} />
                          </a>
                          
                          {statStr !== 'verified' ? (
                            <button
                              onClick={() => handleVerify(doc.id, true)}
                              className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold"
                            >
                              Verify
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerify(doc.id, false)}
                              className="px-2 py-1 rounded border border-white/10 text-gray-400 text-[10px] font-semibold"
                            >
                              Revoke
                            </button>
                          )}

                          {statStr !== 'rejected' && (
                            <button
                              onClick={() => setRejectingDocId(doc.id)}
                              className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold"
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

              {/* Compact ERP Pagination controls */}
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3 bg-[#0F1629]/40 border border-white/5 rounded-xl p-2.5 shadow-sm">
                <div>
                  Showing <span className="font-semibold text-gray-300">{(currentPage - 1) * rowsPerPage + 1}</span>-
                  <span className="font-semibold text-gray-300">{Math.min(currentPage * rowsPerPage, filteredDocs.length)}</span> of{' '}
                  <span className="font-semibold text-gray-300">{filteredDocs.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-white/5 bg-[#0A0E1A] hover:bg-white/5 text-gray-300 disabled:opacity-30 disabled:hover:bg-[#0A0E1A] transition-all font-semibold"
                  >
                    ← Previous
                  </button>
                  <span className="px-2 py-1 font-bold text-amber-500 font-mono">{currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDocs.length / rowsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredDocs.length / rowsPerPage) || filteredDocs.length === 0}
                    className="px-2.5 py-1 rounded border border-white/5 bg-[#0A0E1A] hover:bg-white/5 text-gray-300 disabled:opacity-30 disabled:hover:bg-[#0A0E1A] transition-all font-semibold"
                  >
                    Next →
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
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">All Documents</span>
                  <div className="space-y-1.5">
                    {getOtherStudentDocs(selectedStudent.id).map(otherDoc => {
                      const stat = otherDoc.status || 'pending'
                      let stClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      if (stat === 'verified') stClass = 'bg-green-500/10 text-green-400 border border-green-500/20'
                      else if (stat === 'rejected') stClass = 'bg-red-500/10 text-red-400 border border-red-500/20'

                      return (
                        <div key={otherDoc.id} className="bg-[#0A0E1A]/80 border border-white/5 rounded-lg p-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{DOC_LABELS[otherDoc.doc_type] || otherDoc.doc_type}</p>
                            <p className="text-[9px] text-gray-500 truncate max-w-[160px]">{otherDoc.file_name}</p>
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#0F1629] border border-white/10 rounded-2xl p-4.5 z-[60] text-gray-200 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3.5">
                <h3 className="text-xs font-bold text-white font-serif flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-500" /> Reject Document
                </h3>
                <button
                  onClick={() => {
                    setRejectingDocId(null)
                    setRejectionInput('')
                  }}
                  className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>

              <form onSubmit={handleSingleRejectSubmit} className="space-y-3">
                <div>
                  <textarea
                    required
                    placeholder="Enter the rejection comment..."
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
                      setRejectingDocId(null)
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
