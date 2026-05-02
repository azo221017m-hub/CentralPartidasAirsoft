// Test básico de conectividad a Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ojuxfmywmmvlemjdvzqa.supabase.co',
  'sb_publishable_HKHiHjce3uqrHt-Lvr1nCw_sg44UrE7'
)

console.log('🔍 Probando conectividad básica...')

// Test 1: Conexión básica
try {
  const { data, error } = await supabase.auth.getSession()
  console.log('✅ Conexión establecida')
} catch (err) {
  console.log('❌ Error de conexión:', err.message)
}

// Test 2: Probar una consulta muy simple
try {
  const { data, error } = await supabase.rpc('now')
  if (error) {
    console.log('⚠️ Error en función now():', error.message)
  } else {
    console.log('✅ Función now() funciona:', data)
  }
} catch (err) {
  console.log('❌ Error ejecutando now():', err.message)
}

// Test 3: Listar tablas disponibles
try {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(10)
    
  if (error) {
    console.log('⚠️ No se pueden listar tablas:', error.message)
  } else {
    console.log('📋 Tablas disponibles:', data?.map(t => t.table_name))
  }
} catch (err) {
  console.log('❌ Error listando tablas:', err.message)
}

console.log('\n🎯 Si ves errores arriba, hay problemas de conectividad.')
console.log('🎯 Si no hay errores, el problema es que falta crear la tabla access_requests.')