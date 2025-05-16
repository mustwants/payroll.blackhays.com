/*
  # Fix users table RLS recursion issue

  1. Changes
    - Modify the "Admins can read all users" policy to avoid recursion
    - Use JWT claims to check user role instead of querying the users table
  
  2. Security
    - Maintains the same security model where admins can read all users
    - Users can still read and update their own data
*/

-- Drop the policy causing recursion
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- Recreate it to use JWT claims instead of querying the users table again
CREATE POLICY "Admins can read all users" 
ON public.users
FOR SELECT 
TO public
USING (auth.jwt() ->> 'role' = 'admin');

-- Optional: Create a helper function for getting user role from JWT
-- This can be used in other policies to avoid similar recursion issues
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN coalesce(auth.jwt() ->> 'role', 'employee');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;