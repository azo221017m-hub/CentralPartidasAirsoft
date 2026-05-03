-- Script para actualizar la tabla players con los nuevos campos
-- IMPORTANTE: Ejecutar este script en el Dashboard de Supabase

-- 1. Eliminar la columna user_id si existe
ALTER TABLE players DROP COLUMN IF EXISTS user_id;

-- 2. Agregar las nuevas columnas
ALTER TABLE players ADD COLUMN IF NOT EXISTS contraseña TEXT NOT NULL DEFAULT 'temp123';
ALTER TABLE players ADD COLUMN IF NOT EXISTS tipo_jugador TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS equipo TEXT;

-- 3. Remover el valor por defecto temporal de contraseña
ALTER TABLE players ALTER COLUMN contraseña DROP DEFAULT;

-- 4. Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;