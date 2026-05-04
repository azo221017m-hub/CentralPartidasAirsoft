import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePlayer, getPlayerByNickname, getTeamsComplete, createTeam } from '../services/supabaseService'

// ─── Utilidad: leer usuario del localStorage ───────────────────────────────
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('currentUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Subcomponente: campo de avatar ────────────────────────────────────────
function AvatarField({ value, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Avatar</label>
      <label className="cursor-pointer flex items-center gap-2 bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors text-sm w-fit">
        {value
          ? <img src={value} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-tactical-orange" />
          : <span className="text-tactical-sand">📷 Subir Avatar</span>
        }
        {value && <span className="text-green-400 text-xs">✓ Cargado</span>}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  )
}

// ─── Subcomponente: formulario de jugador (compartido por los 3 tipos) ──────
function FormularioJugador({ datos, onChange }) {
  const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Nombre Completo</label>
          <input
            type="text"
            value={datos.nombrecompleto}
            onChange={e => onChange('nombrecompleto', e.target.value)}
            className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Sobrenombre (Nick)</label>
          <input
            type="text"
            value={datos.nickname}
            onChange={e => onChange('nickname', e.target.value)}
            className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
            placeholder="Nickname en el juego"
          />
        </div>
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Contraseña</label>
          <input
            type="password"
            value={datos.contraseña}
            onChange={e => onChange('contraseña', e.target.value)}
            className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
            placeholder="Contraseña de acceso"
          />
        </div>
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Experiencia</label>
          <select
            value={datos.experiencia}
            onChange={e => onChange('experiencia', e.target.value)}
            className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
          >
            {experiencias.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
        </div>
      </div>

      <AvatarField value={datos.avatar_url} onChange={v => onChange('avatar_url', v)} />

      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">
            ⚔️ Habilidad Asalto: <span className="text-tactical-orange font-bold">{datos.assault_skill}%</span>
          </label>
          <input type="range" min="0" max="100" value={datos.assault_skill}
            onChange={e => onChange('assault_skill', Number(e.target.value))}
            className="w-full accent-tactical-orange" />
        </div>
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">
            🔭 Habilidad Explorador: <span className="text-tactical-orange font-bold">{datos.scout_skill}%</span>
          </label>
          <input type="range" min="0" max="100" value={datos.scout_skill}
            onChange={e => onChange('scout_skill', Number(e.target.value))}
            className="w-full accent-tactical-orange" />
        </div>
        <div>
          <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">
            🛡️ Habilidad Retaguardia: <span className="text-tactical-orange font-bold">{datos.rear_guard_skill}%</span>
          </label>
          <input type="range" min="0" max="100" value={datos.rear_guard_skill}
            onChange={e => onChange('rear_guard_skill', Number(e.target.value))}
            className="w-full accent-tactical-orange" />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function RegistroEquipo() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [guardando, setGuardando] = useState(false)

  // Datos del jugador (compartidos por los 3 formularios)
  const [jugador, setJugador] = useState({
    id: '',
    nombrecompleto: '',
    nickname: '',
    contraseña: '',
    experiencia: 'Novato',
    avatar_url: '',
    assault_skill: 0,
    scout_skill: 0,
    rear_guard_skill: 0,
  })

  // Datos extra para jugador_equipo
  const [equipoSeleccionado, setEquipoSeleccionado] = useState({ id: '', name: '' })
  const [listaEquipos, setListaEquipos] = useState([])

  // Datos extra para capitan_equipo
  const [equipo, setEquipo] = useState({ nombre: '', logo: null, foto: null })

  const setMsg = (texto, tipo = 'info') => setMensaje({ texto, tipo })

  // Cambiar campo del jugador
  const cambiarJugador = (campo, valor) => {
    setJugador(prev => ({ ...prev, [campo]: valor }))
  }

  // ── Cargar datos al montar ──────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      const user = getCurrentUser()
      if (!user) {
        setLoading(false)
        return
      }
      setCurrentUser(user)

      // Cargar datos actuales del jugador desde la BD
      const { data, error } = await getPlayerByNickname(user.nickname)
      if (!error && data) {
        const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']
        setJugador({
          id: data.id,
          nombrecompleto: data.nombrecompleto || '',
          nickname: data.nickname || '',
          contraseña: data.contraseña || '',
          experiencia: experiencias[data.experience] || 'Novato',
          avatar_url: data.avatar_url || '',
          assault_skill: data.assault_skill || 0,
          scout_skill: data.scout_skill || 0,
          rear_guard_skill: data.rear_guard_skill || 0,
        })
      }

      // Si es jugador_equipo, cargar lista de equipos
      if (user.tipo_jugador === 'jugador_equipo') {
        const { data: teams } = await getTeamsComplete()
        setListaEquipos(teams || [])
        if (data?.team_id && teams) {
          const team = teams.find(t => t.id === data.team_id)
          if (team) setEquipoSeleccionado({ id: team.id, name: team.name })
        }
      }

      setLoading(false)
    }
    cargar()
  }, [])

  // ── Upload de imágenes para capitán ────────────────────────────────────
  const handleEquipoImagen = (campo, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setEquipo(prev => ({ ...prev, [campo]: ev.target.result }))
    reader.readAsDataURL(file)
  }

  // ── GUARDAR: Independiente ──────────────────────────────────────────────
  const guardarIndependiente = async () => {
    if (!jugador.nombrecompleto.trim()) return setMsg('El nombre completo es obligatorio.', 'error')
    if (!jugador.nickname.trim()) return setMsg('El sobrenombre es obligatorio.', 'error')
    if (!jugador.contraseña.trim()) return setMsg('La contraseña es obligatoria.', 'error')

    setGuardando(true)
    setMsg('🔄 Actualizando perfil...', 'info')

    const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']
    const { error } = await updatePlayer(jugador.id, {
      nombrecompleto: jugador.nombrecompleto,
      nickname: jugador.nickname,
      contraseña: jugador.contraseña,
      experience: experiencias.indexOf(jugador.experiencia),
      avatar_url: jugador.avatar_url || null,
      assault_skill: jugador.assault_skill,
      scout_skill: jugador.scout_skill,
      rear_guard_skill: jugador.rear_guard_skill,
    })

    setGuardando(false)
    if (error) return setMsg(`❌ Error: ${error.message}`, 'error')

    setMsg('✅ Perfil actualizado correctamente.', 'ok')
    setTimeout(() => navigate('/'), 2000)
  }

  // ── GUARDAR: Jugador de equipo ──────────────────────────────────────────
  const guardarJugadorEquipo = async () => {
    if (!jugador.nombrecompleto.trim()) return setMsg('El nombre completo es obligatorio.', 'error')
    if (!jugador.nickname.trim()) return setMsg('El sobrenombre es obligatorio.', 'error')
    if (!jugador.contraseña.trim()) return setMsg('La contraseña es obligatoria.', 'error')
    if (!equipoSeleccionado.id) return setMsg('Debes seleccionar un equipo.', 'error')

    setGuardando(true)
    setMsg('🔄 Actualizando perfil...', 'info')

    const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']
    const { error } = await updatePlayer(jugador.id, {
      team_id: equipoSeleccionado.id,
      equipo: equipoSeleccionado.name,
      nombrecompleto: jugador.nombrecompleto,
      nickname: jugador.nickname,
      contraseña: jugador.contraseña,
      experience: experiencias.indexOf(jugador.experiencia),
      avatar_url: jugador.avatar_url || null,
      assault_skill: jugador.assault_skill,
      scout_skill: jugador.scout_skill,
      rear_guard_skill: jugador.rear_guard_skill,
    })

    setGuardando(false)
    if (error) return setMsg(`❌ Error: ${error.message}`, 'error')

    setMsg('✅ Perfil actualizado correctamente.', 'ok')
    setTimeout(() => navigate('/'), 2000)
  }

  // ── GUARDAR: Capitán ────────────────────────────────────────────────────
  const guardarCapitan = async () => {
    if (!equipo.nombre.trim()) return setMsg('El nombre del equipo es obligatorio.', 'error')
    if (!jugador.nombrecompleto.trim()) return setMsg('El nombre completo es obligatorio.', 'error')
    if (!jugador.nickname.trim()) return setMsg('El sobrenombre es obligatorio.', 'error')
    if (!jugador.contraseña.trim()) return setMsg('La contraseña es obligatoria.', 'error')

    setGuardando(true)
    setMsg('🔄 Registrando equipo...', 'info')

    // 1. INSERT en teams
    const { data: newTeam, error: teamError } = await createTeam({
      name: equipo.nombre,
      logo_url: equipo.logo || null,
      team_photo_url: equipo.foto || null,
      leader_id: jugador.id,
    })

    if (teamError) {
      setGuardando(false)
      return setMsg(`❌ Error creando equipo: ${teamError.message}`, 'error')
    }

    setMsg('🔄 Actualizando perfil del capitán...', 'info')

    // 2. UPDATE en players con el nuevo team_id
    const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']
    const { error: playerError } = await updatePlayer(jugador.id, {
      team_id: newTeam.id,
      equipo: equipo.nombre,
      nombrecompleto: jugador.nombrecompleto,
      nickname: jugador.nickname,
      contraseña: jugador.contraseña,
      experience: experiencias.indexOf(jugador.experiencia),
      avatar_url: jugador.avatar_url || null,
      assault_skill: jugador.assault_skill,
      scout_skill: jugador.scout_skill,
      rear_guard_skill: jugador.rear_guard_skill,
    })

    setGuardando(false)
    if (playerError) return setMsg(`❌ Error actualizando perfil: ${playerError.message}`, 'error')

    setMsg('✅ Equipo registrado y perfil actualizado correctamente.', 'ok')
    setTimeout(() => navigate('/'), 2000)
  }

  // ── RENDER ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-tactical-orange text-xl animate-pulse">Cargando datos...</div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-8">
          <p className="text-red-300 text-xl font-bold mb-2">⚠️ Acceso Denegado</p>
          <p className="text-red-400">Debes iniciar sesión para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  const tipo = currentUser.tipo_jugador

  // Mensaje de estado
  const msgClasses = {
    ok: 'bg-green-900 text-green-300 border-green-700',
    error: 'bg-red-900 text-red-300 border-red-700',
    info: 'bg-blue-900 text-blue-300 border-blue-700',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Mensaje de estado */}
      {mensaje.texto && (
        <div className={`mb-6 p-4 rounded-lg font-bold border ${msgClasses[mensaje.tipo] || msgClasses.info}`}>
          {mensaje.texto}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FORMULARIO: INDEPENDIENTE
      ══════════════════════════════════════════════════════════════ */}
      {tipo === 'independiente' && (
        <div>
          <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide mb-1">
            🎯 Registro de Jugador
          </h1>
          <p className="text-tactical-sand mb-8">Regístrate como jugador independiente de Airsoft</p>

          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6">
            <h2 className="text-tactical-orange font-bold text-lg uppercase mb-1">Integrante</h2>
            <p className="text-tactical-sand text-sm mb-4">Nuevo Integrante</p>
            <FormularioJugador datos={jugador} onChange={cambiarJugador} />
          </div>

          <button
            onClick={guardarIndependiente}
            disabled={guardando}
            className="mt-6 w-full bg-tactical-orange hover:bg-tactical-lightorange disabled:opacity-50 text-tactical-black font-bold py-4 rounded-lg uppercase tracking-wide text-lg transition-colors"
          >
            {guardando ? '🔄 Guardando...' : '💾 Actualizar Jugador'}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FORMULARIO: JUGADOR DE EQUIPO
      ══════════════════════════════════════════════════════════════ */}
      {tipo === 'jugador_equipo' && (
        <div>
          <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide mb-1">
            🎯 Registro de Jugador
          </h1>
          <p className="text-tactical-sand mb-8">Busca tu equipo y Regístrate en CPA</p>

          {/* Información del Equipo */}
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
            <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">Información del Equipo</h2>
            <div>
              <label className="block text-tactical-sand text-xs mb-2 uppercase tracking-wide">Nombre del Equipo</label>
              <select
                value={equipoSeleccionado.name}
                onChange={e => {
                  const team = listaEquipos.find(t => t.name === e.target.value)
                  setEquipoSeleccionado(team ? { id: team.id, name: team.name } : { id: '', name: '' })
                }}
                className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              >
                <option value="">— Selecciona un equipo —</option>
                {listaEquipos.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos del jugador */}
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6">
            <h2 className="text-tactical-orange font-bold text-lg uppercase mb-1">Integrante</h2>
            <p className="text-tactical-sand text-sm mb-4">Nuevo Integrante</p>
            <FormularioJugador datos={jugador} onChange={cambiarJugador} />
          </div>

          <button
            onClick={guardarJugadorEquipo}
            disabled={guardando}
            className="mt-6 w-full bg-tactical-orange hover:bg-tactical-lightorange disabled:opacity-50 text-tactical-black font-bold py-4 rounded-lg uppercase tracking-wide text-lg transition-colors"
          >
            {guardando ? '🔄 Guardando...' : '💾 Actualizar Jugador'}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FORMULARIO: CAPITÁN DE EQUIPO
      ══════════════════════════════════════════════════════════════ */}
      {tipo === 'capitan_equipo' && (
        <div>
          <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide mb-1">
            🏆 Registro de Equipo
          </h1>
          <p className="text-tactical-sand mb-8">Regístrate como capitán y registra tu equipo de Airsoft</p>

          {/* Información del Equipo */}
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
            <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">Información del Equipo</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Nombre del Equipo *</label>
                <input
                  type="text"
                  value={equipo.nombre}
                  onChange={e => setEquipo(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
                  placeholder="Nombre del equipo"
                />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Logo del Equipo</label>
                <label className="cursor-pointer flex items-center gap-2 bg-tactical-gray border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors text-sm">
                  {equipo.logo
                    ? <img src={equipo.logo} alt="logo" className="w-8 h-8 rounded-full object-cover border border-tactical-orange" />
                    : <span className="text-tactical-sand">🖼️ Subir Logo</span>
                  }
                  {equipo.logo && <span className="text-green-400 text-xs">✓ Cargado</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleEquipoImagen('logo', e)} />
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Foto del Equipo</label>
                <label className="cursor-pointer flex items-center gap-2 bg-tactical-gray border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors text-sm w-fit">
                  {equipo.foto
                    ? <img src={equipo.foto} alt="foto" className="w-16 h-10 rounded object-cover border border-tactical-orange" />
                    : <span className="text-tactical-sand">📷 Subir Foto del Equipo</span>
                  }
                  {equipo.foto && <span className="text-green-400 text-xs">✓ Cargado</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleEquipoImagen('foto', e)} />
                </label>
              </div>
            </div>
          </div>

          {/* Datos del capitán */}
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6">
            <h2 className="text-tactical-orange font-bold text-lg uppercase mb-1">Integrante</h2>
            <p className="text-tactical-sand text-sm mb-4">Nuevo Integrante</p>
            <FormularioJugador datos={jugador} onChange={cambiarJugador} />
          </div>

          <button
            onClick={guardarCapitan}
            disabled={guardando}
            className="mt-6 w-full bg-tactical-orange hover:bg-tactical-lightorange disabled:opacity-50 text-tactical-black font-bold py-4 rounded-lg uppercase tracking-wide text-lg transition-colors"
          >
            {guardando ? '🔄 Guardando...' : '🏆 Actualizar Equipo'}
          </button>
        </div>
      )}

      {/* Si el tipo no coincide con ninguno conocido */}
      {tipo !== 'independiente' && tipo !== 'jugador_equipo' && tipo !== 'capitan_equipo' && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6 text-center">
          <p className="text-yellow-300 font-bold">⚠️ Tipo de jugador no reconocido: <code>{tipo}</code></p>
          <p className="text-yellow-400 text-sm mt-2">Contacta al administrador para corregir tu perfil.</p>
        </div>
      )}

    </div>
  )
}

