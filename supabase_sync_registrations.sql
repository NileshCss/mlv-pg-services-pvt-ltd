-- ============================================================
-- Sync pre_registrations to bookings pipeline automatically
-- ============================================================

-- Function to handle the sync
CREATE OR REPLACE FUNCTION public.sync_registration_to_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into bookings table when a new registration is created
  INSERT INTO public.bookings (
    name,
    phone,
    email,
    college,
    room_number,
    check_in_date,
    status,
    notes,
    source
  ) VALUES (
    NEW.full_name,
    NEW.phone,
    NEW.email,
    NEW.college_name,
    NEW.room_preference,
    NEW.check_in_date,
    'new', -- initial status in pipeline
    'Auto-synced from website registration. Food pref: ' || COALESCE(NEW.food_preference, 'None'),
    'website'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_registration_to_booking ON public.pre_registrations;

-- Create the trigger
CREATE TRIGGER trigger_sync_registration_to_booking
AFTER INSERT ON public.pre_registrations
FOR EACH ROW
EXECUTE FUNCTION public.sync_registration_to_booking();

-- Optional: Sync existing registrations to bookings (if they aren't already there)
-- This checks if a booking with the same phone number already exists to avoid duplicates
INSERT INTO public.bookings (name, phone, email, college, room_number, check_in_date, status, notes, source, created_at)
SELECT 
  r.full_name, 
  r.phone, 
  r.email, 
  r.college_name, 
  r.room_preference, 
  r.check_in_date, 
  'new', 
  'Auto-migrated from existing registration. Food pref: ' || COALESCE(r.food_preference, 'None'), 
  'website',
  r.created_at
FROM public.pre_registrations r
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookings b WHERE b.phone = r.phone
);
