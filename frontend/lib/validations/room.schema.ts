import { z } from 'zod'

export const roomSchema = z
  .object({
    building_id: z.string().min(1, 'Building is required'),
    room_number: z
      .string()
      .min(1, 'Room number is required')
      .max(20, 'Too long')
      .regex(/^[A-Za-z0-9\-]+$/, 'Only letters, numbers, and hyphens'),
    floor: z.coerce.number().int().min(0).max(50).default(1),
    room_type: z.enum(['single', 'double', 'triple', 'dormitory'], {
      required_error: 'Select a room type',
    }),
    total_beds: z
      .coerce.number({ required_error: 'Required' })
      .int()
      .min(1, 'At least 1 bed')
      .max(50, 'Maximum 50 beds'),
    occupied_beds: z.coerce.number({ invalid_type_error: 'Must be a number' }).int().min(0).default(0),
    price_per_bed: z
      .coerce.number({ required_error: 'Rent is required' })
      .positive('Rent must be greater than 0'),
    security_deposit: z
      .coerce.number({ required_error: 'Security deposit is required' })
      .min(0, 'Deposit must be positive'),
    electricity_charges: z.coerce.number().min(0).optional().default(0),
    maintenance_charges: z.coerce.number().min(0).optional().default(0),
    is_ac: z.boolean().default(false),
    has_attached_bathroom: z.boolean().default(false),
    status: z.enum(['available', 'occupied', 'maintenance', 'reserved']).default('available'),
    amenities: z.array(z.string()).default([]),
    notes: z.string().max(500).optional().default(''),
  })
  .refine(data => data.occupied_beds <= data.total_beds, {
    message: 'Occupied beds cannot exceed total beds',
    path: ['occupied_beds'],
  })

export type RoomFormData = z.infer<typeof roomSchema>

export const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required').max(100, 'Too long'),
  code: z.string().min(1, 'Building code is required').max(20, 'Too long'),
  address: z.string().min(1, 'Address is required').max(250, 'Too long'),
  description: z.string().max(500).optional().default(''),
  status: z.enum(['Boys PG', 'Girls PG'], {
    required_error: 'Select building type',
  }),
})

export type BuildingFormData = z.infer<typeof buildingSchema>
