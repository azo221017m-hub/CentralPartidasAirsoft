-- Script MÍNIMO para crear solo la tabla access_requests
-- Ejecuta esto en el SQL Editor de Supabase si solo quieres el login

-- Habilitar extensión para gen_random_uuid() si no está disponible
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar tabla si ya existe para evitar conflictos
DROP TABLE IF EXISTS access_requests;

-- Crear tabla para control de acceso (usuarios autorizados)
CREATE TABLE access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email text,
  status text DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

-- Crear índice para mejorar performance en búsquedas
CREATE INDEX idx_access_requests_contact_name ON access_requests(contact_name);

-- Insertar usuarios de ejemplo para pruebas
INSERT INTO access_requests (contact_name, password_hash, email) VALUES
('admin', 'admin123', 'admin@cpa.mx'),
('organizador', 'org456', 'organizador@cpa.mx'),
('lider1', 'lider789', 'lider1@cpa.mx');

-- Verificar que se crearon los datos
SELECT 'Usuarios creados:' as mensaje, count(*) as total FROM access_requests;
SELECT * FROM access_requests ORDER BY contact_name;