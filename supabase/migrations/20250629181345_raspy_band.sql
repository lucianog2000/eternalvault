/*
  # Clear All Database Tables

  1. Clear Data
    - Remove all data from all tables
    - Reset sequences and counters
    - Maintain table structure and relationships

  2. Order of Operations
    - Clear dependent tables first (foreign key constraints)
    - Clear parent tables last
    - Maintain referential integrity during cleanup

  3. Tables to Clear
    - capsule_access_history
    - access_key_capsules  
    - access_keys
    - capsules
    - capsule_groups
    - profiles (keep structure, clear data)
*/

-- Clear all data from tables in correct order (respecting foreign key constraints)

-- 1. Clear access history first (depends on capsules and access_keys)
DELETE FROM capsule_access_history;

-- 2. Clear access key relationships (depends on access_keys and capsules)
DELETE FROM access_key_capsules;

-- 3. Clear access keys (depends on profiles)
DELETE FROM access_keys;

-- 4. Clear capsules (depends on capsule_groups and profiles)
DELETE FROM capsules;

-- 5. Clear capsule groups (depends on profiles)
DELETE FROM capsule_groups;

-- 6. Clear profiles (but keep the table structure)
DELETE FROM profiles;

-- Reset any sequences if they exist
-- Note: UUID primary keys don't use sequences, but if we had any auto-increment fields, we'd reset them here

-- Verify all tables are empty
DO $$
DECLARE
    table_name text;
    row_count integer;
BEGIN
    -- Check each table and log the count
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'capsule_groups', 'capsules', 'access_keys', 'access_key_capsules', 'capsule_access_history')
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
        RAISE NOTICE 'Table % has % rows', table_name, row_count;
    END LOOP;
END $$;