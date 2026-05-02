// Cliente Supabase compartido
// Usa las variables de entorno definidas en .env (prefijo VITE_ para Vite)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // En desarrollo es útil avisar si falta configuración
  // No lanzar excepción: en builds server-side puede diferir
  // pero durante ejecución en Vite estas vars deben existir.
  console.warn('[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en el entorno')
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_KEY ?? '')

export default supabase
