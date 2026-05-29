'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { FolderOpen, Search, Eye, Download, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const GOLD = '#C8840A'

export default function AdminDocumentsPage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all')

  const loadData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, students(full_name, student_id)')
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
          verified: status,
          verified_at: status ? new Date().toISOString() : null,
          verified_by: status && session?.user ? session.user.id : null
        })
        .eq('id', docId)

      if (error) throw error
      toast.success(status ? 'Document verified and marked active!' : 'Document marked as unverified')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    }
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to reject and delete this document? This will remove the file from storage.')) return

    try {
      // Extract storage path
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
      toast.success('Document rejected and deleted successfully')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject document')
    }
  }

  const filteredDocs = documents.filter(doc => {
    const name = doc.students?.full_name?.toLowerCase() || ''
    const id = doc.students?.student_id?.toLowerCase() || ''
    const term = searchQuery.toLowerCase()

    const matchesSearch = name.includes(term) || id.includes(term)
    const matchesFilter = verificationFilter === 'all' || 
                          (verificationFilter === 'verified' && doc.verified) || 
                          (verificationFilter === 'pending' && !doc.verified)

    return matchesSearch && matchesFilter
  })

  const DOC_LABELS: Record<string, string> = {
    aadhar: 'Aadhaar Card',
    college_id: 'College ID Card',
    photo: 'Passport Photograph',
    agreement: 'Stay Agreement Contract',
    renewal_slip: 'Renewal Confirmation Slip',
    receipt: 'Payment Receipt',
    other: 'Other Supporting Document'
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
            <FolderOpen style={{ color: GOLD }} /> Student Document Audit
          </h1>
          <p className="text-sm text-gray-500 mt-1">Audit staying documents, verify Aadhaar/College identity cards, and reject invalid records</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            {(['all', 'pending', 'verified'] as const).map(f => (
              <button
                key={f}
                onClick={() => setVerificationFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  verificationFilter === f
                    ? 'bg-[#C8840A] text-[#F5A623] border-[#F5A623]/30'
                    : 'bg-[#0F1629] text-gray-400 border-white/5 hover:border-amber-500/20'
                }`}
              >
                {f === 'all' ? 'All Files' : f === 'pending' ? 'Pending Audit' : 'Verified Files'}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-80 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by student name or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-white/8 bg-[#0F1629] text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-[#0F1629] rounded-2xl border border-white/5">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1629] rounded-2xl border border-white/5 p-6">
            <FolderOpen size={38} className="mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-gray-300">No documents found</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Document Type</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">File Name</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Upload Date</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-white">{doc.students?.full_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{doc.students?.student_id || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-300 font-semibold">
                        {DOC_LABELS[doc.doc_type] || doc.doc_type}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-xs text-gray-300">
                        {doc.file_name || 'Unnamed Document'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {doc.uploaded_at?.split('T')[0]}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.verified 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {doc.verified ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {doc.verified ? 'Verified & Approved' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex justify-end items-center gap-2">
                          <a href={doc.file_url} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-all" title="View Document">
                            <Eye size={13} />
                          </a>
                          <a href={doc.file_url} download={doc.file_name || 'document'}
                            className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition-all" title="Download Document">
                            <Download size={13} />
                          </a>
                          
                          {!doc.verified ? (
                            <>
                              <button
                                onClick={() => handleVerify(doc.id, true)}
                                className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 font-bold text-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id, doc.file_url)}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleVerify(doc.id, false)}
                              className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 font-bold text-xs transition-colors"
                            >
                              Revoke Verification
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
