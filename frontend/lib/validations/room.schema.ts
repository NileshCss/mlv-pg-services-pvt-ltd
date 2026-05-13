import { z } from 'zod'

export const roomSchema = z
  .object({
    building_name: z.string().min(1, 'Building name is required').max(100, 'Too long'),

    room_number: z
      .string()
      .min(1, 'Room number is required')
      .max(20, 'Too long')
      .regex(/^[A-Za-z0-9\-]+$/, 'Only letters, numbers and hyphens'),

    floor: z.coerce.number().int().min(0).max(50).optional(),

    room_type: z.enum(['single', 'double', 'triple', 'dormitory'], {
      required_error: 'Select a room type',
    }),

    total_beds: z
      .coerce.number({ required_error: 'Required' })
      .int()
      .min(1, 'At least 1 bed')
      .max(20, 'Maximum 20 beds'),

    occupied_beds: z.coerce.number({ invalid_type_error: 'Must be a number' }).int().min(0),

    price_per_bed: z
      .coerce.number({ required_error: 'Price is required' })
      .positive('Must be greater than 0')
      .max(100000),

    is_ac: z.boolean().default(false),
    has_attached_bathroom: z.boolean().default(false),
    maintenance_status: z.boolean().default(false),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string().url()).default([]),
    notes: z.string().max(500).optional(),
  })
  .refine(data => data.occupied_beds <= data.total_beds, {
    message: 'Occupied beds cannot exceed total beds',
    path: ['occupied_beds'],
  })

export type RoomFormData = z.infer<typeof roomSchema>
