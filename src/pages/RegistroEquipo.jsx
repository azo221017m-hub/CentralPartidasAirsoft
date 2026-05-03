import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FichaJugador from '../components/FichaJugador'
import { updatePlayer, getPlayerByNickname, getTeamsComplete, createTeam } from '../services/supabaseService'

// Función RECREADA para obtener datos del usuario logueado 
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('currentUser')
    console.log('🔍 LocalStorage currentUser:', userData)
    if (userData) {
      const parsed = JSON.parse(userData)
      console.log('🔍 Parsed user data:', parsed)
      return parsed
    }
  } catch (error) {
    console.error('❌ Error parsing user data:', error)
  }
  return null
}

const defaultJugador = {
  nombre: '',
  sobrenombre: '',
  contraseña: '',
  tipo_jugador: 'Novato', // Nuevo campo para tipo de jugador
  equipo: '', // Nuevo campo para equipo (se asignará automáticamente)
  telefonojugador: '',
  zonadejuego: '',
  nombrecompleto: '',
  habilidadAsalto: 0, // Por defecto en 0 para independientes
  habilidadExplorador: 0, // Por defecto en 0 para independientes
  habilidadRetaguardia: 0, // Por defecto en 0 para independientes
  experiencia: 'Novato',
  esLider: false,
  esSegundo: false,
  visible: true,
}

