/*
  # Clean up demo and test accounts

  1. Changes:
    - Remove test and demo accounts from the users table
    - Keep only accounts from the blackhaysgroup.com domain
  
  2. Security:
    - Maintains existing RLS policies
*/

-- Delete any demo accounts or test accounts that are not from blackhaysgroup.com domain
DELETE FROM public.users
WHERE email NOT LIKE '%@blackhaysgroup.com';

-- Ensure all future users have proper email domain validation
DO $$
BEGIN
  -- Check if the trigger function exists
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_user_email') THEN
    -- Create a trigger function to validate email domain
    CREATE OR REPLACE FUNCTION public.validate_user_email()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.email NOT LIKE '%@blackhaysgroup.com' THEN
        RAISE EXCEPTION 'Only email addresses from blackhaysgroup.com domain are allowed';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create a trigger to validate email before insert or update
    CREATE TRIGGER ensure_valid_email_domain
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_user_email();
  END IF;
END $$;

-- Clean up any test employees
DELETE FROM public.employees
WHERE email NOT LIKE '%@blackhaysgroup.com';