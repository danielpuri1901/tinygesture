-- Create gestures table (if not exists)
CREATE TABLE IF NOT EXISTS gestures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT,
  voice_url TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clicks table (if not exists)
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient_email TEXT
);

-- Create storage bucket for gesture media (run manually in Supabase dashboard)
-- Bucket name: gestures-media
-- Public: true (for reading)
-- File size limit: 10MB
