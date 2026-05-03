-- Script para corregir usuarios independientes
-- Ejecutar en Supabase SQL Editor o herramienta de BD

-- 1. Ver todos los usuarios y sus tipos
SELECT nickname, tipo_jugador, equipo, team_id FROM players;

-- 2. Actualizar usuario específico a independiente (cambiar 'tu_nickname' por tu nickname real)
UPDATE players 
SET 
  tipo_jugador = 'independiente',
  equipo = 'Independiente',
  team_id = null,
  assault_skill = 0,
  scout_skill = 0,
  rear_guard_skill = 0
WHERE nickname = 'tu_nickname'; -- ⚠️ CAMBIAR por tu nickname real

-- 3. Verificar el cambio
SELECT nickname, tipo_jugador, equipo, team_id, assault_skill, scout_skill, rear_guard_skill 
FROM players 
WHERE nickname = 'tu_nickname'; -- ⚠️ CAMBIAR por tu nickname real

-- 4. Si quieres hacer TODOS los usuarios independientes:
-- UPDATE players 
-- SET 
--   tipo_jugador = 'independiente',
--   equipo = 'Independiente',
--   team_id = null,
--   assault_skill = 0,
--   scout_skill = 0,
--   rear_guard_skill = 0;