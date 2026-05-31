'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Eye, Trash2, MessageCircle, Download,
  ChevronLeft, ChevronRight, X, RefreshCw,
  Hash, User, Phone, Wallet, Bed, Calendar, Shield, Settings
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

interface PreRegistration {
  id: string
  application_id: string | null
  full_name: string
  phone: string
  email: string
  gender: string
  college_name: string
  course: string
  room_preference: string
  check_in_date: string
  parent_contact: string
  food_preference: string
  additional_notes: string | null
  status: 'new' | 'contacted' | 'otp_verified' | 'deposit_paid' | 'under_review' | 'room_allocated' | 'confirmed' | 'rejected'
  otp_verified: boolean
  deposit_status: 'pending' | 'paid' | 'waived' | 'failed'
  aadhar_url: string | null
  photo_url: string | null
  college_id_url: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = ['new', 'contacted', 'otp_verified', 'deposit_paid', 'under_review', 'room_allocated', 'confirmed', 'rejected']
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  new:            { bg: 'bg-blue-500/20',   text: 'text-blue-400',   label: 'New' },
  contacted:      { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Contacted' },
  otp_verified:   { bg: 'bg-teal-500/20',   text: 'text-teal-400',   label: 'OTP Verified' },
  deposit_paid:   { bg: 'bg-amber-500/20',  text: 'text-amber-400',  label: 'Deposit Paid' },
  under_review:   { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Under Review' },
  room_allocated: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'Room Allocated' },
  confirmed:      { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Confirmed' },
  rejected:       { bg: 'bg-red-500/20',    text: 'text-red-400',    label: 'Rejected' },
}

export default function RegistrationsPage() {
  const supabase = createClient()
  const [registrations, setRegistrations] = useState<PreRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [viewingReg, setViewingReg] = useState<PreRegistration | null>(null)
  const itemsPerPage = 10

  // Fetch registrations from pre_registrations table
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('pre_registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,phone.ilike.%${search}%,college_name.ilike.%${search}%,email.ilike.%${search}%`
        )
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase fetch error:', error)
        throw error
      }
      console.log('[Registrations] Fetched:', data?.length, 'rows')
      setRegistrations(data || [])
      setCurrentPage(1)
      setSelectedRows(new Set())
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
      toast.error('Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }, [supabase, search, statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRegistrations()
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [search, statusFilter, fetchRegistrations])

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return registrations.slice(start, start + itemsPerPage)
  }, [registrations, currentPage])

  const totalPages = Math.ceil(registrations.length / itemsPerPage)

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pre_registrations')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setRegistrations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: newStatus as any } : r))
      )
      toast.success('Status updated')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update status')
    }
  }

  // Handle deposit status change
  const handleDepositUpdate = async (id: string, newStatus: 'paid' | 'waived', amount?: number) => {
    try {
      const updates: any = { deposit_status: newStatus }
      // If setting to paid, automatically move main status to deposit_paid if it's currently earlier in the flow
      if (newStatus === 'paid') {
        const reg = registrations.find(r => r.id === id)
        if (reg && ['new', 'contacted', 'otp_verified'].includes(reg.status)) {
          updates.status = 'deposit_paid'
        }
      }
      
      const { error } = await supabase
        .from('pre_registrations')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setRegistrations(prev =>
        prev.map(r => (r.id === id ? { ...r, ...updates } : r))
      )
      if (viewingReg?.id === id) {
        setViewingReg(prev => prev ? { ...prev, ...updates } : null)
      }
      toast.success(`Deposit marked as ${newStatus}`)
    } catch (error) {
      console.error('Deposit update failed:', error)
      toast.error('Failed to update deposit status')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this registration?')) return
    try {
      const { error } = await supabase.from('pre_registrations').delete().eq('id', id)
      if (error) throw error
      setRegistrations(prev => prev.filter(r => r.id !== id))
      toast.success('Registration deleted')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete registration')
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return
    if (!window.confirm(`Delete ${selectedRows.size} registrations?`)) return
    try {
      const ids = Array.from(selectedRows)
      const { error } = await supabase.from('pre_registrations').delete().in('id', ids)
      if (error) throw error
      toast.success(`Deleted ${ids.length} registrations`)
      setSelectedRows(new Set())
      fetchRegistrations()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete registrations')
    }
  }

  // CSV Export
  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'Nationality', 'College', 'Course', 'Room Pref', 'Check-in', 'Parent Contact', 'Food Pref', 'Status', 'Notes', 'Registered']
    const rows = registrations.map(r => [
      r.full_name, r.phone, r.email, r.gender, r.college_name,
      r.course, r.room_preference, r.check_in_date || '',
      r.parent_contact, r.food_preference,
      STATUS_COLORS[r.status]?.label || r.status,
      r.additional_notes || '',
      new Date(r.created_at).toLocaleDateString('en-IN'),
    ])
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

  // WhatsApp
  const openWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
    const message = encodeURIComponent(
      `Hi ${name}, this is from MLV PG Services. We received your registration enquiry and would like to follow up.`
    )
    window.open(`https://wa.me/${number}?text=${message}`, '_blank')
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Registrations</h1>
          <p className="text-gray-400">Manage student registrations and follow-ups</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white focus:border-amber-500/50 focus:outline-none transition-all"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {STATUS_COLORS[s].label}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchRegistrations()}
            className="p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete ({selectedRows.size})
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={registrations.length === 0}
            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500">
          {loading ? 'Loading...' : `${registrations.length} registration${registrations.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
              <thead className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-b border-amber-500/15 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-5 text-left w-[40px] transition-colors hover:bg-white/[0.02]">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(paginatedData.map(r => r.id)))
                        } else {
                          setSelectedRows(new Set())
                        }
                      }}
                      className="cursor-pointer"
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        minWidth: '16px',
                        minHeight: '16px',
                        margin: 0, 
                        accentColor: '#f59e0b',
                        flexShrink: 0,
                        appearance: 'auto',
                        WebkitAppearance: 'auto'
                      }} 
                    />
                  </th>
                  
                  {/* APP ID */}
                  <th className="px-6 py-5 text-left text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Hash size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      App ID
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-left" />
                  </th>

                  {/* NAME */}
                  <th className="px-6 py-5 text-left text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Name
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-left" />
                  </th>

                  {/* PHONE (Centered) */}
                  <th className="px-6 py-5 text-center text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center justify-center gap-2">
                      <Phone size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Phone
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-center" />
                  </th>

                  {/* DEPOSIT (Centered) */}
                  <th className="px-6 py-5 text-center text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center justify-center gap-2">
                      <Wallet size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Deposit
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-center" />
                  </th>

                  {/* ROOM PREFERENCE (Left) */}
                  <th className="px-6 py-5 text-left text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Bed size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Room Preference
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-left" />
                  </th>

                  {/* CHECK-IN DATE (Left) */}
                  <th className="px-6 py-5 text-left text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Check-In Date
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-left" />
                  </th>

                  {/* STATUS (Centered) */}
                  <th className="px-6 py-5 text-center text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center justify-center gap-2">
                      <Shield size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Status
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-center" />
                  </th>

                  {/* ACTIONS (Right) */}
                  <th className="px-6 py-5 text-right text-[14px] font-bold tracking-[0.5px] text-white/85 uppercase whitespace-nowrap group/th cursor-pointer transition-all hover:text-white relative hover:bg-white/[0.02]">
                    <div className="flex items-center justify-end gap-2">
                      <Settings size={15} className="text-gray-500 group-hover/th:text-amber-400 transition-colors" />
                      Actions
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover/th:scale-x-100 transition-transform origin-right" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-700 border-t-amber-500 rounded-full animate-spin" />
                        Loading registrations...
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Search className="w-5 h-5 text-amber-500/50" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          {search || statusFilter !== 'all'
                            ? 'No registrations match your filters'
                            : 'No registrations found'}
                        </p>
                        {(search || statusFilter !== 'all') && (
                          <button
                            onClick={() => { setSearch(''); setStatusFilter('all') }}
                            className="text-xs text-amber-400 hover:text-amber-300 underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(reg => (
                    <tr
                      key={reg.id}
                      className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors group ${
                        selectedRows.has(reg.id) ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4 w-[40px] align-middle">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(reg.id)}
                          onChange={e => {
                            const newSet = new Set(selectedRows)
                            if (e.target.checked) newSet.add(reg.id)
                            else newSet.delete(reg.id)
                            setSelectedRows(newSet)
                          }}
                          className="cursor-pointer"
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            minWidth: '16px',
                            minHeight: '16px',
                            margin: 0, 
                            accentColor: '#f59e0b',
                            flexShrink: 0,
                            appearance: 'auto',
                            WebkitAppearance: 'auto'
                          }} 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono text-amber-400">{reg.application_id || '—'}</p>
                        {reg.otp_verified && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] uppercase font-bold rounded">
                            OTP ✓
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white font-medium">{reg.full_name}</p>
                        {reg.email && <p className="text-xs text-gray-500 mt-0.5">{reg.email}</p>}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-400 font-mono">{reg.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          reg.deposit_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          reg.deposit_status === 'waived' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {reg.deposit_status ? reg.deposit_status.toUpperCase() : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{reg.room_preference}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {reg.check_in_date
                          ? new Date(reg.check_in_date).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={reg.status}
                          onChange={e => handleStatusChange(reg.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[reg.status]?.bg || ''
                          } ${STATUS_COLORS[reg.status]?.text || ''} bg-transparent border border-current focus:outline-none cursor-pointer`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="bg-[#0F1629] text-white">
                              {STATUS_COLORS[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewingReg(reg)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openWhatsApp(reg.phone, reg.full_name)}
                            className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors text-gray-400 hover:text-green-400"
                            title="WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(reg.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, registrations.length)} of{' '}
                {registrations.length} registrations
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-amber-500/30 text-amber-400'
                          : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingReg && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingReg(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#0F1629] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/8">
                  <h2 className="text-white font-semibold text-lg">Registration Details</h2>
                  <button onClick={() => setViewingReg(null)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                  {[
                    { label: 'App ID',          value: viewingReg.application_id || '—' },
                    { label: 'Full Name',       value: viewingReg.full_name },
                    { label: 'Phone',           value: viewingReg.phone },
                    { label: 'Email',           value: viewingReg.email || '—' },
                    { label: 'OTP Verified',    value: viewingReg.otp_verified ? 'Yes ✅' : 'No ❌' },
                    { label: 'Nationality',     value: viewingReg.gender },
                    { label: 'College',         value: viewingReg.college_name },
                    { label: 'Course',          value: viewingReg.course || '—' },
                    { label: 'Room Pref',       value: viewingReg.room_preference },
                    { label: 'Check-in',        value: viewingReg.check_in_date ? new Date(viewingReg.check_in_date).toLocaleDateString('en-IN') : '—' },
                    { label: 'Parent Contact',  value: viewingReg.parent_contact },
                    { label: 'Food Pref',       value: viewingReg.food_preference },
                    { label: 'Notes',           value: viewingReg.additional_notes || '—' },
                    { label: 'Admin Notes',     value: viewingReg.admin_notes || '—' },
                    { label: 'Registered',      value: new Date(viewingReg.created_at).toLocaleString('en-IN') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4">
                      <span className="text-xs text-gray-500 uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
                      <span className="text-sm text-white">{value}</span>
                    </div>
                  ))}
                  <div className="flex gap-4 border-t border-white/10 pt-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider w-28 shrink-0 pt-1.5">Documents</span>
                    <div className="flex flex-col gap-2">
                      {viewingReg.aadhar_url ? <a href={viewingReg.aadhar_url} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline">Aadhar Card ↗</a> : <span className="text-sm text-gray-600">No Aadhar</span>}
                      {viewingReg.photo_url ? <a href={viewingReg.photo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline">Photo ↗</a> : <span className="text-sm text-gray-600">No Photo</span>}
                      {viewingReg.college_id_url ? <a href={viewingReg.college_id_url} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline">College ID ↗</a> : <span className="text-sm text-gray-600">No College ID</span>}
                    </div>
                  </div>
                  <div className="flex gap-4 border-t border-white/10 pt-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider w-28 shrink-0 pt-1.5">Deposit Status</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingReg.deposit_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        viewingReg.deposit_status === 'waived' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {viewingReg.deposit_status ? viewingReg.deposit_status.toUpperCase() : 'PENDING'}
                      </span>
                      {(!viewingReg.deposit_status || viewingReg.deposit_status === 'pending') && (
                        <div className="flex gap-2">
                          <button onClick={() => handleDepositUpdate(viewingReg.id, 'paid')} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30">Mark Paid</button>
                          <button onClick={() => handleDepositUpdate(viewingReg.id, 'waived')} className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded hover:bg-gray-500/30">Waive</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 border-t border-white/10 pt-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider w-28 shrink-0 pt-1.5">App Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[viewingReg.status]?.bg} ${STATUS_COLORS[viewingReg.status]?.text}`}>
                      {STATUS_COLORS[viewingReg.status]?.label || viewingReg.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 p-6 pt-3">
                  <button
                    onClick={() => openWhatsApp(viewingReg.phone, viewingReg.full_name)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl text-sm font-medium transition-colors border border-green-500/20"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button
                    onClick={() => setViewingReg(null)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

