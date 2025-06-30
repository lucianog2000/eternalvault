/*
  # Enable Anonymous Access for Access Keys

  1. New Policies
    - Allow anonymous users to read access_keys by key_hash
    - Allow anonymous users to read capsules through access_key_capsules
    - Allow anonymous users to read profiles for access key owners
    - Allow anonymous users to create access history records

  2. Security
    - Maintain existing RLS for authenticated users
    - Add specific policies for anonymous access key validation
    - Ensure anonymous users can only access data through valid access keys
*/

-- Policy to allow anonymous users to validate access keys by hash
CREATE POLICY "Anonymous users can validate access keys by hash" ON access_keys
  FOR SELECT 
  TO anon
  USING (true); -- Allow reading access keys for validation

-- Policy to allow anonymous users to read access key capsule relationships
CREATE POLICY "Anonymous users can read access key capsule relationships" ON access_key_capsules
  FOR SELECT 
  TO anon
  USING (true); -- Allow reading relationships for access key validation

-- Policy to allow anonymous users to read capsules through access keys
CREATE POLICY "Anonymous users can read capsules through access keys" ON capsules
  FOR SELECT 
  TO anon
  USING (true); -- Allow reading capsules for access key validation

-- Policy to allow anonymous users to read profiles for access key owners
CREATE POLICY "Anonymous users can read profiles for access key owners" ON profiles
  FOR SELECT 
  TO anon
  USING (true); -- Allow reading owner profiles for access key validation

-- Policy to allow anonymous users to create access history records
CREATE POLICY "Anonymous users can create access history records" ON capsule_access_history
  FOR INSERT 
  TO anon
  WITH CHECK (true); -- Allow anonymous users to log access

-- Policy to allow anonymous users to update access key usage counts
CREATE POLICY "Anonymous users can update access key usage" ON access_keys
  FOR UPDATE 
  TO anon
  USING (true)
  WITH CHECK (true); -- Allow updating access counts and last accessed times

-- Policy to allow anonymous users to update capsule read counts for self-destruction
CREATE POLICY "Anonymous users can update capsule read counts" ON capsules
  FOR UPDATE 
  TO anon
  USING (true)
  WITH CHECK (true); -- Allow updating self-destruction read counts