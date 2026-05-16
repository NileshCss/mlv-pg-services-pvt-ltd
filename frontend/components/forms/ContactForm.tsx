'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContactFormSchema, type ContactFormData } from '@/lib/utils/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import axios from 'axios'

interface ContactFormProps {
  onSuccess?: () => void
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true)
      const response = await axios.post('/api/contact', {
        ...data,
        status: 'new',
      })

      if (response.status === 201 || response.status === 200) {
        toast.success('Message sent successfully! We will contact you soon.')
        reset()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Alert
        type="info"
        description="We'll get back to you within 24 hours. Promise!"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="Your name"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Phone Number"
          placeholder="Your phone"
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Subject"
        placeholder="What's this about?"
        {...register('subject')}
        error={errors.subject?.message}
      />

      <div>
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: '#1A1A2E', fontFamily: 'Inter, sans-serif' }}
        >
          Message
        </label>
        <textarea
          placeholder="Tell us your thoughts..."
          {...register('message')}
          className="w-full rounded-lg border px-4 py-3 placeholder:text-[#8A8AA0] resize-none transition-all duration-300 focus:outline-none"
          style={{
            background: '#FFFFFF',
            border: '1px solid #EBEBF0',
            color: '#1A1A2E',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#EBEBF0'
            e.currentTarget.style.boxShadow = 'none'
          }}
          rows={5}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </motion.form>
  )
}

export { ContactForm }

