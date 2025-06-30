/*
  # EternalVault Database Schema Migration

  1. New Tables
    - `capsule_groups` - Groups that organize capsules by purpose/audience
    - `capsules` - Individual legacy capsules with content and rules
    - `access_keys` - Secure keys for granular access control
    - `access_key_capsules` - Many-to-many relationship between access keys and capsules
    - `capsule_access_history` - Audit trail for capsule access

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure proper foreign key constraints

  3. Features
    - Self-destruction mechanism for capsules
    - Unlock rules based on inactivity
    - Granular access control via access keys
    - Complete audit trail
*/

-- Create capsule_groups table
CREATE TABLE IF NOT EXISTS capsule_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create capsules table
CREATE TABLE IF NOT EXISTS capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('passwords', 'instructions', 'messages', 'assets')),
  group_id UUID REFERENCES capsule_groups(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Unlock rule configuration
  unlock_rule_type TEXT DEFAULT 'inactivity',
  unlock_rule_days INTEGER DEFAULT 90,
  unlock_rule_active BOOLEAN DEFAULT true,
  
  -- Self-destruction configuration
  self_destruct_enabled BOOLEAN DEFAULT false,
  self_destruct_max_reads INTEGER DEFAULT 1,
  self_destruct_current_reads INTEGER DEFAULT 0,
  self_destruct_destroy_after_read BOOLEAN DEFAULT true,
  self_destruct_warning_message TEXT,
  
  -- Status fields
  is_active BOOLEAN DEFAULT true,
  is_unlocked BOOLEAN DEFAULT false,
  is_destroyed BOOLEAN DEFAULT false,
  destroyed_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create access_keys table
CREATE TABLE IF NOT EXISTS access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE, -- Store hashed version of the key for security
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Access control
  expires_at TIMESTAMPTZ,
  max_access_count INTEGER,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  last_accessed_from TEXT,
  
  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create many-to-many relationship table for access_keys and capsules
CREATE TABLE IF NOT EXISTS access_key_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key_id UUID REFERENCES access_keys(id) ON DELETE CASCADE NOT NULL,
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(access_key_id, capsule_id)
);

-- Create capsule access history table
CREATE TABLE IF NOT EXISTS capsule_access_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  access_key_id UUID REFERENCES access_keys(id) ON DELETE SET NULL,
  accessed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_method TEXT DEFAULT 'chat',
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE capsule_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_key_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_access_history ENABLE ROW LEVEL SECURITY;

-- Policies for capsule_groups
CREATE POLICY "Users can view own capsule groups" ON capsule_groups
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own capsule groups" ON capsule_groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own capsule groups" ON capsule_groups
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own capsule groups" ON capsule_groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Policies for capsules
CREATE POLICY "Users can view own capsules" ON capsules
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own capsules" ON capsules
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own capsules" ON capsules
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own capsules" ON capsules
  FOR DELETE USING (auth.uid() = owner_id);

-- Policies for access_keys
CREATE POLICY "Users can view own access keys" ON access_keys
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own access keys" ON access_keys
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own access keys" ON access_keys
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own access keys" ON access_keys
  FOR DELETE USING (auth.uid() = owner_id);

-- Policies for access_key_capsules (users can manage relationships for their own access keys)
CREATE POLICY "Users can view own access key capsule relationships" ON access_key_capsules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM access_keys ak 
      WHERE ak.id = access_key_id AND ak.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create access key capsule relationships" ON access_key_capsules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM access_keys ak 
      WHERE ak.id = access_key_id AND ak.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete access key capsule relationships" ON access_key_capsules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM access_keys ak 
      WHERE ak.id = access_key_id AND ak.owner_id = auth.uid()
    )
  );

-- Policies for capsule_access_history
CREATE POLICY "Users can view access history for own capsules" ON capsule_access_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capsules c 
      WHERE c.id = capsule_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create access history records" ON capsule_access_history
  FOR INSERT WITH CHECK (true); -- Allow anyone to create access records

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_capsules_owner_id ON capsules(owner_id);
CREATE INDEX IF NOT EXISTS idx_capsules_group_id ON capsules(group_id);
CREATE INDEX IF NOT EXISTS idx_capsules_category ON capsules(category);
CREATE INDEX IF NOT EXISTS idx_capsules_is_active ON capsules(is_active);
CREATE INDEX IF NOT EXISTS idx_capsules_is_destroyed ON capsules(is_destroyed);

CREATE INDEX IF NOT EXISTS idx_capsule_groups_owner_id ON capsule_groups(owner_id);

CREATE INDEX IF NOT EXISTS idx_access_keys_owner_id ON access_keys(owner_id);
CREATE INDEX IF NOT EXISTS idx_access_keys_key_hash ON access_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_access_keys_is_active ON access_keys(is_active);

CREATE INDEX IF NOT EXISTS idx_access_key_capsules_access_key_id ON access_key_capsules(access_key_id);
CREATE INDEX IF NOT EXISTS idx_access_key_capsules_capsule_id ON access_key_capsules(capsule_id);

CREATE INDEX IF NOT EXISTS idx_capsule_access_history_capsule_id ON capsule_access_history(capsule_id);
CREATE INDEX IF NOT EXISTS idx_capsule_access_history_accessed_at ON capsule_access_history(accessed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_capsule_groups_updated_at
  BEFORE UPDATE ON capsule_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capsules_updated_at
  BEFORE UPDATE ON capsules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_keys_updated_at
  BEFORE UPDATE ON access_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle capsule self-destruction
CREATE OR REPLACE FUNCTION handle_capsule_self_destruction()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if self-destruction should trigger
  IF NEW.self_destruct_enabled = true 
     AND NEW.self_destruct_current_reads >= NEW.self_destruct_max_reads 
     AND NEW.self_destruct_destroy_after_read = true 
     AND OLD.is_destroyed = false THEN
    
    NEW.is_destroyed = true;
    NEW.destroyed_at = now();
    NEW.is_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for capsule self-destruction
CREATE TRIGGER capsule_self_destruction_trigger
  BEFORE UPDATE ON capsules
  FOR EACH ROW EXECUTE FUNCTION handle_capsule_self_destruction();