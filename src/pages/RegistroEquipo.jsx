import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FichaJugador from '../components/FichaJugador'
import { createTeam, createPlayer } from '../services/supabaseService'

const defaultJugador = {
  nombre: '',
  sobrenombre: '',
  habilidadAsalto: 50,
  habilidadExplorador: 50,
  habilidadRetaguardia: 50,
  experiencia: 'Novato',
  esLider: false,
  esSegundo: false,
  visible: true,
  equipo: '',
}

export default function RegistroEquipo() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [logo, setLogo] = useState(null)
  const [fotoEquipo, setFotoEquipo] = useState(null)
  const [integrantes, setIntegrantes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [jugadorActual, setJugadorActual] = useState({ ...defaultJugador })
  const [editIdx, setEditIdx] = useState(null)
  const [mensaje, setMensaje] = useState('')

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
    if (!jugadorActual.nombre.trim()) return
    const newJ = { ...jugadorActual, id: Date.now(), equipo: nombre }
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

  const guardarEquipo = async () => {
    if (!nombre.trim()) {
      setMensaje('Por favor ingresa el nombre del equipo.')
      return
    }
    if (integrantes.length === 0) {
      setMensaje('Por favor agrega al menos un integrante.')
      return
    }

    setMensaje('Guardando equipo...')

    const { data: teamData, error: teamError } = await createTeam({
      name: nombre,
      logo_url: logo,
      team_photo_url: fotoEquipo,
      is_public_forum: false
    })

    if (teamError || !teamData) {
      console.error('Error creando equipo:', teamError)
      setMensaje('Error registrando el equipo. Revisa la consola.')
      return
    }

    // Crear jugadores y asociarlos al equipo en la base de datos
    const teamId = teamData.team?.id || teamData.id || null
    for (const j of integrantes) {
      const nickname = j.sobrenombre?.trim() || j.nombre?.trim() || 'Jugador'
      await createPlayer({
        nickname,
        avatar_url: j.avatar || null,
        assault_skill: Number(j.habilidadAsalto) || 0,
        scout_skill: Number(j.habilidadExplorador) || 0,
        rear_guard_skill: Number(j.habilidadRetaguardia) || 0,
        experience: 0,
        team_id: teamId
      })
    }

    setMensaje('✅ Equipo registrado exitosamente!')
    setTimeout(() => navigate(`/foro/${teamId}`), 1500)
  }

  const experiencias = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Veterano']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide">
          🎯 Registro de Equipo
        </h1>
        <p className="text-tactical-sand mt-2">Registra tu equipo de airsoft y agrega a tus integrantes.</p>
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
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">Información del Equipo</h2>
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

      {/* Lista de integrantes */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-tactical-orange font-bold text-lg uppercase">
            Integrantes ({integrantes.length})
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
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Experiencia</label>
                <select
                  value={jugadorActual.experiencia}
                  onChange={e => setJugadorActual(j => ({ ...j, experiencia: e.target.value }))}
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
        ✅ Registrar Equipo
      </button>
    </div>
  )
}
