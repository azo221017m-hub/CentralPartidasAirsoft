-- Script SUPER SIMPLE para crear tabla access_requests
-- Copia y pega LÍNEA POR LÍNEA en el SQL Editor de Supabase

-- Paso 1: Habilitar extensión
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Paso 2: Eliminar tabla si existe
DROP TABLE IF EXISTS access_requests CASCADE;

-- Paso 3: Crear tabla
CREATE TABLE access_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    email text,
    status text DEFAULT 'approved',
    created_at timestamptz DEFAULT now()
);

-- Paso 4: Insertar datos de prueba
INSERT INTO access_requests (contact_name, password_hash, email) VALUES ('admin', 'admin123', 'admin@cpa.mx');
INSERT INTO access_requests (contact_name, password_hash, email) VALUES ('organizador', 'org456', 'organizador@cpa.mx');  
INSERT INTO access_requests (contact_name, password_hash, email) VALUES ('lider1', 'lider789', 'lider1@cpa.mx');

-- Paso 5: Verificar
SELECT * FROM access_requests;