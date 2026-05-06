# Supabase Setup Guide

This guide will help you set up Supabase for the MLV PG Services website.

## Prerequisites

- Supabase account (create at [supabase.com](https://supabase.com))
- PostgreSQL basics (optional but helpful)

## Step 1: Create a Supabase Project

1. Sign in to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Name**: `mlv-pg-services`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for it to initialize (5-10 minutes)

## Step 2: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: This is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: This is `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Create Database Tables

### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Pre-Registrations Table
CREATE TABLE pre_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  full_name TEXT NOT NULL,
  phone VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  college_name TEXT NOT NULL,
  course TEXT NOT NULL,
  room_preference VARCHAR(100) NOT NULL,
  check_in_date DATE NOT NULL,
  parent_contact VARCHAR(10) NOT NULL,
  food_preference VARCHAR(100) NOT NULL,
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'new',
  UNIQUE(email, phone)
);

-- Room Bookings Table
CREATE TABLE room_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  student_name TEXT NOT NULL,
  phone VARCHAR(10) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  booking_status VARCHAR(50) DEFAULT 'pending'
);

-- Contact Messages Table
CREATE TABLE contact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  phone VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new'
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  password_hash TEXT NOT NULL
);

-- Testimonials Table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  student_name TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT
);

-- Gallery Images Table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  UNIQUE(image_url)
);

-- Create Indexes for Performance
CREATE INDEX idx_pre_registrations_status ON pre_registrations(status);
CREATE INDEX idx_pre_registrations_created_at ON pre_registrations(created_at DESC);
CREATE INDEX idx_contact_status ON contact(status);
CREATE INDEX idx_contact_created_at ON contact(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create Policies for public read (registrations can be inserted publicly)
CREATE POLICY "Allow public insert to pre_registrations" 
  ON pre_registrations 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public insert to contact" 
  ON contact 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Allow reading testimonials and galleries
CREATE POLICY "Allow public read testimonials" 
  ON testimonials 
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow public read gallery_images" 
  ON gallery_images 
  FOR SELECT 
  TO anon
  USING (true);
```

4. Click "Run" to execute the SQL
5. Verify tables are created by checking the **Table Editor**

## Step 4: Set Up Environment Variables

1. In your project root, copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Never commit this file to version control (it's in `.gitignore`)

## Step 5: Enable Email Notifications (Optional)

### Set Up Email via Supabase

1. Go to **Settings** → **Email Templates**
2. Configure email settings for notifications

### Alternative: Using Third-Party Email Service

You can integrate with services like:
- SendGrid
- Mailgun
- AWS SES
- Google Gmail (via Nodemailer)

Update your API routes (`/api/registrations/route.ts` and `/api/contact/route.ts`) to send emails.

## Step 6: Test the Connection

1. Run the development server:

```bash
npm run dev
```

2. Visit http://localhost:3000
3. Fill out the pre-registration form
4. Check Supabase **Table Editor** → **pre_registrations** to verify data is saved

## Troubleshooting

### "Connection refused"
- Make sure your Supabase project is running
- Check that your URL is correct

### "Invalid API Key"
- Verify you copied the correct anon key
- Check for extra spaces or characters

### "Permission denied"
- Ensure Row Level Security policies are correctly set
- Check that you're using the correct key (anon vs service_role)

### "Table doesn't exist"
- Run the SQL script again
- Ensure you selected the correct database
- Check for typos in table names

## Next Steps

1. Set up authentication with Supabase Auth
2. Configure storage for image uploads
3. Set up automated backups
4. Monitor performance with Supabase analytics

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Dashboard](https://app.supabase.com)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
