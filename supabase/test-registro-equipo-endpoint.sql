-- Script de prueba para el endpoint de Registrar Equipo
-- Ejecutar en el Dashboard de Supabase después de actualizar la tabla

-- 1. Verificar la estructura actual de la tabla players
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;

-- 2. Simular una inserción como la haría el endpoint de RegistroEquipo
-- (Esta es la estructura que debe funcionar después de los cambios)

-- Insertar equipo de prueba
INSERT INTO teams (name, logo_url, team_photo_url, is_public_forum) 
VALUES ('Equipo Test RegistroEndpoint', null, null, false)
RETURNING id, name;

-- Obtener el ID del equipo recién creado (reemplazar con el ID real)
-- SET @team_id = (SELECT id FROM teams WHERE name = 'Equipo Test RegistroEndpoint');

-- Insertar jugadores de prueba con la nueva estructura
-- Nota: Reemplazar 'TEAM_ID_AQUI' con el ID real del equipo
/*
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
) VALUES 
('Líder Test', 'password123', 'Experto', 'Equipo Test RegistroEndpoint', 80, 70, 60, 3, 'TEAM_ID_AQUI'),
('Segundo Test', 'password456', 'Avanzado', 'Equipo Test RegistroEndpoint', 70, 80, 65, 2, 'TEAM_ID_AQUI'),
('Miembro Test', 'password789', 'Intermedio', 'Equipo Test RegistroEndpoint', 60, 65, 70, 1, 'TEAM_ID_AQUI');
*/

-- 3. Verificar que los datos se insertaron correctamente
SELECT 
  p.nickname,
  p.contraseña,
  p.tipo_jugador,
  p.equipo,
  p.assault_skill,
  p.scout_skill,
  p.rear_guard_skill,
  p.experience,
  t.name as team_name
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Equipo Test RegistroEndpoint';

-- 4. Limpiar datos de prueba
DELETE FROM players WHERE equipo = 'Equipo Test RegistroEndpoint';
DELETE FROM teams WHERE name = 'Equipo Test RegistroEndpoint';

-- 5. Verificar que se limpiaron los datos
SELECT COUNT(*) as registros_restantes 
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
WHERE t.name = 'Equipo Test RegistroEndpoint' OR p.equipo = 'Equipo Test RegistroEndpoint';