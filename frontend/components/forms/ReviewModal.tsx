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
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student_name.trim() || !form.review.trim()) {
      toast.error('Name and review are required')
      return
    }
    try {
      setSubmitting(true)
      await axios.post('/api/testimonials', form)
      setSubmitted(true)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setForm({ student_name: '', college: '', rating: 5, review: '' })
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
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            key="review-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {submitted ? (
              /* ── Success State ── */
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
                  Thank you!
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6 }}>
                  Your review is under review by our team. We'll feature it on our website once approved!
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    marginTop: '28px',
                    padding: '12px 32px',
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #c9a84c, #e8c96d)',
                    color: '#0a0f1e',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              /* ── Form State ── */
              <>
                {/* Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                      Write a Review ✍️
                    </h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>
                      Share your experience with future students
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
                      borderRadius: '8px', padding: '6px', color: '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Star Rating */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '10px' }}>
                      Your Rating *
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setForm((p) => ({ ...p, rating: star }))}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                            transition: 'transform 0.15s',
                            transform: hoveredStar >= star ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >
                          <Star
                            size={30}
                            style={{
                              color: (hoveredStar || form.rating) >= star ? '#f59e0b' : '#374151',
                              fill: (hoveredStar || form.rating) >= star ? '#f59e0b' : 'none',
                              transition: 'all 0.15s',
                            }}
                          />
                        </button>
                      ))}
                      <span style={{ fontSize: '13px', color: '#c9a84c', alignSelf: 'center', marginLeft: '6px', fontWeight: 600 }}>
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hoveredStar || form.rating)]}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={form.student_name}
                      onChange={(e) => setForm((p) => ({ ...p, student_name: e.target.value }))}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)',
                        color: '#fff', fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.5)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.2)' }}
                    />
                  </div>

                  {/* College */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                      Course & College
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech CSE • Acharya Institute"
                      value={form.college}
                      onChange={(e) => setForm((p) => ({ ...p, college: e.target.value }))}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)',
                        color: '#fff', fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.5)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.2)' }}
                    />
                  </div>

                  {/* Review */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                      Your Review *
                    </label>
                    <textarea
                      placeholder="Share your experience — what did you love most about MLV PG?"
                      value={form.review}
                      onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))}
                      rows={4}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)',
                        color: '#fff', fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box', resize: 'vertical', minHeight: '100px',
                        fontFamily: 'inherit', transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.5)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.2)' }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '13px', borderRadius: '10px', border: 'none',
                      background: submitting ? '#374151' : 'linear-gradient(135deg, #c9a84c, #e8c96d)',
                      color: submitting ? '#9ca3af' : '#0a0f1e',
                      fontWeight: 700, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', width: '100%',
                    }}
                  >
                    {submitting ? 'Submitting...' : '🚀 Submit Review'}
                  </button>

                  <p style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', margin: '0' }}>
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
