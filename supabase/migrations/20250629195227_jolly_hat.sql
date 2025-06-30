/*
  # Add owner_id to access_keys table

  1. Changes
    - Add owner_id column to access_keys table to store the original owner
    - This allows us to display the correct owner name in chat components
    - Update existing access keys to have proper owner_id values

  2. Security
    - Maintain existing RLS policies
    - Ensure owner_id references auth.users table
*/

-- Add owner_id column to access_keys if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_keys' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE access_keys ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_access_keys_owner_id ON access_keys(owner_id);

-- Update table comment
COMMENT ON TABLE access_keys IS 'Secure access keys for granular capsule access control with owner information';