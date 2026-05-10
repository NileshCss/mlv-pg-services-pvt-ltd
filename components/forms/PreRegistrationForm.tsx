'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PreRegistrationSchema, type PreRegistrationFormData } from '@/lib/utils/validations'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { GENDERS, ROOM_PREFERENCES, FOOD_PREFERENCES, NATIONALITIES, WHATSAPP_NUMBER } from '@/lib/utils/constants'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import axios from 'axios'
import { MessageCircle } from 'lucide-react'

interface PreRegistrationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PreRegistrationForm: React.FC<PreRegistrationFormProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PreRegistrationFormData>({
    resolver: zodResolver(PreRegistrationSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: PreRegistrationFormData) => {
    try {
      setIsSubmitting(true)
      
      // Ensure all required fields are present
      const payload = {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        gender: data.gender,
        college_name: data.college_name,
        course: data.course,
        room_preference: data.room_preference,
        check_in_date: data.check_in_date,
        parent_contact: data.parent_contact,
        food_preference: data.food_preference,
        additional_notes: data.additional_notes || '',
        status: 'new',
      }

      const response = await axios.post('/api/registrations', payload)

      if (response.status === 201 || response.status === 200) {
        setSubmitSuccess(true)
        toast.success('Pre-registration submitted successfully! We will contact you soon.')
        reset()
        setTimeout(() => {
          onOpenChange(false)
          setSubmitSuccess(false)
        }, 3000)
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      const errorMsg = error.response?.data?.error || 'Failed to submit pre-registration. Please try again.'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi! I would like to know more about MLV PG Services. Can you provide more details?')
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title=""
      description=""
      size="lg"
    >
      {submitSuccess ? (
        <motion.div
          className="text-center py-12 px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-4 text-6xl">🎉</div>
          <h3 className="text-3xl font-bold mb-3" style={{ color: '#c9a84c' }}>
            Thank You!
          </h3>
          <p className="text-gray-300 mb-2 text-lg">
            Your pre-registration has been submitted successfully
          </p>
          <p className="text-gray-400 text-sm">
            Our team will contact you within 24 hours
          </p>
        </motion.div>
      ) : (
        <div className="px-6 py-8">
          {/* Header with light golden background */}
          <div 
            className="rounded-lg px-6 py-8 mb-8 text-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.12) 0%, rgba(201, 168, 76, 0.08) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div 
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest"
              style={{ 
                background: 'rgba(201, 168, 76, 0.2)', 
                color: '#c9a84c',
                border: '1px solid rgba(201, 168, 76, 0.4)'
              }}
            >
              🔒 ADMISSIONS OPEN 2025-26
            </div>
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-4"
              style={{ 
                color: '#c9a84c',
                fontFamily: '"Georgia", serif',
                letterSpacing: '0.01em',
                fontWeight: 500
              }}
            >
              Secure Your Room at MLV PG Services
            </h2>
            <p className="text-gray-300 text-sm font-medium">
              Premium PG · Near Acharya College, Thammendhalli, Bengaluru · 400+ Students
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                {...register('full_name')}
                error={errors.full_name?.message}
              />
              <Input
                label="Mobile Number"
                placeholder="+91 9876543210"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <Select
                label="Nationality / Country"
                {...register('gender')}
                options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                error={errors.gender?.message}
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="College / University"
                placeholder="Acharya Institute of Technology"
                {...register('college_name')}
                error={errors.college_name?.message}
              />
              <Input
                label="Course"
                placeholder="B.Tech CSE"
                {...register('course')}
                error={errors.course?.message}
              />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Expected Join Date"
                type="date"
                {...register('check_in_date')}
                error={errors.check_in_date?.message}
              />
              <Select
                label="Preferred Room Type"
                {...register('room_preference')}
                options={ROOM_PREFERENCES.map(r => ({ value: r, label: r }))}
                error={errors.room_preference?.message}
              />
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Parent Contact Number"
                placeholder="9876543211"
                {...register('parent_contact')}
                error={errors.parent_contact?.message}
              />
              <Select
                label="Food Preference"
                {...register('food_preference')}
                options={FOOD_PREFERENCES.map(f => ({ value: f, label: f }))}
                error={errors.food_preference?.message}
              />
            </div>

            {/* Special Requirements */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-100">
                Special Requirements or Message
              </label>
              <textarea
                placeholder="Dietary needs, specific requirements, questions..."
                {...register('additional_notes')}
                className="w-full rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 resize-none p-3 transition-all duration-300"
                rows={3}
                style={{
                  borderColor: errors.additional_notes ? 'rgb(239, 68, 68)' : 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: errors.additional_notes ? 'rgba(127,29,29,0.12)' : 'rgba(255,255,255,0.05)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#c9a84c'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.additional_notes ? 'rgb(239, 68, 68)' : 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-2" />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="flex-1 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : '🔒 Submit Pre-Registration'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 font-semibold flex items-center justify-center gap-2"
                onClick={handleWhatsApp}
                disabled={isSubmitting}
              >
                <MessageCircle size={18} />
                WhatsApp Directly
              </Button>
            </div>

            {/* Info note */}
            <p className="text-center text-xs text-gray-500 mt-4">
              ⚡ Your info is secure & used only for admission purposes
            </p>
          </form>
        </div>
      )}
    </Dialog>
  )
}

export { PreRegistrationForm }
export default PreRegistrationForm
