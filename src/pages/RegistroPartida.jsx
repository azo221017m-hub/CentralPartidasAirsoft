import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGames, getTeams, registerTeamToGame, addParticipantToRegistration } from '../services/supabaseService'

const defaultIntegrante = {
  nombre: '',
  equipo: '',
  evidenciaPago: null,
  avisoPriva: false,
  confirmado: false,
}

export default function RegistroPartida() {
  const navigate = useNavigate()
  const [partidas, setPartidas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState({
    nombreEquipo: '',
    equipoId: '',
    partidaId: '',
    confirmacion: false,
    integrantes: [{ ...defaultIntegrante }],
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: gamesData } = await getGames()
      const { data: teamsData } = await getTeams()
      if (!mounted) return
      setPartidas(gamesData || [])
      setEquipos(teamsData || [])
    }
    load()
    return () => { mounted = false }
  }, [])

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const setEquipoFromId = (id) => {
    const eq = equipos.find(e => e.id === id)
    setForm(f => ({
      ...f,
      equipoId: id,
      nombreEquipo: eq?.nombre || '',
      integrantes: eq
        ? eq.integrantes.map(j => ({ nombre: j.nombre || j.sobrenombre, equipo: eq.nombre, evidenciaPago: null, avisoPriva: false, confirmado: false }))
        : [{ ...defaultIntegrante }]
    }))
  }

  const updateIntegrante = (idx, field, value) => {
    setForm(f => ({
      ...f,
      integrantes: f.integrantes.map((int, i) => i === idx ? { ...int, [field]: value } : int)
    }))
  }

  const handleEvidencia = (idx, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => updateIntegrante(idx, 'evidenciaPago', ev.target.result)
    reader.readAsDataURL(file)
  }

  const agregarIntegrante = () => {
    setForm(f => ({ ...f, integrantes: [...f.integrantes, { ...defaultIntegrante }] }))
  }

  const quitarIntegrante = (idx) => {
    setForm(f => ({ ...f, integrantes: f.integrantes.filter((_, i) => i !== idx) }))
  }

  const guardar = () => {
    if (!form.nombreEquipo.trim()) {
      setMensaje('Por favor ingresa el nombre del equipo.')
      return
    }
    if (!form.partidaId) {
      setMensaje('Por favor selecciona una partida.')
      return
    }
    if (!form.confirmacion) {
      setMensaje('Por favor confirma el registro.')
      return
    }

    ;(async () => {
      setMensaje('Enviando registro...')
      const { data: regData, error: regError } = await registerTeamToGame({ game_id: form.partidaId, team_id: form.equipoId, status: form.confirmacion ? 'confirmed' : 'pending' })
      if (regError || !regData) {
        console.error('Error registrando equipo a partida', regError)
        setMensaje('Error registrando equipo. Revisa la consola.')
        return
      }

      for (const int of form.integrantes) {
        await addParticipantToRegistration(regData.id, { player_name: int.nombre, team_name: int.equipo || form.nombreEquipo, payment_proof_url: int.evidenciaPago || null, privacy_notice_accepted: !!int.avisoPriva, confirmation_status: int.confirmado ? 'confirmed' : 'pending' })
      }

      setMensaje('✅ Registro enviado exitosamente!')
      setTimeout(() => navigate(`/partida/${form.partidaId}`), 1500)
    })()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide">🪖 Registro para Partida</h1>
        <p className="text-tactical-sand mt-2">Registra a tu equipo para participar en una partida.</p>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg font-bold ${
          mensaje.startsWith('✅') ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Info del equipo */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">🎯 Datos del Equipo</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase">Seleccionar Equipo Registrado</label>
            <select value={form.equipoId} onChange={e => setEquipoFromId(e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange">
              <option value="">-- Seleccionar equipo --</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase">Nombre del Equipo *</label>
            <input type="text" value={form.nombreEquipo} onChange={e => setField('nombreEquipo', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
              placeholder="Nombre del equipo" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-tactical-sand text-xs mb-1 uppercase">Seleccionar Partida *</label>
            <select value={form.partidaId} onChange={e => setField('partidaId', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange">
              <option value="">-- Seleccionar partida --</option>
              {partidas.filter(p => p.estado !== 'cancelada').map(p => (
                <option key={p.id} value={p.id}>{p.titulo} - {p.fecha}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Integrantes */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-tactical-orange font-bold text-lg uppercase">👥 Registro de Integrantes</h2>
          <button onClick={agregarIntegrante}
            className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-3 py-2 rounded text-sm uppercase">
            + Agregar
          </button>
        </div>

        <div className="space-y-4">
          {form.integrantes.map((int, idx) => (
            <div key={idx} className="bg-tactical-gray border border-tactical-olive rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-tactical-orange font-bold text-sm">Integrante {idx + 1}</h3>
                {form.integrantes.length > 1 && (
                  <button onClick={() => quitarIntegrante(idx)}
                    className="text-red-400 hover:text-red-300 text-sm font-bold">✕</button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-tactical-sand text-xs mb-1 uppercase">Nombre *</label>
                  <input type="text" value={int.nombre} onChange={e => updateIntegrante(idx, 'nombre', e.target.value)}
                    className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                    placeholder="Nombre del jugador" />
                </div>
                <div>
                  <label className="block text-tactical-sand text-xs mb-1 uppercase">Equipo</label>
                  <input type="text" value={int.equipo} onChange={e => updateIntegrante(idx, 'equipo', e.target.value)}
                    className="w-full bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
                    placeholder="Nombre del equipo" />
                </div>
                <div>
                  <label className="block text-tactical-sand text-xs mb-1 uppercase">Evidencia de Pago</label>
                  <label className="cursor-pointer flex items-center gap-2 bg-tactical-darkgreen border border-tactical-olive rounded px-3 py-2 hover:border-tactical-orange transition-colors text-sm">
                    <svg className="w-4 h-4 text-tactical-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-tactical-sand">{int.evidenciaPago ? 'Evidencia cargada ✓' : 'Subir Evidencia'}</span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleEvidencia(idx, e)} />
                  </label>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={int.avisoPriva} onChange={e => updateIntegrante(idx, 'avisoPriva', e.target.checked)}
                      className="accent-tactical-orange w-4 h-4" />
                    <span className="text-tactical-sand text-sm">Acepto el Aviso de Privacidad</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={int.confirmado} onChange={e => updateIntegrante(idx, 'confirmado', e.target.checked)}
                      className="accent-tactical-orange w-4 h-4" />
                    <span className="text-tactical-sand text-sm">Confirmado para participar</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmación */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">✅ Confirmación</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.confirmacion} onChange={e => setField('confirmacion', e.target.checked)}
            className="accent-tactical-orange w-5 h-5 mt-0.5" />
          <span className="text-tactical-sand text-sm">
            Confirmo que los datos proporcionados son correctos, acepto el reglamento de la partida y me comprometo a participar conforme a las reglas establecidas por Central Partidas Airsoft México.
          </span>
        </label>
      </div>

      <button onClick={guardar}
        className="w-full bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold py-4 rounded-lg uppercase tracking-wide text-lg transition-colors">
        🚀 Enviar Registro
      </button>
    </div>
  )
}
