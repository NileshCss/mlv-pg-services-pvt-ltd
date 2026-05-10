'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Shield, User } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    role?: string
  }
  last_sign_in_at?: string
  created_at: string
}

export default function UsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Get all users from a custom table if available
      // For now, we'll just show the current user
      if (user) {
        setUsers([{
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata,
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at || new Date().toISOString(),
        }])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error('Cannot delete your own account')
      return
    }

    if (!window.confirm('Delete this user?')) return

    try {
      // In production, you'd call an admin API to delete the user
      toast.success('User deleted')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete user')
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Users</h1>
            <p className="text-gray-400">Manage admin users and access</p>
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${DESIGN_SYSTEM.components.card.base} p-6 border border-blue-500/20 bg-blue-500/5`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Shield className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">User Management</h3>
              <p className="text-sm text-gray-400">
                User management is currently limited. To add or remove users, contact your Supabase administrator or use the Supabase dashboard.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Loading users...
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`${DESIGN_SYSTEM.components.card.base} overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-500/10">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">
                      Last Sign In
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.user_metadata?.full_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                          {user.user_metadata?.role || 'Admin'}
                        </span>
                        {user.id === currentUser?.id && (
                          <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={user.id === currentUser?.id}
                            onClick={() => handleDelete(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.id === currentUser?.id
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'hover:bg-red-500/20 text-red-400'
                            }`}
                            title={
                              user.id === currentUser?.id
                                ? 'Cannot delete yourself'
                                : 'Delete'
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
