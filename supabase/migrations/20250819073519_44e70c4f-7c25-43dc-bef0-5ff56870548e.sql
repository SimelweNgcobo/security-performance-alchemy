-- Add missing full_name column to customers table
ALTER TABLE public.customers ADD COLUMN full_name text;