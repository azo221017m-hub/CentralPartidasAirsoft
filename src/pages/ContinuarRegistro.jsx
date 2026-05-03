import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTeamWithPlayers, createPlayer, getTeamsComplete, getPlayerByNickname } from '../services/supabaseService'

// Función para obtener datos del usuario logueado del localStorage o contexto
const getCurrentUser = () => {
  // Esto debería obtenerse del contexto de autenticación o localStorage
  // Por ahora, simulamos que viene del localStorage o props
  const userData = localStorage.getItem('currentUser')
  if (userData) {
    return JSON.parse(userData)
  }
  
  // Valor por defecto para testing (remover en producción)
  return {
    nickname: 'TestUser',
    tipo_jugador: 'independiente' // Cambiar por 'jugador_equipo' o 'capitan_equipo' para probar
  }
}

const defaultJugador = {
  nombre: '',
  sobrenombre: '',
  contraseña: '',
  tipo_jugador: 'Novato',
  equipo: '',
  habilidadAsalto: 50,
  habilidadExplorador: 50,
  habilidadRetaguardia: 50,
  experiencia: 'Novato',
  esLider: false,
  esSegundo: false,
  visible: true,
  telefonojugador: '',
  nombrecompleto: '',
  zonadejuego: ''
}

const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']

