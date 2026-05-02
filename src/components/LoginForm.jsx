import { useState } from 'react'
import { validateAccess } from '../services/supabaseService'

export default function LoginForm({ onClose, onLoginSuccess }) {
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usuario.trim() || !contraseña.trim()) {
      setMensaje('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const { data, error } = await validateAccess(usuario.trim(), contraseña)
      
      if (error) {
        console.error('Error validando acceso:', error)
        
        // Dar más información específica sobre el error
        if (error.code === '42501') {
          setMensaje('⚠️ Base de datos no configurada. Contacta al administrador.')
        } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          setMensaje('⚠️ Tabla de usuarios no encontrada. Contacta al administrador.')
        } else {
          setMensaje('Error de conexión. Intenta de nuevo.')
        }
        return
      }

      if (data && data.contact_name) {
        setMensaje('Acceso a CPA')
        onLoginSuccess(data)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setMensaje('Sin Acceso, eres hacker?')
      }
    } catch (err) {
      console.error('Error:', err)
      setMensaje('Error inesperado. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-tactical-darkgreen border-2 border-tactical-orange rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-tactical-orange font-bold text-xl uppercase">🔐 Acceso</h2>
          <button 
            onClick={onClose}
            className="text-tactical-sand hover:text-tactical-orange text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-tactical-sand text-sm mb-2 uppercase tracking-wide">
              Usuario *
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              placeholder="Ingresa tu usuario"
              disabled={cargando}
            />
          </div>

          <div>
            <label className="block text-tactical-sand text-sm mb-2 uppercase tracking-wide">
              Contraseña *
            </label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="w-full bg-tactical-gray border border-tactical-olive rounded px-3 py-2 text-tactical-sand focus:outline-none focus:border-tactical-orange"
              placeholder="Ingresa tu contraseña"
              disabled={cargando}
            />
          </div>

          {mensaje && (
            <div className={`p-3 rounded-lg font-bold text-sm ${
              mensaje === 'Acceso a CPA' 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : mensaje === 'Sin Acceso, eres hacker?'
                ? 'bg-red-900 text-red-300 border border-red-700'
                : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
            }`}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-tactical-orange hover:bg-tactical-lightorange disabled:opacity-50 text-tactical-black font-bold py-3 rounded uppercase tracking-wide transition-colors"
            >
              {cargando ? 'Validando...' : 'Acceso'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-tactical-gray hover:bg-tactical-olive text-tactical-sand font-bold px-4 py-3 rounded uppercase"
            >
              Cancelar
            </button>
          </div>
        </form>

     
      </div>
    </div>
  )
}