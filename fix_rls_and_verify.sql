-- First, let's check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Disable RLS on all tables
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.members;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.members;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.members;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.expenses;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.payments;

-- Verify data exists
SELECT COUNT(*) as member_count FROM public.members;
SELECT COUNT(*) as expense_count FROM public.expenses;
SELECT COUNT(*) as payment_count FROM public.payments;

-- Show first few expenses to confirm
SELECT id, description, amount, paid_by, date FROM public.expenses LIMIT 5;
