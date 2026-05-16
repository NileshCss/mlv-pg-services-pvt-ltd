'use client'

import React, { useState, useRef } from 'react'
import { X, AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react'

interface ComplaintFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES = [
  'Food Quality',
  'Room Cleanliness',
  'WiFi / Internet',
  'Electricity / Power',
  'Water Supply',
  'Security Issue',
  'Staff Behaviour',
  'Maintenance',
  'Other',
]

const URGENCY_OPTIONS = [
  { value: 'low',    label: 'Low',         emoji: '🟢', color: '#2ECC71' },
  { value: 'medium', label: 'Medium',      emoji: '🟡', color: '#F39C12' },
  { value: 'high',   label: 'High / Urgent', emoji: '🔴', color: '#E74C3C' },
]

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#EBEBF0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1A1A2E',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#1A1A2E',
  marginBottom: '6px',
  fontFamily: 'Inter, sans-serif',
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({ open, onOpenChange }) => {
  const [form, setForm] = useState({
    studentName: '',
    roomNumber:  '',
    phone:       '',
    category:    '',
    details:     '',
    urgency:     'medium',
  })
  const [photoFile,    setPhotoFile]    = useState<File | null>(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [success,      setSuccess]      = useState<string | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const getFocusStyle = (name: string): React.CSSProperties =>
    focusedField === name
      ? { ...INPUT_STYLE, borderColor: '#C9A84C', boxShadow: '0 0 0 3px rgba(201,168,76,0.15)' }
      : INPUT_STYLE

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.studentName.trim()) return setError('Please enter your full name.')
    if (!form.roomNumber.trim())  return setError('Please enter your room number.')
    if (!form.phone.trim())       return setError('Please enter your phone number.')
    if (!form.category)           return setError('Please select a complaint category.')
    if (form.details.trim().length < 20) return setError('Details must be at least 20 characters.')

    setSubmitting(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: form.studentName,
          roomNumber:  form.roomNumber,
          phone:       form.phone,
          category:    form.category,
          details:     form.details,
          urgency:     form.urgency,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submission failed')
      setSuccess(json.complaintId)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setForm({ studentName: '', roomNumber: '', phone: '', category: '', details: '', urgency: 'medium' })
      setPhotoFile(null)
      setSuccess(null)
      setError(null)
    }, 300)
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 9000,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9001,
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          fontFamily: 'Inter, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #EBEBF0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1,
          borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}>
              📋 Raise a Complaint
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#8A8AA0' }}>
              We resolve all complaints within 24 hours
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 36, height: 36, border: 'none', cursor: 'pointer',
              borderRadius: '8px', background: '#F8F6F1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8A8AA0', flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {/* Success State */}
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(46,204,113,0.1)', margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={36} color="#2ECC71" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E', margin: '0 0 10px', fontFamily: 'Playfair Display, serif' }}>
                Complaint Submitted!
              </h3>
              <p style={{ color: '#4A4A6A', fontSize: '15px', lineHeight: 1.6, margin: '0 0 8px' }}>
                ✅ Your complaint has been submitted. We will resolve it within 24 hours.
              </p>
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#C9A84C',
                margin: '12px 0 24px',
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '0.05em',
              }}>
                Complaint ID: {success}
              </div>
              <button
                onClick={handleClose}
                style={{
                  display: 'block', width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
                  color: '#1A1A2E', fontWeight: 700, fontSize: '15px',
                  border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* Error Banner */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderRadius: '8px',
                  background: 'rgba(231,76,60,0.08)',
                  border: '1px solid rgba(231,76,60,0.25)',
                  marginBottom: '20px',
                }}>
                  <AlertCircle size={16} color="#E74C3C" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#E74C3C' }}>{error}</span>
                </div>
              )}

              {/* Row: Name + Room */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={LABEL_STYLE}>Full Name <span style={{ color: '#E74C3C' }}>*</span></label>
                  <input
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('studentName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Rahul Kumar"
                    style={getFocusStyle('studentName')}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Room Number <span style={{ color: '#E74C3C' }}>*</span></label>
                  <input
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('roomNumber')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="204"
                    style={getFocusStyle('roomNumber')}
                  />
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>Phone Number <span style={{ color: '#E74C3C' }}>*</span></label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+91 98765 43210"
                  style={getFocusStyle('phone')}
                />
              </div>

              {/* Category */}
              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>Complaint Category <span style={{ color: '#E74C3C' }}>*</span></label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('category')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...getFocusStyle('category'), cursor: 'pointer' }}
                >
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Details */}
              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>
                  Complaint Details <span style={{ color: '#E74C3C' }}>*</span>
                  <span style={{ fontWeight: 400, color: '#8A8AA0', fontSize: '12px', marginLeft: '6px' }}>
                    (min 20 characters)
                  </span>
                </label>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('details')}
                  onBlur={() => setFocusedField(null)}
                  rows={4}
                  placeholder="Describe your complaint in detail…"
                  style={{ ...getFocusStyle('details'), resize: 'vertical', minHeight: '100px' }}
                />
                <div style={{ fontSize: '11px', color: '#8A8AA0', marginTop: '4px', textAlign: 'right' }}>
                  {form.details.length} chars {form.details.length < 20 && form.details.length > 0 && '— need at least 20'}
                </div>
              </div>

              {/* Urgency */}
              <div style={{ marginBottom: '16px' }}>
                <label style={LABEL_STYLE}>Urgency Level</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {URGENCY_OPTIONS.map(u => (
                    <label
                      key={u.value}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', padding: '10px 8px', borderRadius: '8px',
                        border: `2px solid ${form.urgency === u.value ? u.color : '#EBEBF0'}`,
                        background: form.urgency === u.value ? `${u.color}18` : '#FAFAFA',
                        cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none',
                        fontSize: '13px', fontWeight: form.urgency === u.value ? 700 : 500,
                        color: form.urgency === u.value ? u.color : '#4A4A6A',
                      }}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={u.value}
                        checked={form.urgency === u.value}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      {u.emoji} {u.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Upload (optional) */}
              <div style={{ marginBottom: '24px' }}>
                <label style={LABEL_STYLE}>Upload Photo <span style={{ fontWeight: 400, color: '#8A8AA0' }}>(optional)</span></label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed #EBEBF0',
                    borderRadius: '8px', padding: '16px',
                    textAlign: 'center', cursor: 'pointer',
                    background: '#FAFAFA', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#EBEBF0')}
                >
                  <Upload size={20} style={{ color: '#8A8AA0', margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: '#8A8AA0' }}>
                    {photoFile ? photoFile.name : 'Click to upload image (JPG, PNG — max 5 MB)'}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px',
                  background: submitting ? '#d4c07a' : 'linear-gradient(135deg, #C9A84C, #E8C96B)',
                  color: '#1A1A2E', fontWeight: 700, fontSize: '15px',
                  border: 'none', borderRadius: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {submitting ? 'Submitting…' : '📤 Submit Complaint'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

