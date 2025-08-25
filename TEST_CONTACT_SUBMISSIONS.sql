-- Test script to verify contact_submissions table is working correctly
-- Run this in Supabase SQL Editor after setting up the table

-- Check if table exists
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'contact_submissions';

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'contact_submissions';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'contact_submissions';

-- Count existing submissions
SELECT 
    status,
    COUNT(*) as count
FROM contact_submissions 
GROUP BY status
ORDER BY status;

-- Show recent submissions (if any)
SELECT 
    id,
    first_name,
    last_name,
    email,
    subject,
    status,
    created_at
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 5;

-- Test insert (this should work for anyone)
INSERT INTO contact_submissions (
    first_name, 
    last_name, 
    email, 
    subject, 
    message
) VALUES (
    'Test',
    'User',
    'test@example.com',
    'Test Subject',
    'This is a test message to verify the table is working correctly.'
);

-- Verify the insert worked
SELECT 'Insert test completed successfully' as result;

-- Show the test record
SELECT * FROM contact_submissions WHERE email = 'test@example.com' ORDER BY created_at DESC LIMIT 1;
