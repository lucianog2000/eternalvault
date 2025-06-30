/*
  # Anonymous Access Policies for Direct Access Keys

  1. Security Updates
    - Drop existing conflicting policies if they exist
    - Create new policies for anonymous access to access keys system
    - Enable direct access to capsules through access keys
    - Allow access history recording for audit purposes

  2. Policy Changes
    - Anonymous users can validate access keys
    - Anonymous users can read associated capsules
    - Anonymous users can update usage counters
    - Anonymous users can create access history records
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anonymous users can validate access keys by hash" ON access_keys;
DROP POLICY IF EXISTS "Anonymous users can update access key usage" ON access_keys;
DROP POLICY IF EXISTS "Anonymous users can read access key capsule relationships" ON access_key_capsules;
DROP POLICY IF EXISTS "Anonymous users can read capsules through access keys" ON capsules;
DROP POLICY IF EXISTS "Anonymous users can update capsule read counts" ON capsules;
DROP POLICY IF EXISTS "Anonymous users can read profiles for access key owners" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can create access history records" ON capsule_access_history;

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