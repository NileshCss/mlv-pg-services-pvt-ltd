'use client'

import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Eye, Edit2, Trash2, UserPlus, RefreshCw, Layers, ShieldAlert, CheckCircle, Home, Hammer, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { RoomFormPanel } from '@/components/rooms/RoomFormPanel'
import { BuildingFormPanel } from '@/components/rooms/BuildingFormPanel'
import { useRooms } from '@/hooks/useRooms'
import { deleteRoom, deleteBuilding } from '@/lib/services/rooms.service'
import type { Room, Building } from '@/types/room.types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const GOLD = '#F59E0B'

export default function RoomsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'rooms' | 'buildings'>('rooms')
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'single' | 'double' | 'triple' | 'dormitory' | 'available' | 'occupied' | 'maintenance' | 'reserved'>('all')
  const [activeBuildingId, setActiveBuildingId] = useState<string>('all')

  // Slide-over Form Panels
  const [roomFormOpen, setRoomFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  
  const [buildingFormOpen, setBuildingFormOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)

  // Details view modals
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null)
  const [viewingBuilding, setViewingBuilding] = useState<Building | null>(null)

  const { rooms, buildings, isLoading, refetch, refetchBuildings } = useRooms(activeFilter, activeBuildingId)

  // ── STATS COMPUTATION ───────────────────────────────────────
  const stats = useMemo(() => {
    const totalBuildings = buildings.length
    const totalRooms = rooms.length
    
    const occupiedRooms = rooms.filter(r => r.occupied_beds > 0).length
    const availableRooms = rooms.filter(r => r.status === 'available').length
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length

    let totalBeds = 0
    let occupiedBeds = 0
    rooms.forEach(r => {
      totalBeds += r.total_beds || 0
      occupiedBeds += r.occupied_beds || 0
    })

    const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    return {
      totalBuildings,
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyPercent,
      totalBeds,
      occupiedBeds
    }
  }, [rooms, buildings])

  // ── DELETION HANDLERS ───────────────────────────────────────
  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room ${room.room_number}?`)) return
    
    try {
      const { error } = await deleteRoom(room.id)
      if (error) {
        // Show detailed warning alert/popup
        alert(`❌ CANNOT DELETE ROOM\n\nReason: ${error.message}\n\nPlease resolve active allocations before deleting the room.`);
        toast.error(error.message)
        return
      }
      toast.success(`Room ${room.room_number} deleted successfully`)
      refetch()
    } catch (err: any) {
      toast.error('An error occurred during deletion')
    }
  }

  const handleDeleteBuilding = async (bldg: Building) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${bldg.name}?`)) return

    try {
      const { error } = await deleteBuilding(bldg.id)
      if (error) {
        alert(`❌ CANNOT DELETE BUILDING\n\nReason: ${error.message}\n\nPlease delete or reassign all rooms associated with this building first.`);
        toast.error(error.message)
        return
      }
      toast.success(`Building ${bldg.name} deleted successfully`)
      refetchBuildings()
      refetch()
    } catch (err: any) {
      toast.error('An error occurred during deletion')
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0A0E1A] p-6 lg:p-8 text-gray-100"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
              🏨 Room & Building Inventory
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage buildings, floor arrangements, rates, and bed allocations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { refetch(); refetchBuildings(); }}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 text-gray-400 hover:text-amber-400 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => {
                if (activeTab === 'rooms') {
                  setEditingRoom(null)
                  setRoomFormOpen(true)
                } else {
                  setEditingBuilding(null)
                  setBuildingFormOpen(true)
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'rooms' ? 'Add Room' : 'Add Building'}
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Panel */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Buildings</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-white">{stats.totalBuildings}</span>
              <span className="text-xs text-gray-400">blocks</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Rooms</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-white">{stats.totalRooms}</span>
              <span className="text-xs text-gray-400">units</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Occupied Rooms</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-red-400">{stats.occupiedRooms}</span>
              <span className="text-xs text-gray-500">in use</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Available Rooms</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-green-400">{stats.availableRooms}</span>
              <span className="text-xs text-gray-500">vacant</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Maintenance</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-orange-400">{stats.maintenanceRooms}</span>
              <span className="text-xs text-gray-500">offline</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Occupancy Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-amber-500">{stats.occupancyPercent}%</span>
              <span className="text-xs text-gray-400">({stats.occupiedBeds}/{stats.totalBeds})</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('rooms')}
            className="pb-3 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === 'rooms' ? GOLD : '#9CA3AF' }}
          >
            🏠 Rooms Inventory ({rooms.length})
            {activeTab === 'rooms' && (
              <motion.div layoutId="roomsTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
            )}
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className="pb-3 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === 'buildings' ? GOLD : '#9CA3AF' }}
          >
            🏢 Buildings ({buildings.length})
            {activeTab === 'buildings' && (
              <motion.div layoutId="roomsTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
            )}
          </button>
        </div>

        {/* Dynamic Section view */}
        {activeTab === 'rooms' ? (
          <div className="space-y-6">
            {/* Rooms Filtering Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                {['all', 'single', 'double', 'triple', 'dormitory', 'available', 'occupied', 'maintenance', 'reserved'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveFilter(t as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                      activeFilter === t
                        ? 'bg-amber-500/25 text-amber-400 border border-amber-500/35'
                        : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <select
                value={activeBuildingId}
                onChange={e => setActiveBuildingId(e.target.value)}
                className="bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none cursor-pointer focus:border-amber-500"
              >
                <option value="all">🏢 All Buildings</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ROOMS TABLE */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-2xl">
                <Loader2 className="animate-spin text-amber-500 mb-3" size={24} />
                <p className="text-sm text-gray-400">Loading inventory data…</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <Home size={38} className="mx-auto mb-3 text-gray-600" />
                <p className="font-semibold text-gray-300">No rooms found</p>
                <p className="text-sm text-gray-500 mt-1">Try changing your filters or add a new room.</p>
              </div>
            ) : (
              <div className="bg-[#0F1629] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] table-auto text-left border-collapse">
                    <thead className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-b border-amber-500/15">
                      <tr>
                        {['Building', 'Floor', 'Room Number', 'Room Type', 'Capacity', 'Occupied Beds', 'Available Beds', 'Rent / Bed', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-4 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-white/80 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {rooms.map(room => (
                        <tr key={room.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-3.5 font-semibold text-white">{room.building_name}</td>
                          <td className="px-5 py-3.5 text-gray-400">{room.floor || 0}</td>
                          <td className="px-5 py-3.5 font-bold text-amber-500">{room.room_number}</td>
                          <td className="px-5 py-3.5 text-gray-400 capitalize">{room.room_type}</td>
                          <td className="px-5 py-3.5 font-semibold text-white">{room.total_beds} beds</td>
                          <td className="px-5 py-3.5 text-red-400">{room.occupied_beds} occupied</td>
                          <td className="px-5 py-3.5 font-bold text-green-400">{Math.max(0, room.total_beds - room.occupied_beds)} vacant</td>
                          <td className="px-5 py-3.5 font-mono text-gray-200">₹{room.price_per_bed?.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              room.status === 'available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              room.status === 'occupied' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              room.status === 'maintenance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {room.status === 'available' ? '🟢 Available' :
                               room.status === 'occupied' ? '🔴 Occupied' :
                               room.status === 'maintenance' ? '🟠 Maintenance' :
                               '🔵 Reserved'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingRoom(room)}
                                className="p-1.5 rounded-lg border border-white/10 hover:border-amber-500/40 text-gray-400 hover:text-amber-400 transition-colors"
                                title="View Details"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => { setEditingRoom(room); setRoomFormOpen(true); }}
                                className="p-1.5 rounded-lg border border-white/10 hover:border-amber-500/40 text-gray-400 hover:text-amber-400 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/students`)}
                                className="px-2.5 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-bold text-amber-500 uppercase tracking-wider transition-all"
                                title="Assign Student"
                              >
                                <UserPlus size={10} className="inline mr-1" /> Assign
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room)}
                                className="p-1.5 rounded-lg border border-red-500/10 text-red-400/60 hover:text-red-400 hover:border-red-500/30 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BUILDINGS VIEW */
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-2xl">
                <Loader2 className="animate-spin text-amber-500 mb-3" size={24} />
                <p className="text-sm text-gray-400">Loading buildings arrangements…</p>
              </div>
            ) : buildings.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <Layers size={38} className="mx-auto mb-3 text-gray-600" />
                <p className="font-semibold text-gray-300">No buildings registered yet</p>
                <p className="text-sm text-gray-500 mt-1">Add a building to start allocating rooms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {buildings.map(bldg => {
                  const buildingRooms = rooms.filter(r => r.building_id === bldg.id)
                  const roomsCount = buildingRooms.length
                  const occCount = buildingRooms.filter(r => r.occupied_beds > 0).length
                  
                  return (
                    <motion.div
                      key={bldg.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-white/10 bg-[#0F1629] p-5 flex flex-col justify-between gap-4 hover:border-amber-500/30 transition-all group hover:-translate-y-0.5 shadow-lg"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <h4 className="font-bold text-white text-base group-hover:text-amber-500 transition-colors">{bldg.name}</h4>
                            <span className="text-[10px] font-mono text-gray-500 tracking-widest">{bldg.code}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            bldg.status === 'Boys PG' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'
                          }`}>
                            {bldg.status}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 mb-4 font-medium italic">
                          "{bldg.address}"
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-b border-white/5 py-3 text-xs">
                          <div>
                            <span className="text-gray-500 block">Total Rooms</span>
                            <span className="text-sm font-bold text-white mt-0.5 block">{roomsCount} units</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Occupied Rooms</span>
                            <span className="text-sm font-bold text-red-400 mt-0.5 block">{occCount} active</span>
                          </div>
                        </div>

                        {bldg.description && (
                          <p className="text-xs text-gray-500 mt-3 line-clamp-2">{bldg.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setViewingBuilding(bldg)}
                          className="flex-1 py-2 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() => { setEditingBuilding(bldg); setBuildingFormOpen(true); }}
                          className="flex-1 py-2 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBuilding(bldg)}
                          className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Building"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Slide-over Form Panel: Room ── */}
      <AnimatePresence>
        {roomFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRoomFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#0F1629] border-l border-white/8 z-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
            >
              <RoomFormPanel
                mode={editingRoom ? 'edit' : 'add'}
                room={editingRoom}
                buildings={buildings}
                onClose={() => setRoomFormOpen(false)}
                onSuccess={() => {
                  setRoomFormOpen(false)
                  refetch()
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Slide-over Form Panel: Building ── */}
      <AnimatePresence>
        {buildingFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuildingFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#0F1629] border-l border-white/8 z-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
            >
              <BuildingFormPanel
                mode={editingBuilding ? 'edit' : 'add'}
                building={editingBuilding}
                onClose={() => setBuildingFormOpen(false)}
                onSuccess={() => {
                  setBuildingFormOpen(false)
                  refetchBuildings()
                  refetch()
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Detail View Modal: Room ── */}
      <AnimatePresence>
        {viewingRoom && (
          <>
            <div onClick={() => setViewingRoom(null)} className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg bg-[#0F1629] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">Room {viewingRoom.room_number} Details</h3>
                <button onClick={() => setViewingRoom(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Building</span>
                  <span className="text-white font-bold">{viewingRoom.building_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Floor</span>
                  <span className="text-white font-bold">{viewingRoom.floor} Floor</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Room Type</span>
                  <span className="text-white capitalize">{viewingRoom.room_type}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Bed Capacity</span>
                  <span className="text-white">{viewingRoom.total_beds} beds ({viewingRoom.occupied_beds} occupied)</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Monthly Rent</span>
                  <span className="text-amber-500 font-bold">₹{viewingRoom.price_per_bed?.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Security Deposit</span>
                  <span className="text-amber-500 font-bold">₹{viewingRoom.security_deposit?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Electricity Charges</span>
                  <span className="text-white">₹{viewingRoom.electricity_charges?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Maintenance Charges</span>
                  <span className="text-white">₹{viewingRoom.maintenance_charges?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>

              {viewingRoom.amenities && viewingRoom.amenities.length > 0 && (
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-2">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingRoom.amenities.map(a => (
                      <span key={a} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-xs text-gray-300">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingRoom.notes && (
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Remarks</span>
                  <p className="text-xs text-gray-400 bg-white/[0.02] p-3 rounded-lg border border-white/5 italic">"{viewingRoom.notes}"</p>
                </div>
              )}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── Detail View Modal: Building ── */}
      <AnimatePresence>
        {viewingBuilding && (
          <>
            <div onClick={() => setViewingBuilding(null)} className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg bg-[#0F1629] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">{viewingBuilding.name}</h3>
                <button onClick={() => setViewingBuilding(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block">Building Code</span>
                  <span className="text-white font-mono text-sm tracking-wider">{viewingBuilding.code}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status / Type</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    viewingBuilding.status === 'Boys PG' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'
                  }`}>{viewingBuilding.status}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Address</span>
                  <span className="text-white">{viewingBuilding.address}</span>
                </div>
                {viewingBuilding.description && (
                  <div>
                    <span className="text-gray-500 block">Description</span>
                    <p className="text-xs text-gray-300 bg-white/[0.02] p-3 rounded-lg border border-white/5">{viewingBuilding.description}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
