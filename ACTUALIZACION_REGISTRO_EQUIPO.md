# Actualización del Endpoint "Registrar Equipo"

## Cambios Realizados

### 1. Estructura del Objeto `defaultJugador` (`RegistroEquipo.jsx`)
```javascript
// ANTES
const defaultJugador = {
  nombre: '',
  sobrenombre: '',
  contraseña: '',
  habilidadAsalto: 50,
  habilidadExplorador: 50,
  habilidadRetaguardia: 50,
  experiencia: 'Novato',
  esLider: false,
  esSegundo: false,
  visible: true,
  equipo: '',
}

// DESPUÉS
const defaultJugador = {
  nombre: '',
  sobrenombre: '',
  contraseña: '',
  tipo_jugador: 'Novato', // ✅ Nuevo campo
  equipo: '',             // ✅ Reordenado
  habilidadAsalto: 50,
  habilidadExplorador: 50,
  habilidadRetaguardia: 50,
  experiencia: 'Novato',
  esLider: false,
  esSegundo: false,
  visible: true,
}
```

### 2. Función `agregarJugador()` 
```javascript
// ✅ Actualizada para mapear correctamente los nuevos campos
const newJ = { 
  ...jugadorActual, 
  id: Date.now(), 
  equipo: nombre,                        // ✅ Asignar nombre del equipo
  tipo_jugador: jugadorActual.experiencia // ✅ Usar experiencia como tipo
}
```

### 3. Campo de Experiencia en el Formulario
```javascript
// ✅ Actualizado para sincronizar experiencia con tipo_jugador
onChange={e => setJugadorActual(j => ({ 
  ...j, 
  experiencia: e.target.value, 
  tipo_jugador: e.target.value  // ✅ Sincronización automática
}))}
```

### 4. Componente `FichaJugador.jsx`
```jsx
// ✅ Añadido campo tipo_jugador en la visualización
<div className="text-tactical-sand">
  <div>Experiencia: <span className="text-tactical-orange font-bold">{jugador.experiencia || 'Novato'}</span></div>
  {jugador.tipo_jugador && (
    <div className="mt-1">Tipo: <span className="text-tactical-orange font-bold">{jugador.tipo_jugador}</span></div>
  )}
</div>
```

## Flujo de Datos Actualizado

### Al Registrar un Equipo:
1. **Usuario llena el formulario** → Campos: `nombre`, `sobrenombre`, `contraseña`, `experiencia`
2. **Se ejecuta `agregarJugador()`** → Mapea: `tipo_jugador = experiencia`, `equipo = nombre del equipo`
3. **Se llama `createTeamWithPlayers()`** → Pasa todos los campos al servicio de Supabase
4. **Servicio `createPlayer()`** → Inserta en la base de datos con la nueva estructura:
   ```javascript
   {
     nickname: playerData.sobrenombre || playerData.nombre,
     contraseña: playerData.contraseña || 'default123',
     tipo_jugador: playerData.experiencia || null,
     equipo: teamData.name || null,
     // ... otros campos
   }
   ```

## Compatibilidad

### ✅ **Mantenido:**
- Validación de contraseña obligatoria
- Campos de habilidades (asalto, explorador, retaguardia)
- Funcionalidad de líder y segundo al mando
- Carga de avatar e imágenes
- Validación de formularios

### ✅ **Mejorado:**
- Sincronización automática entre `experiencia` y `tipo_jugador`
- Asignación automática del nombre del equipo en el campo `equipo`
- Visualización completa de la información del jugador en la ficha
- Estructura de datos alineada con la nueva tabla `players`

## Scripts de Prueba

### 1. `test-registro-equipo-endpoint.sql`
- Simula el proceso completo de registro
- Verifica inserción con la nueva estructura
- Incluye limpieza de datos de prueba

### 2. Para ejecutar en Supabase Dashboard:
```sql
-- 1. Ejecutar primero: update-players-table.sql
-- 2. Probar con: test-registro-equipo-endpoint.sql
```

## Verificación de Funcionamiento

### ✅ **Checklist de Pruebas:**
- [ ] Ejecutar script de actualización de tabla en Supabase
- [ ] Crear un equipo desde el formulario web
- [ ] Verificar que se guardan todos los campos nuevos
- [ ] Confirmar que se muestran correctamente en la ficha del jugador
- [ ] Validar que la contraseña se requiere y se guarda
- [ ] Comprobar que `tipo_jugador` se sincroniza con `experiencia`
- [ ] Verificar que `equipo` se asigna automáticamente

### 🔧 **En caso de errores:**
1. Verificar que el script `update-players-table.sql` se ejecutó correctamente
2. Revisar la consola del navegador para errores de JavaScript
3. Confirmar que las columnas `contraseña`, `tipo_jugador`, `equipo` existen en la tabla
4. Validar que los permisos RLS permiten inserción en la tabla `players`

## Estado Final

El endpoint de "Registrar Equipo" ahora está **completamente actualizado** para trabajar con la nueva estructura de la tabla `players`, manteniendo toda la funcionalidad existente y agregando soporte para los nuevos campos requeridos.