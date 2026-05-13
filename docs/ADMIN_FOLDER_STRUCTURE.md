# 📁 Complete Admin Dashboard - Folder Structure Reference

## Directory Tree with File Descriptions

```
mlv-pg-services-website/
│
├── 📄 ADMIN_IMPLEMENTATION_COMPLETE.md
│   └── Complete summary of what has been implemented
│
├── 📄 ADMIN_SETUP_GUIDE.md
│   └── Quick setup, deployment, and customization guide
│
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Enterprise login page with glassmorphism design
│   │   │           - Email/password auth
│   │   │           - Remember me checkbox
│   │   │           - Feature showcase on right panel
│   │   │           - Responsive layout (mobile-friendly)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx ✅ UPDATED
│   │   │       └── Main dashboard with stats and charts
│   │   │           - 4 animated stat cards
│   │   │           - Monthly registrations chart
│   │   │           - Booking status distribution pie chart
│   │   │           - Quick action cards
│   │   │
│   │   ├── registrations/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Registrations management
│   │   │           - Data table with pagination
│   │   │           - Search + status filter
│   │   │           - Bulk delete + CSV export
│   │   │           - Inline status change
│   │   │           - WhatsApp integration
│   │   │
│   │   ├── bookings/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Kanban booking pipeline
│   │   │           - 6 status columns
│   │   │           - Drag-and-drop with @hello-pangea/dnd
│   │   │           - Real-time status updates
│   │   │           - Quick delete buttons
│   │   │
│   │   ├── rooms/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Room management grid
│   │   │           - Responsive grid (3/2/1 cols)
│   │   │           - Filter by type/AC/maintenance
│   │   │           - Occupancy visualization
│   │   │           - Edit/delete/maintenance toggle
│   │   │
│   │   ├── gallery/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Gallery management with uploads
│   │   │           - Drag-and-drop upload zone
│   │   │           - Image compression
│   │   │           - Supabase Storage integration
│   │   │           - Category filtering
│   │   │           - Preview modal
│   │   │           - Delete & toggle active
│   │   │
│   │   ├── testimonials/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Testimonial moderation
│   │   │           - Grid with cards
│   │   │           - Add/edit modal form
│   │   │           - Star rating selector
│   │   │           - Status workflow (pending/approved/rejected)
│   │   │           - Feature/unfeature toggle
│   │   │
│   │   ├── users/
│   │   │   └── page.tsx ✨ NEW
│   │   │       └── Admin users management
│   │   │           - User listing with details
│   │   │           - Role management
│   │   │           - Last sign-in tracking
│   │   │           - Delete with safety checks
│   │   │
│   │   └── settings/
│   │       └── page.tsx ✨ NEW
│   │           └── Admin settings dashboard
│   │               - Profile management
│   │               - Password change with validation
│   │               - Notification preferences
│   │               - Integration settings (Razorpay, WhatsApp, SMTP)
│   │
│   ├── layout.tsx
│   │   └── Root layout with fonts and providers
│   │
│   └── globals.css
│       └── Global styles
│
├── components/
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx ✅ EXISTING
│   │   │   │   └── Wrapper for all admin pages with auth check
│   │   │   │       - Authentication guard
│   │   │   │       - Sidebar + main content layout
│   │   │   │       - Responsive design
│   │   │   │
│   │   │   └── Sidebar.tsx ✅ EXISTING
│   │   │       └── Navigation sidebar
│   │   │           - Collapsible (64px/240px)
│   │   │           - 9 nav items with icons
│   │   │           - Active state with gold highlight
│   │   │           - Mobile overlay menu
│   │   │           - Logout button
│   │   │
│   │   └── dashboard/
│   │       ├── StatCard.tsx ✅ EXISTING
│   │       │   └── Animated stat card component
│   │       │       - Counter animation on mount
│   │       │       - Trend indicator (up/down arrow)
│   │       │       - Color variants (gold/blue/green/red)
│   │       │       - Prefix/suffix support
│   │       │
│   │       ├── RegistrationsChart.tsx ✅ EXISTING
│   │       │   └── Monthly registrations bar chart
│   │       │       - Recharts BarChart
│   │       │       - Custom dark tooltip
│   │       │       - Responsive container
│   │       │       - Legend
│   │       │
│   │       └── BookingStatusChart.tsx ✅ EXISTING
│   │           └── Booking distribution pie chart
│   │               - Recharts PieChart
│   │               - 6 status colors
│   │               - Custom tooltip
│   │               - Label display
│   │
│   ├── ui/
│   │   ├── Alert.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── WhatsAppButton.tsx
│   │
│   ├── forms/
│   │   ├── ContactForm.tsx
│   │   ├── PreRegistrationForm.tsx
│   │   └── (more form components)
│   │
│   └── sections/
│       └── (public page sections)
│
├── store/ (Zustand State Management)
│   ├── authStore.ts ✅ COMPLETE
│   │   └── Authentication state
│   │       - user: User | null
│   │       - isLoading: boolean
│   │       - isAuthenticated: boolean
│   │       - setUser(), logout()
│   │
│   ├── uiStore.ts ✅ COMPLETE
│   │   └── UI state management
│   │       - sidebarCollapsed: boolean
│   │       - activeModal: string | null
│   │       - toggleSidebar(), openModal(), closeModal()
│   │
│   └── dashboardStore.ts ✅ COMPLETE
│       └── Dashboard data and filters
│           - stats: DashboardStats
│           - filters: { dateRange, status, searchQuery }
│           - setStats(), setFilters(), resetFilters()
│
├── lib/
│   ├── admin/
│   │   └── designSystem.ts ✅ COMPLETE
│   │       └── Complete design system
│   │           - Color palette (gold, status colors)
│   │           - Typography scales
│   │           - Shadows & borders
│   │           - Component patterns
│   │           - Tailwind theme config
│   │           - Chart colors for Recharts
│   │
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   │
│   ├── animations.ts
│   ├── utils.ts
│   └── validations/
│       ├── registration.schema.ts
│       ├── booking.schema.ts
│       ├── foodmenu.schema.ts
│       └── room.schema.ts
│
├── types/
│   ├── database.ts
│   ├── food.ts
│   ├── registration.ts
│   ├── booking.ts
│   └── index.ts
│
├── public/
│   └── images/
│
├── styles/
│   └── globals.css
│
├── middleware.ts
│   └── Auth protection for dashboard routes
│
├── tailwind.config.ts ✅ CONFIGURED
│   └── Tailwind CSS configuration
│       - Custom colors
│       - Font families
│       - Animation keyframes
│       - Box shadows
│
├── next.config.js
├── tsconfig.json
├── package.json ✅ UPDATED (has all dependencies)
├── postcss.config.js
└── README.md

```

