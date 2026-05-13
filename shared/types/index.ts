// ─────────────────────────────────────────────────────────
// Shared User Types
// ─────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'student'

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

// ─────────────────────────────────────────────────────────
// Shared Booking Types
// ─────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded'

export interface Booking {
  id: string
  studentId: string
  roomId: string
  checkInDate: Date
  checkOutDate?: Date
  monthlyRent: number
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type BookingInput = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>

// ─────────────────────────────────────────────────────────
// Shared Room Types
// ─────────────────────────────────────────────────────────

export type RoomType = 'single' | 'double' | 'triple' | 'dormitory'

export interface Room {
  id: string
  roomNumber: string
  roomType: RoomType
  totalBeds: number
  occupiedBeds: number
  pricePerBed: number
  isAC: boolean
  hasAttachedBathroom: boolean
  maintenanceStatus: boolean
  amenities: string[]
  images: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type RoomInput = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>

// ─────────────────────────────────────────────────────────
// Shared API Response Types
// ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─────────────────────────────────────────────────────────
// Shared Auth Types
// ─────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone: string
}

export interface RegisterResponse extends LoginResponse {}
