/*
  # Remove Capsule Groups System

  1. Changes
    - Remove group_id column from capsules table
    - Drop capsule_groups table completely
    - Update comments to reflect new grouping strategy

  2. New Strategy
    - Capsules are grouped by Access Keys
    - Each Access Key defines which capsules belong to its "group"
    - No separate groups table needed
*/

-- Remove group_id column from capsules (if it exists)
ALTER TABLE capsules DROP COLUMN IF EXISTS group_id;

-- Drop capsule_groups table completely (if it exists)
DROP TABLE IF EXISTS capsule_groups CASCADE;

-- Drop any remaining indexes related to groups
DROP INDEX IF EXISTS idx_capsules_group_id;
DROP INDEX IF EXISTS idx_capsule_groups_owner_id;

-- Update table comment
COMMENT ON TABLE capsules IS 'Legacy capsules - grouped dynamically by access keys through access_key_capsules relationship';
COMMENT ON TABLE access_key_capsules IS 'Defines which capsules belong to each access key group';