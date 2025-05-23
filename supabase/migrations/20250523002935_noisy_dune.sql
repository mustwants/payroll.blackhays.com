/*
  # Fix users table RLS policies

  1. Changes
     - Remove duplicate policies for inserting user records
     - Add a policy for unauthenticated users to insert their own records during signup
     - Ensure service role can bypass RLS completely
     - Consolidate and clarify existing policies

  2. Security
     - Maintains data security while allowing proper user creation
     - Enables both authenticated and unauthenticated users to create their own records
     - Preserves admin and service role capabilities
*/

-- First drop the duplicate policies to clean things up
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own records" ON public.users;

-- Create a clean policy for authenticated users to insert their own records
CREATE POLICY "Users can insert their own records" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Add policy for unauthenticated (anon) users to insert their own records during signup
CREATE POLICY "Allow unauthenticated users to insert their own records"
ON public.users
FOR INSERT
TO anon
WITH CHECK (auth.uid() = id);

-- Ensure the service role policy is correctly configured
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);