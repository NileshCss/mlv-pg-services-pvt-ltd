'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { Star, Edit2, Trash2, Check, X, Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

interface Testimonial {
  id: string
  student_name: string
  college?: string
  rating: number
  review: string
  photo_url?: string
  storage_path?: string
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  created_at: string
  updated_at: string
}

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approved' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' },
}

export default function TestimonialsPage() {
  const supabase = createClient()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    studentName: '',
    college: '',
    rating: 5,
    review: '',
  })

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentName.trim() || !formData.review.trim()) {
      toast.error('Name and review are required')
      return
    }

    try {
      if (editingTestimonial) {
        // Update
        const { error } = await supabase
          .from('testimonials')
          .update({
            student_name: formData.studentName,
            college: formData.college,
            rating: formData.rating,
            review: formData.review,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTestimonial.id)

        if (error) throw error

        setTestimonials(prev =>
          prev.map(t =>
            t.id === editingTestimonial.id
              ? {
                  ...t,
                  student_name: formData.studentName,
                  college: formData.college,
                  rating: formData.rating,
                  review: formData.review,
                }
              : t
          )
        )
        toast.success('Testimonial updated')
      } else {
        // Create
        const { data, error } = await supabase
          .from('testimonials')
          .insert({
            student_name: formData.studentName,
            college: formData.college,
            rating: formData.rating,
            review: formData.review,
            status: 'pending',
          })
          .select()

        if (error) throw error

        setTestimonials(prev => [data[0], ...prev])
        toast.success('Testimonial created (pending approval)')
      }

      setShowForm(false)
      setEditingTestimonial(null)
      setFormData({ studentName: '', college: '', rating: 5, review: '' })
    } catch (error) {
      console.error('Submit failed:', error)
      toast.error('Failed to save testimonial')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from('testimonials')
        .update({ status: newStatus })
        .eq('id', id)

      setTestimonials(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus as any } : t))
      )
      toast.success('Status updated')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update status')
    }
  }

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      await supabase
        .from('testimonials')
        .update({ is_featured: !testimonial.is_featured })
        .eq('id', testimonial.id)

      setTestimonials(prev =>
        prev.map(t =>
          t.id === testimonial.id ? { ...t, is_featured: !t.is_featured } : t
        )
      )
      toast.success(testimonial.is_featured ? 'Removed from featured' : 'Added to featured')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update featured status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return

    try {
      await supabase.from('testimonials').delete().eq('id', id)
      setTestimonials(prev => prev.filter(t => t.id !== id))
      toast.success('Testimonial deleted')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete testimonial')
    }
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Testimonials</h1>
            <p className="text-gray-400">Manage student reviews and ratings</p>
          </div>
          <button
            onClick={() => {
              setEditingTestimonial(null)
              setFormData({ studentName: '', college: '', rating: 5, review: '' })
              setShowForm(true)
            }}
            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Testimonial
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className={`${DESIGN_SYSTEM.components.card.base} w-full max-w-2xl max-h-96 overflow-y-auto`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingTestimonial ? 'Edit' : 'Add'} Testimonial
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={e => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                      placeholder="Student name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      College
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={e => setFormData(prev => ({ ...prev, college: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all"
                      placeholder="College name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className={`p-2 rounded-lg transition-all ${
                            formData.rating >= star
                              ? 'text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        >
                          <Star size={24} fill={formData.rating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Review *
                    </label>
                    <textarea
                      value={formData.review}
                      onChange={e => setFormData(prev => ({ ...prev, review: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition-all resize-none"
                      placeholder="Student review"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all font-medium"
                    >
                      {editingTestimonial ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({testimonials.length})
          </button>
          {Object.entries(STATUS_COLORS).map(([status, colors]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filter === status
                  ? `${colors.bg} ${colors.text} border ${colors.bg}`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {colors.label} ({testimonials.filter(t => t.status === status).length})
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Loading testimonials...
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <p>No testimonials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`${DESIGN_SYSTEM.components.card.base}`}
              >
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{testimonial.student_name}</h3>
                      <p className="text-sm text-gray-400">{testimonial.college || 'N/A'}</p>
                    </div>
                    {testimonial.is_featured && (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 font-medium">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review */}
                  <p className="text-sm text-gray-300 line-clamp-3">{testimonial.review}</p>

                  {/* Status */}
                  <div className="pt-4 border-t border-white/10">
                    <select
                      value={testimonial.status || 'pending'}
                      onChange={e => handleStatusChange(testimonial.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded text-sm font-medium ${
                        STATUS_COLORS[testimonial.status as keyof typeof STATUS_COLORS]?.bg || STATUS_COLORS.pending.bg
                      } ${STATUS_COLORS[testimonial.status as keyof typeof STATUS_COLORS]?.text || STATUS_COLORS.pending.text} bg-transparent border border-current focus:outline-none cursor-pointer mb-3`}
                    >
                      {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                        <option key={status} value={status}>
                          {colors.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleFeatured(testimonial)}
                        className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                          testimonial.is_featured
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingTestimonial(testimonial)
                          setFormData({
                            studentName: testimonial.student_name,
                            college: testimonial.college || '',
                            rating: testimonial.rating,
                            review: testimonial.review,
                          })
                          setShowForm(true)
                        }}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

