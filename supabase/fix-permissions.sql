-- Script para CONFIGURAR PERMISOS en la tabla access_requests existente
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Habilitar Row Level Security
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- 2. Dar permisos de lectura a usuarios públicos y autenticados
GRANT SELECT ON access_requests TO anon;
GRANT SELECT ON access_requests TO authenticated;

-- 3. Eliminar política anterior si existe
DROP POLICY IF EXISTS "Allow public read access" ON access_requests;

-- 4. Crear política para permitir lectura pública (necesario para login)
CREATE POLICY "Allow public read access" ON access_requests
    FOR SELECT USING (true);

-- 5. Verificar que los permisos funcionan
SELECT 'Permisos configurados correctamente' as status;
SELECT contact_name, created_at FROM access_requests;