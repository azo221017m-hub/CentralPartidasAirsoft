# Instrucciones de Prueba - Botón Actualizar en RegistroEquipo

## 🎯 **Problema Reportado**
El nombre del botón "REGISTRAR" no se actualiza a "ACTUALIZAR" según el tipo de jugador que hizo login.

## ✅ **Correcciones Implementadas**

### **1. Estado Reactivo del Usuario**
```javascript
// ANTES: Estado estático
const [currentUser] = useState(() => getCurrentUser())

// DESPUÉS: Estado reactivo que escucha cambios
const [currentUser, setCurrentUser] = useState(() => getCurrentUser())

useEffect(() => {
  const updateCurrentUser = () => {
    setCurrentUser(getCurrentUser())
  }
  
  updateCurrentUser()
  window.addEventListener('storage', updateCurrentUser)
  
  return () => {
    window.removeEventListener('storage', updateCurrentUser)
  }
}, [])
```

### **2. Lógica del Botón Clarificada**
```javascript
// Botón con lógica explícita para cada tipo de jugador
✅ {currentUser ? (
  currentUser.tipo_jugador === 'independiente' ? 'ACTUALIZAR' :
  currentUser.tipo_jugador === 'jugador_equipo' ? 'ACTUALIZAR' :
  currentUser.tipo_jugador === 'capitan_equipo' ? 'ACTUALIZAR' :
  'REGISTRAR'
) : 'REGISTRAR'}
```

## 🧪 **Pasos de Prueba**

### **Paso 1: Verificar Usuario Independiente**
1. Accede a `http://localhost:5173/`
2. Haz login con un usuario que tenga `tipo_jugador = 'independiente'`
3. Ve al Navbar → "Continuar Registro"
4. **VERIFICAR:** El botón debe mostrar "✅ ACTUALIZAR"
5. **VERIFICAR:** El título debe mostrar "🎯 Actualizar Perfil de Jugador"

### **Paso 2: Verificar Jugador de Equipo**
1. Haz login con un usuario que tenga `tipo_jugador = 'jugador_equipo'`
2. Ve al Navbar → "Continuar Registro"
3. **VERIFICAR:** El botón debe mostrar "✅ ACTUALIZAR"
4. **VERIFICAR:** Debe aparecer la sección "Información del Equipo (Sólo consulta)"
5. **VERIFICAR:** El título debe mostrar "🎯 Actualizar Perfil de Jugador"

### **Paso 3: Verificar Capitán de Equipo**
1. Haz login con un usuario que tenga `tipo_jugador = 'capitan_equipo'`
2. Ve al Navbar → "Continuar Registro"
3. **VERIFICAR:** El botón debe mostrar "✅ ACTUALIZAR"
4. **VERIFICAR:** Debe aparecer la sección "Información del Equipo" (editable)
5. **VERIFICAR:** El título debe mostrar "🎯 Registro de Reclutamiento"

## 🔍 **Debugging - Si el Problema Persiste**

### **Verificar Datos en localStorage**
1. Abre DevTools (F12)
2. Ve a Application → Local Storage → http://localhost:5173
3. Busca la clave `currentUser`
4. **VERIFICAR:** Que contenga el campo `tipo_jugador` correctamente

### **Verificar en Consola**
```javascript
// Ejecutar en consola del navegador
console.log('CurrentUser:', JSON.parse(localStorage.getItem('currentUser')))
console.log('Tipo jugador:', JSON.parse(localStorage.getItem('currentUser'))?.tipo_jugador)
```

### **Verificar Base de Datos**
```sql
-- Verificar tipos de jugador en la BD
SELECT nickname, tipo_jugador FROM players WHERE nickname = 'tu_nickname';
```

## 🎯 **Comportamientos Esperados por Tipo**

| Tipo de Jugador | Botón | Título | Sección Equipo |
|----------------|-------|--------|----------------|
| `independiente` | "✅ ACTUALIZAR" | "Actualizar Perfil de Jugador" | ❌ Oculta |
| `jugador_equipo` | "✅ ACTUALIZAR" | "Actualizar Perfil de Jugador" | ✅ Solo consulta |
| `capitan_equipo` | "✅ ACTUALIZAR" | "Registro de Reclutamiento" | ✅ Editable |
| Sin login | "✅ REGISTRAR" | "Registro de Reclutamiento" | ✅ Editable |

## 🚀 **Estado del Servidor**
- ✅ Ejecutándose en: `http://localhost:5173/`
- ✅ Sin errores de compilación
- ✅ Hot reload activo

## 📝 **Si el Problema Continúa**

### **Posibles Causas:**
1. **Caché del navegador:** Ctrl+F5 para hard refresh
2. **LocalStorage corrupto:** Borrar localStorage y hacer login de nuevo
3. **Datos de BD incorrectos:** Verificar que el usuario tenga el `tipo_jugador` correcto
4. **Timing de carga:** El componente se renderiza antes de que se cargue el usuario

### **Solución Temporal - Debug Mode:**
Agrega este código temporalmente en RegistroEquipo.jsx para debug:
```javascript
// Después de la línea del botón
<div className="mt-2 text-xs text-white bg-red-600 p-2">
  DEBUG: Usuario = {currentUser?.nickname}, Tipo = {currentUser?.tipo_jugador}
</div>
```

---
**✅ CORRECCIONES APLICADAS - LISTO PARA PRUEBA**