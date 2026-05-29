// ─── MLV PG Student Portal — TypeScript Types ─────────────────────────────

// ── Student ────────────────────────────────────────────────────────────────
export interface Student {
  id: string
  user_id: string | null
  application_id: string | null
  student_id: string | null             // e.g. MLV-STU-0001
  full_name: string
  email: string
  mobile: string | null
  college_name: string | null
  course: string | null
  year_of_study: string | null
  parent_name: string | null
  parent_contact: string | null
  permanent_address: string | null
  emergency_contact: string | null
  nationality: string | null
  gender: string | null
  room_id: string | null
  bed_id: string | null
  joining_date: string | null           // ISO date
  agreement_end_date: string | null     // ISO date
  profile_photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined fields (from API)
  room?: Room
  bed?: Bed
}

// ── Room ───────────────────────────────────────────────────────────────────
export interface Room {
  id: string
  room_number: string
  floor: number
  type: 'single' | 'double' | 'triple'
  capacity: number
  status: 'available' | 'occupied' | 'maintenance'
  amenities: string[]
  monthly_rent: number | null
  created_at: string
  updated_at: string
  // Joined
  beds?: Bed[]
  current_students?: Pick<Student, 'id' | 'full_name' | 'student_id'>[]
}

// ── Bed ────────────────────────────────────────────────────────────────────
export interface Bed {
  id: string
  room_id: string
  bed_number: string
  status: 'available' | 'occupied'
  created_at: string
  // Joined
  student?: Pick<Student, 'id' | 'full_name' | 'student_id'>
}

// ── Fee ────────────────────────────────────────────────────────────────────
export interface Fee {
  id: string
  student_id: string
  monthly_amount: number
  security_deposit: number
  security_deposit_paid: boolean
  security_deposit_paid_at: string | null
  plan_type: 'monthly' | 'bi_monthly' | 'quarterly'
  late_fee: number
  payment_mode: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Installment ────────────────────────────────────────────────────────────
export interface Installment {
  id: string
  fee_id: string
  student_id: string
  installment_no: number
  due_date: string                      // ISO date
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  paid_at: string | null
  receipt_url: string | null
  created_at: string
}

// ── Payment ────────────────────────────────────────────────────────────────
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'razorpay' | 'cheque' | 'other'
export type PaymentType = 'monthly' | 'security_deposit' | 'renewal' | 'late_fee' | 'other'

export interface Payment {
  id: string
  student_id: string
  installment_id: string | null
  amount: number
  payment_mode: PaymentMode | null
  transaction_id: string | null
  type: PaymentType
  receipt_url: string | null
  notes: string | null
  recorded_by: string | null
  created_at: string
}

// ── Agreement ──────────────────────────────────────────────────────────────
export interface Agreement {
  id: string
  student_id: string
  start_date: string | null
  end_date: string | null
  file_url: string | null
  signed: boolean
  signature_data: string | null
  signed_at: string | null
  created_by: string | null
  created_at: string
}

// ── Renewal ────────────────────────────────────────────────────────────────
export type RenewalStatus = 'pending' | 'approved' | 'rejected'

export interface Renewal {
  id: string
  student_id: string
  requested_at: string
  status: RenewalStatus
  approved_at: string | null
  rejected_at: string | null
  slip_url: string | null
  new_end_date: string | null
  admin_notes: string | null
  reviewed_by: string | null
}

// ── Student Complaint ──────────────────────────────────────────────────────
export type ComplaintCategory = 'food' | 'electricity' | 'internet' | 'cleaning' | 'water' | 'maintenance' | 'other'
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface StudentComplaint {
  id: string
  student_id: string
  category: ComplaintCategory
  subject: string
  description: string
  photo_url: string | null
  status: ComplaintStatus
  admin_response: string | null
  responded_at: string | null
  responded_by: string | null
  created_at: string
  updated_at: string
}

// ── Document ───────────────────────────────────────────────────────────────
export type DocType = 'aadhar' | 'photo' | 'college_id' | 'agreement' | 'renewal_slip' | 'receipt' | 'other'

export interface StudentDocument {
  id: string
  student_id: string
  doc_type: DocType
  file_url: string
  file_name: string | null
  verified: boolean
  verified_at: string | null
  verified_by: string | null
  uploaded_by: string
  uploaded_at: string
}

// ── Notice ─────────────────────────────────────────────────────────────────
export type NoticeType = 'general' | 'urgent' | 'events' | 'maintenance'

export interface Notice {
  id: string
  title: string
  content: string
  type: NoticeType
  is_active: boolean
  target_role: 'all' | 'student' | 'admin'
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── OTP Token ──────────────────────────────────────────────────────────────
export type OtpPurpose = 'pre_register' | 'forgot_password'

export interface OtpToken {
  id: string
  email: string
  otp_code: string
  purpose: OtpPurpose
  attempts: number
  max_attempts: number
  expires_at: string
  used: boolean
  created_at: string
}

// ── Application (extended pre_registration) ────────────────────────────────
export type ApplicationStatus = 'new' | 'contacted' | 'confirmed' | 'rejected' | 'converted'

export interface Application {
  id: string
  application_id: string | null
  full_name: string
  phone: string
  email: string
  gender: string
  college_name: string
  course: string
  year_of_study: string | null
  room_preference: string
  check_in_date: string | null
  parent_name: string | null
  parent_contact: string
  permanent_address: string | null
  emergency_contact: string | null
  food_preference: string
  nationality: string | null
  additional_notes: string | null
  aadhar_url: string | null
  photo_url: string | null
  college_id_url: string | null
  email_verified: boolean
  status: ApplicationStatus
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

// ── Dashboard Summary (for student overview) ───────────────────────────────
export interface StudentDashboardSummary {
  student: Student
  room: Room | null
  bed: Bed | null
  pendingFee: number
  totalPaid: number
  nextDueDate: string | null
  activeComplaints: number
  renewalStatus: RenewalStatus | null
  daysUntilExpiry: number | null
}

// ── Audit Log ─────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}
