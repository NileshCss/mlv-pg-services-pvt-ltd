# 🚀 Admin Dashboard - Quick Setup & Deployment Guide

## ⚡ Quick Start (5 minutes)

### 1. Environment Setup
Create `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Third-party integrations
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
WATI_API_KEY=your-wati-api-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Setup Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase_schema.sql`
3. Enable RLS on all tables
4. Copy your credentials to `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/admin/login`

### 5. Default Admin Access
- **Email**: Configure in Supabase Auth
- **Password**: Set via Supabase dashboard

## 🔑 Create Admin User in Supabase

### Via Supabase Dashboard:
1. Go to Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"

### Via Supabase CLI:
```bash
supabase start
supabase projects create
```

## 📦 Build for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel
```

## 🗄️ Database Setup Checklist

- [ ] Run `supabase_schema.sql` in SQL editor
- [ ] Enable Row Level Security on all tables
- [ ] Create policies for authenticated users
- [ ] Test database connections
- [ ] Setup storage bucket for gallery uploads
- [ ] Configure CORS for public access

## 🔐 Security Checklist

- [ ] Enable HTTPS in production
- [ ] Set strong admin passwords
- [ ] Enable 2FA in Supabase
- [ ] Configure firewall rules
- [ ] Encrypt API keys in environment
- [ ] Regular backups configured
- [ ] Error logging enabled
- [ ] Rate limiting configured

## 🎨 Customization Guide

### Change Theme Colors
Edit `lib/admin/designSystem.ts`:

```typescript
export const DESIGN_SYSTEM = {
  colors: {
    gold: '#F5A623',              // Change primary color
    goldLight: '#FFD166',          // Hover color
    bgPrimary: '#0A0E1A',         // Background color
    // ... more colors
  }
}
```

### Add Google Fonts
Edit `app/layout.tsx`:

```typescript
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'] })
const dmSans = DM_Sans({ subsets: ['latin'] })
```

### Change Logo
Edit `components/admin/layout/Sidebar.tsx`:

```typescript
<div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
  <img src="/logo.png" alt="MLV" className="w-full h-full" />
</div>
```

## 📊 Analytics Integration

### Add Google Analytics
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Add Sentry Error Tracking
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## 🔌 API Integration Examples

### Razorpay Payment Integration
```typescript
// In /api/admin/payments/create
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const order = await razorpay.orders.create({
  amount: 50000, // in paise
  currency: 'INR',
})
```

### WhatsApp Integration
```typescript
// Using WATI API
const sendWhatsApp = async (phone: string, message: string) => {
  const response = await fetch('https://api.wati.io/api/v1/sendSessionMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WATI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      waNumber: `91${phone}`,
      messageText: message,
    }),
  })
  return response.json()
}
```

### Email Notifications
```typescript
// Using Nodemailer
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

await transporter.sendMail({
  from: 'admin@mlvpg.com',
  to: email,
  subject: 'New Registration',
  html: '<h1>Welcome!</h1>',
})
```

## 📈 Performance Optimization

### Enable Caching
```typescript
// app/admin/dashboard/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds
```

### Optimize Images
```typescript
import Image from 'next/image'

<Image
  src={image.image_url}
  alt="Gallery image"
  width={400}
  height={400}
  priority={false}
  loading="lazy"
/>
```

### Code Splitting
```typescript
import dynamic from 'next/dynamic'

const BookingsKanban = dynamic(() => import('@/components/BookingsKanban'), {
  loading: () => <KanbanSkeleton />,
  ssr: false
})
```

## 🐛 Troubleshooting

### Issue: Login not working
**Solution**: 
1. Check Supabase connection string in `.env.local`
2. Verify user exists in Supabase Auth
3. Check browser console for errors

### Issue: Images not uploading
**Solution**:
1. Verify Supabase Storage bucket exists
2. Check storage permissions (public/private)
3. Verify CORS configuration

### Issue: Charts not rendering
**Solution**:
1. Ensure Recharts is installed: `npm install recharts`
2. Check data format matches chart requirements
3. Verify 'use client' directive is present

### Issue: Drag-drop not working
**Solution**:
1. Verify @hello-pangea/dnd is installed
2. Check DragDropContext wrapping
3. Ensure Droppable/Draggable IDs are unique

## 📱 Mobile Optimization

The dashboard is fully responsive. Test on:
- iPhone 12/13/14 (375px)
- iPad (768px)
- Desktop (1024px+)

All pages auto-stack vertically on mobile with proper padding.

## 🚢 Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrated to production
- [ ] Admin user created
- [ ] SSL certificate installed
- [ ] Storage bucket configured
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Domain configured
- [ ] Email verified for SMTP
- [ ] Analytics integrated

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Recharts**: https://recharts.org/

## 🎉 You're All Set!

Your premium admin dashboard is ready. Customize it to match your brand and deploy with confidence.

### Next Steps:
1. ✅ Setup environment variables
2. ✅ Configure Supabase database
3. ✅ Create admin user
4. ✅ Test all features locally
5. ✅ Deploy to production
6. ✅ Configure integrations (optional)
7. ✅ Setup monitoring & analytics
8. ✅ Train team on dashboard

**Happy Admin Dashboard-ing! 🚀**
