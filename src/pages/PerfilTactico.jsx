import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayerByNickname, getTeamById } from '../services/supabaseService'

const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null') } catch { return null }
}

const EXP_LABELS = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']
const TIPO_LABELS = {
  independiente: 'Independiente',
  jugador_equipo: 'Jugador de Equipo',
  capitan_equipo: 'Capitan de Equipo',
}

export default function PerfilTactico() {
  const navigate = useNavigate()
  const [jugador, setJugador] = useState(null)
  const [equipo, setEquipo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const user = getCurrentUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await getPlayerByNickname(user.nickname)
      if (error || !data) { setLoading(false); return }
      setJugador(data)

      if (data.team_id && (data.tipo_jugador === 'jugador_equipo' || data.tipo_jugador === 'capitan_equipo')) {
        const { data: teamData } = await getTeamById(data.team_id)
        if (teamData) setEquipo(teamData)
      }
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-tactical-orange text-xl animate-pulse">Cargando perfil...</div>
      </div>
    )
  }

  if (!jugador) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-8">
          <p className="text-red-300 text-xl font-bold">Acceso Denegado</p>
          <p className="text-red-400 mt-2">Debes iniciar sesion para ver tu perfil.</p>
        </div>
      </div>
    )
  }

  const expLabel = EXP_LABELS[jugador.experience] || 'Novato'
  const tipoLabel = TIPO_LABELS[jugador.tipo_jugador] || jugador.tipo_jugador || '-'
  const esEquipo = jugador.tipo_jugador === 'jugador_equipo' || jugador.tipo_jugador === 'capitan_equipo'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: '#FFA500' }}>
          Perfil Tactico
        </h1>
        <p className="text-tactical-sand text-sm mt-1">Ficha operativa del combatiente</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Columna izquierda: Avatar + datos básicos */}
        <div className="lg:col-span-1 space-y-4">

          {/* Avatar */}
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-xl p-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 overflow-hidden mb-4 flex items-center justify-center bg-tactical-gray"
              style={{ borderColor: '#FFA500' }}>
              {jugador.avatar_url ? (
                <img src={jugador.avatar_url} alt={jugador.nickname} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none">
                  <circle cx="32" cy="24" r="12" fill="#4a5c2a" />
                  <ellipse cx="32" cy="52" rx="18" ry="12" fill="#4a5c2a" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-center" style={{ color: '#FFA500' }}>
              {jugador.nickname}
            </h2>
            {jugador.nombrecompleto && (
              <p className="text-tactical-sand text-sm mt-1 text-center">{jugador.nombrecompleto}</p>
            )}
            <div className="mt-3 flex flex-col gap-1 items-center">
              <span className="text-xs px-3 py-1 rounded-full font-bold uppercase"
                style={{ backgroundColor: '#FFA500', color: '#111' }}>
                {tipoLabel}
              </span>
              <span className="text-xs text-tactical-sand mt-1">
                Experiencia: <span className="font-bold" style={{ color: '#FFA500' }}>{expLabel}</span>
              </span>
            </div>
          </div>

          {/* Botón editar perfil */}
          <button
            onClick={() => navigate('/registro-equipo')}
            className="w-full py-3 rounded-lg font-bold uppercase tracking-wide text-sm border-2 transition-colors"
            style={{ borderColor: '#FFA500', color: '#FFA500' }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#FFA500'; e.currentTarget.style.color = '#111' }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFA500' }}
          >
            Editar Perfil
          </button>
        </div>

        {/* Columna derecha: Habilidades + Equipo */}
        <div className="lg:col-span-2 space-y-6">

          {/* Habilidades */}
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-xl p-6">
            <h3 className="text-sm uppercase tracking-widest mb-5" style={{ color: '#FFA500' }}>
              Habilidades de Combate
            </h3>

            {/* Solo gráficos circulares */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Asalto', value: jugador.assault_skill || 0 },
                { label: 'Explorador', value: jugador.scout_skill || 0 },
                { label: 'Retaguardia', value: jugador.rear_guard_skill || 0 },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2d3a1a" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FFA500" strokeWidth="3"
                        strokeDasharray={`${s.value} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                      style={{ color: '#FFA500' }}>{s.value}%</span>
                  </div>
                  <span className="text-tactical-sand text-xs mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipo (solo si aplica) */}
          {esEquipo && equipo && (
            <div className="bg-tactical-darkgreen border border-tactical-olive rounded-xl p-6">
              <h3 className="text-sm uppercase tracking-widest mb-4" style={{ color: '#FFA500' }}>
                Equipo Tactico
                {jugador.tipo_jugador === 'capitan_equipo' && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: '#FFA500', color: '#111' }}>CAPITAN</span>
                )}
              </h3>
              <div className="flex items-center gap-4 mb-4">
                {equipo.logo_url ? (
                  <img src={equipo.logo_url} alt={equipo.name}
                    className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: '#FFA500' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-tactical-gray border-2 flex items-center justify-center"
                    style={{ borderColor: '#FFA500' }}>
                    <span className="text-2xl font-bold" style={{ color: '#FFA500' }}>
                      {equipo.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold" style={{ color: '#FFA500' }}>{equipo.name}</p>
                </div>
              </div>
              {equipo.team_photo_url && (
                <div className="rounded-lg overflow-hidden border border-tactical-olive">
                  <img src={equipo.team_photo_url} alt="Foto del equipo"
                    className="w-full h-40 object-cover" />
                  <p className="text-center text-xs text-tactical-sand py-2">Foto del Equipo</p>
                </div>
              )}
            </div>
          )}

          {/* Sin equipo asignado */}
          {esEquipo && !equipo && (
            <div className="bg-tactical-darkgreen border border-tactical-olive rounded-xl p-6 text-center">
              <p className="text-tactical-sand text-sm">Sin equipo asignado aun.</p>
              <button onClick={() => navigate('/registro-equipo')}
                className="mt-3 text-sm font-bold uppercase underline" style={{ color: '#FFA500' }}>
                Completar registro
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