export default function ContinuarRegistro() {
  const navigate = useNavigate()
  const [currentUser] = useState(() => getCurrentUser()) // Inicializar con el usuario actual
  const [equiposList, setEquiposList] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [jugadorActual, setJugadorActual] = useState({ ...defaultJugador })
  const [mensaje, setMensaje] = useState('')
  
  // Estados para registro de equipo (solo para capitán)
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [logoEquipo, setLogoEquipo] = useState(null)
  const [fotoEquipo, setFotoEquipo] = useState(null)

  useEffect(() => {
    // Cargar lista de equipos si es necesario
    if (currentUser && currentUser.tipo_jugador === 'jugador_equipo') {
      const fetchTeams = async () => {
        const { data, error } = await getTeamsComplete()
        if (data && !error) {
          setEquiposList(data)
        }
      }
      fetchTeams()
    }
  }, [currentUser])

  // Efecto para cargar datos existentes del jugador
  useEffect(() => {
    const loadPlayerData = async () => {
      if (currentUser && currentUser.nickname) {
        const { data: playerData, error } = await getPlayerByNickname(currentUser.nickname)
        
        if (playerData && !error) {
          // Pre-poblar el formulario con los datos existentes
          setJugadorActual(prevState => ({
            ...prevState,
            nombre: playerData.nombre || '',
            sobrenombre: playerData.nickname || '',
            contraseña: '', // No pre-poblar la contraseña por seguridad
            tipo_jugador: playerData.tipo_jugador || 'Novato',
            equipo: playerData.equipo || '',
            habilidadAsalto: playerData.assault_skill || 50,
            habilidadExplorador: playerData.scout_skill || 50,
            habilidadRetaguardia: playerData.rear_guard_skill || 50,
            experiencia: playerData.tipo_jugador || 'Novato',
            esLider: playerData.es_lider || false,
            esSegundo: playerData.es_segundo || false,
            visible: playerData.visible !== false,
            telefonojugador: playerData.telefonojugador || '',
            nombrecompleto: playerData.nombrecompleto || '',
            zonadejuego: playerData.zonadejuego || ''
          }))
        }
      }
    }

    loadPlayerData()
  }, [currentUser])

  const handleTeamSelection = (teamName) => {
    const team = equiposList.find(t => t.name === teamName)
    setSelectedTeam(team)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoEquipo(ev.target.result)
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

  const handleRegistrar = async () => {
    if (!jugadorActual.nombrecompleto.trim() || !jugadorActual.contraseña.trim()) {
      setMensaje('Por favor completa todos los campos obligatorios.')
      return
    }

    setMensaje('🔄 Registrando...')

    try {
      if (currentUser.tipo_jugador === 'independiente') {
        // Registro como jugador independiente
        const { error } = await createPlayer({
          nickname: jugadorActual.sobrenombre || jugadorActual.nombrecompleto,
          contraseña: jugadorActual.contraseña,
          tipo_jugador: jugadorActual.experiencia,
          equipo: 'Independiente',
          assault_skill: jugadorActual.habilidadAsalto,
          scout_skill: jugadorActual.habilidadExplorador,
          rear_guard_skill: jugadorActual.habilidadRetaguardia,
          experience: experiencias.indexOf(jugadorActual.experiencia),
          telefonojugador: jugadorActual.telefonojugador,
          nombrecompleto: jugadorActual.nombrecompleto,
          zonadejuego: jugadorActual.zonadejuego
        })
        
        if (error) {
          setMensaje(`❌ Error: ${error.message}`)
          return
        }
        
      } else if (currentUser.tipo_jugador === 'jugador_equipo') {
        // Registro en equipo existente
        if (!selectedTeam) {
          setMensaje('Por favor selecciona un equipo.')
          return
        }
        
        const { error } = await createPlayer({
          nickname: jugadorActual.sobrenombre || jugadorActual.nombrecompleto,
          contraseña: jugadorActual.contraseña,
          tipo_jugador: jugadorActual.experiencia,
          equipo: selectedTeam.name,
          assault_skill: jugadorActual.habilidadAsalto,
          scout_skill: jugadorActual.habilidadExplorador,
          rear_guard_skill: jugadorActual.habilidadRetaguardia,
          experience: experiencias.indexOf(jugadorActual.experiencia),
          team_id: selectedTeam.id,
          telefonojugador: jugadorActual.telefonojugador,
          nombrecompleto: jugadorActual.nombrecompleto,
          zonadejuego: jugadorActual.zonadejuego
        })
        
        if (error) {
          setMensaje(`❌ Error: ${error.message}`)
          return
        }
        
      } else if (currentUser.tipo_jugador === 'capitan_equipo') {
        // Registro como capitán de nuevo equipo
        if (!nombreEquipo.trim()) {
          setMensaje('Por favor ingresa el nombre del equipo.')
          return
        }
        
        const { error } = await createTeamWithPlayers({
          teamData: {
            name: nombreEquipo,
            logo_url: logoEquipo,
            team_photo_url: fotoEquipo,
            is_public_forum: true
          },
          playersData: [{
            ...jugadorActual,
            esLider: true
          }]
        })
        
        if (error) {
          setMensaje(`❌ Error: ${error.message}`)
          return
        }
      }
      
      setMensaje('✅ Registro completado exitosamente!')
      setTimeout(() => navigate('/'), 2000)
      
    } catch (error) {
      console.error('Error en registro:', error)
      setMensaje(`❌ Error inesperado: ${error.message}`)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cpa-dark flex items-center justify-center">
        <div className="text-cpa-sand">Cargando...</div>
      </div>
    )
  }

  const getTitleAndSubtitle = () => {
    switch (currentUser.tipo_jugador) {
      case 'independiente':
        return {
          title: 'REGISTRO DE JUGADOR',
          subtitle: 'Regístrate como jugador independiente de Airsoft'
        }
      case 'jugador_equipo':
        return {
          title: 'REGISTRO DE JUGADOR',
          subtitle: 'Busca tu equipo y Regístrate en CPA'
        }
      case 'capitan_equipo':
        return {
          title: 'REGISTRO DE EQUIPO',
          subtitle: 'Regístrate como capitán y registra tu equipo de Airsoft'
        }
      default:
        return {
          title: 'CONTINUAR REGISTRO',
          subtitle: 'Completa tu registro en CPA'
        }
    }
  }

  const { title, subtitle } = getTitleAndSubtitle()

  return (
    <div className="min-h-screen bg-cpa-dark py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cpa-primary mb-2 font-tactical uppercase">
            {title}
          </h1>
          <p className="text-cpa-sand text-lg">
            {subtitle}
          </p>
        </div>

        {/* Información del Equipo - Solo para jugador_equipo y capitan_equipo */}
        {(currentUser.tipo_jugador === 'jugador_equipo' || currentUser.tipo_jugador === 'capitan_equipo') && (
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
            <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">
              INFORMACIÓN DEL EQUIPO {currentUser.tipo_jugador === 'jugador_equipo' ? '(Sólo consulta)' : ''}
            </h2>
            
            {currentUser.tipo_jugador === 'jugador_equipo' ? (
              // Para jugador que busca equipo existente
              <div className="space-y-4">
                <div>
                  <label className="block text-tactical-sand text-sm mb-2 uppercase">Seleccionar Equipo</label>
                  <select
                    onChange={(e) => handleTeamSelection(e.target.value)}
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
            ) : (
              // Para capitán que crea nuevo equipo
              <div className="space-y-4">
                <div>
                  <label className="block text-tactical-sand text-sm mb-2 uppercase">Nombre del Equipo *</label>
                  <input
                    type="text"
                    value={nombreEquipo}
                    onChange={(e) => setNombreEquipo(e.target.value)}
                    className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
                    placeholder="Nombre de tu equipo"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-tactical-sand text-sm mb-2 uppercase">Logo del Equipo</label>
                    <label className="cursor-pointer flex items-center gap-3 bg-tactical-gray border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors w-fit">
                      <svg className="w-5 h-5 text-tactical-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-tactical-sand text-sm">{logoEquipo ? 'Logo cargado ✓' : 'Subir Logo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    {logoEquipo && (
                      <img src={logoEquipo} alt="Logo" className="w-16 h-16 object-cover rounded-full border-2 border-tactical-orange mt-2" />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-tactical-sand text-sm mb-2 uppercase">Foto del Equipo</label>
                    <label className="cursor-pointer flex items-center gap-3 bg-tactical-gray border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors w-fit">
                      <svg className="w-5 h-5 text-tactical-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-tactical-sand text-sm">{fotoEquipo ? 'Foto cargada ✓' : 'Subir Foto de Equipo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoEquipoUpload} />
                    </label>
                    {fotoEquipo && (
                      <img src={fotoEquipo} alt="Foto" className="w-24 h-16 object-cover rounded border border-tactical-orange mt-2" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formulario de Integrante */}
        <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
          <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">
            INTEGRANTE
          </h2>
          <h3 className="text-tactical-sand font-bold mb-4">Nuevo Integrante</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-tactical-sand text-xs mb-1 uppercase">Nombre Completo *</label>
              <input
                type="text"
                value={jugadorActual.nombrecompleto}
                onChange={e => setJugadorActual(j => ({ ...j, nombrecompleto: e.target.value }))}
                className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                placeholder="Nombre completo del jugador"
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

          <div className="space-y-3">
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
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`p-3 rounded-lg font-bold text-sm mb-4 ${
            mensaje.includes('✅') 
              ? 'bg-green-900 text-green-300 border border-green-700' 
              : mensaje.includes('❌')
              ? 'bg-red-900 text-red-300 border border-red-700'
              : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
          }`}>
            {mensaje}
          </div>
        )}

        {/* Botón de registro */}
        <div className="text-center">
          <button
            onClick={handleRegistrar}
            className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-8 py-3 rounded-lg text-lg uppercase transition-colors"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  )
}