# Validación de Mapeo de Campos - RegistroEquipo vs Tabla Players

## 🗂️ **Mapeo de Campos INPUT → DATABASE**

### **Campos de Formulario → Tabla players**

| Campo Input (RegistroEquipo) | Campo Database (players) | Tipo | Validación |
|------------------------------|-------------------------|------|------------|
| `jugadorData.sobrenombre` | `players.nickname` | text NOT NULL | ✅ Requerido |
| `jugadorData.contraseña` | `players.contraseña` | text NOT NULL | ✅ Requerido |
| `jugadorData.experiencia` | `players.tipo_jugador` | text | ✅ Válido |
| `jugadorData.equipo` | `players.equipo` | text | ✅ "Independiente" para independientes |
| `jugadorData.telefonojugador` | `players.telefonojugador` | text | ✅ Opcional |
| `jugadorData.zonadejuego` | `players.zonadejuego` | text | ✅ Opcional |
| `jugadorData.nombrecompleto` | `players.nombrecompleto` | text | ✅ Opcional |
| `jugadorData.habilidadAsalto` | `players.assault_skill` | integer DEFAULT 0 | ✅ 0 para independientes |
| `jugadorData.habilidadExplorador` | `players.scout_skill` | integer DEFAULT 0 | ✅ 0 para independientes |
| `jugadorData.habilidadRetaguardia` | `players.rear_guard_skill` | integer DEFAULT 0 | ✅ 0 para independientes |
| `experiencias.indexOf(jugadorData.experiencia)` | `players.experience` | integer DEFAULT 0 | ✅ Índice de experiencia |
| `null` (para independientes) | `players.team_id` | uuid | ✅ NULL para independientes |
| `jugadorData.avatar` | `players.avatar_url` | text | ✅ URL de imagen |

## 🎯 **Implementación Específica para Independientes**

### **1. Pre-carga de Datos**
```javascript
// En el useEffect de carga de datos
const jugadorCargado = {
  contraseña: currentUser.tipo_jugador === 'independiente' ? (playerData.contraseña || '') : '',
  habilidadAsalto: currentUser.tipo_jugador === 'independiente' ? 0 : (playerData.assault_skill || 50),
  habilidadExplorador: currentUser.tipo_jugador === 'independiente' ? 0 : (playerData.scout_skill || 50),
  habilidadRetaguardia: currentUser.tipo_jugador === 'independiente' ? 0 : (playerData.rear_guard_skill || 50),
  // ... otros campos
}
```

### **2. Función UPDATE para Independientes**
```javascript
if (currentUser.tipo_jugador === 'independiente') {
  const { error: updateError } = await updatePlayer(currentPlayerData.id, {
    nickname: jugadorData.sobrenombre || jugadorData.nombrecompleto,
    contraseña: jugadorData.contraseña,
    tipo_jugador: jugadorData.experiencia,
    equipo: 'Independiente',
    telefonojugador: jugadorData.telefonojugador || '',
    zonadejuego: jugadorData.zonadejuego || '',
    nombrecompleto: jugadorData.nombrecompleto || '',
    assault_skill: jugadorData.habilidadAsalto,    // Siempre 0
    scout_skill: jugadorData.habilidadExplorador,   // Siempre 0
    rear_guard_skill: jugadorData.habilidadRetaguardia, // Siempre 0
    experience: experiencias.indexOf(jugadorData.experiencia),
    team_id: null // Independientes no tienen equipo
  })
}
```

## 📋 **Validaciones Implementadas**

### **✅ Requerimientos Cumplidos**

1. **Campo Contraseña Pre-cargado:**
   ```javascript
   contraseña: currentUser.tipo_jugador === 'independiente' ? (playerData.contraseña || '') : ''
   ```

2. **Habilidades en 0 para Independientes:**
   ```javascript
   habilidadAsalto: currentUser.tipo_jugador === 'independiente' ? 0 : (playerData.assault_skill || 50)
   habilidadExplorador: currentUser.tipo_jugador === 'independiente' ? 0 : (playerData.scout_skill || 50)
   habilidadRetaguardia: currentUser.tipo_jugador === 'independiente' ? 0 : (playerData.rear_guard_skill || 50)
   ```

3. **Botón "ACTUALIZAR" para Independientes:**
   ```javascript
   ✅ {currentUser ? (
     currentUser.tipo_jugador === 'independiente' ? 'ACTUALIZAR' :
     currentUser.tipo_jugador === 'jugador_equipo' ? 'ACTUALIZAR' :
     currentUser.tipo_jugador === 'capitan_equipo' ? 'ACTUALIZAR' :
     'REGISTRAR'
   ) : 'REGISTRAR'}
   ```

4. **UPDATE por ID del Usuario Logueado:**
   ```javascript
   const { data: currentPlayerData } = await getPlayerByNickname(currentUser.nickname)
   await updatePlayer(currentPlayerData.id, { ... })
   ```

## 🔍 **Verificaciones de Integridad**

### **Campos Obligatorios**
- ✅ `nickname` (sobrenombre) - Requerido, mapeado correctamente
- ✅ `contraseña` - Requerida, pre-cargada para independientes
- ✅ `tipo_jugador` - Desde experiencia seleccionada

### **Campos Específicos para Independientes**
- ✅ `equipo` = "Independiente" (hardcoded)
- ✅ `assault_skill` = 0 (forzado)
- ✅ `scout_skill` = 0 (forzado)
- ✅ `rear_guard_skill` = 0 (forzado)
- ✅ `team_id` = null (sin equipo)

### **Campos Opcionales**
- ✅ `telefonojugador` - Desde input
- ✅ `zonadejuego` - Desde input
- ✅ `nombrecompleto` - Desde input
- ✅ `avatar_url` - Desde upload de imagen

## 🚀 **Estado de Implementación**

| Funcionalidad | Estado | Detalles |
|---------------|--------|----------|
| Navbar - Ocultar menús | ✅ Implementado | Oculta "Crear Partida" y "Registrar en Partida" cuando "Continuar Registro" visible |
| Contraseña pre-cargada | ✅ Implementado | Solo para independientes |
| Habilidades en 0 | ✅ Implementado | assault_skill, scout_skill, rear_guard_skill = 0 |
| Botón "ACTUALIZAR" | ✅ Implementado | Dinámico según tipo_jugador |
| UPDATE por user ID | ✅ Implementado | Usa getPlayerByNickname → updatePlayer(id) |
| Mapeo completo campos | ✅ Validado | Todos los campos INPUT → DB mapeados correctamente |

---

**✅ VALIDACIÓN COMPLETA - MAPEO CORRECTO DE CAMPOS**

Todos los campos están correctamente mapeados entre el formulario y la base de datos, con lógica específica implementada para jugadores independientes.