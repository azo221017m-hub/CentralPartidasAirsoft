import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Home() {
  const [partidas, setPartidas] = useState([])
  const [equipos, setEquipos] = useState([])

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('partidas') || '[]')
    const e = JSON.parse(localStorage.getItem('equipos') || '[]')
    setPartidas(p)
    setEquipos(e)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative bg-tactical-darkgreen border-2 border-tactical-orange rounded-lg p-8 mb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d4620a" strokeWidth="0.5"/>
            </pattern>
            <rect width="400" height="300" fill="url(#grid)"/>
          </svg>
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-tactical-orange rounded-full mb-4">
            <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
              <circle cx="40" cy="40" r="36" stroke="#1a2e1a" strokeWidth="3"/>
              <path d="M40 8 L45 25 L62 25 L48 35 L53 52 L40 42 L27 52 L32 35 L18 25 L35 25 Z" fill="#1a2e1a"/>
              <circle cx="40" cy="40" r="8" fill="#1a2e1a"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-tactical-orange mb-2 uppercase tracking-widest">
            Central Partidas
          </h1>
          <h2 className="text-2xl font-bold text-tactical-sand mb-4 uppercase tracking-wider">
            Airsoft México
          </h2>
          <p className="text-tactical-lightolive max-w-2xl mx-auto mb-8">
            La plataforma definitiva para organizar partidas de airsoft, registrar equipos y gestionar tus eventos tácticos.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/registro-equipo" className="bg-tactical-orange hover:bg-tactical-lightorange text-tactical-black font-bold px-6 py-3 rounded uppercase tracking-wide transition-colors">
              Registrar Equipo
            </Link>
            <Link to="/crear-partida" className="bg-transparent border-2 border-tactical-orange text-tactical-orange hover:bg-tactical-orange hover:text-tactical-black font-bold px-6 py-3 rounded uppercase tracking-wide transition-colors">
              Crear Partida
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Equipos Registrados', value: equipos.length, icon: '🎯' },
          { label: 'Partidas Creadas', value: partidas.length, icon: '⚔️' },
          { label: 'Jugadores Activos', value: equipos.reduce((a, e) => a + (e.integrantes?.length || 0), 0), icon: '🪖' },
          { label: 'Partidas Activas', value: partidas.filter(p => p.estado === 'activa').length, icon: '🔥' },
        ].map((stat, i) => (
          <div key={i} className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-tactical-orange">{stat.value}</div>
            <div className="text-xs text-tactical-sand uppercase tracking-wide mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Partidas recientes */}
      <div className="mb-10">
        <h2 className="text-tactical-orange text-xl font-bold uppercase tracking-wide mb-4 border-b border-tactical-olive pb-2">
          ⚔️ Partidas Recientes
        </h2>
        {partidas.length === 0 ? (
          <div className="text-center py-12 text-tactical-lightolive">
            <p className="text-lg mb-4">No hay partidas registradas aún.</p>
            <Link to="/crear-partida" className="bg-tactical-orange text-tactical-black font-bold px-4 py-2 rounded">
              Crear Primera Partida
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partidas.slice(-6).reverse().map(p => (
              <Link key={p.id} to={`/partida/${p.id}`}
                className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4 hover:border-tactical-orange transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-tactical-orange">{p.titulo}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    p.estado === 'activa' ? 'bg-green-800 text-green-300' : 'bg-tactical-gray text-tactical-sand'
                  }`}>{p.estado || 'pendiente'}</span>
                </div>
                <p className="text-tactical-sand text-sm mb-2">📅 {p.fecha}</p>
                <p className="text-tactical-lightolive text-sm">{p.dinamica}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Equipos */}
      <div>
        <h2 className="text-tactical-orange text-xl font-bold uppercase tracking-wide mb-4 border-b border-tactical-olive pb-2">
          🎯 Equipos Registrados
        </h2>
        {equipos.length === 0 ? (
          <div className="text-center py-12 text-tactical-lightolive">
            <p className="text-lg mb-4">No hay equipos registrados aún.</p>
            <Link to="/registro-equipo" className="bg-tactical-orange text-tactical-black font-bold px-4 py-2 rounded">
              Registrar Primer Equipo
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipos.map(equipo => (
              <Link key={equipo.id} to={`/foro/${equipo.id}`}
                className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4 hover:border-tactical-orange transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-tactical-olive flex items-center justify-center border border-tactical-orange overflow-hidden">
                    {equipo.logo ? (
                      <img src={equipo.logo} alt={equipo.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-tactical-orange font-bold text-lg">{equipo.nombre?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-tactical-orange">{equipo.nombre}</h3>
                    <p className="text-tactical-sand text-xs">{equipo.integrantes?.length || 0} integrantes</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${equipo.foroPublico ? 'bg-green-800 text-green-300' : 'bg-tactical-gray text-tactical-sand'}`}>
                    {equipo.foroPublico ? '🔓 Foro Público' : '🔒 Foro Privado'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
