# MLV PG Services - Pre-Registration Form Setup Guide

## Overview
The pre-registration form has been updated with a beautiful modal design matching the attached wireframe. The form now includes:
- Gold "PRE-REGISTRATION OPEN" badge
- Modern, clean 2-column layout
- Nationality/Country field (supports Indian, Nepali, Bhutanese, etc.)
- All required fields for student pre-registration
- WhatsApp integration button
- Special requirements textarea

## Current Status

### ✅ What's Working
- Beautiful modal UI with smooth animations
- Form validation with real-time error messages
- All form fields properly configured
- WhatsApp button integration
- Success/error message handling
- Responsive design for mobile and desktop

### ⚠️ What Needs Fixing
The form submission is currently blocked by Supabase database configuration issues:
1. **RLS (Row Level Security) policies** are not set up to allow INSERT operations
2. **Database schema constraint** restricts the gender field to 'Male'/'Female'/'Other', but the form now sends nationality values

## How to Fix

### Step 1: Run the Migration SQL in Supabase

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query and paste the contents of `supabase_migration_nationality.sql`
4. Click **Run** to execute the migration

This migration will:
- Enable Row Level Security on `pre_registrations` and `contact` tables
- Create INSERT policies for both `anon` and `authenticated` roles
- Add a `nationality` column to the `pre_registrations` table
- Remove the restrictive CHECK constraint on the gender column

### Step 2: Test the Form

After running the migration:
1. Refresh the website at `http://localhost:3000`
2. Wait 10 seconds or click any "Book Now" button to open the pre-registration modal
3. Fill in the form with test data:
   - **Full Name:** Any name (min 2 characters)
   - **Mobile Number:** 10-digit number (e.g., 9876543210)
   - **Email:** Valid email address
   - **Nationality:** Select from dropdown (Indian, Nepali, Bhutanese, etc.)
   - **College:** College name
   - **Course:** Course name  
   - **Expected Join Date:** Pick a future date
   - **Preferred Room Type:** Choose room type
   - **Parent Contact:** 10-digit phone number
   - **Food Preference:** Select from options
   - **Special Requirements:** Optional message

4. Click **Submit Pre-Registration** to submit the form
5. You should see a success message

## File Changes Made

### Components Updated
- `components/forms/PreRegistrationForm.tsx` - Complete redesign of the form UI and submission logic
- Updated styling to match the attached wireframe
- Added WhatsApp button integration

### Constants Updated
- `lib/utils/constants.ts` - Added NATIONALITIES array with common nationalities

### Validation Updated
- `lib/utils/validations.ts` - Updated PreRegistrationSchema to accept nationality values

### Database Files Created
- `supabase_migration_nationality.sql` - Migration file to fix RLS and schema issues

## Form Features

### 1. Auto-Open Modal
The form automatically opens after 10 seconds when you first visit the website (can be disabled in code).

### 2. Manual Opening
Click any "Book Now" or "Pre-Register" button to open the form.

### 3. WhatsApp Integration
- Click "WhatsApp Directly" to open WhatsApp and contact the PG
- Message is pre-filled with inquiry text
- No need to manually type

### 4. Form Validation
- Real-time validation as you type
- Clear error messages for each field
- Phone numbers validated to 10 digits
- Email format validation

### 5. Success Message
- Shows celebratory animation on successful submission
- Displays success message and auto-closes after 3 seconds

### 6. Error Handling
- Displays user-friendly error messages
- Shows API errors from Supabase
- Allows retry after error

## Environment Variables Needed

Make sure your `.env` file includes:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210  # WhatsApp number in E.164 format
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### "Row Level Security Policy Violation" Error
**Solution:** Run the migration SQL file in Supabase SQL Editor as described in Step 1.

### "Phone must be 10 digits" Error
**Solution:** Enter a valid 10-digit phone number without country code.

### "Invalid email address" Error
**Solution:** Enter a valid email address in the format: user@example.com

### "Nationality field shows gender options"
**Solution:** This was temporary during development. After running the migration, it will show proper nationality options.

### Form doesn't submit even after migration
1. Check browser console for errors (F12 → Console tab)
2. Verify all required fields are filled
3. Check that Supabase URL and keys are correct in `.env`
4. Verify RLS policies are enabled by checking in Supabase dashboard

## Next Steps

After the form is working:

1. **Configure Email Notifications:**
   - Set up Supabase email templates for confirmation emails
   - Update the TODO comments in `app/api/registrations/route.ts`

2. **Add Admin Dashboard:**
   - Create admin interface to view registrations
   - Add ability to respond to inquiries

3. **Integrate Payment:**
   - Add payment gateway integration for actual bookings

## Additional Resources

- **Supabase RLS Documentation:** https://supabase.com/docs/guides/auth/row-level-security
- **Form Validation:** Using Zod schema in `lib/utils/validations.ts`
- **Component Documentation:** See comments in `components/forms/PreRegistrationForm.tsx`
