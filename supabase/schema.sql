-- Esquema para Supabase (Postgres)
-- Crea tablas y relaciones según la especificación del proyecto

-- Habilitar extensión para gen_random_uuid() si no está disponible
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMS
DO $$BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'objective_status') THEN
        CREATE TYPE objective_status AS ENUM ('pending', 'completed', 'failed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_confirmation') THEN
        CREATE TYPE participant_confirmation AS ENUM ('pending', 'confirmed');
    END IF;
END$$;

-- TABLAS
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  team_photo_url text,
  leader_id uuid,
  second_in_command_id uuid,
  is_public_forum boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  avatar_url text,
  contraseña text NOT NULL,
  tipo_jugador text,
  equipo text,
  telefonojugador text,
  zonadejuego text,
  nombrecompleto text,
  assault_skill integer DEFAULT 0,
  scout_skill integer DEFAULT 0,
  rear_guard_skill integer DEFAULT 0,
  experience integer DEFAULT 0,
  team_id uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_player_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Relaciones opcionales hacia players (leader/second) con ON DELETE SET NULL
-- Solo agregar si no existen ya
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_team_leader' 
        AND table_name = 'teams'
    ) THEN
        ALTER TABLE teams ADD CONSTRAINT fk_team_leader 
        FOREIGN KEY (leader_id) REFERENCES players(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_team_second' 
        AND table_name = 'teams'
    ) THEN
        ALTER TABLE teams ADD CONSTRAINT fk_team_second 
        FOREIGN KEY (second_in_command_id) REFERENCES players(id) ON DELETE SET NULL;
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS team_forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL UNIQUE,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_forum_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL,
  author_id uuid,
  title text,
  content text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_post_forum FOREIGN KEY (forum_id) REFERENCES team_forums(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  team_id uuid,
  title text,
  date timestamptz,
  game_mode text,
  status text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_game_creator FOREIGN KEY (created_by) REFERENCES players(id) ON DELETE SET NULL,
  CONSTRAINT fk_game_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS game_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  type text NOT NULL,
  description text,
  status objective_status DEFAULT 'pending',
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_objective_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  team_id uuid NOT NULL,
  status registration_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_registration_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_registration_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL,
  player_name text NOT NULL,
  team_name text,
  payment_proof_url text,
  privacy_notice_accepted boolean DEFAULT false,
  confirmation_status participant_confirmation DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_participant_registration FOREIGN KEY (registration_id) REFERENCES game_registrations(id) ON DELETE CASCADE
);

-- TRIGGER: Cuando se crea un equipo, crear su foro automáticamente (si no existe)
CREATE OR REPLACE FUNCTION create_forum_for_new_team()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentar insertar el foro; si ya existe, ignorar
  INSERT INTO team_forums (team_id, is_public)
  VALUES (NEW.id, COALESCE(NEW.is_public_forum, true))
  ON CONFLICT (team_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_forum ON teams;
CREATE TRIGGER trg_create_forum
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION create_forum_for_new_team();

-- INDEXES útiles (solo crear si no existen)
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_games_team_id ON games(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_game_id ON game_registrations(game_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_contact_name ON access_requests(contact_name);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_id ON forum_posts(forum_id);

-- Tabla para control de acceso (usuarios autorizados)
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email text,
  status text DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

-- CONFIGURAR PERMISOS PARA access_requests
-- Habilitar Row Level Security
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Dar permisos de lectura a usuarios públicos y autenticados
GRANT SELECT ON access_requests TO anon;
GRANT SELECT ON access_requests TO authenticated;

-- Crear política para permitir lectura pública (necesario para login)
DROP POLICY IF EXISTS "Allow public read access" ON access_requests;
CREATE POLICY "Allow public read access" ON access_requests
    FOR SELECT USING (true);

-- Insertar algunos usuarios de ejemplo
INSERT INTO access_requests (contact_name, password_hash, email) VALUES
('admin', 'admin123', 'admin@cpa.mx'),
('organizador', 'org456', 'organizador@cpa.mx'),
('lider1', 'lider789', 'lider1@cpa.mx')
ON CONFLICT (contact_name) DO NOTHING;

-- Nota: Ajusta tipos y restricciones según tus necesidades (por ejemplo, forzar uniqueness de nicknames, etc.)
