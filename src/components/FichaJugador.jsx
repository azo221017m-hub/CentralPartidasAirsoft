export default function FichaJugador({ jugador, onToggleVisible, canEdit }) {
  const skillBar = (value) => (
    <div className="w-full bg-tactical-gray rounded-full h-2">
      <div
        className="bg-tactical-orange h-2 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )

  return (
    <div className="bg-tactical-darkgreen border border-tactical-olive rounded-lg p-4 relative">
      {canEdit && (
        <button
          onClick={() => onToggleVisible && onToggleVisible(jugador.id)}
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded font-bold ${
            jugador.visible
              ? 'bg-tactical-green text-tactical-sand'
              : 'bg-tactical-gray text-tactical-sand'
          }`}
        >
          {jugador.visible ? 'Visible' : 'Oculto'}
        </button>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="w-16 h-16 rounded-full bg-tactical-olive flex items-center justify-center flex-shrink-0 border-2 border-tactical-orange overflow-hidden">
          {jugador.avatar ? (
            <img src={jugador.avatar} alt={jugador.nombre} className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
              <circle cx="32" cy="24" r="12" fill="#6b7c4a"/>
              <ellipse cx="32" cy="52" rx="18" ry="12" fill="#6b7c4a"/>
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-tactical-orange font-bold text-lg">{jugador.sobrenombre || jugador.nombre}</h3>
          {jugador.sobrenombre && <p className="text-tactical-sand text-xs">{jugador.nombre}</p>}
          <div className="flex gap-2 mt-1">
            {jugador.esLider && (
              <span className="bg-tactical-orange text-tactical-black text-xs px-2 py-0.5 rounded font-bold">LÍDER</span>
            )}
            {jugador.esSegundo && (
              <span className="bg-tactical-olive text-tactical-sand text-xs px-2 py-0.5 rounded font-bold">2DO AL MANDO</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-tactical-sand">⚔️ Asalto</span>
            <span className="text-tactical-orange">{jugador.habilidadAsalto || 0}%</span>
          </div>
          {skillBar(jugador.habilidadAsalto || 0)}
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-tactical-sand">🔭 Explorador</span>
            <span className="text-tactical-orange">{jugador.habilidadExplorador || 0}%</span>
          </div>
          {skillBar(jugador.habilidadExplorador || 0)}
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-tactical-sand">🛡️ Retaguardia</span>
            <span className="text-tactical-orange">{jugador.habilidadRetaguardia || 0}%</span>
          </div>
          {skillBar(jugador.habilidadRetaguardia || 0)}
        </div>
      </div>

      <div className="flex justify-between text-xs border-t border-tactical-olive pt-2">
        <span className="text-tactical-sand">Experiencia: <span className="text-tactical-orange font-bold">{jugador.experiencia || 'Novato'}</span></span>
        <span className="text-tactical-sand">Equipo: <span className="text-tactical-orange font-bold">{jugador.equipo || '-'}</span></span>
      </div>
    </div>
  )
}
