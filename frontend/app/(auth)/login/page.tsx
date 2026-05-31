'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { motion } from 'motion/react'
import { LogIn, Loader } from 'lucide-react'

/**
 * WARNING: This login page uses hardcoded credentials and should NOT be used for admin authentication.
 * Use /admin/login instead, which uses Supabase authentication.
 * This page is for demonstration purposes only and is a security risk.
 */
export default function DemoLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simulated admin login - in production, use Supabase Auth
      // For now, use static credentials
      if (email === 'admin@mlvpg.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card */}
        <div className="relative glass-effect border border-gray-800 rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 text-dark-900 font-bold text-lg mb-4">
              MLV
            </div>
            <h1 className="text-2xl font-bold text-gray-50 mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">MLV PG Services Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert type="error" title="Login Failed" description={error} closeable />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@mlvpg.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />

            <div className="flex items-center gap-[10px] text-[14px] text-gray-400">
              <input
                type="checkbox"
                id="remember"
                className="cursor-pointer"
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  minWidth: '18px',
                  minHeight: '18px',
                  margin: 0, 
                  accentColor: '#f59e0b',
                  flexShrink: 0,
                  appearance: 'auto',
                  WebkitAppearance: 'auto'
                }} 
              />
              <label htmlFor="remember" className="cursor-pointer hover:text-gray-300 transition-colors">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-3">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-400 bg-gray-900/50 p-3 rounded">
              <p>Email: <span className="text-secondary-400">admin@mlvpg.com</span></p>
              <p>Password: <span className="text-secondary-400">admin123</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 MLV PG Services. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}

