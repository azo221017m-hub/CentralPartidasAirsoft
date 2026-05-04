import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ContinuarRegistro from './pages/ContinuarRegistro'
import PerfilTactico from './pages/PerfilTactico'
import Foro from './pages/Foro'
import CrearPartida from './pages/CrearPartida'
import DetallePartida from './pages/DetallePartida'
import RegistroPartida from './pages/RegistroPartida'

function App() {
  return (
    <div className="min-h-screen bg-tactical-black">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro-equipo" element={<ContinuarRegistro />} />
        <Route path="/perfil" element={<PerfilTactico />} />
        <Route path="/foro/:equipoId" element={<Foro />} />
        <Route path="/crear-partida" element={<CrearPartida />} />
        <Route path="/partida/:partidaId" element={<DetallePartida />} />
        <Route path="/registro-partida" element={<RegistroPartida />} />
      </Routes>
    </div>
  )
}

export default App
