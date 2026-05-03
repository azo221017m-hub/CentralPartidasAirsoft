-- Script para REVALIDAR la estructura de la tabla PLAYERS
-- Ejecuta esto en el SQL Editor de Supabase para verificar columnas

-- 1. Verificar estructura de la tabla players
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si existen registros en players
SELECT COUNT(*) as total_players FROM players;

-- 3. Mostrar algunos registros de ejemplo (si existen)
SELECT 
    id,
    user_id,
    nickname,
    avatar_url,
    assault_skill,
    scout_skill,
    rear_guard_skill,
    experience,
    team_id,
    created_at
FROM players 
LIMIT 5;

-- 4. Verificar restricciones y claves foráneas
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'players';

-- 5. Verificar permisos actuales en la tabla players
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'players'
AND table_schema = 'public';

-- Mensaje de confirmación
SELECT 'Validación de tabla players completada' AS status;