'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarChart3, Users, FileText, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import axios from 'axios'

interface DashboardStats {
  totalLeads: number
  newLeads: number
  convertedLeads: number
  totalMessages: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    totalMessages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    setIsAuthorized(true)
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const [regRes, contactRes] = await Promise.all([
        axios.get('/api/registrations'),
        axios.get('/api/contact'),
      ])

      const registrationsData = regRes.data.data || []
      const contactsData = contactRes.data.data || []

      setStats({
        totalLeads: registrationsData.length,
        newLeads: registrationsData.filter((r: any) => r.status === 'new').length,
        convertedLeads: registrationsData.filter((r: any) => r.status === 'confirmed').length,
        totalMessages: contactsData.length,
      })

      setRegistrations(registrationsData.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-secondary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40`}>
        <div className="flex items-center gap-2 mb-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-500 text-dark-900 font-bold">
            MLV
          </div>
          <div>
            <div className="text-sm font-bold text-gray-50">MLV</div>
            <div className="text-xs text-gray-400">Admin</div>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { icon: BarChart3, label: 'Dashboard', href: '#' },
            { icon: Users, label: 'Pre-Registrations', href: '#registrations' },
            { icon: FileText, label: 'Messages', href: '#messages' },
          ].map((item, idx) => (
            <button
              key={idx}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-secondary-400"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-0 md:ml-64">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-50">Dashboard</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: stats.totalLeads, icon: '👥' },
              { label: 'New Leads', value: stats.newLeads, icon: '🆕' },
              { label: 'Converted', value: stats.convertedLeads, icon: '✅' },
              { label: 'Messages', value: stats.totalMessages, icon: '💬' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-xl bg-gray-900 border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-50 mt-2">{stat.value}</p>
                  </div>
                  <span className="text-4xl">{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Registrations */}
          <motion.div
            className="p-6 rounded-xl bg-gray-900 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-bold text-gray-50 mb-4">Recent Pre-Registrations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-gray-400">Phone</th>
                    <th className="px-4 py-3 text-left text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg: any, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3">{reg.full_name}</td>
                      <td className="px-4 py-3 text-gray-400">{reg.email}</td>
                      <td className="px-4 py-3 text-gray-400">{reg.phone}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-400 text-xs font-semibold">
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu Close */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
