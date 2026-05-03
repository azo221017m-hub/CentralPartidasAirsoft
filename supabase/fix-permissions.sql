-- Script para CONFIGURAR PERMISOS completos en todas las tablas
-- Ejecuta esto en el SQL Editor de Supabase para solucionar "permission denied"

-- CONFIGURAR PERMISOS PARA TABLA TEAMS
-- Habilitar Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Dar permisos completos a usuarios públicos y autenticados
GRANT ALL ON teams TO anon;
GRANT ALL ON teams TO authenticated;

-- Crear políticas para permitir operaciones públicas
DROP POLICY IF EXISTS "Allow public read access" ON teams;
CREATE POLICY "Allow public read access" ON teams
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON teams;
CREATE POLICY "Allow public insert access" ON teams
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON teams;
CREATE POLICY "Allow public update access" ON teams
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON teams;
CREATE POLICY "Allow public delete access" ON teams
    FOR DELETE USING (true);

-- CONFIGURAR PERMISOS PARA TABLA PLAYERS
-- Habilitar Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Dar permisos completos a usuarios públicos y autenticados
GRANT ALL ON players TO anon;
GRANT ALL ON players TO authenticated;

-- Crear políticas para permitir operaciones públicas
DROP POLICY IF EXISTS "Allow public read access" ON players;
CREATE POLICY "Allow public read access" ON players
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON players;
CREATE POLICY "Allow public insert access" ON players
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON players;
CREATE POLICY "Allow public update access" ON players
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON players;
CREATE POLICY "Allow public delete access" ON players
    FOR DELETE USING (true);

-- CONFIGURAR PERMISOS PARA TABLA TEAM_FORUMS
-- Habilitar Row Level Security
ALTER TABLE team_forums ENABLE ROW LEVEL SECURITY;

-- Dar permisos completos a usuarios públicos y autenticados
GRANT ALL ON team_forums TO anon;
GRANT ALL ON team_forums TO authenticated;

-- Crear políticas para permitir operaciones públicas
DROP POLICY IF EXISTS "Allow public read access" ON team_forums;
CREATE POLICY "Allow public read access" ON team_forums
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON team_forums;
CREATE POLICY "Allow public insert access" ON team_forums
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON team_forums;
CREATE POLICY "Allow public update access" ON team_forums
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON team_forums;
CREATE POLICY "Allow public delete access" ON team_forums
    FOR DELETE USING (true);

-- CONFIGURAR PERMISOS PARA ACCESS_REQUESTS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Dar permisos completos a usuarios públicos y autenticados
GRANT ALL ON access_requests TO anon;
GRANT ALL ON access_requests TO authenticated;

-- Crear políticas para permitir operaciones públicas
DROP POLICY IF EXISTS "Allow public read access" ON access_requests;
CREATE POLICY "Allow public read access" ON access_requests
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON access_requests;
CREATE POLICY "Allow public insert access" ON access_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON access_requests;
CREATE POLICY "Allow public update access" ON access_requests
    FOR UPDATE USING (true);

-- VERIFICAR PERMISOS
SELECT 'Permisos configurados correctamente para teams, players, team_forums y access_requests' AS status;