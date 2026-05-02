import logoCPA from '../assets/logocpa.JPG'

export default function LogoOficial({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  }

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden border-4 border-cpa-primary glow-cpa relative group ${className}`}>
      {/* Anillo de efectos */}
      <div className="absolute inset-0 rounded-full border-2 border-cpa-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cpa-primary/20 to-cpa-secondary/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      
      <img 
        src={logoCPA} 
        alt="Central Partidas Airsoft Logo" 
        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
      />
      
      {/* Efecto de brillo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
    </div>
  )
}