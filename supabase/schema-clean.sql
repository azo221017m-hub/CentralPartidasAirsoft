-- Schema LIMPIO para Supabase - Sin errores de constraints duplicadas
-- Este script se puede ejecutar múltiples veces sin errores

-- Habilitar extensión para gen_random_uuid() si no está disponible
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- LIMPIAR Y RECREAR ENUMS
DO $$BEGIN
    -- Eliminar enums existentes si existen (en orden de dependencias)
    DROP TYPE IF EXISTS participant_confirmation CASCADE;
    DROP TYPE IF EXISTS registration_status CASCADE;
    DROP TYPE IF EXISTS objective_status CASCADE;
    
    -- Crear nuevos enums
    CREATE TYPE objective_status AS ENUM ('pending', 'completed', 'failed');
    CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'rejected');
    CREATE TYPE participant_confirmation AS ENUM ('pending', 'confirmed');
END$$;

-- ELIMINAR TABLAS EXISTENTES (en orden de dependencias)
DROP TABLE IF EXISTS game_participants CASCADE;
DROP TABLE IF EXISTS game_registrations CASCADE;
DROP TABLE IF EXISTS game_objectives CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS team_forums CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS access_requests CASCADE;

-- CREAR TABLAS
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  team_photo_url text,
  leader_id uuid,
  second_in_command_id uuid,
  is_public_forum boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  nickname text NOT NULL,
  avatar_url text,
  assault_skill integer DEFAULT 0,
  scout_skill integer DEFAULT 0,
  rear_guard_skill integer DEFAULT 0,
  experience integer DEFAULT 0,
  team_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE team_forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL UNIQUE,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL,
  author_id uuid,
  title text,
  content text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  team_id uuid,
  title text,
  date timestamptz,
  game_mode text,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE game_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  type text NOT NULL,
  description text,
  status objective_status DEFAULT 'pending',
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE game_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  team_id uuid NOT NULL,
  status registration_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL,
  player_name text NOT NULL,
  team_name text,
  payment_proof_url text,
  privacy_notice_accepted boolean DEFAULT false,
  confirmation_status participant_confirmation DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email text,
  status text DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

-- AGREGAR FOREIGN KEYS
ALTER TABLE players ADD CONSTRAINT fk_player_team 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE teams ADD CONSTRAINT fk_team_leader 
  FOREIGN KEY (leader_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE teams ADD CONSTRAINT fk_team_second 
  FOREIGN KEY (second_in_command_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE team_forums ADD CONSTRAINT fk_forum_team 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

ALTER TABLE forum_posts ADD CONSTRAINT fk_post_forum 
  FOREIGN KEY (forum_id) REFERENCES team_forums(id) ON DELETE CASCADE;

ALTER TABLE forum_posts ADD CONSTRAINT fk_post_author 
  FOREIGN KEY (author_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE games ADD CONSTRAINT fk_game_creator 
  FOREIGN KEY (created_by) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE games ADD CONSTRAINT fk_game_team 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE game_objectives ADD CONSTRAINT fk_objective_game 
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

ALTER TABLE game_registrations ADD CONSTRAINT fk_registration_game 
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

ALTER TABLE game_registrations ADD CONSTRAINT fk_registration_team 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

ALTER TABLE game_participants ADD CONSTRAINT fk_participant_registration 
  FOREIGN KEY (registration_id) REFERENCES game_registrations(id) ON DELETE CASCADE;

-- CREAR FUNCIÓN Y TRIGGER PARA FOROS AUTOMÁTICOS
CREATE OR REPLACE FUNCTION create_forum_for_new_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_forums (team_id, is_public)
  VALUES (NEW.id, COALESCE(NEW.is_public_forum, true))
  ON CONFLICT (team_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_forum
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION create_forum_for_new_team();

-- CREAR ÍNDICES
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_games_team_id ON games(team_id);
CREATE INDEX idx_registrations_game_id ON game_registrations(game_id);
CREATE INDEX idx_access_requests_contact_name ON access_requests(contact_name);
CREATE INDEX idx_forum_posts_forum_id ON forum_posts(forum_id);

-- INSERTAR DATOS DE PRUEBA
INSERT INTO access_requests (contact_name, password_hash, email) VALUES
('admin', 'admin123', 'admin@cpa.mx'),
('organizador', 'org456', 'organizador@cpa.mx'),
('lider1', 'lider789', 'lider1@cpa.mx');

-- VERIFICAR CREACIÓN
SELECT 'access_requests' as tabla, count(*) as registros FROM access_requests
UNION ALL
SELECT 'teams' as tabla, count(*) as registros FROM teams
UNION ALL
SELECT 'players' as tabla, count(*) as registros FROM players;