export default function RegistroEquipo() {
  const navigate = useNavigate()
  
  // Estados principales RECREADOS
  const [currentUser, setCurrentUser] = useState(null)
  const [isUserLoaded, setIsUserLoaded] = useState(false)
  const [nombre, setNombre] = useState('')
  const [logo, setLogo] = useState(null)
  const [fotoEquipo, setFotoEquipo] = useState(null)
  const [integrantes, setIntegrantes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [jugadorActual, setJugadorActual] = useState({ ...defaultJugador })
  const [editIdx, setEditIdx] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [equiposList, setEquiposList] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [currentPlayerTeam] = useState(null)
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    nombreEquipo: ''
  })

  // EFECTO RECREADO para cargar usuario al inicio
  useEffect(() => {
    console.log('🔄 Iniciando carga de usuario...')
    const loadUser = () => {
      const user = getCurrentUser()
      console.log('🔍 Usuario cargado:', user)
      setCurrentUser(user)
      setIsUserLoaded(true)
    }
    
    loadUser()
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      console.log('🔄 Storage cambió, recargando usuario...')
      loadUser()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // EFECTO RECREADO para cargar datos del jugador según tipo
  useEffect(() => {
    if (!currentUser || !isUserLoaded) {
      console.log('⏳ Esperando usuario o no cargado aún...')
      return
    }

    console.log('🎯 Cargando datos para usuario:', currentUser.nickname, 'Tipo:', currentUser.tipo_jugador)

    const loadPlayerData = async () => {
      try {
        // Cargar datos del jugador desde BD
        const { data: playerData, error: playerError } = await getPlayerByNickname(currentUser.nickname)
        
        if (playerError || !playerData) {
          console.error('❌ Error obteniendo datos del jugador:', playerError)
          setMensaje('❌ Error: No se pudieron cargar los datos del jugador')
          return
        }

        console.log('📋 Datos del jugador desde BD:', playerData)

        // LÓGICA ESPECÍFICA PARA INDEPENDIENTES
        const esIndependiente = 
          playerData.tipo_jugador === 'independiente' || 
          currentUser.tipo_jugador === 'independiente'

        console.log('🎯 Es independiente?', esIndependiente)

        // Preparar datos del jugador con lógica específica
        const jugadorCargado = {
          id: playerData.id,
          nombre: playerData.nombre || '',
          sobrenombre: playerData.nickname || '',
          // CONTRASEÑA: Pre-cargar SOLO para independientes
          contraseña: esIndependiente ? (playerData.contraseña || '') : '',
          tipo_jugador: playerData.tipo_jugador || 'Novato',
          equipo: playerData.equipo || (esIndependiente ? 'Independiente' : ''),
          telefonojugador: playerData.telefonojugador || '',
          zonadejuego: playerData.zonadejuego || '',
          nombrecompleto: playerData.nombrecompleto || '',
          // HABILIDADES: 0 para independientes, valores actuales para otros
          habilidadAsalto: esIndependiente ? 0 : (playerData.assault_skill || 50),
          habilidadExplorador: esIndependiente ? 0 : (playerData.scout_skill || 50),
          habilidadRetaguardia: esIndependiente ? 0 : (playerData.rear_guard_skill || 50),
          experiencia: playerData.tipo_jugador || 'Novato',
          esLider: false,
          esSegundo: false,
          visible: true,
        }

        console.log('✅ Jugador cargado con datos específicos:', jugadorCargado)

        // Establecer el jugador en el formulario
        setJugadorActual(jugadorCargado)
        setIntegrantes([jugadorCargado])
        setMostrarForm(false)

        // Cargar equipos si es necesario (para jugadores de equipo)
        if (playerData.tipo_jugador === 'jugador_equipo') {
          const { data: teamsData } = await getTeamsComplete()
          setEquiposList(teamsData || [])
        }

        setMensaje('✅ Datos cargados correctamente')

      } catch (error) {
        console.error('❌ Error cargando datos:', error)
        setMensaje('❌ Error inesperado al cargar datos')
      }
    }

    loadPlayerData()
  }, [currentUser, isUserLoaded])

  // Función para manejar selección de equipo (para jugador_equipo)
  const handleTeamSelection = (teamName) => {
    const team = equiposList.find(t => t.name === teamName)
    if (team) {
      setSelectedTeam(team)
      setNombre(team.name)
      setLogo(team.logo_url)
      setFotoEquipo(team.team_photo_url)
      setFormData(prev => ({
        ...prev,
        nombreEquipo: team.name
      }))
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleFotoEquipoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFotoEquipo(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setJugadorActual(j => ({ ...j, avatar: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const setLider = (idx) => {
    setIntegrantes(prev => prev.map((j, i) => ({
      ...j,
      esLider: i === idx,
      esSegundo: j.esSegundo && i !== idx,
    })))
  }

  const setSegundo = (idx) => {
    setIntegrantes(prev => prev.map((j, i) => ({
      ...j,
      esSegundo: i === idx,
      esLider: j.esLider && i !== idx,
    })))
  }

  const agregarJugador = () => {
    if (!jugadorActual.nombre.trim()) {
      setMensaje('El nombre del jugador es obligatorio.')
      return
    }
    if (!jugadorActual.contraseña.trim()) {
      setMensaje('La contraseña es obligatoria para el acceso al sistema.')
      return
    }
    
    setMensaje('') // Limpiar mensaje de error
    const newJ = { 
      ...jugadorActual, 
      id: jugadorActual.id || Date.now(), // Mantener ID existente o crear uno nuevo
      equipo: nombre, // Asignar nombre del equipo
      tipo_jugador: jugadorActual.experiencia // Usar experiencia como tipo de jugador
    }
    if (editIdx !== null) {
      setIntegrantes(prev => prev.map((j, i) => i === editIdx ? newJ : j))
      setEditIdx(null)
    } else {
      setIntegrantes(prev => [...prev, newJ])
    }
    setJugadorActual({ ...defaultJugador })
    setMostrarForm(false)
  }

  const editarJugador = (idx) => {
    setJugadorActual({ ...integrantes[idx] })
    setEditIdx(idx)
    setMostrarForm(true)
  }

  const eliminarJugador = (idx) => {
    setIntegrantes(prev => prev.filter((_, i) => i !== idx))
  }

  const guardarEquipo = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      setMensaje('❌ Error: Usuario no identificado.')
      return
    }

    if (integrantes.length === 0) {
      setMensaje('Por favor completa tu información como jugador.')
      return
    }

    const jugadorData = integrantes[0] // Tomar los datos del jugador actual
    if (!jugadorData.contraseña || !jugadorData.contraseña.trim()) {
      setMensaje('La contraseña es obligatoria.')
      return
    }

    try {
      // Obtener el ID del jugador actual desde la base de datos
      const { data: currentPlayerData, error: getPlayerError } = await getPlayerByNickname(currentUser.nickname)
      
      if (getPlayerError || !currentPlayerData) {
        setMensaje(`❌ Error al obtener datos del jugador: ${getPlayerError?.message || 'Jugador no encontrado'}`)
        return
      }

      // LÓGICA SEGÚN TIPO DE JUGADOR
      if (currentUser.tipo_jugador === 'independiente') {
        // INDEPENDIENTE: Solo actualizar tabla players
        setMensaje('🔄 Actualizando perfil de jugador independiente...')

        const { error: updateError } = await updatePlayer(currentPlayerData.id, {
          nickname: jugadorData.sobrenombre || jugadorData.nombrecompleto,
          contraseña: jugadorData.contraseña,
          tipo_jugador: jugadorData.experiencia,
          equipo: 'Independiente',
          telefonojugador: jugadorData.telefonojugador || '',
          zonadejuego: jugadorData.zonadejuego || '',
          nombrecompleto: jugadorData.nombrecompleto || '',
          assault_skill: jugadorData.habilidadAsalto,
          scout_skill: jugadorData.habilidadExplorador,
          rear_guard_skill: jugadorData.habilidadRetaguardia,
          experience: experiencias.indexOf(jugadorData.experiencia),
          team_id: null // Independiente no tiene team_id
        })

        if (updateError) {
          setMensaje(`❌ Error actualizando perfil: ${updateError.message}`)
          return
        }

        setMensaje('✅ Perfil de jugador independiente actualizado exitosamente!')
        
      } else if (currentUser.tipo_jugador === 'jugador_equipo') {
        // JUGADOR_EQUIPO: Actualizar tabla players (el equipo es solo consulta)
        setMensaje('🔄 Actualizando perfil de jugador de equipo...')

        // Determinar el equipo y team_id
        let equipoNombre = jugadorData.equipo
        let teamIdToSet = currentPlayerData.team_id

        // Si se seleccionó un equipo diferente de la lista
        if (selectedTeam && selectedTeam.name !== currentPlayerData.equipo) {
          equipoNombre = selectedTeam.name
          teamIdToSet = selectedTeam.id
        }

        const { error: updateError } = await updatePlayer(currentPlayerData.id, {
          nickname: jugadorData.sobrenombre || jugadorData.nombrecompleto,
          contraseña: jugadorData.contraseña,
          tipo_jugador: jugadorData.experiencia,
          equipo: equipoNombre,
          telefonojugador: jugadorData.telefonojugador || '',
          zonadejuego: jugadorData.zonadejuego || '',
          nombrecompleto: jugadorData.nombrecompleto || '',
          assault_skill: jugadorData.habilidadAsalto,
          scout_skill: jugadorData.habilidadExplorador,
          rear_guard_skill: jugadorData.habilidadRetaguardia,
          experience: experiencias.indexOf(jugadorData.experiencia),
          team_id: teamIdToSet
        })

        if (updateError) {
          setMensaje(`❌ Error actualizando perfil: ${updateError.message}`)
          return
        }

        setMensaje('✅ Perfil de jugador de equipo actualizado exitosamente!')
        
      } else if (currentUser.tipo_jugador === 'capitan_equipo') {
        // CAPITAN_EQUIPO: REGISTRAR nuevo equipo en tabla teams Y actualizar tabla players
        setMensaje('🔄 Registrando equipo y actualizando capitán...')

        // 1. REGISTRAR nuevo equipo en tabla teams
        const { data: newTeam, error: teamError } = await createTeam({
          name: nombre,
          logo_url: logo,
          team_photo_url: fotoEquipo,
          leader_id: currentPlayerData.id, // ID del jugador que hizo login
          is_public_forum: true
        })

        if (teamError) {
          setMensaje(`❌ Error registrando equipo: ${teamError.message}`)
          return
        }

        // 2. ACTUALIZAR tabla players (datos del capitán) con el nuevo team_id
        const { error: playerError } = await updatePlayer(currentPlayerData.id, {
          nickname: jugadorData.sobrenombre || jugadorData.nombrecompleto,
          contraseña: jugadorData.contraseña,
          tipo_jugador: jugadorData.experiencia,
          equipo: nombre, // Nombre del equipo registrado
          telefonojugador: jugadorData.telefonojugador || '',
          zonadejuego: jugadorData.zonadejuego || '',
          nombrecompleto: jugadorData.nombrecompleto || '',
          assault_skill: jugadorData.habilidadAsalto,
          scout_skill: jugadorData.habilidadExplorador,
          rear_guard_skill: jugadorData.habilidadRetaguardia,
          experience: experiencias.indexOf(jugadorData.experiencia),
          team_id: newTeam.id // ID del equipo registrado
        })

        if (playerError) {
          setMensaje(`❌ Error actualizando perfil del capitán: ${playerError.message}`)
          return
        }

        setMensaje('✅ Equipo registrado y capitán actualizado exitosamente!')
        
      } else {
        setMensaje('❌ Tipo de jugador no reconocido.')
        return
      }

      // Redirigir después de 2 segundos
      setTimeout(() => navigate('/'), 2000)

    } catch (error) {
      console.error('Error inesperado:', error)
      setMensaje(`❌ Error inesperado: ${error.message}`)
    }
  }

  const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ALERTA: Verificar estado de login */}
      {!currentUser && (
        <div className="mb-6 p-4 bg-red-900 text-red-300 border border-red-700 rounded-lg font-bold">
          ⚠️ ERROR: No hay usuario logueado. Debes hacer LOGIN primero.
        </div>
      )}
      
      {currentUser && (
        <div className="mb-6 p-4 bg-blue-900 text-blue-300 border border-blue-700 rounded-lg">
          ✅ Usuario logueado: <strong>{currentUser.nickname}</strong><br/>
          📋 Tipo de jugador: <strong>"{currentUser.tipo_jugador || 'NO DEFINIDO'}"</strong><br/>
          🏷️ Equipo: <strong>{currentUser.equipo || 'NO DEFINIDO'}</strong>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide">
          {currentUser && (currentUser.tipo_jugador === 'independiente' || currentUser.tipo_jugador === 'jugador_equipo') 
            ? '🎯 Actualizar Perfil de Jugador'
            : '🎯 Registro de Reclutamiento'
          }
        </h1>
        <p className="text-tactical-sand mt-2">
          {currentUser && (currentUser.tipo_jugador === 'independiente' || currentUser.tipo_jugador === 'jugador_equipo')
            ? 'Actualiza tu información personal y habilidades de airsoft.'
            : 'Registra tu equipo de airsoft y agrega a tus integrantes.'
          }
        </p>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg font-bold ${
          mensaje.startsWith('✅') ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Info del equipo - Mostrar según tipo de usuario */}
      {currentUser && currentUser.tipo_jugador === 'jugador_equipo' && (
        <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
          <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">
            Información del Equipo (Sólo consulta)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-tactical-sand text-sm mb-2 uppercase">Seleccionar Equipo</label>
              <select
                onChange={(e) => handleTeamSelection(e.target.value)}
                value={formData.nombreEquipo || ''}
                className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              >
                <option value="">Selecciona un equipo</option>
                {equiposList.map((team, index) => (
                  <option key={index} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTeam && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-tactical-sand text-sm mb-2 uppercase">Logo del Equipo</label>
                  {selectedTeam.logo_url ? (
                    <img src={selectedTeam.logo_url} alt="Logo" className="w-20 h-20 object-cover rounded border border-tactical-orange" />
                  ) : (
                    <div className="w-20 h-20 bg-tactical-gray rounded border border-tactical-olive flex items-center justify-center text-tactical-sand text-xs">
                      Sin logo
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-tactical-sand text-sm mb-2 uppercase">Foto del Equipo</label>
                  {selectedTeam.team_photo_url ? (
                    <img src={selectedTeam.team_photo_url} alt="Foto" className="w-32 h-20 object-cover rounded border border-tactical-orange" />
                  ) : (
                    <div className="w-32 h-20 bg-tactical-gray rounded border border-tactical-olive flex items-center justify-center text-tactical-sand text-xs">
                      Sin foto
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info del equipo - Para capitán de equipo (editable) */}
      {currentUser && currentUser.tipo_jugador === 'capitan_equipo' && (
        <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">
          Información del Equipo 
          {currentPlayerTeam && <span className="text-tactical-sand text-sm ml-2">({currentPlayerTeam.name})</span>}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-tactical-sand text-sm mb-2 uppercase tracking-wide">Nombre del Equipo *</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              placeholder="Nombre del equipo"
            />
          </div>
          <div>
            <label className="block text-tactical-sand text-sm mb-2 uppercase tracking-wide">Logo del Equipo</label>
            <label className="cursor-pointer flex items-center gap-3 bg-tactical-gray border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors">
              <svg className="w-5 h-5 text-tactical-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-tactical-sand text-sm">{logo ? 'Logo cargado ✓' : 'Subir Logo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-tactical-sand text-sm mb-2 uppercase tracking-wide">Foto del Equipo</label>
          <label className="cursor-pointer flex items-center gap-3 bg-tactical-gray border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors w-fit">
            <svg className="w-5 h-5 text-tactical-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-tactical-sand text-sm">{fotoEquipo ? 'Foto cargada ✓' : 'Subir Foto de Equipo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFotoEquipoUpload} />
          </label>
        </div>

        {(logo || fotoEquipo) && (
          <div className="flex gap-4 mt-4">
            {logo && (
              <div className="text-center">
                <p className="text-xs text-tactical-sand mb-1">Logo</p>
                <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-full border-2 border-tactical-orange" />
              </div>
            )}
            {fotoEquipo && (
              <div className="text-center">
                <p className="text-xs text-tactical-sand mb-1">Foto del equipo</p>
                <img src={fotoEquipo} alt="Foto" className="w-24 h-16 object-cover rounded border border-tactical-orange" />
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Lista de integrantes */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-tactical-orange font-bold text-lg uppercase">
            {currentUser && (currentUser.tipo_jugador === 'independiente' || currentUser.tipo_jugador === 'jugador_equipo')
              ? 'Mi Perfil'
              : `Integrantes (${integrantes.length})`
            }
          </h2>
          <button
            onClick={() => { setMostrarForm(true); setJugadorActual({ ...defaultJugador }); setEditIdx(null) }}
            className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-4 py-2 rounded text-sm uppercase"
          >
            + Agregar Integrante
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-tactical-gray border border-tactical-olive rounded-lg p-4 mb-4">
            <h3 className="text-tactical-orange font-bold mb-4">
              {editIdx !== null ? 'Editar Integrante' : 'Nuevo Integrante'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Nombre *</label>
                <input
                  type="text"
                  value={jugadorActual.nombre}
                  onChange={e => setJugadorActual(j => ({ ...j, nombre: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Sobrenombre (Nick)</label>
                <input
                  type="text"
                  value={jugadorActual.sobrenombre}
                  onChange={e => setJugadorActual(j => ({ ...j, sobrenombre: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                  placeholder="Sobrenombre o apodo"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Nombre Completo</label>
                <input
                  type="text"
                  value={jugadorActual.nombrecompleto}
                  onChange={e => setJugadorActual(j => ({ ...j, nombrecompleto: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                  placeholder="Nombre completo del jugador"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Teléfono</label>
                <input
                  type="tel"
                  value={jugadorActual.telefonojugador}
                  onChange={e => setJugadorActual(j => ({ ...j, telefonojugador: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Zona de Juego</label>
                <input
                  type="text"
                  value={jugadorActual.zonadejuego}
                  onChange={e => setJugadorActual(j => ({ ...j, zonadejuego: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                  placeholder="Zona preferida de juego"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Contraseña *</label>
                <input
                  type="password"
                  value={jugadorActual.contraseña}
                  onChange={e => setJugadorActual(j => ({ ...j, contraseña: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                  placeholder="Contraseña para acceso"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Experiencia</label>
                <select
                  value={jugadorActual.experiencia}
                  onChange={e => setJugadorActual(j => ({ ...j, experiencia: e.target.value, tipo_jugador: e.target.value }))}
                  className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                >
                  {experiencias.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Avatar</label>
                <label className="cursor-pointer flex items-center gap-2 bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors text-sm">
                  <span className="text-tactical-sand">{jugadorActual.avatar ? 'Avatar cargado ✓' : 'Subir Avatar'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">⚔️ Habilidad Asalto: {jugadorActual.habilidadAsalto}%</label>
                <input type="range" min="0" max="100" value={jugadorActual.habilidadAsalto}
                  onChange={e => setJugadorActual(j => ({ ...j, habilidadAsalto: Number(e.target.value) }))}
                  className="w-full accent-tactical-orange" />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">🔭 Habilidad Explorador: {jugadorActual.habilidadExplorador}%</label>
                <input type="range" min="0" max="100" value={jugadorActual.habilidadExplorador}
                  onChange={e => setJugadorActual(j => ({ ...j, habilidadExplorador: Number(e.target.value) }))}
                  className="w-full accent-tactical-orange" />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">🛡️ Habilidad Retaguardia: {jugadorActual.habilidadRetaguardia}%</label>
                <input type="range" min="0" max="100" value={jugadorActual.habilidadRetaguardia}
                  onChange={e => setJugadorActual(j => ({ ...j, habilidadRetaguardia: Number(e.target.value) }))}
                  className="w-full accent-tactical-orange" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={agregarJugador}
                className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-4 py-2 rounded text-sm"
              >
                {editIdx !== null ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                onClick={() => { setMostrarForm(false); setEditIdx(null); setJugadorActual({ ...defaultJugador }) }}
                className="bg-tactical-gray hover:bg-tactical-olive text-tactical-sand font-bold px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {integrantes.length > 0 && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {integrantes.map((jugador, idx) => (
                <div key={jugador.id || idx}>
                  <FichaJugador jugador={jugador} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setLider(idx)}
                      className={`flex-1 text-xs py-1.5 rounded font-bold transition-colors ${jugador.esLider ? 'bg-tactical-orange text-tactical-black' : 'bg-tactical-gray text-tactical-sand hover:bg-tactical-olive'}`}>
                      👑 Líder
                    </button>
                    <button onClick={() => setSegundo(idx)}
                      className={`flex-1 text-xs py-1.5 rounded font-bold transition-colors ${jugador.esSegundo ? 'bg-tactical-olive text-tactical-sand' : 'bg-tactical-gray text-tactical-sand hover:bg-tactical-olive'}`}>
                      🎖️ 2do Mando
                    </button>
                    <button onClick={() => editarJugador(idx)}
                      className="bg-tactical-gray hover:bg-tactical-olive text-tactical-sand text-xs py-1.5 px-3 rounded font-bold">
                      ✏️
                    </button>
                    <button onClick={() => eliminarJugador(idx)}
                      className="bg-red-900 hover:bg-red-800 text-red-300 text-xs py-1.5 px-3 rounded font-bold">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={guardarEquipo}
        className="w-full bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold py-4 rounded-lg uppercase tracking-wide text-lg transition-colors"
      >
        {/* LÓGICA RECREADA PARA EL BOTÓN */}
        ✅ {(() => {
          console.log('🔄 Evaluando botón - currentUser:', currentUser)
          
          if (!currentUser) {
            return 'REGISTRAR (NO LOGUEADO)'
          }
          
          const tipoJugador = currentUser.tipo_jugador
          console.log('🎯 Tipo de jugador detectado:', tipoJugador)
          
          if (tipoJugador === 'independiente') {
            return 'ACTUALIZAR INDEPENDIENTE'
          } else if (tipoJugador === 'jugador_equipo') {
            return 'ACTUALIZAR JUGADOR'
          } else if (tipoJugador === 'capitan_equipo') {
            return 'ACTUALIZAR CAPITÁN'
          } else {
            return `ACTUALIZAR (${tipoJugador || 'SIN TIPO'})`
          }
        })()}
      </button>
    </div>
  )
}
