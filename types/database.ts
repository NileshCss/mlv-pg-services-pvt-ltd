export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      pre_registrations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          phone: string
          email: string
          gender: string
          college_name: string
          course: string
          room_preference: string
          check_in_date: string
          parent_contact: string
          food_preference: string
          additional_notes: string | null
          status: 'new' | 'contacted' | 'confirmed' | 'rejected'
          notes: string | null
          assigned_to: string | null
        }
        Insert: Omit<Database['public']['Tables']['pre_registrations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pre_registrations']['Insert']>
      }
      contact: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          phone: string
          email: string
          subject: string
          message: string
          status: 'new' | 'read' | 'replied'
          reply_text: string | null
          replied_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['contact']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['contact']['Insert']>
      }
      room_bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          student_name: string
          phone: string
          email: string | null
          room_number: string
          room_type: string
          check_in_date: string | null
          check_out_date: string | null
          monthly_rent: number | null
          payment_status: 'pending' | 'paid' | 'partial' | 'refunded'
          booking_status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
          registration_id: string | null
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['room_bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['room_bookings']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          role: 'super_admin' | 'admin' | 'manager'
          full_name: string | null
          is_active: boolean
          last_login: string | null
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      testimonials: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          student_name: string
          course: string | null
          college_name: string | null
          message: string
          rating: number
          image_url: string | null
          is_approved: boolean
          is_featured: boolean
        }
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>
      }
      gallery_images: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          image_url: string
          title: string | null
          description: string | null
          category: string
          sort_order: number
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['gallery_images']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      registration_status: 'new' | 'contacted' | 'confirmed' | 'rejected'
      contact_status: 'new' | 'read' | 'replied'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
      payment_status: 'pending' | 'paid' | 'partial' | 'refunded'
      admin_role: 'super_admin' | 'admin' | 'manager'
    }
    CompositeTypes: {}
  }
}

// ── Convenience Types ──────────────────────────────────────────────────────
export type PreRegistration   = Database['public']['Tables']['pre_registrations']['Row']
export type ContactMessage    = Database['public']['Tables']['contact']['Row']
export type RoomBooking       = Database['public']['Tables']['room_bookings']['Row']
export type AdminUser         = Database['public']['Tables']['admin_users']['Row']
export type Testimonial       = Database['public']['Tables']['testimonials']['Row']
export type GalleryImage      = Database['public']['Tables']['gallery_images']['Row']

// ── Insert Types ───────────────────────────────────────────────────────────
export type PreRegistrationInsert = Database['public']['Tables']['pre_registrations']['Insert']
export type ContactMessageInsert  = Database['public']['Tables']['contact']['Insert']
export type RoomBookingInsert     = Database['public']['Tables']['room_bookings']['Insert']
export type TestimonialInsert     = Database['public']['Tables']['testimonials']['Insert']

// ── Status Enums ───────────────────────────────────────────────────────────
export type RegistrationStatus = Database['public']['Enums']['registration_status']
export type ContactStatus      = Database['public']['Enums']['contact_status']
export type BookingStatus      = Database['public']['Enums']['booking_status']
export type PaymentStatus      = Database['public']['Enums']['payment_status']
export type AdminRole          = Database['public']['Enums']['admin_role']
