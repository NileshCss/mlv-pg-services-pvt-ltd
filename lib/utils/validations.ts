import { z } from 'zod'

export const PreRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .min(10, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email address'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  college_name: z.string().min(2, 'College name is required'),
  course: z.string().min(2, 'Course name is required'),
  room_preference: z.string().min(1, 'Please select a room preference'),
  check_in_date: z.string().min(1, 'Check-in date is required'),
  parent_contact: z
    .string()
    .regex(/^[0-9]{10}$/, 'Parent contact must be 10 digits'),
  food_preference: z.string().min(1, 'Please select a food preference'),
  additional_notes: z.string().optional().nullable(),
})

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const AdminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type PreRegistrationFormData = z.infer<typeof PreRegistrationSchema>
export type ContactFormData = z.infer<typeof ContactFormSchema>
export type AdminLoginData = z.infer<typeof AdminLoginSchema>
