/*
  # Fix users table RLS policies for user creation

  1. Changes
     - Simplify and clarify RLS policies for users table
     - Ensure service role can properly manage all users
     - Ensure authenticated users can insert their own records
     - Remove redundant policies

  2. Security
     - Maintain proper row-level security for user data
     - Prevent users from modifying other users' data
*/

-- First, disable RLS temporarily to avoid issues when modifying policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Delete potentially conflicting policies
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own records" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update their own records" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can view their own records" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Create clean, non-overlapping policies
-- Allow admins to manage all users
CREATE POLICY "Admins can manage all users" 
ON users 
FOR ALL 
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Allow service role to bypass RLS completely
CREATE POLICY "Service role can manage all users" 
ON users 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to insert their own record
CREATE POLICY "Users can insert their own record" 
ON users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own record
CREATE POLICY "Users can update their own record" 
ON users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to read their own record
CREATE POLICY "Users can read their own record" 
ON users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;