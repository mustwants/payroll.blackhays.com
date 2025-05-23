/*
  # Fix Row Level Security policies for users table

  1. Security
    - Enable RLS on users table if not already enabled
    - Drop existing policies to avoid conflicts
    - Create policies for:
      - Users to insert their own records
      - Users to read their own data
      - Users to update their own data
      - Admins to manage all users
      - Service role to bypass RLS
*/

-- First check if RLS is enabled on the users table, enable it if not
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own records" ON public.users;
DROP POLICY IF EXISTS "Users can view their own records" ON public.users;
DROP POLICY IF EXISTS "Users can update their own records" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create policy for user self-registration
CREATE POLICY "Users can insert their own records"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy for users to read their own data
CREATE POLICY "Users can view their own records"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own records"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Ensure service role can bypass RLS
CREATE POLICY "Service role can manage all users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);