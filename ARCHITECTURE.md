# Architecture & Technology Stack

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pages        │  │ Components   │  │ Styles       │      │
│  │ - Homepage   │  │ - UI         │  │ - Tailwind   │      │
│  │ - Admin      │  │ - Forms      │  │ - Global CSS │      │
│  │ - Auth       │  │ - Sections   │  │ - Animations │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
           │                                 │
           │                                 │
           ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (Next.js Routes)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/regist  │  │ /api/contact │  │ /api/admin   │      │
│  │ - POST       │  │ - POST       │  │ - GET        │      │
│  │ - GET        │  │ - GET        │  │ - PATCH      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
           │                                 │
           │                                 │
           ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Backend as a Service)                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │           PostgreSQL Database                    │       │
│  │                                                  │       │
│  │  ┌─────────────┐  ┌─────────────┐              │       │
│  │  │ Registrations│  │ Contact     │              │       │
│  │  │ Room Bookings│  │ Testimonials│              │       │
│  │  │ Admin Users │  │ Gallery     │              │       │
│  │  └─────────────┘  └─────────────┘              │       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │        Supabase Auth & RLS (Row Level Security) │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion 10
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js via Vercel
- **API Routes**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Direct SQL via Supabase Client

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (optional)
- **CDN**: Vercel CDN
- **DNS**: Domain registrar

### Development Tools
- **Language**: TypeScript
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest (optional)

## 📦 Dependency Breakdown

### Core Dependencies
```json
{
  "next": "^15.0.0",           // React framework
  "react": "^19.0.0",          // UI library
  "react-dom": "^19.0.0"       // DOM rendering
}
```

### Database & Auth
```json
{
  "@supabase/supabase-js": "^2.38.0",  // Database client
  "@supabase/ssr": "^0.0.10"           // Server-side rendering support
}
```

### UI & Styling
```json
{
  "framer-motion": "^10.16.0",        // Animations
  "lucide-react": "^0.292.0",         // Icons
  "tailwindcss": "^3.3.0",            // CSS framework
  "class-variance-authority": "^0.7.0" // Component variants
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.48.0",       // Form management
  "zod": "^3.22.0",                   // Schema validation
  "@hookform/resolvers": "^3.3.0"     // Zod + React Hook Form
}
```

### Utilities
```json
{
  "axios": "^1.6.0",           // HTTP requests
  "sonner": "^1.2.0",          // Toast notifications
  "clsx": "^2.0.0",            // Class name utilities
  "tailwind-merge": "^2.2.0"   // Merge Tailwind classes
}
```

## 🏗️ Component Architecture

### UI Components (`components/ui/`)
Reusable, unstyled components:
- `Button.tsx` - CTA buttons
- `Input.tsx` - Form inputs
- `Select.tsx` - Dropdowns
- `Dialog.tsx` - Modals
- `Card.tsx` - Content containers
- `Alert.tsx` - Notifications
- `Skeleton.tsx` - Loading states
- `Navbar.tsx` - Navigation
- `Footer.tsx` - Footer
- `WhatsAppButton.tsx` - WhatsApp CTA

### Form Components (`components/forms/`)
Business-logic forms:
- `PreRegistrationForm.tsx` - Pre-registration popup
- `ContactForm.tsx` - Contact form

### Section Components (`components/sections/`)
Homepage sections:
- `HeroSection.tsx` - Hero banner
- `AboutSection.tsx` - About MLV PG
- `FacilitiesSection.tsx` - Facilities list
- `RoomsSection.tsx` - Room types & pricing
- `TestimonialsSection.tsx` - Student reviews
- `GallerySection.tsx` - Photo gallery
- `FAQSection.tsx` - FAQ accordion
- `ContactSection.tsx` - Contact form + info

## 🔄 Data Flow

### Pre-Registration Flow
```
User fills form
    ↓
React Hook Form validates (Zod)
    ↓
Submit to /api/registrations
    ↓
API validates again
    ↓
Insert into Supabase
    ↓
Trigger email notification
    ↓
Show success message
    ↓
Store in localStorage (optional)
```

### Admin Dashboard Flow
```
Admin visits /admin/login
    ↓
Enter credentials
    ↓
Local auth check (demo mode)
    ↓
Store token in localStorage
    ↓
Fetch data from API
    ↓
Display dashboard
    ↓
Real-time updates via polling
```

## 📊 Database Schema

### pre_registrations
```sql
id (UUID)
created_at (timestamp)
full_name (text)
phone (varchar)
email (varchar)
gender (varchar)
college_name (text)
course (text)
room_preference (varchar)
check_in_date (date)
parent_contact (varchar)
food_preference (varchar)
additional_notes (text)
status (varchar) - [new, contacted, confirmed]
```

### contact
```sql
id (UUID)
created_at (timestamp)
name (text)
phone (varchar)
email (varchar)
subject (text)
message (text)
status (varchar) - [new, read, replied]
```

### room_bookings
```sql
id (UUID)
created_at (timestamp)
student_name (text)
phone (varchar)
room_number (varchar)
room_type (varchar)
payment_status (varchar)
booking_status (varchar)
```

### testimonials
```sql
id (UUID)
created_at (timestamp)
student_name (text)
message (text)
rating (integer)
image_url (text)
```

### gallery_images
```sql
id (UUID)
created_at (timestamp)
image_url (text)
category (varchar)
```

## 🔐 Security Features

1. **Environment Variables**: Sensitive data in `.env.local`
2. **Row Level Security**: RLS policies on database tables
3. **Input Validation**: Zod schemas on frontend and backend
4. **SQL Injection Prevention**: Parameterized queries via Supabase
5. **CORS**: Configured in API routes
6. **HTTPS**: Enforced on production
7. **Authentication**: Supabase Auth integration ready

## 📈 Performance Optimizations

1. **Image Optimization**:
   - WebP format conversion
   - Responsive images
   - Lazy loading
   - CDN delivery

2. **Code Splitting**:
   - Next.js automatic code splitting
   - Dynamic imports for heavy components
   - Tree shaking

3. **Caching**:
   - Static page generation (SSG)
   - Incremental Static Regeneration (ISR)
   - Client-side caching
   - Browser caching headers

4. **Bundle Size**:
   - Tree shaking unused code
   - Minification
   - Compression

## 🧪 Testing Strategy

### Unit Tests
- Component rendering
- Form validation
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Form submissions

### E2E Tests
- Complete user flows
- Admin dashboard
- Mobile responsiveness

## 🔄 CI/CD Pipeline

### GitHub Actions
```
git push
    ↓
Trigger workflow
    ↓
Run linter
    ↓
Run tests
    ↓
Build Next.js
    ↓
Deploy to Vercel
    ↓
Run smoke tests
```

## 📱 Responsive Design Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1536px

## 🎨 Design System

### Colors
- **Primary**: #0d1b85 (Dark Blue)
- **Secondary**: #c9a84c (Gold)
- **Dark**: #111827 (Almost Black)
- **White**: #ffffff

### Typography
- **Display**: Playfair Display (Serif)
- **Body**: DM Sans (Sans-serif)

### Spacing Scale
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, ...

## 🚀 Performance Targets

- Lighthouse Score: 90+
- Core Web Vitals: All green
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

---

For detailed setup and deployment instructions, refer to other documentation files.
