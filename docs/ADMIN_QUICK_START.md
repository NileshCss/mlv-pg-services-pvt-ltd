# Quick Start Guide - MLV Admin Dashboard

## 🚀 Get Started in 5 Minutes

### Step 1: Deploy Database Schema
```bash
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "New Query"
4. Copy entire content from: supabase_admin_schema.sql
5. Paste and click "Run"
6. Verify all tables created successfully
```

### Step 2: Create Admin User
```bash
1. Go to: Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: admin@yourdomain.com
4. Password: Generate strong password
5. Auto confirm email
6. User is now ready to login
```

### Step 3: Test Dashboard
```bash
# Terminal
cd e:\mlv_pg_services_website
npm run dev

# Browser
Visit: http://localhost:3000/admin/dashboard
```

### Step 4: View Dashboard
You should see:
- 4 Stat Cards with animated counters
- Monthly Registrations bar chart
- Booking Status pie chart
- Quick action links

---

## 📊 Dashboard Features

### Stat Cards
| Card | Value | Trend |
|------|-------|-------|
| Total Registrations | 256 | ↑ 12% |
| Total Bookings | 128 | ↑ 8% |
| Active Residents | 98 | ↑ 5% |
| Pending Follow-ups | 34 | ↓ 3% |

### Navigation Links
- **Dashboard** - Overview & analytics
- **Registrations** - Student pre-registrations
- **Bookings** - Room booking pipeline (Kanban)
- **Food Menu** - Weekly meal management
- **Rooms** - Room inventory & occupancy
- **Gallery** - Image management
- **Testimonials** - Student reviews
- **Users** - Admin user management
- **Settings** - Configuration & integrations

---

## 🎨 Design System

### Colors
- **Gold (Primary)**: #F5A623
- **Gold (Hover)**: #FFD166
- **Gold (Pressed)**: #C8840A
- **Background**: #0A0E1A
- **Card**: rgba(15, 22, 41, 0.8)

### Fonts
- **Display**: Playfair Display (headings)
- **Body**: DM Sans (text)
- **Mono**: JetBrains Mono (data/IDs)

### Effects
- Glassmorphism: `bg-white/5 backdrop-blur-xl border border-white/10`
- Premium Shadow: `shadow-[0_8px_32px_rgba(0,0,0,0.4)]`
- Gold Glow: `shadow-[0_8px_32px_rgba(245,166,35,0.15)]`

---

## 📁 Project Structure

```
admin-dashboard/
├── app/admin/
│   └── dashboard/
│       └── page.tsx          ← Main dashboard
│
├── components/admin/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── DashboardLayout.tsx
│   └── dashboard/
│       ├── StatCard.tsx
│       ├── RegistrationsChart.tsx
│       └── BookingStatusChart.tsx
│
├── store/
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── dashboardStore.ts
│
└── lib/admin/
    └── designSystem.ts
```

---

## 🔧 Environment Setup

### Required Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Get from Supabase
1. Go to: Settings → API
2. Copy "Project URL"
3. Copy "anon public" key

---

## ✨ Key Features

### StatCard Features
- ✅ Animated counter (800ms)
- ✅ Trend indicators (green ↑, red ↓)
- ✅ Color-coded metrics
- ✅ Hover lift effect
- ✅ Background glow animation

### Chart Features
- ✅ Responsive containers
- ✅ Dark tooltips with glassmorphism
- ✅ Custom styling for dark theme
- ✅ Animated on mount
- ✅ Legend and grid lines

### Layout Features
- ✅ Collapsible sidebar (240px → 64px)
- ✅ Mobile-responsive (hamburger menu)
- ✅ Active route highlighting
- ✅ Smooth animations
- ✅ Auth protection

---

## 🔐 Security

### Authentication
- Supabase Auth with JWT
- Protected routes (/admin/*)
- Automatic session management
- Logout functionality

### Database
- Row Level Security (RLS) enabled
- Policies for admin-only access
- Encrypted settings storage
- Audit timestamps (created_at, updated_at)

---

## 📈 Sample Data

The schema includes sample data for testing:
- 3 sample registrations
- 4 sample rooms with pricing
- 3 sample food menu days
- Mock chart data for visualization

---

## 🐛 Troubleshooting

### Dashboard not loading?
1. Check browser console for errors
2. Verify Supabase URL and key in .env.local
3. Confirm authenticated user exists
4. Check if migration SQL executed successfully

### Charts not showing?
1. Verify recharts package installed: `npm list recharts`
2. Check browser console for errors
3. Ensure mock data is loading

### Sidebar not responding?
1. Check if Zustand store is initialized
2. Verify useUIStore hook is imported correctly
3. Check browser console for errors

---

## 📞 Support Files

- **ADMIN_DASHBOARD_SETUP.md** - Full implementation details
- **supabase_admin_schema.sql** - Database schema SQL
- **QUICK_REFERENCE.md** - Quick lookup guide

---

## 🎯 Phase 2 - Coming Next

- ✅ Phase 1: Dashboard Analytics (COMPLETE)
- ⏳ Phase 2: Authentication & Core Pages
  - Login page (/admin/login)
  - Registrations management
  - Kanban bookings board
  - Food menu editor
  - Rooms grid
  - Gallery upload
  - Testimonials workflow
  - Settings page

---

**Ready to build?** Run `npm run dev` and visit `/admin/dashboard`!
