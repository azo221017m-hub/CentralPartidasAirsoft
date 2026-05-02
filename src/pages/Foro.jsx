import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import FichaJugador from '../components/FichaJugador'

export default function Foro() {
  const { equipoId } = useParams()
  const [equipo, setEquipo] = useState(null)
  const [autenticado, setAutenticado] = useState(false)
  const [rolUsuario, setRolUsuario] = useState(null)
  const [password, setPassword] = useState('')
  const [nuevaNoticia, setNuevaNoticia] = useState('')
  const [tituloNoticia, setTituloNoticia] = useState('')
  const [mostrarFormNoticia, setMostrarFormNoticia] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const equipos = JSON.parse(localStorage.getItem('equipos') || '[]')
    const eq = equipos.find(e => e.id === equipoId)
    setEquipo(eq || null)

    const session = JSON.parse(localStorage.getItem(`foro_session_${equipoId}`) || 'null')
    if (session) {
      setAutenticado(true)
      setRolUsuario(session.rol)
    }
  }, [equipoId])

  const actualizarEquipo = (nuevoEquipo) => {
    const equipos = JSON.parse(localStorage.getItem('equipos') || '[]')
    const idx = equipos.findIndex(e => e.id === equipoId)
    if (idx !== -1) {
      equipos[idx] = nuevoEquipo
      localStorage.setItem('equipos', JSON.stringify(equipos))
      setEquipo(nuevoEquipo)
    }
  }

  const autenticar = (rol) => {
    const correctas = { lider: 'lider123', segundo: 'segundo123' }
    if (password === correctas[rol]) {
      setAutenticado(true)
      setRolUsuario(rol)
      localStorage.setItem(`foro_session_${equipoId}`, JSON.stringify({ rol }))
      setPassword('')
      setMensaje('')
    } else {
      setMensaje('Contraseña incorrecta. (Demo: lider123 / segundo123)')
    }
  }

  const cerrarSesion = () => {
    setAutenticado(false)
    setRolUsuario(null)
    localStorage.removeItem(`foro_session_${equipoId}`)
  }

  const toggleForoPublico = () => {
    const actualizado = { ...equipo, foroPublico: !equipo.foroPublico }
    actualizarEquipo(actualizado)
  }

  const publicarNoticia = () => {
    if (!tituloNoticia.trim() || !nuevaNoticia.trim()) return
    const noticia = {
      id: Date.now(),
      titulo: tituloNoticia,
      contenido: nuevaNoticia,
      autor: rolUsuario === 'lider' ? 'Líder' : '2do al Mando',
      fecha: new Date().toLocaleDateString('es-MX'),
    }
    const actualizado = {
      ...equipo,
      noticias: [...(equipo.noticias || []), noticia],
    }
    actualizarEquipo(actualizado)
    setNuevaNoticia('')
    setTituloNoticia('')
    setMostrarFormNoticia(false)
  }

  const eliminarNoticia = (id) => {
    const actualizado = {
      ...equipo,
      noticias: equipo.noticias.filter(n => n.id !== id),
    }
    actualizarEquipo(actualizado)
  }

  const toggleVisibilidadJugador = (jugadorId) => {
    const actualizado = {
      ...equipo,
      integrantes: equipo.integrantes.map(j =>
        j.id === jugadorId ? { ...j, visible: !j.visible } : j
      ),
    }
    actualizarEquipo(actualizado)
  }

  if (!equipo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-tactical-sand text-xl mb-4">Equipo no encontrado.</p>
        <Link to="/registro-equipo" className="bg-tactical-orange text-tactical-black font-bold px-4 py-2 rounded">
          Registrar Equipo
        </Link>
      </div>
    )
  }

  const canEdit = autenticado && (rolUsuario === 'lider' || rolUsuario === 'segundo')
  const jugadoresVisibles = equipo.integrantes?.filter(j => j.visible || canEdit) || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header del equipo */}
      <div className="bg-tactical-darkgreen border-2 border-tactical-orange rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-tactical-olive flex items-center justify-center border-2 border-tactical-orange overflow-hidden flex-shrink-0">
            {equipo.logo ? (
              <img src={equipo.logo} alt={equipo.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-tactical-orange font-bold text-3xl">{equipo.nombre?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-tactical-orange uppercase">{equipo.nombre}</h1>
            <p className="text-tactical-sand text-sm mt-1">{equipo.integrantes?.length || 0} integrantes registrados</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${equipo.foroPublico ? 'bg-green-800 text-green-300' : 'bg-tactical-gray text-tactical-sand'}`}>
                {equipo.foroPublico ? '🔓 Foro Público' : '🔒 Foro Privado'}
              </span>
              {autenticado && (
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-tactical-orange text-tactical-black">
                  {rolUsuario === 'lider' ? '👑 Líder' : '🎖️ 2do al Mando'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {canEdit && (
              <>
                <button onClick={toggleForoPublico}
                  className="bg-tactical-gray hover:bg-tactical-olive text-tactical-sand text-xs px-3 py-2 rounded font-bold">
                  {equipo.foroPublico ? '🔒 Hacer Privado' : '🔓 Hacer Público'}
                </button>
                <Link to="/crear-partida"
                  className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black text-xs px-3 py-2 rounded font-bold text-center">
                  ⚔️ Crear Partida
                </Link>
              </>
            )}
            {autenticado ? (
              <button onClick={cerrarSesion}
                className="bg-red-900 hover:bg-red-800 text-red-300 text-xs px-3 py-2 rounded font-bold">
                Cerrar Sesión
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Login */}
      {!autenticado && (
        <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4 mb-6">
          <h3 className="text-tactical-orange font-bold mb-3">🔐 Acceso para Administradores</h3>
          {mensaje && <p className="text-yellow-400 text-sm mb-3">{mensaje}</p>}
          <div className="flex gap-3 flex-wrap">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm focus:outline-none focus:border-tactical-orange"
              onKeyDown={e => e.key === 'Enter' && autenticar('lider')}
            />
            <button onClick={() => autenticar('lider')}
              className="bg-tactical-orange text-tactical-black font-bold px-4 py-2 rounded text-sm">
              Entrar como Líder
            </button>
            <button onClick={() => autenticar('segundo')}
              className="bg-tactical-olive text-tactical-sand font-bold px-4 py-2 rounded text-sm">
              Entrar como 2do
            </button>
          </div>
          <p className="text-tactical-lightolive text-xs mt-2">Demo: lider123 / segundo123</p>
        </div>
      )}

      {/* Foto del equipo */}
      {equipo.fotoEquipo && (
        <div className="mb-6 rounded-lg overflow-hidden border border-tactical-olive">
          <img src={equipo.fotoEquipo} alt="Foto del equipo" className="w-full h-48 object-cover" />
        </div>
      )}

      {/* Noticias */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-tactical-orange font-bold text-xl uppercase">📰 Noticias del Equipo</h2>
          {canEdit && (
            <button
              onClick={() => setMostrarFormNoticia(!mostrarFormNoticia)}
              className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-4 py-2 rounded text-sm uppercase"
            >
              + Nueva Noticia
            </button>
          )}
        </div>

        {mostrarFormNoticia && canEdit && (
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4 mb-4">
            <input
              type="text"
              value={tituloNoticia}
              onChange={e => setTituloNoticia(e.target.value)}
              placeholder="Título de la noticia"
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm mb-3 focus:outline-none focus:border-tactical-orange"
            />
            <textarea
              value={nuevaNoticia}
              onChange={e => setNuevaNoticia(e.target.value)}
              placeholder="Contenido de la noticia..."
              rows={4}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand text-sm mb-3 focus:outline-none focus:border-tactical-orange resize-none"
            />
            <div className="flex gap-3">
              <button onClick={publicarNoticia}
                className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-4 py-2 rounded text-sm">
                Publicar
              </button>
              <button onClick={() => setMostrarFormNoticia(false)}
                className="bg-tactical-gray text-tactical-sand font-bold px-4 py-2 rounded text-sm">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {(equipo.noticias || []).length === 0 ? (
          <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-8 text-center text-tactical-lightolive">
            No hay noticias publicadas aún.
          </div>
        ) : (
          <div className="space-y-4">
            {[...(equipo.noticias || [])].reverse().map(noticia => (
              <div key={noticia.id} className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-tactical-orange">{noticia.titulo}</h3>
                  {canEdit && (
                    <button onClick={() => eliminarNoticia(noticia.id)}
                      className="text-red-400 hover:text-red-300 text-xs">🗑️</button>
                  )}
                </div>
                <p className="text-tactical-sand text-sm mb-2">{noticia.contenido}</p>
                <p className="text-tactical-lightolive text-xs">Por {noticia.autor} • {noticia.fecha}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fichas de jugadores */}
      {(equipo.foroPublico || autenticado) && (
        <div>
          <h2 className="text-tactical-orange font-bold text-xl uppercase mb-4">🪖 Fichas de Jugadores</h2>
          {jugadoresVisibles.length === 0 ? (
            <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-8 text-center text-tactical-lightolive">
              No hay fichas visibles.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {jugadoresVisibles.map(jugador => (
                <FichaJugador
                  key={jugador.id}
                  jugador={jugador}
                  canEdit={canEdit}
                  onToggleVisible={toggleVisibilidadJugador}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
