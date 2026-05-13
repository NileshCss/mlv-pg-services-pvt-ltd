# Getting Started with MLV PG Services Website

Welcome! This guide will help you set up and run the MLV PG Services website locally.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ ([download](https://nodejs.org))
- **npm** or **yarn**: Usually comes with Node.js
- **Git**: For version control
- **Supabase Account**: Create at [supabase.com](https://supabase.com) (free)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mlv-pg-services.git
cd mlv-pg-services
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

Quick version:
1. Create a Supabase project
2. Run the SQL schema
3. Copy credentials to `.env.local`

### 4. Create Environment File

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
mlv-pg-services/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Main app routes
│   │   ├── layout.tsx           # App layout
│   │   └── page.tsx             # Homepage
│   ├── (auth)/                  # Auth routes
│   │   ├── login/page.tsx       # Admin login
│   │   └── signup/page.tsx      # Signup (optional)
│   ├── admin/                   # Admin routes
│   │   └── dashboard/page.tsx   # Dashboard
│   └── api/                     # API routes
│       ├── registrations/       # Registration endpoints
│       ├── contact/             # Contact form endpoints
│       └── admin/               # Admin endpoints
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Dialog.tsx
│   │   ├── Card.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── WhatsAppButton.tsx
│   │   └── ...
│   ├── forms/                   # Form components
│   │   ├── PreRegistrationForm.tsx
│   │   └── ContactForm.tsx
│   └── sections/                # Page sections
│       ├── HeroSection.tsx
│       ├── AboutSection.tsx
│       ├── FacilitiesSection.tsx
│       ├── RoomsSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── GallerySection.tsx
│       ├── FAQSection.tsx
│       └── ContactSection.tsx
├── lib/                         # Utilities and helpers
│   ├── supabase/               # Supabase clients
│   └── utils/                  # Helper functions
│       ├── constants.ts        # App constants
│       ├── helpers.ts          # Utility functions
│       └── validations.ts      # Zod schemas
├── types/                      # TypeScript types
├── styles/                     # Global styles
├── public/                     # Static assets
└── package.json               # Dependencies
```

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
colors: {
  primary: { 900: '#0d1b85' },    // Dark blue
  secondary: { 500: '#c9a84c' },  // Gold
  // ...
}
```

### Content

- **Hero Section**: Edit `components/sections/HeroSection.tsx`
- **Facilities**: Edit `lib/utils/constants.ts` → `FACILITIES`
- **Rooms**: Edit `lib/utils/constants.ts` → `ROOM_TYPES`
- **FAQs**: Edit `components/sections/FAQSection.tsx`

### WhatsApp Number

Update in `.env.local`:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

## 📝 Adding New Sections

1. Create component in `components/sections/YourSection.tsx`
2. Use the section template:

```typescript
'use client'

import React from 'react'
import { motion } from 'framer-motion'

export const YourSection: React.FC = () => {
  return (
    <section id="your-section" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Your content */}
      </div>
    </section>
  )
}
```

3. Import and add to `app/(app)/page.tsx`:

```typescript
import { YourSection } from '@/components/sections/YourSection'

export default function Home() {
  return (
    <>
      {/* Other sections */}
      <YourSection />
      {/* Other sections */}
    </>
  )
}
```

## 🔐 Admin Dashboard

### Access

1. Go to `/admin/login`
2. Use credentials:
   - Email: `admin@mlvpg.com`
   - Password: `admin123`

### Features

- View all pre-registrations
- View contact messages
- Dashboard statistics
- Manage leads

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick Vercel deployment:

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect on Vercel.com
# 3. Add environment variables
# 4. Deploy!
```

## 🐛 Troubleshooting

### "Cannot find module" error

```bash
npm install
```

### Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
```

### Supabase connection failed

- Check `.env.local` for correct credentials
- Verify Supabase project is active
- Check network connectivity

### Form submission not working

- Check browser console for errors
- Verify API routes are accessible
- Check Supabase tables exist

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For help:
1. Check the documentation in this repo
2. Visit [supabase.com/docs](https://supabase.com/docs)
3. Create an issue on GitHub
4. Contact the development team

---

**Happy coding! 🎉**
