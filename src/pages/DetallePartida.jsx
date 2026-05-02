import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGameById, getTeams, updateGame, getRegistrationsByGame, getParticipantsByRegistration } from '../services/supabaseService'

const estadoColor = {
  'Completado': 'bg-green-900 text-green-300',
  'En Progreso': 'bg-yellow-900 text-yellow-300',
  'Fallido': 'bg-red-900 text-red-300',
  'Cancelado': 'bg-red-950 text-red-400',
  'Pendiente': 'bg-tactical-gray text-tactical-sand',
}

export default function DetallePartida() {
  const { partidaId } = useParams()
  const [partida, setPartida] = useState(null)
  const [equipos, setEquipos] = useState([])
  const [equiposParticipantes, setEquiposParticipantes] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: gameData } = await getGameById(partidaId)
      const { data: teamsData } = await getTeams()
      if (!mounted) return
      setPartida(gameData || null)
      setEquipos(teamsData || [])
    }
    load()
    return () => { mounted = false }
  }, [partidaId])

  useEffect(() => {
    let mounted = true
    async function loadRegs() {
      const { data: regs } = await getRegistrationsByGame(partidaId)
      if (!mounted) return
      if (!regs) return setEquiposParticipantes([])
      // Para cada registro, obtener participantes
      const detailed = []
      for (const r of regs) {
        const { data: parts } = await getParticipantsByRegistration(r.id)
        detailed.push({ ...r, participantes: parts || [] })
      }
      setEquiposParticipantes(detailed)
    }
    loadRegs()
    return () => { mounted = false }
  }, [partidaId])

  const actualizarEstado = async (field, value) => {
    // Actualiza la partida en Supabase
    const { data, error } = await updateGame(partidaId, { [field]: value })
    if (error) {
      console.error('Error actualizando partida', error)
      return
    }
    setPartida(data || null)
  }

  if (!partida) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-tactical-sand text-xl mb-4">Partida no encontrada.</p>
        <Link to="/" className="bg-tactical-orange text-tactical-black font-bold px-4 py-2 rounded">
          Ir al Inicio
        </Link>
      </div>
    )
  }

  const equipoOrg = equipos.find(e => e.id === partida.equipoOrganizador)
  const misiones = [1, 2, 3, 4, 5].filter(n => partida[`mision${n}`])
  const estadosOpciones = ['Pendiente', 'En Progreso', 'Completado', 'Fallido', 'Cancelado']

  

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-tactical-darkgreen border-2 border-tactical-orange rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-tactical-orange uppercase mb-2">{partida.titulo}</h1>
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="text-tactical-sand text-sm">📅 {partida.fecha}</span>
              {equipoOrg && <span className="text-tactical-sand text-sm">🎯 {equipoOrg.nombre}</span>}
              {partida.puntuacion && <span className="text-tactical-orange font-bold text-sm">🏆 {partida.puntuacion}</span>}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              partida.estado === 'activa' ? 'bg-green-800 text-green-300' :
              partida.estado === 'completada' ? 'bg-blue-900 text-blue-300' :
              'bg-tactical-gray text-tactical-sand'
            }`}>
              {partida.estado?.toUpperCase() || 'ACTIVA'}
            </span>
          </div>
          <div className="flex gap-2">
            <Link to="/registro-partida"
              className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-4 py-2 rounded text-sm uppercase">
              Registrar Equipo
            </Link>
          </div>
        </div>
      </div>

      {/* Dinámica */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-3">🗺️ Dinámica</h2>
        <p className="text-tactical-sand">{partida.dinamica}</p>
      </div>

      {/* Objetivo */}
      {partida.objetivo && (
        <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
          <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">🎯 Objetivo Principal</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <p className="text-tactical-sand">{partida.objetivo}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1.5 rounded font-bold ${estadoColor[partida.objetivoEstado] || estadoColor['Pendiente']}`}>
                {partida.objetivoEstado}
              </span>
              <select
                value={partida.objetivoEstado}
                onChange={e => actualizarEstado('objetivoEstado', e.target.value)}
                className="bg-tactical-gray border border-tactical-olive rounded px-2 py-1 text-tactical-sand text-xs focus:outline-none"
              >
                {estadosOpciones.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Misiones */}
      {misiones.length > 0 && (
        <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
          <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">📜 Misiones</h2>
          <div className="space-y-3">
            {misiones.map(n => (
              <div key={n} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-tactical-olive pb-3 last:border-0 last:pb-0">
                <div>
                  <span className="text-tactical-orange font-bold text-sm mr-2">MISIÓN {n}:</span>
                  <span className="text-tactical-sand text-sm">{partida[`mision${n}`]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded font-bold ${estadoColor[partida[`mision${n}Estado`]] || estadoColor['Pendiente']}`}>
                    {partida[`mision${n}Estado`]}
                  </span>
                  <select
                    value={partida[`mision${n}Estado`]}
                    onChange={e => actualizarEstado(`mision${n}Estado`, e.target.value)}
                    className="bg-tactical-gray border border-tactical-olive rounded px-2 py-1 text-tactical-sand text-xs focus:outline-none"
                  >
                    {estadosOpciones.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipos participantes */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">
          🪖 Equipos Participantes ({equiposParticipantes.length})
        </h2>
        {equiposParticipantes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-tactical-lightolive mb-4">No hay equipos registrados para esta partida.</p>
            <Link to="/registro-partida" className="bg-tactical-orange text-tactical-black font-bold px-4 py-2 rounded text-sm">
              Registrar Equipo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {equiposParticipantes.map((reg, idx) => (
              <div key={idx} className="border border-tactical-olive rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-tactical-orange">{reg.nombreEquipo}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    reg.confirmado ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {reg.confirmado ? '✅ Confirmado' : '⏳ Pendiente'}
                  </span>
                </div>
                <p className="text-tactical-sand text-xs">{reg.integrantes?.length || 0} integrantes registrados</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
