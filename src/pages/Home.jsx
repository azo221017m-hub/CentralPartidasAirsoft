
import { useEffect, useState } from 'react'
import { getGames, getTeams } from '../services/supabaseService'
// Importar imagen de fondo oficial
import fondoCPA from '../assets/fondocpa.png'

export default function Home() {
  const [partidas, setPartidas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  // Debug: Verificar si la imagen se carga correctamente
  useEffect(() => {
    console.log('🖼️ Ruta del fondo CPA:', fondoCPA)
    
    // Verificar si la imagen se puede cargar
    const img = new Image()
    img.onload = () => {
      console.log('✅ Imagen fondocpa.png cargada correctamente')
      setBackgroundLoaded(true)
    }
    img.onerror = () => {
      console.error('❌ Error al cargar fondocpa.png')
      setBackgroundLoaded(false)
    }
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

  // Usar imagen importada o fallback desde public SIN efectos de opacidad
  const backgroundImage = backgroundLoaded 
    ? `url(${fondoCPA})`
    : `url('/fondocpa.png'), linear-gradient(135deg, #485D2A 0%, #2E3A1E 10%, #111214 100%)`

  return (
    <div 
      className="min-h-screen relative bg-cpa-dark bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage
      }}
    >
      {/* Debug info - Mostrar estado de carga */}
      {!backgroundLoaded && (
        <div className="fixed top-4 left-4 bg-yellow-500 text-black p-2 rounded z-50 text-sm">
          🔄 Cargando fondo oficial...
        </div>
      )}
      
      {/* Stats Section con iconografía del brandbook */}
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
              <div className="text-4xl mb-2">�</div>
              <div className="font-squadron text-cpa-primary text-3xl font-bold mb-1">{partidas.filter(p => p.estado === 'activa').length}</div>
              <div className="font-tactical text-cpa-sand text-sm tracking-wider uppercase">CALENDARIO</div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  )
}
