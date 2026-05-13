'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  UtensilsCrossed,
  Home,
  Image,
  Star,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Registrations', icon: ClipboardList, href: '/admin/registrations' },
  { label: 'Bookings', icon: Calendar, href: '/admin/bookings' },
  { label: 'Food Menu', icon: UtensilsCrossed, href: '/admin/food-menu' },
  { label: 'Rooms', icon: Home, href: '/admin/rooms' },
  { label: 'Gallery', icon: Image, href: '/admin/gallery' },
  { label: 'Testimonials', icon: Star, href: '/admin/testimonials' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
]

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col"
        style={{
          background: '#080C18',
          borderRight: '1px solid rgba(245, 166, 35, 0.1)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-amber-500/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">MLV</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">MLV</p>
                <p className="text-xs text-gray-400">PG Services</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border-l-3 border-amber-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-amber-500/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Mobile Sidebar */}
      {!sidebarCollapsed && (
        <motion.div
          initial={{ x: -240 }}
          animate={{ x: 0 }}
          exit={{ x: -240 }}
          className="md:hidden fixed left-0 top-0 h-screen w-60 bg-gray-900 border-r border-amber-500/10 z-30 flex flex-col"
        >
          {/* Logo */}
          <div className="p-6 border-b border-amber-500/10">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">MLV</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">MLV</p>
                <p className="text-xs text-gray-400">PG Services</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={toggleSidebar}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 border-l-3 border-amber-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-amber-500/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}
