import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Build an admin-level Supabase client using the service role key
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Verify the caller is a logged-in admin ──────────────────
async function getCallerSession() {
  try {
    const serverClient = await createServerClient()
    const { data: { session } } = await serverClient.auth.getSession()
    return session
  } catch {
    return null
  }
}

// GET /api/admin/users — list all auth users
export async function GET() {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { data, error } = await admin.auth.admin.listUsers()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return only safe fields
  const users = (data.users || []).map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.user_metadata?.full_name || '',
    role: u.user_metadata?.role || 'admin',
    last_sign_in_at: u.last_sign_in_at,
    created_at: u.created_at,
  }))

  return NextResponse.json({ users }, { status: 200 })
}

// POST /api/admin/users — invite / create a new admin user
export async function POST(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const body = await request.json()
  const { email, password, full_name } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: full_name || '', role: 'admin' },
    email_confirm: true, // auto-confirm so user can log in immediately
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || '',
        role: 'admin',
        created_at: data.user.created_at,
      },
    },
    { status: 201 }
  )
}

// DELETE /api/admin/users — delete a user by id
export async function DELETE(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  // Prevent deleting self
  if (userId === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
