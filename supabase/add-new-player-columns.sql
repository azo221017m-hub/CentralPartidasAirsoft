-- Add new columns to players table: zonadejuego and nombrecompleto

-- Add zonadejuego column (game zone/area)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS zonadejuego text;

-- Add nombrecompleto column (full name)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS nombrecompleto text;

-- Update the schema comment for documentation
COMMENT ON COLUMN players.zonadejuego IS 'Zona de juego preferida del jugador';
COMMENT ON COLUMN players.nombrecompleto IS 'Nombre completo del jugador';