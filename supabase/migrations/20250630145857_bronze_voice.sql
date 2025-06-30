/*
  # Simplificar Access Keys - Sin Hashing

  1. Cambios Principales
    - Eliminar key_hash, usar la key generada directamente como ID
    - Cambiar access_keys.id de uuid a text
    - Actualizar todas las referencias y foreign keys
    - Deshabilitar RLS completamente

  2. Estructura Nueva
    - access_keys.id ahora es text (la key generada)
    - Búsqueda directa sin hashing
    - Acceso simplificado para el hackathon
*/

-- Primero, eliminar todas las foreign keys que referencian access_keys.id
ALTER TABLE access_key_capsules DROP CONSTRAINT IF EXISTS access_key_capsules_access_key_id_fkey;
ALTER TABLE capsule_access_history DROP CONSTRAINT IF EXISTS capsule_access_history_access_key_id_fkey;

-- Eliminar constraints únicos antes de los índices
ALTER TABLE access_keys DROP CONSTRAINT IF EXISTS access_keys_key_hash_key;

-- Ahora eliminar índices
DROP INDEX IF EXISTS idx_access_keys_key_hash;
DROP INDEX IF EXISTS access_keys_key_hash_key;

-- Crear nueva tabla access_keys simplificada
CREATE TABLE access_keys_new (
  id text PRIMARY KEY, -- Usar la key generada directamente como ID
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at timestamptz,
  max_access_count integer,
  access_count integer DEFAULT 0,
  last_accessed_at timestamptz,
  last_accessed_from text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copiar datos existentes (si los hay) - generar nuevos IDs únicos
INSERT INTO access_keys_new (id, name, owner_id, expires_at, max_access_count, access_count, last_accessed_at, last_accessed_from, notes, is_active, created_at, updated_at)
SELECT 
  'evault_' || substr(md5(random()::text || clock_timestamp()::text), 1, 32) as id, -- Generar nuevos IDs únicos
  name,
  owner_id,
  expires_at,
  max_access_count,
  access_count,
  last_accessed_at,
  last_accessed_from,
  notes,
  is_active,
  created_at,
  updated_at
FROM access_keys;

-- Eliminar tabla antigua
DROP TABLE access_keys CASCADE;

-- Renombrar nueva tabla
ALTER TABLE access_keys_new RENAME TO access_keys;

-- Recrear índices
CREATE INDEX idx_access_keys_owner_id ON access_keys(owner_id);
CREATE INDEX idx_access_keys_is_active ON access_keys(is_active);

-- Recrear tabla access_key_capsules con nueva referencia
CREATE TABLE access_key_capsules_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key_id text NOT NULL REFERENCES access_keys(id) ON DELETE CASCADE,
  capsule_id uuid NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(access_key_id, capsule_id)
);

-- Eliminar tabla antigua de relaciones (si existe)
DROP TABLE IF EXISTS access_key_capsules CASCADE;

-- Renombrar nueva tabla
ALTER TABLE access_key_capsules_new RENAME TO access_key_capsules;

-- Recrear índices para relaciones
CREATE INDEX idx_access_key_capsules_access_key_id ON access_key_capsules(access_key_id);
CREATE INDEX idx_access_key_capsules_capsule_id ON access_key_capsules(capsule_id);

-- Recrear tabla de historial con tipo correcto
CREATE TABLE capsule_access_history_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  access_key_id text REFERENCES access_keys(id) ON DELETE SET NULL,
  accessed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  access_method text DEFAULT 'chat',
  ip_address text,
  user_agent text,
  accessed_at timestamptz DEFAULT now()
);

-- Copiar datos del historial si existen
INSERT INTO capsule_access_history_new (id, capsule_id, accessed_by_user_id, access_method, ip_address, user_agent, accessed_at)
SELECT id, capsule_id, accessed_by_user_id, access_method, ip_address, user_agent, accessed_at
FROM capsule_access_history;

-- Eliminar tabla antigua de historial
DROP TABLE IF EXISTS capsule_access_history CASCADE;

-- Renombrar nueva tabla de historial
ALTER TABLE capsule_access_history_new RENAME TO capsule_access_history;

-- Recrear índices para historial
CREATE INDEX idx_capsule_access_history_capsule_id ON capsule_access_history(capsule_id);
CREATE INDEX idx_capsule_access_history_accessed_at ON capsule_access_history(accessed_at);

-- Recrear trigger para updated_at
CREATE TRIGGER update_access_keys_updated_at
  BEFORE UPDATE ON access_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deshabilitar RLS completamente
ALTER TABLE access_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_key_capsules DISABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_access_history DISABLE ROW LEVEL SECURITY;

-- Comentarios para confirmar
COMMENT ON TABLE access_keys IS 'RLS DISABLED - Full access for all users. Uses generated key as primary key.';
COMMENT ON TABLE access_key_capsules IS 'RLS DISABLED - Full access for all users';
COMMENT ON TABLE capsule_access_history IS 'RLS DISABLED - Full access for all users';