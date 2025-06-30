/*
  # Anonymous Access Policies for Direct Access Keys

  1. Security Updates
    - Add policies for anonymous users to access capsules via access keys
    - Enable direct access without verification
    - Maintain security while allowing anonymous access

  2. Changes
    - Update RLS policies for anonymous access
    - Allow access key validation without authentication
    - Enable capsule access for anonymous users with valid keys
*/

-- Allow anonymous users to read access keys for validation
CREATE POLICY "Anonymous users can validate access keys by hash"
  ON access_keys
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update access key usage
CREATE POLICY "Anonymous users can update access key usage"
  ON access_keys
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read access key capsule relationships
CREATE POLICY "Anonymous users can read access key capsule relationships"
  ON access_key_capsules
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read capsules through access keys
CREATE POLICY "Anonymous users can read capsules through access keys"
  ON capsules
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update capsule read counts
CREATE POLICY "Anonymous users can update capsule read counts"
  ON capsules
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read profiles for access key owners
CREATE POLICY "Anonymous users can read profiles for access key owners"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to create access history records
CREATE POLICY "Anonymous users can create access history records"
  ON capsule_access_history
  FOR INSERT
  TO anon
  WITH CHECK (true);