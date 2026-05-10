// Supabase Full Schema Verification Test
// Run AFTER executing supabase_schema.sql in Supabase SQL Editor
// Usage: node test-supabase.mjs

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envLocalPath = resolve(process.cwd(), '.env.local');
  const envPath = resolve(process.cwd(), '.env');
  let envContent = '';
  if (existsSync(envLocalPath)) {
    envContent = readFileSync(envLocalPath, 'utf-8');
    console.log('📄 Loaded: .env.local');
  } else if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
    console.log('📄 Loaded: .env');
  } else {
    console.error('❌ No .env.local or .env file found!');
    process.exit(1);
  }
  const vars = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    vars[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
  }
  return vars;
}

async function checkTable(url, headers, tableName) {
  try {
    const res = await fetch(`${url}/rest/v1/${tableName}?select=count`, {
      headers: { ...headers, Prefer: 'count=exact' },
    });
    const body = await res.text();
    if (res.ok) {
      const range = res.headers.get('content-range') || '0/0';
      const total = range.split('/')[1] || '0';
      return { ok: true, count: total };
    } else {
      let msg = body;
      try { msg = JSON.parse(body).message || body; } catch {}
      return { ok: false, error: msg };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function testInsert(url, headers, tableName, payload) {
  try {
    const res = await fetch(`${url}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    if (res.ok || res.status === 201) {
      return { ok: true };
    } else {
      let msg = body;
      try { msg = JSON.parse(body).message || body; } catch {}
      return { ok: false, error: msg };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function runTests() {
  console.log('\n🔍 MLV PG Services — Full Schema Verification\n');
  console.log('═'.repeat(52));

  const env = loadEnv();
  const url = env['NEXT_PUBLIC_SUPABASE_URL'];
  const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || url.includes('your-project')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured!'); process.exit(1);
  }

  console.log(`\n🌐 Project URL : ${url}`);
  console.log(`🔑 Anon Key    : ${anonKey.slice(0, 20)}...`);

  const anonHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };

  const serviceHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  // ── Test 1: Auth Health ──────────────────────────────────
  console.log('\n🔐 Test 1: Auth Service');
  const authRes = await fetch(`${url}/auth/v1/health`, { headers: anonHeaders });
  if (authRes.ok) {
    const d = await authRes.json();
    console.log(`   ✅ GoTrue ${d.version} — Online`);
  } else {
    console.log(`   ❌ Auth service failed: ${authRes.status}`);
  }

  // ── Test 2: Table Checks (service role — full access) ────
  console.log('\n🗄️  Test 2: Table Existence & Row Counts (service role)');
  const tables = [
    'pre_registrations',
    'contact',
    'room_bookings',
    'admin_users',
    'testimonials',
    'gallery_images',
  ];

  let allTablesOk = true;
  for (const table of tables) {
    const result = await checkTable(url, serviceHeaders, table);
    if (result.ok) {
      console.log(`   ✅ ${table.padEnd(22)} — rows: ${result.count}`);
    } else {
      console.log(`   ❌ ${table.padEnd(22)} — ${result.error.slice(0, 60)}`);
      allTablesOk = false;
    }
  }

  // ── Test 3: Public INSERT (anon — pre_registration form) ─
  console.log('\n📝 Test 3: Public INSERT into pre_registrations (anon)');
  const testReg = {
    full_name: 'Test Student',
    phone: '9999999999',
    email: 'test@example.com',
    gender: 'Male',
    college_name: 'Test College',
    course: 'B.Tech CSE',
    room_preference: 'Double Sharing',
    check_in_date: '2026-06-01',
    parent_contact: '8888888888',
    food_preference: 'Veg',
    additional_notes: 'Schema verification test — safe to delete',
    status: 'new',
  };
  const insertResult = await testInsert(url, anonHeaders, 'pre_registrations', testReg);
  if (insertResult.ok) {
    console.log('   ✅ Anon INSERT works — PreRegistrationForm will function correctly');
  } else {
    console.log('   ❌ Anon INSERT failed:', insertResult.error);
  }

  // ── Test 4: Public INSERT (anon — contact form) ──────────
  console.log('\n💬 Test 4: Public INSERT into contact (anon)');
  const testContact = {
    name: 'Test User',
    phone: '9999999998',
    email: 'test2@example.com',
    subject: 'Schema Test',
    message: 'This is a schema verification test — safe to delete',
    status: 'new',
  };
  const contactResult = await testInsert(url, anonHeaders, 'contact', testContact);
  if (contactResult.ok) {
    console.log('   ✅ Anon INSERT works — ContactForm will function correctly');
  } else {
    console.log('   ❌ Anon INSERT failed:', contactResult.error);
  }

  // ── Test 5: Public Testimonials Read ─────────────────────
  console.log('\n⭐ Test 5: Public SELECT approved testimonials (anon)');
  const testiResult = await checkTable(url, anonHeaders, 'testimonials');
  if (testiResult.ok) {
    console.log(`   ✅ Testimonials readable — ${testiResult.count} approved rows`);
  } else {
    console.log('   ❌ Testimonials not readable:', testiResult.error);
  }

  // ── Summary ───────────────────────────────────────────────
  console.log('\n' + '═'.repeat(52));
  if (allTablesOk) {
    console.log('🎉 All tables exist! Schema is fully deployed.\n');
    console.log('✅ Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Submit the Pre-Registration form');
    console.log('   3. Check Admin Dashboard at /admin/dashboard\n');
  } else {
    console.log('⚠️  Some tables are missing!\n');
    console.log('👉 Go to: https://supabase.com/dashboard/project/wgnbbxvbzjsmvmiutzgd/sql/new');
    console.log('   Paste and run the contents of: supabase_schema.sql\n');
  }
}

runTests().catch(console.error);
