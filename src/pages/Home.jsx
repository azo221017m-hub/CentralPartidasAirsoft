

import { useEffect, useState, useRef } from 'react'
import { getGames, getTeams } from '../services/supabaseService'
import fondoCPA from '../assets/fondocpa.png'

function CarruselLogos({ equipos }) {
  const [idx, setIdx] = useState(0)
  const logos = equipos.filter(e => e.logo_url)
  const timerRef = useRef(null)

  useEffect(() => {
    if (logos.length <= 1) return
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % logos.length), 2500)
    return () => clearInterval(timerRef.current)
  }, [logos.length])

  if (logos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-48 text-tactical-sand text-sm opacity-50">
        Sin equipos registrados aun
      </div>
    )
  }

  const prev = () => setIdx(i => (i - 1 + logos.length) % logos.length)
  const next = () => setIdx(i => (i + 1) % logos.length)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-4">
      {/* Imagen principal */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <img
          key={logos[idx].id}
          src={logos[idx].logo_url}
          alt={logos[idx].name}
          className="w-40 h-40 rounded-full object-cover border-4 shadow-xl transition-all duration-500"
          style={{ borderColor: '#FFA500' }}
        />
      </div>
      <p className="font-bold text-lg text-center" style={{ color: '#FFA500' }}>{logos[idx].name}</p>

      {/* Controles */}
      {logos.length > 1 && (
        <div className="flex items-center gap-4">
          <button onClick={prev}
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-tactical-olive transition-colors"
            style={{ borderColor: '#FFA500', color: '#FFA500' }}>
            &#8249;
          </button>
          <div className="flex gap-1">
            {logos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: i === idx ? '#FFA500' : '#4a5c2a' }} />
            ))}
          </div>
          <button onClick={next}
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-tactical-olive transition-colors"
            style={{ borderColor: '#FFA500', color: '#FFA500' }}>
            &#8250;
          </button>
        </div>
      )}
      <p className="text-tactical-sand text-xs">{idx + 1} / {logos.length} equipos</p>
    </div>
  )
}

export default function Home() {
  const [partidas, setPartidas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setBackgroundLoaded(true)
    img.onerror = () => setBackgroundLoaded(false)
    img.src = fondoCPA
  }, [])

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

  const backgroundImage = backgroundLoaded
    ? `url(${fondoCPA})`
    : `url('/fondocpa.png'), linear-gradient(135deg, #485D2A 0%, #2E3A1E 10%, #111214 100%)`

  return (
    <div
      className="min-h-screen relative bg-cpa-dark bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage }}
    >
      {/* Stats */}
      <div className="py-16 bg-gradient-to-r from-cpa-primary/5 to-cpa-secondary/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-gradient-to-br from-cpa-gray/50 to-cpa-dark/50 backdrop-blur-sm border border-cpa-primary/20 rounded-xl p-6 hover:border-cpa-primary/50 transition-all duration-300">
              <div className="text-4xl mb-2">👥</div>
              <div className="font-squadron text-cpa-primary text-3xl font-bold mb-1">{equipos.length}</div>
              <div className="font-tactical text-cpa-sand text-sm tracking-wider uppercase">EQUIPOS</div>
            </div>
            <div className="text-center bg-gradient-to-br from-cpa-gray/50 to-cpa-dark/50 backdrop-blur-sm border border-cpa-primary/20 rounded-xl p-6 hover:border-cpa-primary/50 transition-all duration-300">
              <div className="text-4xl mb-2">🎯</div>
              <div className="font-squadron text-cpa-primary text-3xl font-bold mb-1">{partidas.length}</div>
              <div className="font-tactical text-cpa-sand text-sm tracking-wider uppercase">PARTIDAS</div>
            </div>
            <div className="text-center bg-gradient-to-br from-cpa-gray/50 to-cpa-dark/50 backdrop-blur-sm border border-cpa-secondary/20 rounded-xl p-6 hover:border-cpa-secondary/50 transition-all duration-300">
              <div className="text-4xl mb-2">📊</div>
              <div className="font-squadron text-cpa-secondary text-3xl font-bold mb-1">{equipos.reduce((a, e) => a + (e.integrantes?.length || 0), 0)}</div>
              <div className="font-tactical text-cpa-sand text-sm tracking-wider uppercase">RANKINGS</div>
            </div>
            <div className="text-center bg-gradient-to-br from-cpa-gray/50 to-cpa-dark/50 backdrop-blur-sm border border-cpa-primary/20 rounded-xl p-6 hover:border-cpa-primary/50 transition-all duration-300">
              <div className="text-4xl mb-2">📅</div>
              <div className="font-squadron text-cpa-primary text-3xl font-bold mb-1">{partidas.filter(p => p.estado === 'activa').length}</div>
              <div className="font-tactical text-cpa-sand text-sm tracking-wider uppercase">CALENDARIO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección YouTube + Carrusel — siempre visible */}
      <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">

            {/* Izquierda: Video YouTube */}
            <div className="bg-tactical-darkgreen/80 border border-tactical-olive rounded-2xl p-5 flex flex-col">
              <h2 className="text-sm uppercase tracking-widest mb-4 font-bold" style={{ color: '#FFA500' }}>
                Conoce CPA
              </h2>
              <div className="relative w-full rounded-xl overflow-hidden"
                style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  src="https://www.youtube.com/embed/adw0TdXarG8?si=tRtnpYL8cmXTMR5y"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="text-tactical-sand text-xs mt-3 opacity-70">
                Central Partidas Airsoft — La plataforma tactica de Mexico
              </p>
            </div>

            {/* Derecha: Carrusel de logos de equipos */}
            <div className="bg-tactical-darkgreen/80 border border-tactical-olive rounded-2xl p-5 flex flex-col">
              <h2 className="text-sm uppercase tracking-widest mb-4 font-bold" style={{ color: '#FFA500' }}>
                Equipos Registrados
              </h2>
              <div className="flex-1 flex items-center justify-center">
                <CarruselLogos equipos={equipos} />
              </div>
            </div>

          </div>
        </div>

    </div>
  )
}
