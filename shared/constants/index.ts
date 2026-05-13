// ─────────────────────────────────────────────────────────
// Shared Constants - User Roles
// ─────────────────────────────────────────────────────────

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STUDENT: 'student',
} as const

export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  student: 'Student',
} as const

// ─────────────────────────────────────────────────────────
// Shared Constants - Booking Status
// ─────────────────────────────────────────────────────────

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
} as const

export const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
} as const

// ─────────────────────────────────────────────────────────
// Shared Constants - Payment Status
// ─────────────────────────────────────────────────────────

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  REFUNDED: 'refunded',
} as const

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  partial: 'Partially Paid',
  refunded: 'Refunded',
} as const

// ─────────────────────────────────────────────────────────
// Shared Constants - Room Types
// ─────────────────────────────────────────────────────────

export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  DORMITORY: 'dormitory',
} as const

export const ROOM_TYPE_LABELS = {
  single: 'Single Occupancy',
  double: 'Double Occupancy',
  triple: 'Triple Occupancy',
  dormitory: 'Dormitory',
} as const
