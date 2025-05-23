/*
  # Fix users table RLS policies

  1. Security
    - Update RLS policies for the users table to allow authenticated users to insert their own data
    - Add policy for service role to manage all users

  This migration addresses the error "new row violates row-level security policy for table users"
*/

-- Enable RLS for users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create comprehensive policies
-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert own data" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Allow admin users to manage all users
CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Allow service role to manage all users (useful for system operations)
CREATE POLICY "Service role can manage all users" 
ON public.users 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);