## 🎯 What Each Section Does

### Admin Pages (`/app/admin/*/page.tsx`)
All pages follow the same pattern:
1. Use `DashboardLayout` wrapper for auth + sidebar
2. Fetch data from Supabase on mount
3. Render with Framer Motion animations
4. Use Zustand stores for state
5. Show toast notifications on actions
6. Handle loading/error states gracefully

### Components Structure
- **Layout**: Sidebar navigation and page layout
- **Dashboard**: Charts and stat cards
- **UI**: Reusable button, card, input components
- **Forms**: Contact, registration forms (public pages)
- **Sections**: Hero, about, facilities sections (public pages)

### State Management (Zustand)
Three separate stores for different concerns:
- **authStore**: Who is logged in
- **uiStore**: UI interactions (sidebar collapse, modals)
- **dashboardStore**: Data and filters

### Design System
Centralized in `lib/admin/designSystem.ts`:
- Colors with semantic names
- Typography scales
- Component patterns
- Animation specs
- Chart configuration

### Types
TypeScript interfaces for:
- Database tables
- API responses
- Form inputs
- Component props

## 🔗 Dependencies You Need

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "zustand": "^5.0.13",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "framer-motion": "^11.0.0",
    "recharts": "^3.8.1",
    "lucide-react": "^0.292.0",
    "sonner": "^1.2.0",
    "@hello-pangea/dnd": "^18.0.1",
    "browser-image-compression": "^2.0.2",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.11",
    "tailwind-merge": "^2.2.0",
    "clsx": "^2.0.0"
  }
}
```

## ✅ File Checklist - What's New

- ✨ = Brand new files created
- ✅ = Already existed, may have been enhanced
- 📝 = Documentation files

| File | Status | Purpose |
|------|--------|---------|
| `/app/admin/login/page.tsx` | ✨ | Admin login page |
| `/app/admin/dashboard/page.tsx` | ✅ | Dashboard home |
| `/app/admin/registrations/page.tsx` | ✨ | Registrations management |
| `/app/admin/bookings/page.tsx` | ✨ | Kanban board |
| `/app/admin/rooms/page.tsx` | ✨ | Room management |
| `/app/admin/gallery/page.tsx` | ✨ | Gallery management |
| `/app/admin/testimonials/page.tsx` | ✨ | Testimonials management |
| `/app/admin/users/page.tsx` | ✨ | Users management |
| `/app/admin/settings/page.tsx` | ✨ | Settings page |
| `ADMIN_IMPLEMENTATION_COMPLETE.md` | 📝 | Complete implementation summary |
| `ADMIN_SETUP_GUIDE.md` | 📝 | Setup and deployment guide |

## 🎨 Color Palette Reference

```
Primary Background:    #0A0E1A
Secondary Surface:     #0F1629
Sidebar Background:    #080C18

Accent Gold:           #F5A623
Gold Hover:            #FFD166
Gold Pressed:          #C8840A

Text Primary:          #F0F4FF
Text Secondary:        #8892AA
Text Muted:            #4A5568

Status Colors:
  - New:       #3B82F6 (Blue)
  - Interested: #F59E0B (Amber)
  - Contacted:  #8B5CF6 (Purple)
  - Confirmed:  #10B981 (Green)
  - Checked In: #06B6D4 (Cyan)
  - Cancelled:  #EF4444 (Red)
```

## 🚀 Starting Point

1. **Login Page**: `/admin/login` - Start here first
2. **Dashboard**: `/admin/dashboard` - Main hub
3. **Registrations**: `/admin/registrations` - Manage registrations
4. **Bookings**: `/admin/bookings` - Manage bookings pipeline
5. **Settings**: `/admin/settings` - Configure admin account

All pages are protected by authentication and require login.

---

**Total Pages Created**: 9 (login + 8 dashboard pages)
**Total Components**: 3 new admin components + existing UI components
**Total Store Files**: 3 (auth, ui, dashboard)
**Design System**: 1 complete file
**Documentation**: 3 guides
