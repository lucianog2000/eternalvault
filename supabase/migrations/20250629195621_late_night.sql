/*
  # Fix access_keys and profiles relationship

  1. Changes
    - Drop existing foreign key constraint from access_keys to users
    - Add new foreign key constraint from access_keys to profiles
    - This allows the application to properly join access_keys with profiles table

  2. Security
    - Maintains existing RLS policies
    - No changes to data access patterns
*/

-- Drop the existing foreign key constraint to users table
ALTER TABLE access_keys DROP CONSTRAINT IF EXISTS access_keys_owner_id_fkey;

-- Add new foreign key constraint to profiles table
ALTER TABLE access_keys 
ADD CONSTRAINT access_keys_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;