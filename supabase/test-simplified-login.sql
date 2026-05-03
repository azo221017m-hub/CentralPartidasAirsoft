-- Script de prueba para la validación simplificada de login
-- Ejecutar en el Dashboard de Supabase

-- 1. Verificar estructura actual de la tabla players
SELECT 
    nickname,
    contraseña,
    tipo_jugador,
    equipo,
    team_id
FROM players 
ORDER BY nickname
LIMIT 5;

-- 2. Crear datos de prueba para login simplificado si no existen
-- Insertar jugador de prueba
INSERT INTO players (
    nickname,
    contraseña,
    tipo_jugador,
    equipo,
    assault_skill,
    scout_skill,
    rear_guard_skill,
    experience
) 
SELECT 
    'PlayerTest',
    'test123',
    'Intermedio',
    'Test Squad',
    60,
    70,
    65,
    1
WHERE NOT EXISTS (SELECT 1 FROM players WHERE nickname = 'PlayerTest');

-- 3. Probar la nueva validación simplificada (simular validatePlayerSimple)
-- Esta consulta debe devolver exactamente 1 fila si las credenciales son correctas
SELECT 
    nickname,
    contraseña,
    tipo_jugador,
    equipo,
    assault_skill,
    scout_skill,
    rear_guard_skill,
    experience,
    team_id,
    created_at
FROM players 
WHERE nickname = 'PlayerTest' 
  AND contraseña = 'test123';

-- 4. Verificar que la consulta funciona correctamente
-- Debería devolver los datos del jugador si existe

-- 5. Probar con credenciales incorrectas (debe devolver 0 filas)
SELECT * FROM players 
WHERE nickname = 'PlayerTest' 
  AND contraseña = 'wrong_password';

-- 6. Probar con nickname inexistente (debe devolver 0 filas)
SELECT * FROM players 
WHERE nickname = 'NonExistentPlayer' 
  AND contraseña = 'test123';

-- 7. Limpiar datos de prueba (opcional)
-- DELETE FROM players WHERE nickname = 'PlayerTest';

-- 8. Verificar que la validación funciona para todos los jugadores existentes
SELECT 
    COUNT(*) as total_players,
    COUNT(CASE WHEN contraseña IS NOT NULL AND contraseña != '' THEN 1 END) as players_with_password
FROM players;