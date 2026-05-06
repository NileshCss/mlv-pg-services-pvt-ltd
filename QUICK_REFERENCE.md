# 📋 Quick Reference Guide

## 🎯 Start Here

### First Time Setup (5 minutes)
```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Set up Supabase (see SUPABASE_SETUP.md)
# 4. Add credentials to .env.local

# 5. Run dev server
npm run dev
```

---

## 📂 Key File Locations

### Configuration
| File | Purpose |
|------|---------|
| `.env.example` | Environment template |
| `.env.local` | Your secrets (don't commit) |
| `next.config.js` | Next.js settings |
| `tailwind.config.ts` | Colors & theme |
| `tsconfig.json` | TypeScript settings |

### Components
| Folder | Contains |
|--------|----------|
| `components/ui/` | Reusable UI components |
| `components/forms/` | Form components |
| `components/sections/` | Homepage sections |

### Core
| Folder | Contains |
|--------|----------|
| `app/(app)/` | Main pages |
| `app/(auth)/` | Auth pages |
| `app/admin/` | Admin pages |
| `app/api/` | API endpoints |
| `lib/` | Utilities & helpers |

---

## 🖼️ Components Available

### UI Components
- `Button` - Primary, secondary, outline, ghost
- `Input` - Text input with validation
- `Select` - Dropdown selector
- `Dialog` - Modal popup
- `Card` - Content container
- `Alert` - Info, success, warning, error
- `Skeleton` - Loading placeholder
- `Navbar` - Navigation header
- `Footer` - Footer section
- `WhatsAppButton` - Floating button

### Using Components
```typescript
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Example() {
  return (
    <Card>
      <h2>Hello</h2>
      <Button onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </Card>
  )
}
```

---

## 📝 Customizing Content

### Business Info
File: `lib/utils/constants.ts`
```typescript
export const HERO_CONTENT = {
  badge: '🏛️ Your badge',
  heading: 'Your heading',
  // ...
}

export const ROOM_TYPES = [
  { name: 'Single', price: 13000, ... },
  // ...
]

export const FACILITIES = [
  { icon: '🍽️', title: 'Food', ... },
  // ...
]
```

### Colors
File: `tailwind.config.ts`
```typescript
colors: {
  primary: { 900: '#0d1b85' },      // Dark blue
  secondary: { 500: '#c9a84c' },    // Gold
  // ...
}
```

### Links & Contact
Update these in multiple places:
- `components/ui/Navbar.tsx` - Navigation links
- `components/ui/Footer.tsx` - Footer links
- `lib/utils/constants.ts` - Contact info
- `.env.local` - WhatsApp number

---

## 🔌 API Endpoints

### Create Pre-Registration
```bash
POST /api/registrations
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "gender": "male",
  "college_name": "Acharya Institute",
  "course": "CSE",
  "room_preference": "double",
  "check_in_date": "2024-02-01",
  "parent_contact": "9876543211",
  "food_preference": "vegetarian",
  "additional_notes": "Some notes"
}
```

### Get Registrations
```bash
GET /api/registrations

Response:
[
  { id, full_name, phone, email, ... }
]
```

### Create Contact Message
```bash
POST /api/contact
Content-Type: application/json

{
  "name": "Jane",
  "phone": "9876543210",
  "email": "jane@example.com",
  "subject": "Question",
  "message": "I have a question..."
}
```

---

## 🎨 Styling Guide

### Colors
```css
/* Primary (Dark Blue) */
--color-primary-900: #0d1b85

/* Secondary (Gold) */
--color-secondary-500: #c9a84c

/* Backgrounds */
--color-dark-900: #111827
--color-white: #ffffff
```

### Spacing
```css
/* Use Tailwind classes */
p-4    /* padding */
m-4    /* margin */
gap-4  /* gap between items */

/* Responsive */
md:p-8 /* larger on tablet */
lg:p-12 /* larger on desktop */
```

### Text
```css
/* Headings */
text-3xl font-display   /* Large heading */
text-2xl font-display   /* Medium heading */
text-xl font-display    /* Small heading */

/* Body */
text-base font-body     /* Normal text */
text-sm font-body       /* Small text */
```

---

## 🔄 Form Handling

### Pre-Registration Form
```typescript
// Automatically validates with Zod
// Fields: full_name, phone, email, gender, college_name,
//         course, room_preference, check_in_date,
//         parent_contact, food_preference, additional_notes

// Usage in component:
import { PreRegistrationForm } from '@/components/forms/PreRegistrationForm'

<PreRegistrationForm />
```

### Contact Form
```typescript
import { ContactForm } from '@/components/forms/ContactForm'

<ContactForm 
  onSuccess={() => console.log('Message sent!')}
/>
```

### Adding Validation
File: `lib/utils/validations.ts`
```typescript
export const PreRegistrationSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
  // ...
})
```

---

## 🔓 Admin Panel

### Access
- URL: `/admin/login`
- Email: `admin@mlvpg.com`
- Password: `admin123`

### Dashboard Features
- View statistics
- See all leads
- Track messages
- View recent registrations

### Updating Credentials
File: `app/(auth)/login/page.tsx`
```typescript
// Update these credentials
const credentials = {
  email: 'admin@mlvpg.com',
  password: 'admin123'
}
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# 1. Connect GitHub
# 2. Select repository
# 3. Add environment variables
# 4. Deploy!
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
```

---

## 🧪 Testing Locally

### Test Form Submission
1. Go to `http://localhost:3000`
2. Wait 3 seconds for popup
3. Fill form
4. Submit
5. Check Supabase for data

### Test Admin Dashboard
1. Go to `http://localhost:3000/admin/login`
2. Use demo credentials
3. See dashboard with stats

### Test API Directly
```bash
# Using curl
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test",
    "phone": "9876543210",
    "email": "test@example.com",
    ...
  }'
```

---

## 🐛 Debugging

### Check Console
```bash
npm run dev
# Watch for errors in terminal
```

### Browser DevTools
- F12 to open
- Console tab for errors
- Network tab for API calls
- Application tab for localStorage

### Common Issues

**"Cannot find module"**
```bash
npm install
rm -rf .next
npm run dev
```

**"Supabase connection failed"**
- Check `.env.local`
- Verify credentials in Supabase dashboard
- Check network connectivity

**"Form not submitting"**
- Open browser console
- Check Network tab for API response
- Verify API endpoint exists
- Check Supabase tables exist

---

## 📊 File Structure Overview

```
mlv-pg-services/
├── app/                      # Next.js routes
│   ├── (app)/               # Main app
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/              # Auth pages
│   │   └── login/page.tsx
│   ├── admin/               # Admin pages
│   │   └── dashboard/page.tsx
│   ├── api/                 # API routes
│   │   ├── registrations/
│   │   └── contact/
│   └── layout.tsx
├── components/              # React components
│   ├── ui/                 # UI components (10)
│   ├── forms/              # Forms (2)
│   └── sections/           # Sections (8)
├── lib/                    # Utilities
│   ├── supabase/          # DB clients
│   └── utils/             # Helpers
├── types/                 # TypeScript types
├── styles/                # Global styles
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── Documentation files
```

---

## ✨ Quick Tips

### 1. Add a New Section
```typescript
// components/sections/NewSection.tsx
'use client'
import { motion } from 'framer-motion'

export const NewSection = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Content */}
      </div>
    </section>
  )
}

// app/(app)/page.tsx - import and add
<NewSection />
```

### 2. Add a New Color
```typescript
// tailwind.config.ts
colors: {
  mycolor: { 500: '#your-hex' }
}

// Use in components
className="text-mycolor-500"
```

### 3. Add a New Navigation Link
```typescript
// components/ui/Navbar.tsx
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'New Link', href: '#new-link' },
]
```

---

## 📞 Contact Information

- **Email**: info@mlvpg.com
- **WhatsApp**: +91 98765 43210
- **Location**: Opposite Acharya Institute, Bangalore

---

## 📚 Further Reading

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Detailed setup
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete summary

---

**Last Updated**: January 2024 | **Version**: 2.0.0
