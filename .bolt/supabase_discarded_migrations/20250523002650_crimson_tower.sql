/*
  # Fix RLS policies for users table

  1. Changes
    - Update RLS policies for the users table to ensure new users can create their own records
    - Add a more permissive policy for user creation
    - Preserve existing policies for admin access
  
  2. Security
    - Maintain role-based restrictions for data access
    - Ensure users can only access their own data
    - Allow service role to bypass RLS
*/

-- First check if RLS is enabled on the users table, enable it if not
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Create or replace the policy for user self-registration
CREATE POLICY IF NOT EXISTS "Users can insert their own records"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create or replace policy for users to read their own data
CREATE POLICY IF NOT EXISTS "Users can view their own records"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create or replace policy for users to update their own data
CREATE POLICY IF NOT EXISTS "Users can update their own records"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure admins can manage all users
CREATE POLICY IF NOT EXISTS "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Ensure service role can bypass RLS
CREATE POLICY IF NOT EXISTS "Service role can manage all users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);