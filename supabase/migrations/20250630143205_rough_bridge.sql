/*
  # Disable All RLS Policies - Complete Database Access

  This migration removes ALL Row Level Security policies and restrictions to allow
  unrestricted access to all tables for all users (authenticated and anonymous).

  ## Changes Made:
  1. Drop all existing RLS policies on all tables
  2. Disable RLS on all tables to allow unrestricted access
  3. No authentication or authorization checks

  ## Security Note:
  This completely removes all access restrictions. Use only in development
  or when you want completely open access to all data.
*/

-- ==================== ACCESS KEYS TABLE ====================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own access keys" ON access_keys;
DROP POLICY IF EXISTS "Users can create own access keys" ON access_keys;
DROP POLICY IF EXISTS "Users can update own access keys" ON access_keys;
DROP POLICY IF EXISTS "Users can delete own access keys" ON access_keys;
DROP POLICY IF EXISTS "Anonymous users can validate access keys by hash" ON access_keys;
DROP POLICY IF EXISTS "Anonymous users can update access key usage" ON access_keys;

-- Disable RLS completely
ALTER TABLE access_keys DISABLE ROW LEVEL SECURITY;

-- ==================== CAPSULES TABLE ====================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own capsules" ON capsules;
DROP POLICY IF EXISTS "Users can create own capsules" ON capsules;
DROP POLICY IF EXISTS "Users can update own capsules" ON capsules;
DROP POLICY IF EXISTS "Users can delete own capsules" ON capsules;
DROP POLICY IF EXISTS "Anonymous users can read capsules through access keys" ON capsules;
DROP POLICY IF EXISTS "Anonymous users can update capsule read counts" ON capsules;

-- Disable RLS completely
ALTER TABLE capsules DISABLE ROW LEVEL SECURITY;

-- ==================== ACCESS KEY CAPSULES TABLE ====================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own access key capsule relationships" ON access_key_capsules;
DROP POLICY IF EXISTS "Users can create access key capsule relationships" ON access_key_capsules;
DROP POLICY IF EXISTS "Users can delete access key capsule relationships" ON access_key_capsules;
DROP POLICY IF EXISTS "Anonymous users can read access key capsule relationships" ON access_key_capsules;

-- Disable RLS completely
ALTER TABLE access_key_capsules DISABLE ROW LEVEL SECURITY;

-- ==================== PROFILES TABLE ====================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can read profiles for access key owners" ON profiles;

-- Disable RLS completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ==================== CAPSULE ACCESS HISTORY TABLE ====================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view access history for own capsules" ON capsule_access_history;
DROP POLICY IF EXISTS "Users can create access history records" ON capsule_access_history;
DROP POLICY IF EXISTS "Anonymous users can create access history records" ON capsule_access_history;

-- Disable RLS completely
ALTER TABLE capsule_access_history DISABLE ROW LEVEL SECURITY;

-- ==================== CONFIRMATION ====================

-- Add a comment to confirm all restrictions have been removed
COMMENT ON TABLE access_keys IS 'RLS DISABLED - Full access for all users';
COMMENT ON TABLE capsules IS 'RLS DISABLED - Full access for all users';
COMMENT ON TABLE access_key_capsules IS 'RLS DISABLED - Full access for all users';
COMMENT ON TABLE profiles IS 'RLS DISABLED - Full access for all users';
COMMENT ON TABLE capsule_access_history IS 'RLS DISABLED - Full access for all users';