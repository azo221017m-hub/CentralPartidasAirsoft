import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const estadosOpciones = ['Pendiente', 'En Progreso', 'Completado', 'Fallido', 'Cancelado']

export default function CrearPartida() {
  const navigate = useNavigate()
  const [equipos, setEquipos] = useState([])
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState({
    titulo: '',
    fecha: '',
    dinamica: '',
    equipoOrganizador: '',
    objetivo: '',
    objetivoEstado: 'Pendiente',
    mision1: '', mision1Estado: 'Pendiente',
    mision2: '', mision2Estado: 'Pendiente',
    mision3: '', mision3Estado: 'Pendiente',
    mision4: '', mision4Estado: 'Pendiente',
    mision5: '', mision5Estado: 'Pendiente',
    puntuacion: '',
    estado: 'activa',
  })

  useEffect(() => {
    const eq = JSON.parse(localStorage.getItem('equipos') || '[]')
    setEquipos(eq)
  }, [])

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const misiones = [1, 2, 3, 4, 5]

  const guardar = () => {
    if (!form.titulo.trim() || !form.fecha || !form.dinamica.trim()) {
      setMensaje('Por favor completa los campos requeridos: Título, Fecha y Dinámica.')
      return
    }

    const partida = {
      id: Date.now().toString(),
      ...form,
      equiposParticipantes: [],
      creadoEn: new Date().toISOString(),
    }

    const partidas = JSON.parse(localStorage.getItem('partidas') || '[]')
    partidas.push(partida)
    localStorage.setItem('partidas', JSON.stringify(partidas))

    setMensaje('✅ Partida creada exitosamente!')
    setTimeout(() => navigate(`/partida/${partida.id}`), 1500)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tactical-orange uppercase tracking-wide">⚔️ Crear Partida</h1>
        <p className="text-tactical-sand mt-2">Define los detalles de tu partida de airsoft.</p>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg font-bold ${
          mensaje.startsWith('✅') ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Info básica */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">📋 Información General</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Título de la Partida *</label>
            <input type="text" value={form.titulo} onChange={e => setField('titulo', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              placeholder="Ej: Operación Tormenta del Desierto" />
          </div>
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Fecha *</label>
            <input type="date" value={form.fecha} onChange={e => setField('fecha', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange" />
          </div>
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Estado de la Partida</label>
            <select value={form.estado} onChange={e => setField('estado', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange">
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Dinámica *</label>
            <textarea value={form.dinamica} onChange={e => setField('dinamica', e.target.value)}
              rows={3} placeholder="Describe la dinámica de juego..."
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange resize-none" />
          </div>
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Equipo Organizador</label>
            <select value={form.equipoOrganizador} onChange={e => setField('equipoOrganizador', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange">
              <option value="">Sin equipo organizador</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase tracking-wide">Puntuación</label>
            <input type="text" value={form.puntuacion} onChange={e => setField('puntuacion', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              placeholder="Ej: 1000 pts, TBD" />
          </div>
        </div>
      </div>

      {/* Objetivo */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">🎯 Objetivo Principal</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-tactical-sand text-xs mb-1 uppercase">Objetivo</label>
            <input type="text" value={form.objetivo} onChange={e => setField('objetivo', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              placeholder="Objetivo principal de la partida" />
          </div>
          <div>
            <label className="block text-tactical-sand text-xs mb-1 uppercase">Estado del Objetivo</label>
            <select value={form.objetivoEstado} onChange={e => setField('objetivoEstado', e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange">
              {estadosOpciones.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Misiones */}
      <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-6 mb-6">
        <h2 className="text-tactical-orange font-bold text-lg uppercase mb-4">📜 Misiones</h2>
        <div className="space-y-4">
          {misiones.map(n => (
            <div key={n} className="grid md:grid-cols-3 gap-4 border-b border-tactical-olive pb-4 last:border-0 last:pb-0">
              <div className="md:col-span-2">
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Misión {n}</label>
                <input type="text" value={form[`mision${n}`]} onChange={e => setField(`mision${n}`, e.target.value)}
                  className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
                  placeholder={`Descripción de la misión ${n}`} />
              </div>
              <div>
                <label className="block text-tactical-sand text-xs mb-1 uppercase">Estado Misión {n}</label>
                <select value={form[`mision${n}Estado`]} onChange={e => setField(`mision${n}Estado`, e.target.value)}
                  className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange">
                  {estadosOpciones.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={guardar}
        className="w-full bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold py-4 rounded-lg uppercase tracking-wide text-lg transition-colors">
        ✅ Crear Partida
      </button>
    </div>
  )
}
