import { useState } from 'react'
import { validatePlayerSimple, createPlayer, checkNicknameExists } from '../services/supabaseService'
import supabase from '../lib/supabaseClient'

export default function LoginForm({ onClose, onLoginSuccess }) {
  const [nombreJugador, setNombreJugador] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  
  // Estados para el formulario de registro
  const [showRegister, setShowRegister] = useState(false)
  const [registerData, setRegisterData] = useState({
    nombreJugador: '',
    aliasJugador: '',
    contraseña: '',
    telefonojugador: '',
    tipo: '', // 'independiente', 'jugador_equipo' o 'capitan_equipo'
    zonasJuego: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombreJugador.trim() || !contraseña.trim()) {
      setMensaje('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      // Usar la nueva validación simplificada de jugadores
      const { data, error } = await validatePlayerSimple(nombreJugador.trim(), contraseña)
      
      if (error) {
        console.error('Error validando acceso:', error)
        
        // Dar más información específica sobre el error
        if (error.code === '42501') {
          setMensaje('⚠️ Base de datos no configurada. Contacta al administrador.')
        } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          setMensaje('⚠️ Tabla de usuarios no encontrada. Contacta al administrador.')
        } else {
          setMensaje('Error de conexión. Intenta de nuevo.')
        }
        return
      }

      if (data && data.nickname) {
        setMensaje('✅ Acceso autorizado a CPA')
        
        // Guardar solo campos ligeros — excluir avatar_url (base64 grande)
        const userLight = {
          id: data.id,
          nickname: data.nickname,
          nombrecompleto: data.nombrecompleto,
          tipo_jugador: data.tipo_jugador,
          equipo: data.equipo,
          team_id: data.team_id,
          experience: data.experience,
          assault_skill: data.assault_skill,
          scout_skill: data.scout_skill,
          rear_guard_skill: data.rear_guard_skill,
        }
        localStorage.setItem('currentUser', JSON.stringify(userLight))
        
        onLoginSuccess(userLight)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setMensaje('Sin Acceso, eres hacker?')
      }
    } catch (err) {
      console.error('Error:', err)
      setMensaje('Error inesperado. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  // Función para manejar el registro en base de datos
  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validar campos obligatorios con validaciones seguras
    if (!(registerData.nombreJugador || '').trim() || 
        !(registerData.aliasJugador || '').trim() || 
        !(registerData.contraseña || '').trim() || 
        !(registerData.telefonojugador || '').trim() || 
        !registerData.tipo || 
        !(registerData.zonasJuego || '').trim()) {
      setMensaje('Por favor completa todos los campos del registro.')
      return
    }

    setMensaje('🔄 Verificando disponibilidad del alias...')

    try {
      // Verificar si el nickname ya existe
      const { exists, error: checkError } = await checkNicknameExists(registerData.aliasJugador)
      
      if (checkError) {
        console.error('Error verificando nickname:', checkError)
        setMensaje(`❌ Error verificando alias: ${checkError.message}`)
        return
      }

      if (exists) {
        setMensaje('❌ El alias ya está en uso. Por favor elige otro.')
        return
      }

      setMensaje('🔄 Registrando jugador en la base de datos...')

      // Crear jugador en la base de datos
      const { error: playerError } = await createPlayer({
        nickname: (registerData.aliasJugador || '').trim(),
        avatar_url: null, // Se puede agregar después
        contraseña: (registerData.contraseña || '').trim(),
        tipo_jugador: registerData.tipo || '',
        equipo: (registerData.zonasJuego || '').trim(), // Usar zonasJuego como equipo temporal
        telefonojugador: (registerData.telefonojugador || '').trim(),
        nombrecompleto: (registerData.nombreJugador || '').trim(), // Usar nombreJugador como nombre completo
        zonadejuego: (registerData.zonasJuego || '').trim(), // Agregar zona de juego
        assault_skill: 0, // Valores iniciales en 0
        scout_skill: 0,
        rear_guard_skill: 0,
        experience: 0, // Valores iniciales en 0
        team_id: null // Independiente por ahora
      })

      if (playerError) {
        console.error('Error creando jugador:', playerError)
        setMensaje(`❌ Error registrando jugador: ${playerError.message}`)
        return
      }

      // Crear acceso en access_requests con la contraseña
      const { error: accessError } = await supabase
        .from('access_requests')
        .insert([{
          contact_name: (registerData.aliasJugador || '').trim(),
          password_hash: registerData.contraseña || '',
          email: `${(registerData.aliasJugador || '').trim()}@cpa.local`,
          status: 'approved'
        }])

      if (accessError && !accessError.message?.includes('duplicate')) {
        console.error('Error creando acceso:', accessError)
        setMensaje(`⚠️ Jugador creado pero error en acceso: ${accessError.message}`)
      } else {
        setMensaje('✅ Jugador registrado exitosamente en bdcentralpartidasairsoft!')
      }

      // Limpiar formulario
      setRegisterData({
        nombreJugador: '',
        aliasJugador: '',
        contraseña: '',
        telefonojugador: '',
        tipo: '',
        zonasJuego: ''
      })

      // Cerrar formulario después de unos segundos
      setTimeout(() => {
        setShowRegister(false)
        setMensaje('')
      }, 3000)

    } catch (error) {
      console.error('Error inesperado:', error)
      setMensaje(`❌ Error inesperado: ${error.message}`)
    }
  }

  // Función para alternar entre login y registro
  const toggleRegister = () => {
    setShowRegister(!showRegister)
    setMensaje('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cpa-dark border-2 border-cpa-primary rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-cpa-primary font-squadron text-xl uppercase">
            {showRegister ? '� Registrarme' : '�🔐 Acceso'}
          </h2>
          <button 
            onClick={onClose}
            className="text-cpa-sand hover:text-cpa-primary text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {!showRegister ? (
          // Formulario de Login
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Nombre de Jugador *
                </label>
                <input
                  type="text"
                  value={nombreJugador}
                  onChange={(e) => setNombreJugador(e.target.value)}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                  placeholder="Ingresa tu nombre de jugador"
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                  placeholder="Ingresa tu contraseña"
                  disabled={cargando}
                />
              </div>

              {mensaje && (
                <div className={`p-3 rounded-lg font-bold text-sm ${
                  mensaje === 'Acceso a CPA' 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : mensaje === 'Sin Acceso, eres hacker?'
                    ? 'bg-red-900 text-red-300 border border-red-700'
                    : mensaje.includes('✅')
                    ? 'bg-green-900 text-green-300 border border-green-700'
                    : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                }`}>
                  {mensaje}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 bg-cpa-primary hover:bg-cpa-secondary disabled:opacity-50 text-cpa-white font-squadron font-bold py-3 rounded uppercase tracking-wide transition-colors"
                >
                  {cargando ? 'Validando...' : 'Acceso'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-cpa-gray hover:bg-cpa-secondary text-cpa-sand font-squadron px-4 py-3 rounded uppercase"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* Link para cambiar a registro */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleRegister}
                className="text-cpa-primary hover:text-cpa-sand font-tactical underline transition-colors"
              >
                Registrarme
              </button>
            </div>
          </>
        ) : (
          // Formulario de Registro
          <>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Nombre del Jugador *
                </label>
                <input
                  type="text"
                  value={registerData.nombreJugador}
                  onChange={(e) => setRegisterData({...registerData, nombreJugador: e.target.value})}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Alias de Jugador *
                </label>
                <input
                  type="text"
                  value={registerData.aliasJugador}
                  onChange={(e) => setRegisterData({...registerData, aliasJugador: e.target.value})}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                  placeholder="Tu nickname o alias"
                />
              </div>

              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Teléfono de Jugador *
                </label>
                <input
                  type="tel"
                  value={registerData.telefonojugador}
                  onChange={(e) => setRegisterData({...registerData, telefonojugador: e.target.value})}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={registerData.contraseña}
                  onChange={(e) => setRegisterData({...registerData, contraseña: e.target.value})}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                  placeholder="Contraseña para acceso"
                />
              </div>

              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Modalidad *
                </label>
                <select
                  value={registerData.tipo}
                  onChange={(e) => setRegisterData({...registerData, tipo: e.target.value})}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="independiente">Jugador Independiente</option>
                  <option value="jugador_equipo">Jugador de Equipo</option>
                  <option value="capitan_equipo">Capitán de Equipo</option>
                </select>
              </div>

              <div>
                <label className="block text-cpa-sand text-sm mb-2 uppercase tracking-wide font-tactical">
                  Zonas de Juego *
                </label>
                <textarea
                  value={registerData.zonasJuego}
                  onChange={(e) => setRegisterData({...registerData, zonasJuego: e.target.value})}
                  className="w-full bg-cpa-gray border border-cpa-secondary rounded px-3 py-2 text-cpa-white focus:outline-none focus:border-cpa-primary h-20 resize-none"
                  placeholder="Ej: CDMX, Estado de México, Puebla..."
                />
              </div>

              {mensaje && (
                <div className={`p-3 rounded-lg font-bold text-sm ${
                  mensaje.includes('✅')
                    ? 'bg-green-900 text-green-300 border border-green-700'
                    : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                }`}>
                  {mensaje}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cpa-primary to-cpa-secondary hover:from-cpa-secondary hover:to-cpa-primary text-cpa-white font-squadron font-bold py-3 rounded uppercase tracking-wide transition-colors"
                >
                  🎯 Registrarme
                </button>
                <button
                  type="button"
                  onClick={toggleRegister}
                  className="bg-cpa-gray hover:bg-cpa-secondary text-cpa-sand font-squadron px-4 py-3 rounded uppercase"
                >
                  Volver
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}