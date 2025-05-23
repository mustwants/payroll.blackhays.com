/*
  # Clean up users and employees
  
  1. Delete non-blackhaysgroup.com users
  2. Create email validation
  3. Clean up test employees
*/

-- Delete any demo accounts or test accounts that are not from blackhaysgroup.com domain
DELETE FROM public.users
WHERE email NOT LIKE '%@blackhaysgroup.com';

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
DROP TRIGGER IF EXISTS ensure_valid_email_domain ON public.users;
CREATE TRIGGER ensure_valid_email_domain
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.validate_user_email();

-- Clean up any test employees
DELETE FROM public.employees
WHERE email NOT LIKE '%@blackhaysgroup.com';