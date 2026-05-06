'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PreRegistrationSchema, type PreRegistrationFormData } from '@/lib/utils/validations'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Alert } from '@/components/ui/Alert'
import { GENDERS, ROOM_PREFERENCES, FOOD_PREFERENCES } from '@/lib/utils/constants'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import axios from 'axios'

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
  })

  const onSubmit = async (data: PreRegistrationFormData) => {
    try {
      setIsSubmitting(true)
      const response = await axios.post('/api/registrations', {
        ...data,
        status: 'new',
      })

      if (response.status === 201 || response.status === 200) {
        setSubmitSuccess(true)
        toast.success('Pre-registration submitted successfully!')
        reset()
        setTimeout(() => {
          onOpenChange(false)
          setSubmitSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to submit pre-registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Pre-Register for MLV PG Services"
      description="Join hundreds of satisfied students. Your journey to comfort starts here!"
      size="lg"
    >
      {submitSuccess ? (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-4 text-5xl">✨</div>
          <h3 className="text-2xl font-bold text-secondary-500 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-400 mb-4">
            Your pre-registration has been submitted successfully. Our team will contact you soon!
          </p>
          <p className="text-sm text-gray-500">
            Redirecting...
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Alert
            type="info"
            description="Fill in your details and we'll connect with you soon!"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              {...register('full_name')}
              error={errors.full_name?.message}
            />
            <Input
              label="Phone Number"
              placeholder="9876543210"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Select
              label="Gender"
              {...register('gender')}
              options={GENDERS.map(g => ({ value: g, label: g }))}
              error={errors.gender?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="College Name"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Room Preference"
              {...register('room_preference')}
              options={ROOM_PREFERENCES.map(r => ({ value: r, label: r }))}
              error={errors.room_preference?.message}
            />
            <Input
              label="Check-in Date"
              type="date"
              {...register('check_in_date')}
              error={errors.check_in_date?.message}
            />
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-100">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Tell us more about yourself..."
              {...register('additional_notes')}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-50 placeholder:text-gray-500 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Pre-Registration'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

export { PreRegistrationForm }
