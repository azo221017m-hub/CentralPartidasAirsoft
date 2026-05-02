// Archivo para probar la conexión a Supabase
import { createClient } from '@supabase/supabase-js'

// Variables directas para la prueba
const SUPABASE_URL = 'https://ojuxfmywmmvlemjdvzqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HKHiHjce3uqrHt-Lvr1nCw_sg44UrE7'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...')
  console.log('URL:', SUPABASE_URL)
  console.log('Key:', SUPABASE_KEY ? 'Configurada ✅' : 'No configurada ❌')
  
  try {
    // Verificar si existe la tabla access_requests
    console.log('\n1. Verificando tabla access_requests...')
    const { data: tableData, error: tableError } = await supabase
      .from('access_requests')
      .select('*')
      .limit(5)
    
    if (tableError) {
      console.error('❌ Error accediendo a access_requests:', tableError)
      console.log('📝 Necesitas ejecutar el schema SQL en Supabase')
      return false
    } else {
      console.log('✅ Tabla access_requests existe')
      console.log('Datos encontrados:', tableData)
    }

    // Probar validación específica
    console.log('\n2. Probando validación de usuario admin...')
    const { data: adminData, error: adminError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('contact_name', 'admin')
      .eq('password_hash', 'admin123')
      .maybeSingle()
    
    if (adminError) {
      console.error('❌ Error validando admin:', adminError)
      return false
    } else if (adminData) {
      console.log('✅ Usuario admin encontrado:', adminData)
      return true
    } else {
      console.log('❌ Usuario admin no encontrado')
      return false
    }

  } catch (error) {
    console.error('💥 Error general:', error)
    return false
  }
}

// Ejecutar la prueba
testConnection().then(success => {
  if (!success) {
    console.log('\n❌ La tabla access_requests no existe o no tiene datos.')
    console.log('📋 Necesitas ejecutar el schema SQL en tu proyecto Supabase.')
    console.log('\n🔧 Pasos para solucionarlo:')
    console.log('1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard')
    console.log('2. Selecciona tu proyecto')
    console.log('3. Ve a SQL Editor')
    console.log('4. Ejecuta el contenido del archivo supabase/schema.sql')
  } else {
    console.log('\n✅ ¡Conexión exitosa! El login debería funcionar.')
  }
})