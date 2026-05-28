'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Star } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

interface ReviewModalProps {
  open: boolean
  onClose: () => void
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    student_name: '',
    college: '',
    rating: 5,
    review: '',
  })
  const [errors, setErrors] = useState({
    student_name: '',
    rating: '',
    review: '',
    form: '',
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    let valid = true
    const newErrors = { student_name: '', rating: '', review: '', form: '' }

    if (!form.student_name.trim()) {
      newErrors.student_name = 'Name is required'
      valid = false
    } else if (form.student_name.trim().length < 2) {
      newErrors.student_name = 'Name must be at least 2 characters'
      valid = false
    }

    if (!form.rating || form.rating < 1 || form.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5'
      valid = false
    }

    if (!form.review.trim()) {
      newErrors.review = 'Review is required'
      valid = false
    } else if (form.review.trim().length < 10) {
      newErrors.review = 'Review must be at least 10 characters'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setErrors((prev) => ({ ...prev, form: '' }))
      
      await axios.post('/api/testimonials', {
        student_name: form.student_name.trim(),
        college: form.college.trim() || null,
        rating: Number(form.rating),
        review: form.review.trim(),
      })

      setSubmitted(true)
      toast.success('Review submitted successfully')
      
      // Auto-close after 2s
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err: any) {
      console.error('Submission failed:', err)
      const errMsg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setErrors((prev) => ({
        ...prev,
        form: errMsg,
      }))
      toast.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setForm({ student_name: '', college: '', rating: 5, review: '' })
    setErrors({ student_name: '', rating: '', review: '', form: '' })
    setSubmitted(false)
    setHoveredStar(0)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="review-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
        >
          <motion.div
            key="review-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md md:max-w-lg bg-[#0f1624] text-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 text-sm"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {submitted ? (
              /* ── Success State ── */
              <div className="py-12 px-8 text-center flex flex-col items-center justify-center">
                <div className="text-5xl sm:text-6xl mb-4">✅</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Review Submitted!
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-sm">
                  Your review is under review by our team. We'll feature it on our website once approved!
                </p>
              </div>
            ) : (
              /* ── Form State ── */
              <>
                {/* Header */}
                <div className="mb-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                    Write a Review
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Share your experience at MLV PG with future students
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* General Form Error */}
                  {errors.form && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                      {errors.form}
                    </div>
                  )}

                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => {
                            setForm((p) => ({ ...p, rating: star }))
                            setErrors((p) => ({ ...p, rating: '' }))
                          }}
                          className="text-2xl sm:text-3xl cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            size={28}
                            className={`transition-all duration-150 ${
                              (hoveredStar || form.rating) >= star
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-sm font-medium text-[#C9A84C] ml-2">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hoveredStar || form.rating)]}
                      </span>
                    </div>
                    {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={form.student_name}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, student_name: e.target.value }))
                        setErrors((p) => ({ ...p, student_name: '' }))
                      }}
                      className="w-full bg-white/5 border border-white/10 hover:border-[#C9A84C]/50 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200"
                    />
                    {errors.student_name && <p className="text-red-400 text-xs mt-1">{errors.student_name}</p>}
                  </div>

                  {/* College */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">
                      Course & College
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech CSE • Acharya Institute"
                      value={form.college}
                      onChange={(e) => setForm((p) => ({ ...p, college: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 hover:border-[#C9A84C]/50 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Review */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">
                      Your Review *
                    </label>
                    <textarea
                      placeholder="Share your experience — what did you love most about MLV PG?"
                      value={form.review}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, review: e.target.value }))
                        setErrors((p) => ({ ...p, review: '' }))
                      }}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 hover:border-[#C9A84C]/50 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 resize-none"
                    />
                    {errors.review && <p className="text-red-400 text-xs mt-1">{errors.review}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#C9A84C] hover:bg-[#b8943e] disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 mt-2 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      '🚀 Submit Review'
                    )}
                  </button>

                  {/* Bottom Note */}
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Your review will appear after admin approval
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
