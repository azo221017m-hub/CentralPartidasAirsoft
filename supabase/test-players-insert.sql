-- Test para validar que podemos insertar en la tabla players
-- Ejecutar en SQL Editor de Supabase

-- 1. Test de inserción básica
INSERT INTO players (
    nickname,
    avatar_url,
    assault_skill,
    scout_skill,
    rear_guard_skill,
    experience,
    team_id
) VALUES (
    'test_player_validation',
    null,
    50,
    50,
    50,
    0,
    null
) RETURNING *;

-- 2. Verificar que se insertó correctamente
SELECT * FROM players WHERE nickname = 'test_player_validation';

-- 3. Limpiar el registro de prueba
DELETE FROM players WHERE nickname = 'test_player_validation';

-- 4. Verificar campos obligatorios
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
AND table_schema = 'public'
AND is_nullable = 'NO';

SELECT 'Test de validación de players completado' AS resultado;