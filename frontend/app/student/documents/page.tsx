'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FolderOpen, FileText, CheckCircle, Clock, AlertCircle, Download, Upload, Eye, Loader2, Plus, Trash2, X } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/student/layout/StudentDashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { StudentDocument, DocType } from '@/types/student'

const GOLD = '#C9A84C'
const GOLD_LIGHT = 'rgba(201,168,76,0.1)'
const GOLD_BORDER = 'rgba(201,168,76,0.25)'

const DOC_TYPE_DETAILS: Record<DocType, { label: string; description: string; required: boolean }> = {
  aadhar: { label: 'Aadhaar Card', description: 'Government-issued identity & address proof', required: true },
  college_id: { label: 'College ID', description: 'College ID card or admission confirmation slip', required: true },
  photo: { label: 'Profile Photo', description: 'Recent passport-size color photograph', required: true },
  agreement: { label: 'Rental Agreement', description: 'Signed PG staying rental agreement document', required: false },
  receipt: { label: 'Payment Receipt', description: 'Fee payment receipt or deposit slip', required: false },
  renewal_slip: { label: 'Renewal Slip', description: 'Stay renewal conformation document', required: false },
  other: { label: 'Other Document', description: 'Any other supporting documents', required: false }
}

const STATUS_CONFIG = {
  verified: { label: 'Verified', color: '#27AE60', bg: 'rgba(46,204,113,0.1)', icon: CheckCircle },
  pending: { label: 'Pending Verification', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  missing: { label: 'Missing', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle }
}

export default function DocumentsPage() {
  const supabase = createClient()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<StudentDocument[]>([])
  const [loading, setLoading] = useState(true)
  
  // Upload modal states
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<DocType>('aadhar')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const loadDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      
      const { data: student } = await supabase
        .from('students')
        .select('id, profile_photo_url')
        .eq('user_id', session.user.id)
        .single()
        
      if (!student) return
      setStudentId(student.id)

      // Fetch documents
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('student_id', student.id)
        .order('uploaded_at', { ascending: false })

      setDocuments(docs || [])
    } catch (err) {
      console.error('Error loading documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const timestamp = Date.now()
      const storagePath = `${studentId}/${uploadType}_${timestamp}.${fileExt}`

      // 1. Upload to Supabase Storage in 'student-documents' bucket
      const { error: uploadError, data } = await supabase.storage
        .from('student-documents')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-documents')
        .getPublicUrl(storagePath)

      // 2. Insert record in 'documents' table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          student_id: studentId,
          doc_type: uploadType,
          file_url: publicUrl,
          file_name: selectedFile.name,
          verified: false,
          uploaded_by: 'student',
          uploaded_at: new Date().toISOString()
        })

      if (dbError) {
        throw new Error(`Database record creation failed: ${dbError.message}`)
      }

      toast.success('Document uploaded successfully!')
      setUploadOpen(false)
      setSelectedFile(null)
      loadDocuments()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // Extract storage path from fileUrl
      // Usually publicUrl is https://[project-url]/storage/v1/object/public/student-documents/[path]
      const pathParts = fileUrl.split('/student-documents/')
      if (pathParts.length > 1) {
        const storagePath = decodeURIComponent(pathParts[1])
        await supabase.storage.from('student-documents').remove([storagePath])
      }

      // Delete database record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error

      toast.success('Document deleted successfully')
      loadDocuments()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document')
    }
  }

  // Get current document for a specific type (e.g. latest uploaded Aadhaar)
  const getDocumentByType = (type: DocType) => {
    return documents.find(d => d.doc_type === type)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <StudentDashboardLayout title="Document Vault">
      <div className="space-y-6">
        
        {/* Intro Banner */}
        <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: GOLD_LIGHT, border: `1px solid ${GOLD_BORDER}` }}>
              <FolderOpen size={22} style={{ color: GOLD }} />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                Your Document Vault
              </h2>
              <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                Manage all your personal records, identity proofs, and rent agreements in one secure place. 
                Required files marked as <span className="font-semibold text-red-500">Missing</span> must be uploaded for verification by the PG administration.
              </p>
            </div>
          </div>
        </div>

        {/* Required Documents Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              Required Documents
            </h3>
            <button
              onClick={() => { setUploadType('aadhar'); setUploadOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96B)', color: '#1A1A2E', boxShadow: '0 2px 8px rgba(201,168,76,0.2)' }}
            >
              <Plus size={14} /> Upload Custom File
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 h-40 animate-pulse border border-[#EBEBF0]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['aadhar', 'college_id', 'photo'] as DocType[]).map((type) => {
                const doc = getDocumentByType(type)
                const details = DOC_TYPE_DETAILS[type]
                
                let status: 'verified' | 'pending' | 'missing' = 'missing'
                if (doc) {
                  status = doc.verified ? 'verified' : 'pending'
                }
                
                const cfg = STATUS_CONFIG[status]
                const StatusIcon = cfg.icon

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 flex flex-col justify-between"
                    style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{details.label}</h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{details.description}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-red-500 bg-red-50 flex-shrink-0">
                          Required
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon size={12} /> {cfg.label}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EEE8] flex items-center justify-between gap-2">
                      {doc ? (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 truncate">{doc.file_name}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{fmtDate(doc.uploaded_at)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a href={doc.file_url} target="_blank" rel="noreferrer"
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="View Document"
                              style={{ color: '#4A4A6A' }}>
                              <Eye size={15} />
                            </a>
                            <a href={doc.file_url} download={doc.file_name || 'document'}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Download Document"
                              style={{ color: '#4A4A6A' }}>
                              <Download size={15} />
                            </a>
                            {!doc.verified && (
                              <button onClick={() => handleDelete(doc.id, doc.file_url)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete Document">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => { setUploadType(type); setUploadOpen(true); }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border"
                          style={{ borderColor: GOLD, color: GOLD, background: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = GOLD_LIGHT }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <Upload size={13} /> Upload Document
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* All Documents Vault / List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #EBEBF0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
        >
          <div className="px-5 py-4 border-b border-[#F0EEE8] flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
              All Uploaded Documents & Receipts
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {documents.length} item{documents.length !== 1 ? 's' : ''} total
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" size={24} style={{ color: GOLD }} />
              <p className="text-sm text-gray-400">Loading document list…</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpen size={42} className="mx-auto mb-3" style={{ color: '#D4D4E0' }} />
              <p className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>No files found</p>
              <p className="text-xs text-gray-400 mt-1">Required registration documents will appear here once uploaded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: '#FDFBF7' }}>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Details</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Verification</th>
                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EEE8]">
                  {documents.map((doc) => {
                    const typeDetails = DOC_TYPE_DETAILS[doc.doc_type] || { label: doc.doc_type, required: false }
                    const isVerified = doc.verified

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50/55 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                              <FileText size={16} style={{ color: GOLD }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate text-[#1A1A2E]">{doc.file_name || 'Unnamed Document'}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">Uploaded by {doc.uploaded_by}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: '#F5F5FA', color: '#4A4A6A' }}>
                            {typeDetails.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {fmtDate(doc.uploaded_at)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ 
                              background: isVerified ? 'rgba(46,204,113,0.1)' : 'rgba(245,158,11,0.1)', 
                              color: isVerified ? '#27AE60' : '#F59E0B' 
                            }}>
                            {isVerified ? <CheckCircle size={10} /> : <Clock size={10} />}
                            {isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-1">
                            <a href={doc.file_url} target="_blank" rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-lg transition-all" title="View document">
                              <Eye size={15} />
                            </a>
                            <a href={doc.file_url} download={doc.file_name || 'document'}
                              className="p-1.5 text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-lg transition-all" title="Download document">
                              <Download size={15} />
                            </a>
                            {!isVerified && (
                              <button onClick={() => handleDelete(doc.id, doc.file_url)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete document">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !uploading && setUploadOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative"
                style={{ border: '1px solid #EBEBF0' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair), serif', color: '#1A1A2E' }}>
                    Upload Document
                  </h3>
                  <button 
                    onClick={() => !uploading && setUploadOpen(false)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    disabled={uploading}
                  >
                    <X size={18} style={{ color: '#8A8AA0' }} />
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {/* Select Doc Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Document Type</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as DocType)}
                      disabled={uploading}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border border-[#EBEBF0] bg-[#FAFAFA] outline-none transition-all focus:border-[#C9A84C]"
                    >
                      {Object.entries(DOC_TYPE_DETAILS).map(([val, det]) => (
                        <option key={val} value={val}>
                          {det.label} {det.required ? '(Required)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File Selector Dropzone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Select File</label>
                    <div 
                      className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
                      style={{ 
                        borderColor: selectedFile ? GOLD : '#EBEBF0',
                        background: selectedFile ? GOLD_LIGHT : '#FAFAFA'
                      }}
                      onClick={() => !uploading && document.getElementById('file-input')?.click()}
                    >
                      <input 
                        type="file" 
                        id="file-input" 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      
                      {selectedFile ? (
                        <div className="space-y-2">
                          <FileText className="mx-auto" style={{ color: GOLD }} size={32} />
                          <p className="text-sm font-bold truncate text-[#1A1A2E]" style={{ maxWidth: '280px' }}>
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-gray-400" size={32} />
                          <p className="text-sm font-semibold text-[#1A1A2E]">Drag & drop or click to choose</p>
                          <p className="text-xs text-gray-400">Supports PDF, PNG, JPG or JPEG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ 
                        background: uploading || !selectedFile ? '#EBEBF0' : 'linear-gradient(135deg, #C9A84C, #E8C96B)', 
                        color: uploading || !selectedFile ? '#8A8AA0' : '#1A1A2E',
                        boxShadow: uploading || !selectedFile ? 'none' : '0 4px 12px rgba(201,168,76,0.25)' 
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Uploading Document…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Submit to Vault
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </StudentDashboardLayout>
  )
}
