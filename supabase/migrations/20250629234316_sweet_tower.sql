/*
  # Add capsule destruction tracking columns

  1. New Columns
    - `is_destroyed` (boolean) - Tracks if capsule has been destroyed via self-destruction
    - `destroyed_at` (timestamptz) - Timestamp when capsule was destroyed

  2. Changes
    - Add is_destroyed column with default false
    - Add destroyed_at column for tracking destruction time
    - Update existing queries to handle soft deletion
*/

-- Add is_destroyed column to track soft deletion
ALTER TABLE capsules 
ADD COLUMN IF NOT EXISTS is_destroyed boolean DEFAULT false;

-- Add destroyed_at column to track when destruction occurred
ALTER TABLE capsules 
ADD COLUMN IF NOT EXISTS destroyed_at timestamptz DEFAULT null;

-- Add index for performance on destroyed capsules queries
CREATE INDEX IF NOT EXISTS idx_capsules_is_destroyed 
ON capsules (is_destroyed);

-- Add index for destroyed_at queries
CREATE INDEX IF NOT EXISTS idx_capsules_destroyed_at 
ON capsules (destroyed_at);