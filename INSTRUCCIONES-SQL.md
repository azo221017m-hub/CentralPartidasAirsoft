## 🔧 Ejecutar PASO A PASO en Supabase SQL Editor

### Paso 1: Extensión
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Paso 2: Eliminar tabla existente
```sql
DROP TABLE IF EXISTS access_requests CASCADE;
```

### Paso 3: Crear tabla
```sql
CREATE TABLE access_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now()
);
```

### Paso 4: Insertar usuario admin
```sql
INSERT INTO access_requests (contact_name, password_hash) VALUES ('admin', 'admin123');
```

### Paso 5: Insertar más usuarios
```sql
INSERT INTO access_requests (contact_name, password_hash) VALUES ('organizador', 'org456');
INSERT INTO access_requests (contact_name, password_hash) VALUES ('lider1', 'lider789');
```

### Paso 6: Verificar
```sql
SELECT * FROM access_requests;
```

## ✅ Resultado esperado:
Deberías ver 3 usuarios con sus IDs únicos y timestamps.