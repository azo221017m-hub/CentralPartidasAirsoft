-- ============================================================
-- MIGRACIÓN: Añadir columnas de localización a tabla games
-- Proyecto: ojuxfmywmmvlemjdvzqa
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS locacioncoordenadas TEXT,
  ADD COLUMN IF NOT EXISTS locacionclima TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN games.locacioncoordenadas IS 'Coordenadas GPS de la locación de la partida (ej: 19.4326,-99.1332)';
COMMENT ON COLUMN games.locacionclima IS 'Condiciones climáticas esperadas en la locación (ej: Soleado, Lluvioso, Nublado)';
