'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ArrowLeft, CheckCircle, Upload, Eye, EyeOff, 
  User, ShieldCheck, Home, Phone, Mail, FileText,
  Calendar, AlertCircle, Loader2, Lock, Building
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const GOLD = '#C9A84C'

export default function ExistingResidentRegistrationPage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = use(props.searchParams)
  const supabase = createClient()
  const token = searchParams.token

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Stay Details (Direct or prefilled)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [buildingId, setBuildingId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [joiningDate, setJoiningDate] = useState('')

  const [isManualBuilding, setIsManualBuilding] = useState(false)
  const [manualBuildingName, setManualBuildingName] = useState('')
  const [isManualRoom, setIsManualRoom] = useState(false)
  const [manualRoomNumber, setManualRoomNumber] = useState('')

  const [buildings, setBuildings] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])

  // Form fields state
  const [aadharNumber, setAadharNumber] = useState('')
  const [dob, setDob] = useState('')
  const [permanentAddress, setPermanentAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [emergencyRelationship, setEmergencyRelationship] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [course, setCourse] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [idProofFile, setIdProofFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)

  // Form errors
  const [formErrors, setFormErrors] = useState<any>({})

  // UI state
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const { data: bData } = await supabase.from('buildings').select('*').order('name')
        if (bData && bData.length > 0) {
          setBuildings(bData)
        } else {
          setIsManualBuilding(true)
          setIsManualRoom(true)
        }
      } catch (err) {
        console.error('Failed to load buildings:', err)
      }
    }

    if (!token) {
      // Direct registration bypasses token verification
      fetchBuildings()
      setLoading(false)
      return
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/applications/invitation?token=${token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to verify invitation')
        setInvitation(data.data)
        setFullName(data.data.full_name || '')
        setPhone(data.data.phone || '')
        setEmail(data.data.email || '')
        setBuildingId(data.data.building_id || '')
        setRoomId(data.data.room_id || '')
        setFloorNumber(data.data.floor_number?.toString() || '')
        setJoiningDate(data.data.joining_date || '')
      } catch (err: any) {
        setErrorMsg(err.message || 'Invitation not found or invalid token.')
      } finally {
        setLoading(false)
      }
    }

    checkToken()
  }, [token, supabase])

  // Fetch rooms dynamically when a building is selected in direct form
  useEffect(() => {
    if (token || !buildingId) {
      setRooms([])
      return
    }

    const fetchRooms = async () => {
      try {
        const { data: rData } = await supabase
          .from('rooms')
          .select('*')
          .eq('building_id', buildingId)
          .order('room_number')
        if (rData) setRooms(rData)
      } catch (err) {
        console.error('Failed to load rooms:', err)
      }
    }

    fetchRooms()
  }, [buildingId, token, supabase])

  const validateForm = () => {
    const errors: any = {}

    if (!token) {
      if (!fullName.trim()) errors.fullName = 'Full name is required'
      if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Enter a valid 10-digit mobile number'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address'
      if (!isManualBuilding && !buildingId) errors.buildingId = 'PG Building is required'
      if (isManualBuilding && !manualBuildingName.trim()) errors.buildingId = 'PG Building name is required'
      if (!isManualRoom && !roomId) errors.roomId = 'Room is required'
      if (isManualRoom && !manualRoomNumber.trim()) errors.roomId = 'Room number is required'
      if (!joiningDate) errors.joiningDate = 'Joining date is required'
    }

    if (!/^\d{12}$/.test(aadharNumber)) errors.aadharNumber = 'Aadhaar must be exactly 12 digits'
    if (!dob) errors.dob = 'Date of birth is required'
    if (!permanentAddress.trim()) errors.permanentAddress = 'Permanent address is required'
    if (!city.trim()) errors.city = 'City is required'
    if (!stateName.trim()) errors.stateName = 'State is required'
    if (!/^\d{6}$/.test(pincode)) errors.pincode = 'Pincode must be exactly 6 digits'
    if (!emergencyName.trim()) errors.emergencyName = 'Emergency contact name is required'
    if (!/^[6-9]\d{9}$/.test(emergencyPhone)) errors.emergencyPhone = 'Enter a valid 10-digit emergency phone number'
    if (!emergencyRelationship.trim()) errors.emergencyRelationship = 'Emergency contact relationship is required'
    if (!collegeName.trim()) errors.collegeName = 'College / Company name is required'
    if (!course.trim()) errors.course = 'Course / Designation is required'
    if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
    if (!confirmChecked) errors.confirmChecked = 'You must confirm the correctness of details'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const uploadFile = async (file: File, path: string) => {
    const ext = file.name.split('.').pop()
    const filePath = `existing-residents/${path}_${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('student-documents')
      .upload(filePath, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('student-documents').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please check and complete all required fields')
      return
    }

    setSubmitting(true)
    try {
      // 1. Upload photo and ID proof (conditional on existence)
      const photoUrl = photoFile ? await uploadFile(photoFile, `photos/${email}`) : null
      const idProofUrl = idProofFile ? await uploadFile(idProofFile, `id_proofs/${email}`) : null

      // 2. Submit to existing resident API
      const profileData = {
        aadharNumber,
        dob,
        permanentAddress: `${permanentAddress}, ${city}, ${stateName} - ${pincode}`,
        emergencyName,
        emergencyPhone,
        emergencyRelationship,
        collegeName,
        course,
        photoUrl,
        aadharUrl: idProofUrl, // Set as aadharUrl for backend compatibility
        collegeIdUrl: idProofUrl, // Also set as collegeIdUrl
        password,
        manualBuildingName: isManualBuilding ? manualBuildingName : null,
        manualRoomNumber: isManualRoom ? manualRoomNumber : null
      }

      const payload = token 
        ? { token, profileData }
        : {
            isDirect: true,
            directDetails: {
              fullName,
              email,
              phone,
              buildingId: isManualBuilding ? 'manual' : buildingId,
              roomId: isManualRoom ? 'manual' : roomId,
              floorNumber: floorNumber ? parseInt(floorNumber) : null,
              joiningDate
            },
            profileData
          }

      const res = await fetch('/api/applications/invitation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit registration')

      toast.success('Registration profile submitted successfully!')
      setSuccess(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete registration')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center text-gray-200">
        <Loader2 className="animate-spin text-amber-500 mb-3" size={32} />
        <p className="text-sm text-gray-400">Verifying invitation token…</p>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white/2 border border-red-500/20 backdrop-blur-md">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>Invitation Invalid</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{errorMsg}</p>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full text-black transition-all" style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-gray-100 py-10 px-4 relative">
      {/* Background Orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C8840A 0%, transparent 70%)' }} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Home
          </Link>
          <div className="text-right">
            <p className="text-xs font-bold text-[#C8840A] tracking-widest uppercase">MLV PG Services</p>
            <p className="text-[10px] text-gray-500">Resident Dashboard Activation</p>
          </div>
        </div>

        {success ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F1629] border border-white/8 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xl">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={56} />
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display' }}>Profile Submitted!</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Thank you, <strong className="text-white">{invitation?.full_name || fullName}</strong>. Your profile has been submitted for admin approval. 
              Once the admin approves your registration, we will activate your dashboard access and notify you immediately via Email & WhatsApp with your login credentials.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full text-black transition-all" style={{ background: 'linear-gradient(135deg, #C8840A, #F5A623)' }}>
              Got It, Thanks
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2" style={{ fontFamily: 'Playfair Display' }}>
                <ShieldCheck style={{ color: GOLD }} /> Activate Your Student Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-2">Complete your profile to activate your MLV PG resident account.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Stay Details */}
              <div className="col-span-1 lg:col-span-1 space-y-6">
                <div className="bg-[#0F1629] border border-white/8 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#f59e0b]/20">
                    <Building size={16} className="text-[#f59e0b]" /> Assigned Stay Details
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Full Name *</span>
                      {token ? (
                        <input
                          type="text"
                          disabled
                          value={fullName}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => {
                            setFullName(e.target.value)
                            setFormErrors((p: any) => ({ ...p, fullName: '' }))
                          }}
                          placeholder="Full Name"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                      )}
                      {formErrors.fullName && <p className="text-red-400 text-[10px] mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Mobile Number *</span>
                      {token ? (
                        <input
                          type="tel"
                          disabled
                          value={phone}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={phone}
                          onChange={e => {
                            if (/^\d*$/.test(e.target.value)) setPhone(e.target.value)
                            setFormErrors((p: any) => ({ ...p, phone: '' }))
                          }}
                          placeholder="10-digit Mobile"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                      )}
                      {formErrors.phone && <p className="text-red-400 text-[10px] mt-1">{formErrors.phone}</p>}
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address *</span>
                      {token ? (
                        <input
                          type="email"
                          disabled
                          value={email}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value)
                            setFormErrors((p: any) => ({ ...p, email: '' }))
                          }}
                          placeholder="email@example.com"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                      )}
                      {formErrors.email && <p className="text-red-400 text-[10px] mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">PG Building *</span>
                      {token ? (
                        <input
                          type="text"
                          disabled
                          value={invitation?.buildings?.name || invitation?.profile_data?.manualBuildingName || 'Main Building'}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                        />
                      ) : isManualBuilding ? (
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={manualBuildingName}
                            onChange={e => {
                              setManualBuildingName(e.target.value)
                              setFormErrors((p: any) => ({ ...p, buildingId: '' }))
                            }}
                            placeholder="Enter Building Name"
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                          {buildings.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsManualBuilding(false)
                                setBuildingId('')
                                setManualBuildingName('')
                              }}
                              className="text-[10px] text-[#f59e0b] font-semibold hover:underline absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              Select from list
                            </button>
                          )}
                        </div>
                      ) : (
                        <select
                          required
                          value={buildingId}
                          onChange={e => {
                            if (e.target.value === 'manual') {
                              setIsManualBuilding(true)
                              setBuildingId('')
                              setIsManualRoom(true)
                              setRoomId('')
                            } else {
                              setBuildingId(e.target.value)
                              setFormErrors((p: any) => ({ ...p, buildingId: '' }))
                            }
                            setRoomId('')
                          }}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        >
                          <option value="">-- Building --</option>
                          {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                          <option value="manual">Other / Type Manually</option>
                        </select>
                      )}
                      {formErrors.buildingId && <p className="text-red-400 text-[10px] mt-1">{formErrors.buildingId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Floor *</span>
                        {token ? (
                          <input
                            type="text"
                            disabled
                            value={`Floor ${floorNumber || 1}`}
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                          />
                        ) : (
                          <input
                            type="number"
                            required
                            value={floorNumber}
                            onChange={e => {
                              setFloorNumber(e.target.value)
                              setFormErrors((p: any) => ({ ...p, floorNumber: '' }))
                            }}
                            placeholder="Floor"
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                        )}
                        {formErrors.floorNumber && <p className="text-red-400 text-[10px] mt-1">{formErrors.floorNumber}</p>}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Room *</span>
                        {token ? (
                          <input
                            type="text"
                            disabled
                            value={`Room ${invitation?.rooms?.room_number || invitation?.profile_data?.manualRoomNumber || '—'}`}
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                          />
                        ) : isManualRoom ? (
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={manualRoomNumber}
                              onChange={e => {
                                setManualRoomNumber(e.target.value)
                                setFormErrors((p: any) => ({ ...p, roomId: '' }))
                              }}
                              placeholder="Room No"
                              className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                            />
                            {!isManualBuilding && rooms.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsManualRoom(false)
                                  setRoomId('')
                                  setManualRoomNumber('')
                                }}
                                className="text-[10px] text-[#f59e0b] font-semibold hover:underline absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                Select
                              </button>
                            )}
                          </div>
                        ) : (
                          <select
                            required
                            disabled={!buildingId}
                            value={roomId}
                            onChange={e => {
                              if (e.target.value === 'manual') {
                                setIsManualRoom(true)
                                setRoomId('')
                              } else {
                                setRoomId(e.target.value)
                                setFormErrors((p: any) => ({ ...p, roomId: '' }))
                              }
                            }}
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all disabled:opacity-50"
                          >
                            <option value="">-- Room --</option>
                            {rooms.map(r => (
                              <option key={r.id} value={r.id}>Room {r.room_number}</option>
                            ))}
                            <option value="manual">Other / Type Manually</option>
                          </select>
                        )}
                        {formErrors.roomId && <p className="text-red-400 text-[10px] mt-1">{formErrors.roomId}</p>}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Joining Date *</span>
                      {token ? (
                        <input
                          type="text"
                          disabled
                          value={joiningDate}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="date"
                          required
                          value={joiningDate}
                          onChange={e => {
                            setJoiningDate(e.target.value)
                            setFormErrors((p: any) => ({ ...p, joiningDate: '' }))
                          }}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                      )}
                      {formErrors.joiningDate && <p className="text-red-400 text-[10px] mt-1">{formErrors.joiningDate}</p>}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] text-gray-500 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                      🔒 {token ? 'The details above are set by PG administration and are read-only to prevent duplicate registrations.' : 'Fill in your stay details matching the room you occupy at MLV PG.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Details Form */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="bg-[#0F1629] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  
                  {/* Personal & College */}
                  <div>
                    <h3 className="text-base font-bold text-[#f59e0b] mb-4 pb-2 border-b border-[#f59e0b]/20 flex items-center gap-2">
                      <User size={18} className="text-[#f59e0b]" /> 1. Personal & College/Company Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Aadhaar Card Number *</label>
                        <input
                          type="text"
                          maxLength={12}
                          required
                          value={aadharNumber}
                          onChange={e => {
                            if (/^\d*$/.test(e.target.value)) setAadharNumber(e.target.value)
                            setFormErrors((p: any) => ({ ...p, aadharNumber: '' }))
                          }}
                          placeholder="12-digit Aadhaar Number"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.aadharNumber && <p className="text-red-400 text-[10px] mt-1">{formErrors.aadharNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={e => {
                            setDob(e.target.value)
                            setFormErrors((p: any) => ({ ...p, dob: '' }))
                          }}
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.dob && <p className="text-red-400 text-[10px] mt-1">{formErrors.dob}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">College / Company Name *</label>
                        <input
                          type="text"
                          required
                          value={collegeName}
                          onChange={e => {
                            setCollegeName(e.target.value)
                            setFormErrors((p: any) => ({ ...p, collegeName: '' }))
                          }}
                          placeholder="Acharya Institute of Tech / Infosys"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.collegeName && <p className="text-red-400 text-[10px] mt-1">{formErrors.collegeName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Course / Designation *</label>
                        <input
                          type="text"
                          required
                          value={course}
                          onChange={e => {
                            setCourse(e.target.value)
                            setFormErrors((p: any) => ({ ...p, course: '' }))
                          }}
                          placeholder="B.Tech CSE / Software Engineer"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.course && <p className="text-red-400 text-[10px] mt-1">{formErrors.course}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <div>
                    <h3 className="text-base font-bold text-[#f59e0b] mb-4 pb-2 border-b border-[#f59e0b]/20 flex items-center gap-2">
                      <Home size={18} className="text-[#f59e0b]" /> 2. Permanent Address
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">House, Street & Area Address *</label>
                        <textarea
                          required
                          rows={2}
                          value={permanentAddress}
                          onChange={e => {
                            setPermanentAddress(e.target.value)
                            setFormErrors((p: any) => ({ ...p, permanentAddress: '' }))
                          }}
                          placeholder="House No, Street, Landmark..."
                          className="w-full p-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all resize-none"
                          style={{ minHeight: '80px' }}
                        />
                        {formErrors.permanentAddress && <p className="text-red-400 text-[10px] mt-1">{formErrors.permanentAddress}</p>}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={e => {
                              setCity(e.target.value)
                              setFormErrors((p: any) => ({ ...p, city: '' }))
                            }}
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                          {formErrors.city && <p className="text-red-400 text-[10px] mt-1">{formErrors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">State *</label>
                          <input
                            type="text"
                            required
                            value={stateName}
                            onChange={e => {
                              setStateName(e.target.value)
                              setFormErrors((p: any) => ({ ...p, stateName: '' }))
                            }}
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                          {formErrors.stateName && <p className="text-red-400 text-[10px] mt-1">{formErrors.stateName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Pincode *</label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={pincode}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) setPincode(e.target.value)
                              setFormErrors((p: any) => ({ ...p, pincode: '' }))
                            }}
                            className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                          {formErrors.pincode && <p className="text-red-400 text-[10px] mt-1">{formErrors.pincode}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-base font-bold text-[#f59e0b] mb-4 pb-2 border-b border-[#f59e0b]/20 flex items-center gap-2">
                      <Phone size={18} className="text-[#f59e0b]" /> 3. Emergency Contact Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={emergencyName}
                          onChange={e => {
                            setEmergencyName(e.target.value)
                            setFormErrors((p: any) => ({ ...p, emergencyName: '' }))
                          }}
                          placeholder="Parent / Guardian Name"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.emergencyName && <p className="text-red-400 text-[10px] mt-1">{formErrors.emergencyName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={emergencyPhone}
                          onChange={e => {
                            if (/^\d*$/.test(e.target.value)) setEmergencyPhone(e.target.value)
                            setFormErrors((p: any) => ({ ...p, emergencyPhone: '' }))
                          }}
                          placeholder="Emergency Mobile"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.emergencyPhone && <p className="text-red-400 text-[10px] mt-1">{formErrors.emergencyPhone}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Relationship *</label>
                        <input
                          type="text"
                          required
                          value={emergencyRelationship}
                          onChange={e => {
                            setEmergencyRelationship(e.target.value)
                            setFormErrors((p: any) => ({ ...p, emergencyRelationship: '' }))
                          }}
                          placeholder="Father / Mother / Guardian"
                          className="w-full h-12 px-4 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                        />
                        {formErrors.emergencyRelationship && <p className="text-red-400 text-[10px] mt-1">{formErrors.emergencyRelationship}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div>
                    <h3 className="text-base font-bold text-[#f59e0b] mb-4 pb-2 border-b border-[#f59e0b]/20 flex items-center gap-2">
                      <FileText size={18} className="text-[#f59e0b]" /> 4. Verification Document Vault
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo upload */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Profile Passport Photo (Optional)</label>
                        <div
                          onClick={() => document.getElementById('photo-input')?.click()}
                          className="rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:bg-[#f59e0b]/5 border-2 border-dashed"
                          style={{
                            minHeight: '120px',
                            borderColor: photoFile ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
                            backgroundColor: photoFile ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          }}
                        >
                          <input
                            id="photo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              setPhotoFile(e.target.files?.[0] || null)
                              setFormErrors((p: any) => ({ ...p, photoFile: '' }))
                            }}
                          />
                          {photoFile ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                                <CheckCircle size={18} />
                              </div>
                              <p className="text-xs text-amber-500 font-semibold truncate max-w-[150px]">{photoFile.name}</p>
                              <p className="text-[10px] text-gray-500">Click to replace photo</p>
                            </div>
                          ) : (
                            <div className="text-gray-500 flex flex-col items-center gap-1">
                              <Upload size={20} className="text-[#f59e0b]/80 mb-0.5" />
                              <span className="text-xs font-semibold text-gray-300">Upload Passport Photo</span>
                              <span className="text-[9px] text-gray-500">JPEG, PNG up to 5MB</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aadhaar ID Proof upload */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Aadhaar Card / ID Proof (Optional)</label>
                        <div
                          onClick={() => document.getElementById('id-input')?.click()}
                          className="rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:bg-[#f59e0b]/5 border-2 border-dashed"
                          style={{
                            minHeight: '120px',
                            borderColor: idProofFile ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
                            backgroundColor: idProofFile ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          }}
                        >
                          <input
                            id="id-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => {
                              setIdProofFile(e.target.files?.[0] || null)
                              setFormErrors((p: any) => ({ ...p, idProofFile: '' }))
                            }}
                          />
                          {idProofFile ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                                <CheckCircle size={18} />
                              </div>
                              <p className="text-xs text-amber-500 font-semibold truncate max-w-[150px]">{idProofFile.name}</p>
                              <p className="text-[10px] text-gray-500">Click to replace proof</p>
                            </div>
                          ) : (
                            <div className="text-gray-500 flex flex-col items-center gap-1">
                              <Upload size={20} className="text-[#f59e0b]/80 mb-0.5" />
                              <span className="text-xs font-semibold text-gray-300">Upload Aadhaar Proof</span>
                              <span className="text-[9px] text-gray-500">PDF, JPG up to 5MB</span>
                            </div>
                          )}
                        </div>
                        {formErrors.idProofFile && <p className="text-red-400 text-[10px] mt-1">{formErrors.idProofFile}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Password creation */}
                  <div>
                    <h3 className="text-base font-bold text-[#f59e0b] mb-4 pb-2 border-b border-[#f59e0b]/20 flex items-center gap-2">
                      <Lock size={18} className="text-[#f59e0b]" /> 5. Set Portal Login Password
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Create Password *</label>
                        <div className="relative">
                          <input
                            type={showPw ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => {
                              setPassword(e.target.value)
                              setFormErrors((p: any) => ({ ...p, password: '' }))
                            }}
                            placeholder="Minimum 6 characters"
                            className="w-full h-12 pl-4 pr-10 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                          >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {formErrors.password && <p className="text-red-400 text-[10px] mt-1">{formErrors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Confirm Password *</label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={e => {
                              setConfirmPassword(e.target.value)
                              setFormErrors((p: any) => ({ ...p, confirmPassword: '' }))
                            }}
                            placeholder="Re-type your password"
                            className="w-full h-12 pl-4 pr-10 rounded-[10px] text-sm bg-white border border-[#f59e0b]/15 text-black font-medium placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/15 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                          >
                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {formErrors.confirmPassword && <p className="text-red-400 text-[10px] mt-1">{formErrors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Confirmation checkbox */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer text-left">
                      <input
                        type="checkbox"
                        checked={confirmChecked}
                        onChange={e => {
                          setConfirmChecked(e.target.checked)
                          setFormErrors((p: any) => ({ ...p, confirmChecked: '' }))
                        }}
                        className="rounded border border-[#f59e0b]/15 text-[#f59e0b] outline-none"
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: '18px',
                          minHeight: '18px',
                          marginTop: '2px',
                          accentColor: '#f59e0b'
                        }}
                      />
                      <span className="text-xs text-gray-400 select-none leading-relaxed">
                        I confirm that I am an existing resident of MLV PG and all information provided is accurate and matches official records.
                      </span>
                    </label>
                    {formErrors.confirmChecked && <p className="text-red-400 text-[10px]">{formErrors.confirmChecked}</p>}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-[52px] rounded-xl text-black font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
                      style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting Registration Profile…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Submit Registration Profile
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
