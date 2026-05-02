import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/registro-equipo', label: 'Registrar Equipo' },
    { to: '/crear-partida', label: 'Crear Partida' },
    { to: '/registro-partida', label: 'Registrar en Partida' },
  ]

  return (
    <nav className="bg-tactical-darkgreen border-b-2 border-tactical-orange">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tactical-orange rounded-full flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#1a2e1a" strokeWidth="2"/>
                <path d="M20 5 L23 15 L34 15 L25 21 L28 32 L20 26 L12 32 L15 21 L6 15 L17 15 Z" fill="#1a2e1a"/>
              </svg>
            </div>
            <div>
              <div className="text-tactical-orange font-bold text-sm leading-tight">CENTRAL PARTIDAS</div>
              <div className="text-tactical-sand text-xs leading-tight">AIRSOFT MÉXICO</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? 'text-tactical-orange border-b-2 border-tactical-orange'
                    : 'text-tactical-sand hover:text-tactical-orange'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-tactical-sand hover:text-tactical-orange p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 border-t border-tactical-green">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm font-bold uppercase tracking-wide text-tactical-sand hover:text-tactical-orange"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
