-- Clean up duplicate data from running import script twice
-- This will remove duplicate entries and keep only unique records

-- First, let's see what we have
SELECT 'Members Count' as table_name, COUNT(*) as count FROM public.members
UNION ALL
SELECT 'Expenses Count', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'Payments Count', COUNT(*) FROM public.payments;

-- Delete duplicate members (keep only one of each name)
DELETE FROM public.members
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
        FROM public.members
    ) t
    WHERE rn > 1
);

-- Delete duplicate expenses (keep only one of each unique combination)
DELETE FROM public.expenses
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY description, amount, paid_by, date, category ORDER BY created_at) as rn
        FROM public.expenses
    ) t
    WHERE rn > 1
);

-- Delete duplicate payments (keep only one of each unique combination)
DELETE FROM public.payments
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY from_user, to_user, amount, date ORDER BY created_at) as rn
        FROM public.payments
    ) t
    WHERE rn > 1
);

-- Verify the cleanup
SELECT 'Members After Cleanup' as table_name, COUNT(*) as count FROM public.members
UNION ALL
SELECT 'Expenses After Cleanup', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'Payments After Cleanup', COUNT(*) FROM public.payments;

-- Show the cleaned data
SELECT * FROM public.members ORDER BY name;
SELECT * FROM public.expenses ORDER BY date DESC;
SELECT * FROM public.payments ORDER BY date DESC;
