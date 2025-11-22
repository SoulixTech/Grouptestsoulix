-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access for admin_users" ON admin_users;

-- Create policy to allow public read access for authentication
CREATE POLICY "Allow public read access for admin_users"
ON admin_users
FOR SELECT
TO public
USING (true);

-- Insert default admin user
-- Username: admin
-- Password: SoulixGroup@2025
INSERT INTO admin_users (username, password)
VALUES ('admin', 'SoulixGroup@2025')
ON CONFLICT (username) DO NOTHING;

-- Optional: Add more admin users
-- INSERT INTO admin_users (username, password)
-- VALUES ('yourusername', 'yourpassword');

-- Fix RLS for existing tables
-- Enable RLS on all public tables
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public full access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public full access to members" ON public.members;
DROP POLICY IF EXISTS "Allow public full access to payments" ON public.payments;

-- Create policies to allow public access (read and write)
-- For expenses table
CREATE POLICY "Allow public full access to expenses"
ON public.expenses
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- For members table
CREATE POLICY "Allow public full access to members"
ON public.members
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- For payments table
CREATE POLICY "Allow public full access to payments"
ON public.payments
FOR ALL
TO public
USING (true)
WITH CHECK (true);
