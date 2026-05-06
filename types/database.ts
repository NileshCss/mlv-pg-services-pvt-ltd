export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      pre_registrations: {
        Row: {
          id: string
          created_at: string
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
          status: string
        }
        Insert: Omit<Database['public']['Tables']['pre_registrations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pre_registrations']['Insert']>
      }
      room_bookings: {
        Row: {
          id: string
          student_name: string
          phone: string
          room_number: string
          room_type: string
          payment_status: string
          booking_status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['room_bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['room_bookings']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      testimonials: {
        Row: {
          id: string
          student_name: string
          message: string
          rating: number
          image_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>
      }
      gallery_images: {
        Row: {
          id: string
          image_url: string
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Custom Types
export type PreRegistration = Database['public']['Tables']['pre_registrations']['Row']
export type RoomBooking = Database['public']['Tables']['room_bookings']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row']
