/*
  # Remove Capsule Groups - Group by Access Keys Instead

  1. Changes
    - Remove capsule_groups table completely
    - Remove group_id from capsules table
    - Capsules are now grouped by access keys only
    - Each access key defines its own "group" of capsules

  2. Security
    - Maintain all existing RLS policies for capsules and access keys
    - Remove capsule_groups policies

  3. Cleanup
    - Drop all capsule_groups related objects
    - Update capsules table structure
*/

-- Drop capsule_groups related objects
DROP TRIGGER IF EXISTS update_capsule_groups_updated_at ON capsule_groups;
DROP INDEX IF EXISTS idx_capsule_groups_owner_id;
DROP INDEX IF EXISTS idx_capsules_group_id;

-- Remove group_id column from capsules
ALTER TABLE capsules DROP COLUMN IF EXISTS group_id;

-- Drop capsule_groups table completely
DROP TABLE IF EXISTS capsule_groups CASCADE;

-- Update capsules table comment
COMMENT ON TABLE capsules IS 'Legacy capsules - grouped by access keys, not by separate groups table';