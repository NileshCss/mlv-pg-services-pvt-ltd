// ===== SUPABASE CLIENT (Backend — Node.js 20 compatible) =====
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

const supabaseUrl     = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in backend/.env');
  process.exit(1);
}

// Use the service-role key so the backend bypasses RLS.
// Pass ws as the Realtime transport — required for Node.js < 22.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
  realtime: {
    transport: ws,
  },
});

module.exports = supabase;
