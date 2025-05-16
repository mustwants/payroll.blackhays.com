/*
  # Add google_id column to users table
  
  1. Changes
    - Add `google_id` (text) column to users table to store Google's subject identifier
    
  2. Purpose
    - Support Google authentication by storing the Google user ID separately from the Supabase UUID
*/

-- Add google_id column to store Google's subject identifier
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS google_id text;

-- Create index for faster lookups by google_id
CREATE INDEX IF NOT EXISTS users_google_id_idx ON public.users(google_id);