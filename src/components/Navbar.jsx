import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import LoginForm from './LoginForm'
import LogoOficial from './LogoOficial'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  // Links base que siempre se muestran
  const publicLinks = [
    { to: '/', label: 'Inicio' },
  ]

  // Links que solo se muestran cuando está autenticado
  const privateLinks = [
    { to: '/registro-equipo', label: 'Registrar Equipo' },
    { to: '/crear-partida', label: 'Crear Partida' },
    { to: '/registro-partida', label: 'Registrar en Partida' },
  ]

  // Combinar links según el estado de autenticación
  const links = authenticated ? [...publicLinks, ...privateLinks] : publicLinks

  const handleLoginSuccess = (userData) => {
    setAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setUser(null)
  }

  return (
    <nav className="bg-gradient-to-r from-cpa-dark to-cpa-gray border-b-2 border-cpa-primary shadow-2xl relative overflow-hidden">
      {/* Patrón de fondo táctico */}
      <div className="absolute inset-0 bg-tactical-pattern"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo y título principal con efectos mejorados */}
          <Link to="/" className="flex items-center gap-4 group">
            <LogoOficial 
              size="md" 
              className="logo-header-effect glow-pulse transition-all duration-500 group-hover:scale-125 military-pulse hover:animate-none" 
            />
            <div className="flex flex-col">
              <div className="font-squadron text-cpa-primary text-xl leading-tight tracking-wider transition-all duration-300 group-hover:text-cpa-sand group-hover:scale-105 group-hover:glow-cpa">
                CENTRAL PARTIDAS
              </div>
              <div className="font-tactical text-cpa-sand text-sm leading-tight tracking-widest transition-all duration-300 group-hover:text-cpa-primary">
                — AIRSOFT MÉXICO —
              </div>
            </div>
          </Link>

          {/* Navegación desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 font-tactical text-sm font-semibold uppercase tracking-wide transition-all duration-300 rounded-lg border border-transparent ${
                  location.pathname === link.to
                    ? 'bg-cpa-primary text-cpa-white border-cpa-sand shadow-lg glow-cpa'
                    : 'text-cpa-white hover:text-cpa-primary hover:bg-cpa-gray hover:border-cpa-primary/30'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {location.pathname === link.to && (
                    <div className="w-1 h-1 bg-cpa-white rounded-full"></div>
                  )}
                </span>
              </Link>
            ))}
            
            {/* Separador */}
            <div className="w-px h-8 bg-cpa-primary/30 mx-4"></div>
            
            {/* Área de autenticación */}
            <div className="flex items-center gap-3">
              {authenticated ? (
                <>
                  <div className="flex items-center gap-2 bg-cpa-gray px-3 py-2 rounded-lg border border-cpa-primary/30">
                    <div className="w-2 h-2 bg-cpa-primary rounded-full animate-pulse"></div>
                    <span className="font-tactical text-cpa-sand text-sm font-medium">
                      {user?.contact_name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-cpa-secondary hover:bg-cpa-secondary/80 text-cpa-white font-tactical font-semibold px-4 py-2 rounded-lg uppercase text-xs tracking-wide transition-all duration-300"
                  >
                    Salir a Base
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-cpa-primary to-cpa-secondary hover:from-cpa-secondary hover:to-cpa-primary text-cpa-white font-squadron font-bold px-6 py-3 rounded-lg uppercase text-sm tracking-wider transition-all duration-300 glow-cpa transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    ZONA DE ACCESO 
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Botón hamburguesa móvil */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden relative z-20 p-3 rounded-lg bg-ops-gray border border-ops-primary/30 text-ops-text-light hover:text-ops-primary hover:bg-ops-primary/10 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Navegación móvil */}
        {open && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-ops-dark-gray to-ops-dark border-b-2 border-ops-primary shadow-2xl z-50">
            <div className="px-4 py-6 space-y-4">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 font-tactical font-semibold uppercase tracking-wide transition-all duration-300 rounded-lg ${
                    location.pathname === link.to
                      ? 'bg-ops-primary text-ops-dark'
                      : 'text-ops-text-light hover:text-ops-primary hover:bg-ops-gray'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Separador móvil */}
              <div className="border-t border-ops-primary/30 pt-4 mt-4">
                {authenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-ops-gray rounded-lg border border-ops-primary/30">
                      <div className="w-3 h-3 bg-ops-primary rounded-full animate-pulse"></div>
                      <span className="font-tactical text-ops-text-light font-medium">
                        {user?.contact_name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setOpen(false)
                      }}
                      className="w-full bg-ops-orange hover:bg-ops-orange/80 text-white font-tactical font-semibold px-4 py-3 rounded-lg uppercase text-sm tracking-wide transition-all duration-300"
                    >
                      Salir a Base
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowLogin(true)
                      setOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-ops-primary to-ops-accent text-ops-dark font-tactical font-bold px-6 py-4 rounded-lg uppercase text-sm tracking-wider transition-all duration-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Acceso Táctico
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Login */}
      {showLogin && (
        <LoginForm 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </nav>
  )
}
