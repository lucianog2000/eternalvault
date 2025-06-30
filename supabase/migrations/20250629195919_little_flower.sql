/*
  # Remove Destroyed Capsules System - Physical Deletion

  1. Changes
    - Remove is_destroyed and destroyed_at columns from capsules table
    - Remove self-destruction trigger (capsules will be deleted instead)
    - Update self-destruction function to delete capsules instead of marking them
    - Clean up any existing destroyed capsules

  2. New Behavior
    - When a capsule reaches its read limit, it gets physically deleted
    - No more "destroyed" state - capsules either exist or don't exist
    - Cleaner UI without destroyed capsule handling
*/

-- First, delete any capsules that are currently marked as destroyed
DELETE FROM capsules WHERE is_destroyed = true;

-- Drop the existing self-destruction trigger
DROP TRIGGER IF EXISTS capsule_self_destruction_trigger ON capsules;

-- Create new function that deletes capsules instead of marking them as destroyed
CREATE OR REPLACE FUNCTION handle_capsule_self_destruction()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if self-destruction should trigger
  IF NEW.self_destruct_enabled = true 
     AND NEW.self_destruct_current_reads >= NEW.self_destruct_max_reads 
     AND NEW.self_destruct_destroy_after_read = true THEN
    
    -- Instead of marking as destroyed, we'll delete the capsule
    -- This will be handled in the application code, not in the trigger
    -- The trigger just updates the read count
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (now it just updates read count)
CREATE TRIGGER capsule_self_destruction_trigger
  BEFORE UPDATE ON capsules
  FOR EACH ROW EXECUTE FUNCTION handle_capsule_self_destruction();

-- Remove the destroyed-related columns since we won't use them anymore
ALTER TABLE capsules DROP COLUMN IF EXISTS is_destroyed;
ALTER TABLE capsules DROP COLUMN IF EXISTS destroyed_at;

-- Update table comment
COMMENT ON TABLE capsules IS 'Legacy capsules - physically deleted when self-destruction triggers, no "destroyed" state';