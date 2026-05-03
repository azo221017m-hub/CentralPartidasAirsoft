// Cliente Supabase compartido
// Usa las variables de entorno definidas en .env (prefijo VITE_ para Vite)
import { createClient } from '@supabase/supabase-js'

// Valores desde .env — con fallback a los valores del proyecto
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ojuxfmywmmvlemjdvzqa.supabase.co'

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_HKHiHjce3uqrHt-Lvr1nCw_sg44UrE7'

console.log('[supabase] URL:', SUPABASE_URL)
console.log('[supabase] KEY:', SUPABASE_KEY.substring(0, 25) + '...')

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default supabase
