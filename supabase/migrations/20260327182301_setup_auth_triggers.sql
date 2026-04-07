/*
  # Authentication Setup and User Synchronization
  
  ## Overview
  Sets up automatic synchronization between auth.users and the usuarios table.
  When a user signs up, they are automatically added to the usuarios table with default 'cliente' role.
  
  ## Components
  
  ### 1. Trigger Function
  - `handle_new_user()` - Automatically creates a record in usuarios table when a new user signs up
  - Extracts user metadata (name, role) from registration
  - Sets default role to 'cliente'
  - Admins must be promoted manually by updating the rol field
  
  ### 2. Trigger
  - Fires after INSERT on auth.users
  - Calls handle_new_user() function
  
  ## Usage
  When a user signs up with email/password:
  - User record is created in auth.users
  - Trigger automatically creates corresponding record in usuarios table
  - User can immediately access the system with 'cliente' role
  
  ## Admin Creation
  To create an admin user:
  1. User signs up normally (becomes 'cliente')
  2. Execute: UPDATE usuarios SET rol = 'admin' WHERE email = '[email]';
  
  ## Important Notes
  - First admin must be created manually after first user registration
  - User metadata (name) should be provided during signup via raw_user_meta_data
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create usuario when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();