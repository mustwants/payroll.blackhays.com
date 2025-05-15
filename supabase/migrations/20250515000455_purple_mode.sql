/*
  # Initial database schema for BlackHays Group Payroll System

  1. New Tables
    - `users` - User profile data (connected to auth.users)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)

    - `clients` - Client information table
      - `id` (uuid, primary key)
      - `name` (text)
      - `contact_name` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `website` (text)
      - `logo` (text)
      - `status` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `total_hours` (numeric)
      - `used_hours` (numeric)
      - `monthly_hours` (numeric)
      - `rate` (numeric)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `client_contacts` - Client contacts information
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients.id)
      - `name` (text)
      - `title` (text)
      - `email` (text)
      - `phone` (text)
      - `is_primary` (boolean)
      - `created_at` (timestamp)

    - `employees` - Employee information table
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `department` (text)
      - `position` (text)
      - `status` (text)
      - `hire_date` (date)
      - `avatar` (text)
      - `hours_allocated` (numeric)
      - `hours_used` (numeric)
      - `address` (text)
      - `emergency_contact` (text)
      - `pay_rate` (numeric)
      - `contract_type` (text)
      - `ein` (text)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `employee_skills` - Employee skills
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees.id)
      - `name` (text)
      - `level` (text)

    - `time_entries` - Time tracking entries
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `user_name` (text)
      - `client_id` (uuid, references clients.id)
      - `client_name` (text)
      - `date` (date)
      - `hours` (numeric)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `tasks` - Task assignments
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees.id)
      - `client_id` (uuid, references clients.id)
      - `hours` (numeric)
      - `start_date` (date)
      - `end_date` (date)
      - `description` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `company_info` - Company information
      - `id` (uuid, primary key)
      - `name` (text)
      - `tagline` (text)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `logo` (text)
      - `description` (text)
      - `tax_id` (text)
      - `year_founded` (text)
      - `accounting_contact_name` (text)
      - `accounting_contact_email` (text)
      - `accounting_contact_phone` (text)
      - `social_media_linkedin` (text)
      - `social_media_twitter` (text)
      - `social_media_facebook` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data and admin to read all data
*/

-- Users table linked to Auth
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'employee',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  website text,
  logo text,
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  total_hours numeric DEFAULT 0,
  used_hours numeric DEFAULT 0,
  monthly_hours numeric DEFAULT 0,
  rate numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client contacts
CREATE TABLE IF NOT EXISTS client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  email text,
  phone text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Client projects
CREATE TABLE IF NOT EXISTS client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  status text DEFAULT 'active',
  budget numeric DEFAULT 0,
  hours_allocated numeric DEFAULT 0,
  hours_used numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  department text,
  position text,
  status text DEFAULT 'active',
  hire_date date,
  avatar text,
  hours_allocated numeric DEFAULT 160,
  hours_used numeric DEFAULT 0,
  address text,
  emergency_contact text,
  pay_rate numeric DEFAULT 0,
  contract_type text,
  ein text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee skills
CREATE TABLE IF NOT EXISTS employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  level text DEFAULT 'Intermediate'
);

-- Time entries
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text,
  date date NOT NULL,
  hours numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task assignments
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  hours numeric DEFAULT 0,
  start_date date,
  end_date date,
  description text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Company info
CREATE TABLE IF NOT EXISTS company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT 'BlackHays Group',
  tagline text,
  address text,
  phone text,
  email text,
  website text,
  logo text,
  description text,
  tax_id text,
  year_founded text,
  accounting_contact_name text,
  accounting_contact_email text,
  accounting_contact_phone text,
  social_media_linkedin text,
  social_media_twitter text,
  social_media_facebook text,
  updated_at timestamptz DEFAULT now()
);

-- Insert default company info
INSERT INTO company_info (
  name, tagline, address, phone, email, website, description, tax_id, year_founded
) VALUES (
  'BlackHays Group', 
  'Professional Payroll Management Solutions', 
  '123 Corporate Drive, Suite 500, New York, NY 10001', 
  '(555) 987-6543', 
  'info@blackhays.com', 
  'https://blackhays.com', 
  'BlackHays Group is a leading provider of payroll management solutions for businesses of all sizes. We leverage advanced technology to simplify payroll processing, time tracking, and employee management.',
  '12-3456789',
  '2010'
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: users can read/update own data, admins can read all
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
  
-- Time entries: users can manage their own entries, admins can manage all
CREATE POLICY "Users can manage own time entries" ON time_entries
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Admins can manage all time entries" ON time_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
  
-- Clients: all authenticated users can read, admins can manage
CREATE POLICY "All users can read clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
  
-- Apply same pattern to other tables
-- Client contacts
CREATE POLICY "All users can read client contacts" ON client_contacts
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage client contacts" ON client_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Client projects
CREATE POLICY "All users can read client projects" ON client_projects
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage client projects" ON client_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Employees
CREATE POLICY "All users can read employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Employee skills
CREATE POLICY "All users can read employee skills" ON employee_skills
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage employee skills" ON employee_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks
CREATE POLICY "All users can read tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Company info
CREATE POLICY "All users can read company info" ON company_info
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins can manage company info" ON company_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );