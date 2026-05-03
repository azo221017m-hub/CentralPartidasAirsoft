-- Script para agregar el campo telefonojugador a la tabla players
-- Ejecutar en el Dashboard de Supabase

-- 1. Agregar la columna telefonojugador
ALTER TABLE players ADD COLUMN IF NOT EXISTS telefonojugador TEXT;

-- 2. Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;

-- 3. Ejemplo de inserción con el nuevo campo
/*
INSERT INTO players (
    nickname,
    contraseña,
    tipo_jugador,
    equipo,
    telefonojugador,
    assault_skill,
    scout_skill,
    rear_guard_skill,
    experience
) VALUES (
    'TestPlayerPhone',
    'password123',
    'independiente',
    'Test Team',
    '+1234567890',
    0,
    0,
    0,
    0
);
*/

-- 4. Verificar que la inserción funciona
-- SELECT * FROM players WHERE nickname = 'TestPlayerPhone';

-- 5. Limpiar datos de prueba (opcional)
-- DELETE FROM players WHERE nickname = 'TestPlayerPhone';