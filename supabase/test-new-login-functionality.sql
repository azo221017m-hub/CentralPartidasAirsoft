-- Script de prueba para la nueva funcionalidad de login
-- Ejecutar en el Dashboard de Supabase

-- 1. Verificar que tenemos equipos registrados
SELECT name FROM teams ORDER BY name;

-- 2. Verificar que tenemos jugadores con los nuevos campos
SELECT 
    nickname,
    contraseña,
    tipo_jugador,
    equipo,
    team_id
FROM players 
ORDER BY nickname;

-- 3. Crear datos de prueba para el login si no existen
-- (Ejecutar solo si necesitas datos de prueba)

-- Insertar equipo de prueba si no existe
INSERT INTO teams (name, is_public_forum) 
SELECT 'Alpha Squad', false
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Alpha Squad');

-- Insertar jugador de prueba para login
INSERT INTO players (
    nickname,
    contraseña,
    tipo_jugador,
    equipo,
    assault_skill,
    scout_skill,
    rear_guard_skill,
    experience,
    team_id
) 
SELECT 
    'TestPlayer',
    'test123',
    'Intermedio',
    'Alpha Squad',
    60,
    70,
    65,
    1,
    t.id
FROM teams t 
WHERE t.name = 'Alpha Squad'
AND NOT EXISTS (SELECT 1 FROM players WHERE nickname = 'TestPlayer');

-- 4. Probar la validación de login (simular lo que hace validatePlayerAccess)
SELECT * FROM players 
WHERE nickname = 'TestPlayer' 
  AND contraseña = 'test123' 
  AND equipo = 'Alpha Squad';

-- 5. Verificar que la consulta devuelve datos
-- Esta consulta debe devolver exactamente 1 fila si todo está correcto

-- 6. Limpiar datos de prueba (opcional)
-- DELETE FROM players WHERE nickname = 'TestPlayer';
-- DELETE FROM teams WHERE name = 'Alpha Squad';

-- 7. Consulta para verificar estructura final
SELECT 
    'Campo' as tipo,
    column_name as nombre,
    data_type as tipo_dato,
    is_nullable as permite_null
FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name IN ('nickname', 'contraseña', 'tipo_jugador', 'equipo')
ORDER BY column_name;