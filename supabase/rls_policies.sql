-- ============================================================
-- RLS POLICIES - Central de Partidas Airsoft
-- Proyecto: ojuxfmywmmvlemjdvzqa
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================
-- IMPORTANTE: Este proyecto usa autenticación PROPIA (tabla players/access_requests)
-- NO usa Supabase Auth. Por eso las políticas usan anon con acceso permisivo
-- controlado desde el frontend y servicios.
-- ============================================================

-- ============================================================
-- 1. TABLA: players
-- ============================================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer jugadores (para mostrar fichas públicas)
DROP POLICY IF EXISTS "players_select_public" ON players;
CREATE POLICY "players_select_public" ON players
  FOR SELECT USING (true);

-- Insertar: permitido (registro de nuevos jugadores)
DROP POLICY IF EXISTS "players_insert_public" ON players;
CREATE POLICY "players_insert_public" ON players
  FOR INSERT WITH CHECK (true);

-- Actualizar: permitido (el frontend valida que sea el jugador correcto)
DROP POLICY IF EXISTS "players_update_public" ON players;
CREATE POLICY "players_update_public" ON players
  FOR UPDATE USING (true);

-- Eliminar: solo admins (bloqueado para anon)
DROP POLICY IF EXISTS "players_delete_blocked" ON players;
CREATE POLICY "players_delete_blocked" ON players
  FOR DELETE USING (false);

-- Permisos de rol
GRANT SELECT, INSERT, UPDATE ON players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO authenticated;


-- ============================================================
-- 2. TABLA: teams
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Lectura pública
DROP POLICY IF EXISTS "teams_select_public" ON teams;
CREATE POLICY "teams_select_public" ON teams
  FOR SELECT USING (true);

-- Insertar: permitido (capitanes registran su equipo)
DROP POLICY IF EXISTS "teams_insert_public" ON teams;
CREATE POLICY "teams_insert_public" ON teams
  FOR INSERT WITH CHECK (true);

-- Actualizar: permitido
DROP POLICY IF EXISTS "teams_update_public" ON teams;
CREATE POLICY "teams_update_public" ON teams
  FOR UPDATE USING (true);

-- Eliminar: bloqueado
DROP POLICY IF EXISTS "teams_delete_blocked" ON teams;
CREATE POLICY "teams_delete_blocked" ON teams
  FOR DELETE USING (false);

GRANT SELECT, INSERT, UPDATE ON teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO authenticated;


-- ============================================================
-- 3. TABLA: team_forums
-- ============================================================
ALTER TABLE team_forums ENABLE ROW LEVEL SECURITY;

-- Solo foros públicos visibles para anon
DROP POLICY IF EXISTS "forums_select_public" ON team_forums;
CREATE POLICY "forums_select_public" ON team_forums
  FOR SELECT USING (is_public = true);

-- Insertar/Actualizar permitido (se crea automáticamente al crear equipo)
DROP POLICY IF EXISTS "forums_insert_public" ON team_forums;
CREATE POLICY "forums_insert_public" ON team_forums
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "forums_update_public" ON team_forums;
CREATE POLICY "forums_update_public" ON team_forums
  FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON team_forums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_forums TO authenticated;


-- ============================================================
-- 4. TABLA: forum_posts
-- ============================================================
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Leer posts de foros públicos
DROP POLICY IF EXISTS "posts_select_public" ON forum_posts;
CREATE POLICY "posts_select_public" ON forum_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_forums tf
      WHERE tf.id = forum_id AND tf.is_public = true
    )
  );

-- Cualquiera puede crear posts (validación en frontend)
DROP POLICY IF EXISTS "posts_insert_public" ON forum_posts;
CREATE POLICY "posts_insert_public" ON forum_posts
  FOR INSERT WITH CHECK (true);

-- Actualizar/Eliminar: permitido
DROP POLICY IF EXISTS "posts_update_public" ON forum_posts;
CREATE POLICY "posts_update_public" ON forum_posts
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "posts_delete_public" ON forum_posts;
CREATE POLICY "posts_delete_public" ON forum_posts
  FOR DELETE USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON forum_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_posts TO authenticated;


-- ============================================================
-- 5. TABLA: games
-- ============================================================
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Lectura pública de partidas
DROP POLICY IF EXISTS "games_select_public" ON games;
CREATE POLICY "games_select_public" ON games
  FOR SELECT USING (true);

-- Crear partidas: permitido
DROP POLICY IF EXISTS "games_insert_public" ON games;
CREATE POLICY "games_insert_public" ON games
  FOR INSERT WITH CHECK (true);

-- Actualizar partidas: permitido
DROP POLICY IF EXISTS "games_update_public" ON games;
CREATE POLICY "games_update_public" ON games
  FOR UPDATE USING (true);

-- Eliminar: bloqueado para anon
DROP POLICY IF EXISTS "games_delete_blocked" ON games;
CREATE POLICY "games_delete_blocked" ON games
  FOR DELETE USING (false);

GRANT SELECT, INSERT, UPDATE ON games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON games TO authenticated;


-- ============================================================
-- 6. TABLA: game_objectives
-- ============================================================
ALTER TABLE game_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "objectives_select_public" ON game_objectives;
CREATE POLICY "objectives_select_public" ON game_objectives
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "objectives_insert_public" ON game_objectives;
CREATE POLICY "objectives_insert_public" ON game_objectives
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "objectives_update_public" ON game_objectives;
CREATE POLICY "objectives_update_public" ON game_objectives
  FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON game_objectives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_objectives TO authenticated;


-- ============================================================
-- 7. TABLA: game_registrations
-- ============================================================
ALTER TABLE game_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations_select_public" ON game_registrations;
CREATE POLICY "registrations_select_public" ON game_registrations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "registrations_insert_public" ON game_registrations;
CREATE POLICY "registrations_insert_public" ON game_registrations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "registrations_update_public" ON game_registrations;
CREATE POLICY "registrations_update_public" ON game_registrations
  FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON game_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_registrations TO authenticated;


-- ============================================================
-- 8. TABLA: game_participants
-- ============================================================
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_select_public" ON game_participants;
CREATE POLICY "participants_select_public" ON game_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "participants_insert_public" ON game_participants;
CREATE POLICY "participants_insert_public" ON game_participants
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "participants_update_public" ON game_participants;
CREATE POLICY "participants_update_public" ON game_participants
  FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON game_participants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_participants TO authenticated;


-- ============================================================
-- 9. TABLA: access_requests (ya tiene RLS del schema.sql)
-- ============================================================
-- Asegurar que existe la política de lectura pública para login
DROP POLICY IF EXISTS "Allow public read access" ON access_requests;
CREATE POLICY "Allow public read access" ON access_requests
  FOR SELECT USING (true);

-- Permitir insertar nuevas solicitudes
DROP POLICY IF EXISTS "access_requests_insert_public" ON access_requests;
CREATE POLICY "access_requests_insert_public" ON access_requests
  FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT ON access_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON access_requests TO authenticated;


-- ============================================================
-- VERIFICAR estado final de RLS
-- ============================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
