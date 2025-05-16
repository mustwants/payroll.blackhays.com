/*
  # Add service status check function

  1. New Function
    - `get_service_status` - Simple function to check database connectivity
  
  2. Purpose
    - Provides a lightweight way to check if the database is accessible
    - More efficient than querying a table for health checks
*/

-- Create a simple function to check service status
CREATE OR REPLACE FUNCTION get_service_status()
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'status', 'ok',
    'timestamp', CURRENT_TIMESTAMP
  );
$$;

-- Grant access to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_service_status() TO authenticated, anon;