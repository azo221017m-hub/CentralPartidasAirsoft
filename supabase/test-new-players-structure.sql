-- Script de prueba para verificar las funciones después de los cambios
-- Ejecutar en el Dashboard de Supabase

-- 1. Verificar estructura de la tabla players
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;

-- 2. Insertar un jugador de prueba con las nuevas columnas
INSERT INTO players (
  nickname,
  contraseña,
  tipo_jugador,
  equipo,
  assault_skill,
  scout_skill,
  rear_guard_skill,
  experience
) VALUES (
  'jugador_prueba',
  'test123',
  'Intermedio',
  'Equipo Alpha',
  60,
  70,
  55,
  1
);

-- 3. Verificar que se insertó correctamente
SELECT * FROM players WHERE nickname = 'jugador_prueba';

-- 4. Limpiar datos de prueba
DELETE FROM players WHERE nickname = 'jugador_prueba';